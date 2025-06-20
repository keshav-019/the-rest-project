/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Play, History, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import DatabaseService from '@/lib/database-service';

interface QueryEditorProps {
    connection: string;
    database: string;
}

export const QueryEditorSQL = ({ connection, database }: QueryEditorProps) => {
    const [query, setQuery] = useState(
        database ? `SELECT * FROM ${database}.your_table LIMIT 10` : 'SELECT * FROM your_table LIMIT 10'
    );
    const [isExecuting, setIsExecuting] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [limit] = useState(10);

    const executeQuery = async () => {

        console.log("The Execute Query function is called inside of the Query Editor SQL ", connection, " and the database is: ", database);
        setIsExecuting(true);
        try {
            const dbService = DatabaseService.getInstance();
            const result = await dbService.executeQuery(connection, query, database);
            
            setResults(result.rows || []);
            setColumns(result.fields?.map((f: any) => f.name) || []);
            setExecutionTime(result.executionTime || 0);
            setTotalResults(result.rowCount || result.rows?.length || 0);
            
            toast({
                title: "Query executed",
                description: `Returned ${result.rows?.length || 0} rows in ${result.executionTime || 0}ms`,
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Query failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsExecuting(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalResults / limit)) {
            setCurrentPage(page);
            // Modify query with pagination if needed
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold">SQL Query Editor</h2>
                        <span className="text-sm text-gray-400">
                            {connection} {database && `→ ${database}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                            <History className="h-4 w-4 mr-2" />
                            History
                        </Button>
                        <Button 
                            onClick={executeQuery}
                            disabled={isExecuting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isExecuting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Execute
                        </Button>
                    </div>
                </div>
            </div>

            {/* Query Input */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
                <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="font-mono text-sm min-h-[100px] bg-gray-900 border-gray-700 text-gray-100"
                    placeholder="Enter your SQL query..."
                />
            </div>

            {/* Results */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {isExecuting ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <Tabs defaultValue="results" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none">
                            <TabsTrigger value="results" className="text-gray-300">Results</TabsTrigger>
                            <TabsTrigger value="execution" className="text-gray-300">Execution Plan</TabsTrigger>
                        </TabsList>

                        <TabsContent value="results" className="flex-1 m-0 min-h-0 overflow-hidden">
                            {results.length > 0 ? (
                                <ScrollArea className="h-full">
                                    <div className="p-4">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-gray-800">
                                                <tr>
                                                    {columns.map(col => (
                                                        <th key={col} className="px-4 py-2 text-left border-b border-gray-700">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-800/50">
                                                        {columns.map(col => (
                                                            <td key={col} className="px-4 py-2 border-b border-gray-700">
                                                                {String(row[col])}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    No results to display
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Pagination */}
            {totalResults > 0 && (
                <div className="p-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                        Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalResults)} of {totalResults} rows
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-gray-700 border-gray-600"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-gray-300">Page {currentPage}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage * limit >= totalResults}
                            className="bg-gray-700 border-gray-600"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};