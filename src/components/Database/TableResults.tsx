/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowDown, ArrowUp } from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface TableColumn {
    name: string;
    type: string;
    constraints: string[];
}

interface EditingCell {
    rowIndex: number;
    columnName: string;
}

interface TableResultsProps {
    columns: TableColumn[];
    handleSort: (value: string) => void;
    sortColumn: string | null;
    sortDirection: "desc" | "asc";
    isLoading: boolean;
    data: any[];
    currentPage: number;
    limit: number;
    selectedRows: Set<number>;
    allRowsSelected: boolean;
    onToggleRowSelection: (rowIndex: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    editingCell: EditingCell | null;
    onStartEdit: (rowIndex: number, columnName: string) => void;
    onEndEdit: () => void;
    onCellValueChange: (rowIndex: number, columnName: string, value: string) => void;
    getCellValue: (rowIndex: number, columnName: string) => string;
    getCellClassName: (value: any, columnName: string) => string;
    columnWidths: Record<string, number>;
    onResizeColumn: (columnName: string, width: number) => void;
}

const SELECT_COLUMN_WIDTH = 44;
const ROW_NUMBER_COLUMN_WIDTH = 72;
const DEFAULT_COLUMN_WIDTH = 220;
const MIN_COLUMN_WIDTH = 140;

export default function TableResults({
    columns,
    handleSort,
    sortColumn,
    sortDirection,
    isLoading,
    data,
    currentPage,
    limit,
    selectedRows,
    allRowsSelected,
    onToggleRowSelection,
    onToggleSelectAll,
    editingCell,
    onStartEdit,
    onEndEdit,
    onCellValueChange,
    getCellValue,
    getCellClassName,
    columnWidths,
    onResizeColumn
}: TableResultsProps) {
    const startColumnResize = (event: ReactMouseEvent, columnName: string) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const initialWidth = columnWidths[columnName] ?? DEFAULT_COLUMN_WIDTH;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const nextWidth = Math.max(MIN_COLUMN_WIDTH, initialWidth + (moveEvent.clientX - startX));
            onResizeColumn(columnName, nextWidth);
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                <Table className="w-full table-fixed">
                    <TableHeader className="sticky top-0 bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 z-20">
                        <TableRow>
                            <TableHead
                                className="cursor-default select-none sticky left-0 bg-slate-100 dark:bg-gray-800 z-30"
                                style={{
                                    width: SELECT_COLUMN_WIDTH,
                                    minWidth: SELECT_COLUMN_WIDTH,
                                    maxWidth: SELECT_COLUMN_WIDTH
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={allRowsSelected && data.length > 0}
                                    onChange={(event) => onToggleSelectAll(event.target.checked)}
                                    aria-label="Select all rows"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-default select-none sticky left-[44px] bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 z-30"
                                style={{
                                    width: ROW_NUMBER_COLUMN_WIDTH,
                                    minWidth: ROW_NUMBER_COLUMN_WIDTH,
                                    maxWidth: ROW_NUMBER_COLUMN_WIDTH
                                }}
                            >
                                #
                            </TableHead>
                            {columns.map((column) => {
                                const width = columnWidths[column.name] ?? DEFAULT_COLUMN_WIDTH;

                                return (
                                    <TableHead
                                        key={column.name}
                                        className="cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 select-none bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 relative"
                                        style={{
                                            width,
                                            minWidth: width,
                                            maxWidth: width
                                        }}
                                        onClick={() => handleSort(column.name)}
                                    >
                                        <div className="flex items-center gap-2 pr-3">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{column.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                                    {column.type}
                                                    {column.constraints.length > 0 && (
                                                        <span className="ml-1">
                                                            {column.constraints.includes('PRIMARY KEY') && '🔑'}
                                                            {column.constraints.includes('NOT NULL') && '⚠️'}
                                                            {column.constraints.includes('UNIQUE') && '🔒'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {sortColumn === column.name && (
                                                sortDirection === 'asc'
                                                    ? <ArrowUp className="h-4 w-4 text-slate-400" />
                                                    : <ArrowDown className="h-4 w-4 text-slate-400" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/60 dark:hover:bg-blue-600/50"
                                            onMouseDown={(event) => startColumnResize(event, column.name)}
                                            onClick={(event) => event.stopPropagation()}
                                            aria-label={`Resize ${column.name} column`}
                                        />
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={`loading-${index}`} className="hover:bg-slate-50 dark:hover:bg-gray-800/40">
                                    <TableCell
                                        className="sticky left-0 z-10 bg-white dark:bg-gray-900"
                                        style={{
                                            width: SELECT_COLUMN_WIDTH,
                                            minWidth: SELECT_COLUMN_WIDTH,
                                            maxWidth: SELECT_COLUMN_WIDTH
                                        }}
                                    >
                                        <div className="h-4 w-4 bg-slate-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                    </TableCell>
                                    <TableCell
                                        className="sticky left-[44px] z-10 bg-white dark:bg-gray-900"
                                        style={{
                                            width: ROW_NUMBER_COLUMN_WIDTH,
                                            minWidth: ROW_NUMBER_COLUMN_WIDTH,
                                            maxWidth: ROW_NUMBER_COLUMN_WIDTH
                                        }}
                                    >
                                        <div className="h-4 w-8 bg-slate-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                    </TableCell>
                                    {columns.map((column) => {
                                        const width = columnWidths[column.name] ?? DEFAULT_COLUMN_WIDTH;
                                        return (
                                            <TableCell
                                                key={column.name}
                                                className="bg-white dark:bg-gray-900"
                                                style={{
                                                    width,
                                                    minWidth: width,
                                                    maxWidth: width
                                                }}
                                            >
                                                <div className="h-4 bg-slate-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            data.map((row: any, index: number) => (
                                <TableRow
                                    key={index}
                                    className={`${selectedRows.has(index) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-gray-800/40'}`}
                                >
                                    <TableCell
                                        className="sticky left-0 z-10 bg-white dark:bg-gray-900"
                                        style={{
                                            width: SELECT_COLUMN_WIDTH,
                                            minWidth: SELECT_COLUMN_WIDTH,
                                            maxWidth: SELECT_COLUMN_WIDTH
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(index)}
                                            onChange={() => onToggleRowSelection(index)}
                                            aria-label={`Select row ${(currentPage - 1) * limit + index + 1}`}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </TableCell>
                                    <TableCell
                                        className={`${getCellClassName(index, '#')} sticky left-[44px] z-10 bg-white dark:bg-gray-900`}
                                        style={{
                                            width: ROW_NUMBER_COLUMN_WIDTH,
                                            minWidth: ROW_NUMBER_COLUMN_WIDTH,
                                            maxWidth: ROW_NUMBER_COLUMN_WIDTH
                                        }}
                                    >
                                        {(currentPage - 1) * limit + index + 1}
                                    </TableCell>
                                    {columns.map((column) => {
                                        const width = columnWidths[column.name] ?? DEFAULT_COLUMN_WIDTH;
                                        const isEditingCell =
                                            editingCell?.rowIndex === index &&
                                            editingCell?.columnName === column.name;
                                        const value = getCellValue(index, column.name);
                                        const rawCellValue = row[column.name as keyof typeof row];

                                        return (
                                            <TableCell
                                                key={column.name}
                                                className={getCellClassName(rawCellValue, column.name)}
                                                style={{
                                                    width,
                                                    minWidth: width,
                                                    maxWidth: width
                                                }}
                                                onClick={() => onStartEdit(index, column.name)}
                                            >
                                                {isEditingCell ? (
                                                    <input
                                                        autoFocus
                                                        value={value}
                                                        onChange={(event) =>
                                                            onCellValueChange(index, column.name, event.target.value)
                                                        }
                                                        onBlur={onEndEdit}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' || event.key === 'Escape') {
                                                                onEndEdit();
                                                            }
                                                        }}
                                                        className="w-full bg-transparent border border-blue-400 rounded px-2 py-1 text-sm text-slate-900 dark:text-gray-100 outline-none"
                                                    />
                                                ) : (
                                                    <div className="truncate">
                                                        {rawCellValue === null && value === '' ? (
                                                            <span className="text-slate-400 italic dark:text-gray-500">NULL</span>
                                                        ) : (
                                                            value || <span className="text-slate-400 dark:text-gray-500"> </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
