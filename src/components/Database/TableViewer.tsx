/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Database,
    Play,
    RotateCcw,
    Save,
    Search,
    Square,
    Table as TableIcon,
    Trash2
} from 'lucide-react';
import { toast } from '@/hooks/useToast';
import DatabaseService from '@/lib/database-service';
import TableResults from './TableResults';

interface TableViewerProps {
    tableName: string;
    connection: string;
    database: string;
}

interface TableColumn {
    name: string;
    type: string;
    constraints: string[];
}

interface EditingCell {
    rowIndex: number;
    columnName: string;
}

type EditedRows = Record<number, Record<string, string>>;

const DEFAULT_COLUMN_WIDTH = 220;
const PAGE_LIMIT = 100;
const TABLE_PAGE_CACHE_TTL_MS = 30 * 1000;

interface TablePageCacheEntry {
    totalRows: number;
    rows: any[];
    columns: TableColumn[];
    cachedAt: number;
}

const TABLE_PAGE_CACHE = new Map<string, TablePageCacheEntry>();

const getTableCachePrefix = (connection: string, database: string, tableName: string) =>
    `${connection}::${database}::${tableName}::`;

const getTableCacheKey = (connection: string, database: string, tableName: string, page: number) =>
    `${getTableCachePrefix(connection, database, tableName)}${page}`;

const invalidateTableCache = (connection: string, database: string, tableName: string) => {
    const prefix = getTableCachePrefix(connection, database, tableName);
    for (const key of TABLE_PAGE_CACHE.keys()) {
        if (key.startsWith(prefix)) {
            TABLE_PAGE_CACHE.delete(key);
        }
    }
};

const extractRows = (result: any): any[] => {
    if (Array.isArray(result?.dbResult?.rows)) return result.dbResult.rows;
    if (Array.isArray(result?.rows)) return result.rows;
    if (Array.isArray(result?.data)) return result.data;
    return [];
};

const buildColumnsFromRows = (rows: any[]): TableColumn[] => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).map((key) => ({
        name: key,
        type: typeof rows[0][key],
        constraints: []
    }));
};

const sqlLiteral = (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return `'${String(value).replace(/'/g, "''")}'`;
};

const normalizeEditedValue = (rawValue: string, originalValue: any) => {
    if (rawValue === '' && (originalValue === null || originalValue === undefined)) return null;

    if (typeof originalValue === 'number') {
        const numericValue = Number(rawValue);
        return Number.isFinite(numericValue) ? numericValue : rawValue;
    }

    if (typeof originalValue === 'boolean') {
        if (rawValue.toLowerCase() === 'true') return true;
        if (rawValue.toLowerCase() === 'false') return false;
    }

    return rawValue;
};

