'use client'
import { memo, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    Node,
    NodeProps,
    useEdgesState,
    useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ColumnDefinition, SchemaObject } from '@/types/Connection';

interface SchemaCanvasProps {
    connection: string;
    database: string;
    schema: string;
    tables: SchemaObject[];
}

interface TableNodeData {
    tableName: string;
    columns: ColumnDefinition[];
    expanded: boolean;
    onToggle: (nodeId: string) => void;
}

const TableNode = memo(({ id, data }: NodeProps<TableNodeData>) => {
    return (
        <div
            className="min-w-[220px] max-w-[320px] rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
            onClick={() => data.onToggle(id)}
        >
            <div className="px-3 py-2 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 rounded-t-lg">
                <p className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate">{data.tableName}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {data.columns.length} column{data.columns.length === 1 ? '' : 's'}
                </p>
            </div>

            {data.expanded ? (
                <div className="max-h-64 overflow-y-auto px-3 py-2 space-y-1">
                    {data.columns.map((column) => (
                        <div key={`${data.tableName}-${column.name}`} className="text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800 dark:text-gray-200">{column.name}</span>
                                <span className="text-slate-500 dark:text-gray-400">{column.type}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                                {column.isPrimaryKey ? (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                        PK
                                    </span>
                                ) : null}
                                {column.foreignKey ? (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        FK → {column.foreignKey.table}.{column.foreignKey.column}
                                    </span>
                                ) : null}
                                {!column.isNullable ? (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                                        NOT NULL
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-3 py-2 text-xs text-slate-500 dark:text-gray-400">Click to expand columns</div>
            )}
        </div>
    );
});

TableNode.displayName = 'TableNode';

const nodeTypes = {
    tableNode: TableNode,
};

const buildEdges = (tables: SchemaObject[]) =>
    tables.flatMap((table) => {
        const columns = table.columns || [];
        return columns
            .filter((column) => column.foreignKey?.table)
            .map((column) => ({
                id: `${table.name}-${column.name}->${column.foreignKey?.table}`,
                source: table.name,
                target: column.foreignKey?.table || '',
                label: `${column.name} → ${column.foreignKey?.column}`,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#64748b' },
                labelStyle: { fill: '#64748b', fontSize: 11 },
            }));
    });

export const SchemaCanvas = ({ connection, database, schema, tables }: SchemaCanvasProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const toggleNode = useCallback(
        (nodeId: string) => {
            setNodes((previousNodes) =>
                previousNodes.map((node) =>
                    node.id === nodeId
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  expanded: !node.data.expanded,
                              },
                          }
                        : node
                )
            );
        },
        [setNodes]
    );

    useEffect(() => {
        setNodes((previousNodes) => {
            const previousById = new Map(previousNodes.map((node) => [node.id, node]));

            return tables.map((table, index) => {
                const previousNode = previousById.get(table.name) as Node<TableNodeData> | undefined;
                const x = (index % 4) * 320;
                const y = Math.floor(index / 4) * 250;

                return {
                    id: table.name,
                    type: 'tableNode',
                    position: previousNode?.position || { x, y },
                    data: {
                        tableName: table.name,
                        columns: table.columns || [],
                        expanded: previousNode?.data?.expanded || false,
                        onToggle: toggleNode,
                    },
                    draggable: true,
                } satisfies Node<TableNodeData>;
            });
        });
    }, [tables, toggleNode, setNodes]);

    useEffect(() => {
        setEdges(buildEdges(tables));
    }, [tables, setEdges]);

    const emptyState = useMemo(() => tables.length === 0, [tables.length]);

    if (emptyState) {
        return (
            <div className="h-full grid place-items-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center text-sm text-slate-500 dark:text-gray-400">
                    No schema metadata found for this selection.
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-gray-900">
            <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700 text-xs text-slate-500 dark:text-gray-400">
                {connection} / {database} / {schema} • Drag tables to organize your ERD canvas.
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={2}
            >
                <Controls />
                <MiniMap />
                <Background />
            </ReactFlow>
        </div>
    );
};
