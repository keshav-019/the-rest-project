/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Database, Table as TableIcon, Play, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import DatabaseService from '@/lib/database-service';
import TableResults from './TableResults';

interface TableViewerProps {
    tableName: string;
    connection: string;
    database: string;
}

export const TableViewer = ({ tableName, connection, database }: TableViewerProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sqlQuery, setSqlQuery] = useState(`SELECT * FROM ${tableName} LIMIT 100`);
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows] = useState(300);
    const [limit] = useState(100);
    const [selectedCell, setSelectedCell] = useState<{ content: string; isOpen: boolean }>({ content: '', isOpen: false });
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const totalPages = Math.ceil(totalRows / limit);

    useEffect(() => {
        const fetchTableData = async () => {
            setIsLoading(true);
            try {
                const dbService = DatabaseService.getInstance();
                const result = await dbService.executeQuery(
                    connection,
                    `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${(currentPage - 1) * limit}`,
                    database
                );

                console.log("Fetched data:", result);

                const rows = result.dbResult?.rows || [];
                setData(rows);

                if (rows.length > 0) {
                    const cols = Object.keys(rows[0]).map(key => ({
                        name: key,
                        type: typeof rows[0][key],
                        constraints: []
                    }));
                    setColumns(cols);
                } else {
                    setColumns([]);
                }
            } catch (error: any) {
                console.error("Data fetch error:", error);
                toast({
                    title: "Failed to load table data",
                    description: error.message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, [currentPage, tableName, connection, database, limit]);

    const handleSort = (columnName: string) => {
        if (sortColumn === columnName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnName);
            setSortDirection('asc');
        }
    };

    const handleExecuteQuery = async () => {
        setIsExecuting(true);
        try {
            const dbService = DatabaseService.getInstance();
            const result = await dbService.executeQuery(
                connection,
                sqlQuery, // Use the current query from state
                database
            );

            const rows = result.dbResult?.rows || [];
            setData(rows);

            // Update columns if the result structure changed
            if (rows.length > 0) {
                const cols = Object.keys(rows[0]).map(key => ({
                    name: key,
                    type: typeof rows[0][key],
                    constraints: []
                }));
                setColumns(cols);
            } else {
                setColumns([]);
            }

            toast({
                title: "Query executed successfully",
                variant: "default",
            });
        } catch (error: any) {
            console.error("Query execution error:", error);
            toast({
                title: "Query failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleStopQuery = () => {
        setIsExecuting(false);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const offset = (page - 1) * limit;
            setSqlQuery(`SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`);
        }
    };

    const handleCellClick = (content: any) => {
        setSelectedCell({ content: String(content), isOpen: true });
    };

    const getCellClassName = (value: any, columnName: string) => {
        const baseClass = 'cursor-pointer hover:bg-gray-700 max-w-xs truncate px-4 py-2';
        if (value === null || value === undefined) {
            return baseClass + ' text-gray-500 italic bg-gray-800/50';
        }
        if (columnName === 'id') {
            return baseClass + ' font-mono bg-blue-900/20 text-blue-300';
        }
        if (columnName === '#') { // Special styling for row number column
            return baseClass + ' font-mono bg-gray-800 text-gray-400 sticky left-0 z-10';
        }
        return baseClass;
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
            {/* Header Section */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5 text-blue-500" />
                        <h2 className="text-lg font-semibold">{tableName}</h2>
                        <span className="text-sm text-gray-400">
                            {connection} → {database}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search rows..."
                                className="pl-10 w-64 bg-gray-700 border-gray-600 text-gray-100"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">
                            Export
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">
                            Add Row
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800/50 w-full">
                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Query Editor</span>
                    </div>
                    <Textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="font-mono text-sm min-h-[80px] max-h-[80px] resize-none bg-gray-800 border-gray-700 text-gray-200"
                        placeholder="Enter your SQL query..."
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleExecuteQuery}
                                disabled={isExecuting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Play className="h-4 w-4 mr-1" />
                                {isExecuting ? 'Executing...' : 'Execute'}
                            </Button>
                            {isExecuting && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleStopQuery}
                                >
                                    <Square className="h-4 w-4 mr-1" />
                                    Stop
                                </Button>
                            )}
                            {isExecuting && (
                                <span className="text-sm text-gray-400">Executing query...</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                                {currentPage}/{totalPages} pages
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Results Section */}
            <TableResults columns={columns} currentPage={currentPage} data={data} getCellClassName={getCellClassName} handleCellClick={handleCellClick} handleSort={handleSort} isLoading={isLoading} limit={limit} sortColumn={sortColumn} sortDirection={sortDirection} key={1} />

            {/* Footer Section */}
            <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-800 text-sm text-gray-400">
                Showing {data.length} rows • {columns.length} columns • Total: {totalRows} rows • Last updated: Just now
            </div>

            {/* Cell Content Dialog */}
            <Dialog open={selectedCell.isOpen} onOpenChange={(open) => setSelectedCell({ ...selectedCell, isOpen: open })}>
                <DialogContent className="max-w-2xl bg-gray-800 border-2 border-gray-700 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-gray-100">Cell Content</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Textarea
                            value={selectedCell.content}
                            readOnly
                            className="min-h-[200px] font-mono text-sm bg-gray-700/50 border border-gray-600 text-gray-200"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};