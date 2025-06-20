'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table } from 'lucide-react';
import { ColumnDefinition } from '@/types/Connection';

interface TableDescriptionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tableName: string;
    columns: ColumnDefinition[];
}

export const TableDescriptionDialog = ({
    isOpen,
    onClose,
    tableName,
    columns
}: TableDescriptionDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700 text-gray-100">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Table className="h-5 w-5 text-blue-400" />
                        <DialogTitle>Table Description: {tableName}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    <h3 className="font-medium mb-2 text-gray-300">Columns</h3>
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-300">Name</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Type</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Nullable</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Default</th>
                                    <th className="px-4 py-2 text-left text-gray-300">Primary Key</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((column) => (
                                    <tr key={column.name} className="border-t border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-4 py-2 font-mono text-sm text-gray-200">{column.name}</td>
                                        <td className="px-4 py-2 font-mono text-sm text-gray-200">{column.type}</td>
                                        <td className="px-4 py-2 text-gray-300">{column.isNullable ? 'YES' : 'NO'}</td>
                                        {/* <td className="px-4 py-2 font-mono text-sm text-gray-200">{column.default || 'NULL'}</td> */}
                                        <td className="px-4 py-2 text-gray-300">{column.isPrimaryKey ? 'YES' : 'NO'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};