export const TableViewer = ({ tableName, connection, database }: TableViewerProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sqlQuery, setSqlQuery] = useState(`SELECT * FROM ${tableName} LIMIT ${PAGE_LIMIT}`);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isSavingChanges, setIsSavingChanges] = useState(false);
    const [isDeletingRows, setIsDeletingRows] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCustomResult, setIsCustomResult] = useState(false);
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [editedRows, setEditedRows] = useState<EditedRows>({});
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

    const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_LIMIT));
    const pendingChangesCount = useMemo(
        () => Object.values(editedRows).reduce((total, rowChanges) => total + Object.keys(rowChanges).length, 0),
        [editedRows]
    );

    const primaryKeyColumn = useMemo(() => {
        const idColumn = columns.find((column) => {
            const normalized = column.name.toLowerCase();
            return normalized === 'id' || normalized === '_id';
        });
        return idColumn?.name || columns[0]?.name || null;
    }, [columns]);

    const loadTableData = useCallback(async (page: number) => {
        setIsLoading(true);

        try {
            const cacheKey = getTableCacheKey(connection, database, tableName, page);
            const cachedEntry = TABLE_PAGE_CACHE.get(cacheKey);
            if (cachedEntry && Date.now() - cachedEntry.cachedAt < TABLE_PAGE_CACHE_TTL_MS) {
                setTotalRows(cachedEntry.totalRows);
                setData(cachedEntry.rows);
                setColumns(cachedEntry.columns);
                const cachedOffset = (page - 1) * PAGE_LIMIT;
                setSqlQuery(`SELECT * FROM ${tableName} LIMIT ${PAGE_LIMIT} OFFSET ${cachedOffset}`);
                setIsCustomResult(false);
                setEditedRows({});
                setSelectedRows(new Set());
                setEditingCell(null);
                return;
            }

            const dbService = DatabaseService.getInstance();

            const countResult = await dbService.executeQuery(
                connection,
                `SELECT COUNT(*) AS total_count FROM ${tableName}`,
                database
            );

            const countRows = extractRows(countResult);
            const countValue = countRows[0] ? Number(countRows[0].total_count ?? countRows[0].count ?? Object.values(countRows[0])[0]) : 0;
            const safeTotal = Number.isFinite(countValue) ? countValue : 0;
            setTotalRows(safeTotal);

            const calculatedPages = Math.max(1, Math.ceil(safeTotal / PAGE_LIMIT));
            const safePage = Math.min(page, calculatedPages);

            if (safePage !== page) {
                setCurrentPage(safePage);
                return;
            }

            const offset = (safePage - 1) * PAGE_LIMIT;
            const result = await dbService.executeQuery(
                connection,
                `SELECT * FROM ${tableName} LIMIT ${PAGE_LIMIT} OFFSET ${offset}`,
                database
            );

            const rows = extractRows(result);
            const nextColumns = buildColumnsFromRows(rows);
            setData(rows);
            setColumns(nextColumns);
            setSqlQuery(`SELECT * FROM ${tableName} LIMIT ${PAGE_LIMIT} OFFSET ${offset}`);
            setIsCustomResult(false);
            setEditedRows({});
            setSelectedRows(new Set());
            setEditingCell(null);

            TABLE_PAGE_CACHE.set(cacheKey, {
                totalRows: safeTotal,
                rows,
                columns: nextColumns,
                cachedAt: Date.now(),
            });
        } catch (error: any) {
            toast({
                title: 'Failed to load table data',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [connection, database, tableName]);

    useEffect(() => {
        void loadTableData(currentPage);
    }, [currentPage, loadTableData]);

    useEffect(() => {
        setColumnWidths((previousWidths) => {
            const nextWidths = { ...previousWidths };
            columns.forEach((column) => {
                if (!nextWidths[column.name]) {
                    nextWidths[column.name] = DEFAULT_COLUMN_WIDTH;
                }
            });
            return nextWidths;
        });
    }, [columns]);

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
            const result = await dbService.executeQuery(connection, sqlQuery, database);
            const rows = extractRows(result);

            setData(rows);
            setColumns(buildColumnsFromRows(rows));
            setCurrentPage(1);
            setTotalRows(rows.length);
            setIsCustomResult(true);
            setEditedRows({});
            setSelectedRows(new Set());
            setEditingCell(null);

            toast({
                title: 'Query executed successfully',
                description: `Returned ${rows.length} rows`,
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Query failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleStopQuery = () => {
        setIsExecuting(false);
    };

    const handleResetTableView = async () => {
        setCurrentPage(1);
        await loadTableData(1);
    };

    const handlePageChange = (page: number) => {
        if (isCustomResult) return;
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getCellClassName = (value: any, columnName: string) => {
        const baseClass = 'cursor-text px-3 py-2 align-top border-b border-slate-100 dark:border-gray-800';

        if (columnName === '#') {
            return `${baseClass} text-slate-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-900`;
        }

        if (value === null || value === undefined) {
            return `${baseClass} text-slate-400 italic dark:text-gray-500`;
        }

        return `${baseClass} text-slate-700 dark:text-gray-100`;
    };

    const getCellValue = (rowIndex: number, columnName: string) => {
        const editedValue = editedRows[rowIndex]?.[columnName];
        if (editedValue !== undefined) return editedValue;

        const rawValue = data[rowIndex]?.[columnName];
        if (rawValue === null || rawValue === undefined) return '';
        return String(rawValue);
    };

    const handleCellValueChange = (rowIndex: number, columnName: string, value: string) => {
        setEditedRows((previous) => {
            const next = { ...previous };
            const currentRowChanges = { ...(next[rowIndex] || {}) };
            const originalValue = data[rowIndex]?.[columnName];
            const normalizedOriginal = originalValue === null || originalValue === undefined ? '' : String(originalValue);

            if (value === normalizedOriginal) {
                delete currentRowChanges[columnName];
            } else {
                currentRowChanges[columnName] = value;
            }

            if (Object.keys(currentRowChanges).length === 0) {
                delete next[rowIndex];
            } else {
                next[rowIndex] = currentRowChanges;
            }

            return next;
        });
    };

    const handleSaveChanges = async () => {
        if (!primaryKeyColumn) {
            toast({
                title: 'Unable to save changes',
                description: 'No key column found to identify rows.',
                variant: 'destructive',
            });
            return;
        }

        if (pendingChangesCount === 0) return;

        setIsSavingChanges(true);

        try {
            const dbService = DatabaseService.getInstance();
            const pendingRowEntries = Object.entries(editedRows);

            for (const [rowIndexString, rowChanges] of pendingRowEntries) {
                const rowIndex = Number(rowIndexString);
                const sourceRow = data[rowIndex];
                if (!sourceRow) continue;

                const keyValue = sourceRow[primaryKeyColumn];
                if (keyValue === undefined) continue;

                const assignments = Object.entries(rowChanges).map(([columnName, rawValue]) => {
                    const normalizedValue = normalizeEditedValue(rawValue, sourceRow[columnName]);
                    return `${columnName} = ${sqlLiteral(normalizedValue)}`;
                });

                if (!assignments.length) continue;

                const updateQuery = `UPDATE ${tableName} SET ${assignments.join(', ')} WHERE ${primaryKeyColumn} = ${sqlLiteral(keyValue)};`;
                await dbService.executeQuery(connection, updateQuery, database);
            }

            invalidateTableCache(connection, database, tableName);
            toast({
                title: 'Changes saved',
                description: 'Updated rows were written to the database.',
                variant: 'default',
            });

            await loadTableData(currentPage);
        } catch (error: any) {
            toast({
                title: 'Failed to save changes',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSavingChanges(false);
        }
    };

    const handleToggleRowSelection = (rowIndex: number) => {
        setSelectedRows((previous) => {
            const next = new Set(previous);
            if (next.has(rowIndex)) {
                next.delete(rowIndex);
            } else {
                next.add(rowIndex);
            }
            return next;
        });
    };

    const handleToggleSelectAll = (checked: boolean) => {
        if (!checked) {
            setSelectedRows(new Set());
            return;
        }

        setSelectedRows(new Set(data.map((_, index) => index)));
    };

    const allRowsSelected = data.length > 0 && data.every((_, index) => selectedRows.has(index));

    const handleDeleteSelectedRows = async () => {
        if (!primaryKeyColumn) {
            toast({
                title: 'Unable to delete rows',
                description: 'No key column found to identify rows.',
                variant: 'destructive',
            });
            return;
        }

        if (selectedRows.size === 0) return;

        setIsDeletingRows(true);

        try {
            const dbService = DatabaseService.getInstance();
            const targetIndexes = Array.from(selectedRows.values()).sort((a, b) => b - a);

            for (const rowIndex of targetIndexes) {
                const row = data[rowIndex];
                if (!row) continue;

                const keyValue = row[primaryKeyColumn];
                const deleteQuery = `DELETE FROM ${tableName} WHERE ${primaryKeyColumn} = ${sqlLiteral(keyValue)};`;
                await dbService.executeQuery(connection, deleteQuery, database);
            }

            invalidateTableCache(connection, database, tableName);
            toast({
                title: 'Rows deleted',
                description: `${selectedRows.size} row(s) deleted.`,
                variant: 'default',
            });

            await loadTableData(currentPage);
        } catch (error: any) {
            toast({
                title: 'Failed to delete selected rows',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsDeletingRows(false);
        }
    };

    const handleDeleteAllRows = async () => {
        setIsDeletingAll(true);

        try {
            const dbService = DatabaseService.getInstance();
            await dbService.executeQuery(connection, `DELETE FROM ${tableName};`, database);

            invalidateTableCache(connection, database, tableName);
            toast({
                title: 'All rows deleted',
                description: `Cleared table ${tableName}.`,
                variant: 'default',
            });

            setShowDeleteAllDialog(false);
            await loadTableData(1);
            setCurrentPage(1);
        } catch (error: any) {
            toast({
                title: 'Failed to delete all rows',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsDeletingAll(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <TableIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <h2 className="text-lg font-semibold truncate">{tableName}</h2>
                        <span className="text-sm text-slate-500 dark:text-gray-400 truncate">
                            {connection} → {database}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search rows..."
                                className="pl-10 w-64 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full">
                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-slate-400 dark:text-gray-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">Query Editor</span>
                    </div>
                    <Textarea
                        value={sqlQuery}
                        onChange={(event) => setSqlQuery(event.target.value)}
                        className="font-mono text-sm min-h-[84px] max-h-[84px] resize-none bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-100"
                        placeholder="Enter your SQL query..."
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleExecuteQuery}
                                disabled={isExecuting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Play className="h-4 w-4 mr-1" />
                                {isExecuting ? 'Running...' : 'Run Query'}
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
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={pendingChangesCount === 0 || isSavingChanges}
                                onClick={handleSaveChanges}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                            >
                                <Save className="h-4 w-4 mr-1" />
                                {isSavingChanges ? 'Saving...' : `Save Changes${pendingChangesCount ? ` (${pendingChangesCount})` : ''}`}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={selectedRows.size === 0 || isDeletingRows}
                                onClick={handleDeleteSelectedRows}
                                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700/40 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {isDeletingRows ? 'Deleting...' : `Delete Selected${selectedRows.size ? ` (${selectedRows.size})` : ''}`}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={data.length === 0}
                                onClick={() => setShowDeleteAllDialog(true)}
                                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700/40 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Delete All
                            </Button>
                            {isCustomResult && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleResetTableView}
                                    className="border-slate-200 dark:border-gray-700"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Back To Table View
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-gray-400">
                                {currentPage}/{totalPages} pages
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isCustomResult}
                                    className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isCustomResult}
                                    className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TableResults
                columns={columns}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                isLoading={isLoading}
                data={data}
                getCellClassName={getCellClassName}
                currentPage={currentPage}
                limit={PAGE_LIMIT}
                selectedRows={selectedRows}
                allRowsSelected={allRowsSelected}
                onToggleRowSelection={handleToggleRowSelection}
                onToggleSelectAll={handleToggleSelectAll}
                editingCell={editingCell}
                onStartEdit={(rowIndex, columnName) => setEditingCell({ rowIndex, columnName })}
                onEndEdit={() => setEditingCell(null)}
                onCellValueChange={handleCellValueChange}
                getCellValue={getCellValue}
                columnWidths={columnWidths}
                onResizeColumn={(columnName, width) =>
                    setColumnWidths((previous) => ({ ...previous, [columnName]: width }))
                }
            />

            <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-500 dark:text-gray-400">
                Showing {data.length} rows • {columns.length} columns • Total: {totalRows} rows • Last updated: Just now
            </div>

            <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-gray-100">Delete all rows?</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-gray-400">
                            This will permanently delete every row from <span className="font-medium">{tableName}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAllDialog(false)}
                            className="border-slate-200 dark:border-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeletingAll}
                            onClick={handleDeleteAllRows}
                        >
                            {isDeletingAll ? 'Deleting...' : 'Delete All'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
