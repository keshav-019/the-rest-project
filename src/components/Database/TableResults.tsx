/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface TableResultsProps {
    columns: any[];
    handleSort: (value: string) => void;
    sortColumn: string | null;
    sortDirection: "desc" | "asc";
    isLoading: boolean;
    data: any[];
    getCellClassName: (index: number, value: string) => string;
    handleCellClick: (value: any) => void;
    currentPage: number;
    limit: number;
}

export default function TableResults({ columns, handleSort, sortColumn, sortDirection, isLoading, data, getCellClassName, handleCellClick, currentPage, limit }: TableResultsProps) {
    return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-h-127">
            <div className="flex-1 overflow-auto">
                <Table className="min-w-full">
                    <TableHeader className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
                        <TableRow>
                            {/* Row number column header */}
                            <TableHead
                                className="cursor-default select-none min-w-[50px] sticky left-0 bg-gray-800 text-gray-300 z-20"
                            >
                                #
                            </TableHead>
                            {columns.map((column: any) => (
                                <TableHead
                                    key={column.name}
                                    className="cursor-pointer hover:bg-gray-700 select-none min-w-[120px] bg-gray-800 text-gray-300"
                                    onClick={() => handleSort(column.name)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="font-medium">{column.name}</div>
                                            <div className="text-xs text-gray-500">
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
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="h-4 w-4 text-gray-400" /> :
                                                <ArrowDown className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={`loading-${index}`} className="hover:bg-gray-700/50">
                                    {/* Loading row number cell */}
                                    <TableCell className="bg-gray-900 sticky left-0 z-10">
                                        <div className="h-4 w-full bg-gray-700 animate-pulse rounded"></div>
                                    </TableCell>
                                    {columns.map((column: any) => (
                                        <TableCell key={column.name} className="bg-gray-900">
                                            <div className="h-4 bg-gray-700 animate-pulse rounded"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            data.map((row: any, index: number) => (
                                <TableRow key={index} className="hover:bg-gray-700/50">
                                    {/* Row number cell */}
                                    <TableCell
                                        className={getCellClassName(index, '#')}
                                    >
                                        {(currentPage - 1) * limit + index + 1}
                                    </TableCell>
                                    {columns.map((column: any) => (
                                        <TableCell
                                            key={column.name}
                                            className={getCellClassName(row[column.name as keyof typeof row], column.name)}
                                            onClick={() => handleCellClick(row[column.name as keyof typeof row])}
                                        >
                                            <div className="truncate">
                                                {row[column.name as keyof typeof row] === null ?
                                                    <span className="text-gray-500 italic">NULL</span> :
                                                    String(row[column.name as keyof typeof row])
                                                }
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}