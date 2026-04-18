'use client'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
    MarkerType,
    MiniMap,
    Node,
    NodeProps,
    Panel,
    Position,
    ReactFlowInstance,
    useEdgesState,
    useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronDown, ChevronRight, CircleOff, KeyRound, Link2 } from 'lucide-react';
import { ColumnDefinition, SchemaObject } from '@/types/Connection';

interface SchemaCanvasProps {
    connection: string;
    database: string;
    schema: string;
    tables: SchemaObject[];
    isActive?: boolean;
}

interface TableNodeData {
    tableName: string;
    columns: ColumnDefinition[];
    expanded: boolean;
    relationCount: number;
    isIsolated: boolean;
    onToggle: (nodeId: string) => void;
}

interface TableRelation {
    sourceTable: string;
    targetTable: string;
    sourceColumn: string;
    targetColumn: string;
}

const COMPONENT_GRID_WIDTH = 2200;
const BASE_X = 36;
const BASE_Y = 36;
const NODE_GAP_X = 360;
const NODE_GAP_Y = 280;
const COMPONENT_GAP_X = 430;
const COMPONENT_GAP_Y = 380;
const ISOLATED_COLUMNS = 3;

const normalizeTableIdentifier = (value: string): string => {
    const stripped = value.replace(/["`\[\]]/g, '').trim();
    if (!stripped) {
        return '';
    }

    const parts = stripped.split('.').map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : stripped;
};

const buildRelationships = (tables: SchemaObject[]): TableRelation[] => {
    const tableNameByLower = new Map<string, string>();
    for (const table of tables) {
        tableNameByLower.set(table.name.toLowerCase(), table.name);
    }

    const seen = new Set<string>();
    const relations: TableRelation[] = [];

    for (const table of tables) {
        for (const column of table.columns || []) {
            const foreignTableRaw = column.foreignKey?.table;
            if (!foreignTableRaw) {
                continue;
            }

            const normalizedForeignTable = normalizeTableIdentifier(foreignTableRaw).toLowerCase();
            const targetTable = tableNameByLower.get(normalizedForeignTable);
            if (!targetTable) {
                continue;
            }

            const relationKey = `${table.name}:${column.name}->${targetTable}:${column.foreignKey?.column || 'id'}`;
            if (seen.has(relationKey)) {
                continue;
            }

            seen.add(relationKey);
            relations.push({
                sourceTable: table.name,
                targetTable,
                sourceColumn: column.name,
                targetColumn: column.foreignKey?.column || 'id',
            });
        }
    }

    return relations;
};

const buildEdges = (relations: TableRelation[]): Edge[] =>
    relations.map((relation, index) => ({
        id: `fk-${relation.sourceTable}-${relation.sourceColumn}-${relation.targetTable}-${relation.targetColumn}-${index}`,
        source: relation.sourceTable,
        sourceHandle: 'source',
        target: relation.targetTable,
        targetHandle: 'target',
        type: 'smoothstep',
        animated: true,
        label: `${relation.sourceTable}.${relation.sourceColumn} -> ${relation.targetTable}.${relation.targetColumn}`,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
        style: { stroke: '#38bdf8', strokeWidth: 1.4 },
        labelStyle: { fill: '#64748b', fontSize: 11, fontWeight: 500 },
        labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.92, rx: 4, ry: 4 },
        labelBgPadding: [6, 3],
    }));

const createLayoutPositions = (tables: SchemaObject[], relations: TableRelation[]): Map<string, { x: number; y: number }> => {
    const tableNames = tables.map((table) => table.name);
    const adjacency = new Map<string, Set<string>>();

    for (const tableName of tableNames) {
        adjacency.set(tableName, new Set());
    }

    for (const relation of relations) {
        adjacency.get(relation.sourceTable)?.add(relation.targetTable);
        adjacency.get(relation.targetTable)?.add(relation.sourceTable);
    }

    const visited = new Set<string>();
    const components: string[][] = [];

    for (const tableName of tableNames) {
        if (visited.has(tableName)) {
            continue;
        }

        const stack = [tableName];
        const component: string[] = [];
        visited.add(tableName);

        while (stack.length > 0) {
            const current = stack.pop()!;
            component.push(current);

            for (const neighbor of adjacency.get(current) || []) {
                if (visited.has(neighbor)) {
                    continue;
                }
                visited.add(neighbor);
                stack.push(neighbor);
            }
        }

        components.push(component);
    }

    const connectedComponents = components.filter(
        (component) => component.length > 1 || (adjacency.get(component[0])?.size || 0) > 0
    );
    const isolatedTables = components
        .filter((component) => component.length === 1 && (adjacency.get(component[0])?.size || 0) === 0)
        .map((component) => component[0]);

    connectedComponents.sort((a, b) => b.length - a.length);
    isolatedTables.sort((a, b) => a.localeCompare(b));

    const positions = new Map<string, { x: number; y: number }>();
    let cursorX = BASE_X;
    let cursorY = BASE_Y;
    let rowHeight = 0;

    for (const component of connectedComponents) {
        const sorted = [...component].sort((left, right) => {
            const degreeDiff = (adjacency.get(right)?.size || 0) - (adjacency.get(left)?.size || 0);
            if (degreeDiff !== 0) {
                return degreeDiff;
            }
            return left.localeCompare(right);
        });

        const columns = Math.max(2, Math.ceil(Math.sqrt(sorted.length)));
        const rows = Math.ceil(sorted.length / columns);

        sorted.forEach((tableName, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            positions.set(tableName, {
                x: cursorX + col * NODE_GAP_X,
                y: cursorY + row * NODE_GAP_Y,
            });
        });

        const componentWidth = columns * NODE_GAP_X;
        const componentHeight = rows * NODE_GAP_Y;
        rowHeight = Math.max(rowHeight, componentHeight);
        cursorX += componentWidth + COMPONENT_GAP_X;

        if (cursorX > COMPONENT_GRID_WIDTH) {
            cursorX = BASE_X;
            cursorY += rowHeight + COMPONENT_GAP_Y;
            rowHeight = 0;
        }
    }

    const isolatedStartX = connectedComponents.length > 0 ? COMPONENT_GRID_WIDTH + 140 : BASE_X;
    isolatedTables.forEach((tableName, index) => {
        const col = index % ISOLATED_COLUMNS;
        const row = Math.floor(index / ISOLATED_COLUMNS);
        const xJitter = (index * 37) % 92;
        const yJitter = (index * 53) % 70;

        positions.set(tableName, {
            x: isolatedStartX + col * (NODE_GAP_X - 44) + xJitter,
            y: BASE_Y + row * (NODE_GAP_Y - 26) + yJitter,
        });
    });

    return positions;
};

const TableNode = memo(({ id, data }: NodeProps<TableNodeData>) => {
    return (
        <div className="min-w-[300px] max-w-[340px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-[0_10px_34px_-20px_rgba(15,23,42,0.95)] backdrop-blur-sm">
            <Handle
                id="target"
                type="target"
                position={Position.Top}
                className="!h-2.5 !w-2.5 !border-2 !border-white dark:!border-slate-900 !bg-sky-400"
            />
            <Handle
                id="source"
                type="source"
                position={Position.Bottom}
                className="!h-2.5 !w-2.5 !border-2 !border-white dark:!border-slate-900 !bg-sky-400"
            />

            <button
                type="button"
                className="w-full px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-xl hover:from-sky-50 hover:to-cyan-50 dark:hover:from-slate-900 dark:hover:to-slate-800 transition-colors"
                onClick={() => data.onToggle(id)}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-500 dark:text-slate-300">
                        {data.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{data.tableName}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{data.columns.length} cols</span>
                            <span>•</span>
                            <span>{data.relationCount} links</span>
                            {data.isIsolated ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    <CircleOff className="h-3 w-3" />
                                    isolated
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </button>

            {data.expanded ? (
                <div className="max-h-72 overflow-y-auto px-3 py-3 space-y-1.5 ui-scrollbar">
                    {data.columns.map((column) => (
                        <div
                            key={`${data.tableName}-${column.name}`}
                            className="rounded-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{column.name}</span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                    {column.type}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px]">
                                {column.isPrimaryKey ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                        <KeyRound className="h-2.5 w-2.5" />
                                        PK
                                    </span>
                                ) : null}
                                {column.foreignKey ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                                        <Link2 className="h-2.5 w-2.5" />
                                        FK: {column.foreignKey.table}.{column.foreignKey.column}
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
                <div className="px-4 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">Click table name to expand columns</div>
            )}
        </div>
    );
});

TableNode.displayName = 'TableNode';

const nodeTypes = {
    tableNode: TableNode,
};

export const SchemaCanvas = ({ connection, database, schema, tables, isActive = true }: SchemaCanvasProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const flowWrapperRef = useRef<HTMLDivElement | null>(null);
    const flowRef = useRef<ReactFlowInstance | null>(null);

    const relationships = useMemo(() => buildRelationships(tables), [tables]);
    const layoutPositions = useMemo(() => createLayoutPositions(tables, relationships), [tables, relationships]);

    const relationCountByTable = useMemo(() => {
        const counts = new Map<string, number>();
        for (const table of tables) {
            counts.set(table.name, 0);
        }
        for (const relation of relationships) {
            counts.set(relation.sourceTable, (counts.get(relation.sourceTable) || 0) + 1);
            counts.set(relation.targetTable, (counts.get(relation.targetTable) || 0) + 1);
        }
        return counts;
    }, [tables, relationships]);

    const isolatedCount = useMemo(
        () => tables.filter((table) => (relationCountByTable.get(table.name) || 0) === 0).length,
        [tables, relationCountByTable]
    );

    const fitGraph = useCallback(
        (duration = 320) => {
            if (!isActive || !flowRef.current || tables.length === 0) {
                return;
            }

            flowRef.current.fitView({
                padding: 0.2,
                duration,
                includeHiddenNodes: false,
            });
        },
        [isActive, tables.length]
    );

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

            return tables.map((table) => {
                const previousNode = previousById.get(table.name) as Node<TableNodeData> | undefined;

                return {
                    id: table.name,
                    type: 'tableNode',
                    position: previousNode?.position || layoutPositions.get(table.name) || { x: BASE_X, y: BASE_Y },
                    data: {
                        tableName: table.name,
                        columns: table.columns || [],
                        expanded: previousNode?.data?.expanded || false,
                        relationCount: relationCountByTable.get(table.name) || 0,
                        isIsolated: (relationCountByTable.get(table.name) || 0) === 0,
                        onToggle: toggleNode,
                    },
                    draggable: true,
                } satisfies Node<TableNodeData>;
            });
        });
    }, [tables, layoutPositions, relationCountByTable, toggleNode, setNodes]);

    useEffect(() => {
        setEdges(buildEdges(relationships));
    }, [relationships, setEdges]);

    useEffect(() => {
        if (!isActive || tables.length === 0) {
            return;
        }

        const frame = window.requestAnimationFrame(() => fitGraph(420));
        const timer = window.setTimeout(() => fitGraph(260), 110);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, [isActive, tables.length, edges.length, fitGraph]);

    useEffect(() => {
        if (!isActive || !flowWrapperRef.current || tables.length === 0) {
            return;
        }

        const observer = new ResizeObserver(() => {
            fitGraph(130);
        });

        observer.observe(flowWrapperRef.current);
        return () => observer.disconnect();
    }, [isActive, tables.length, fitGraph]);

    if (!isActive) {
        return <div className="h-full w-full bg-slate-50 dark:bg-gray-900" />;
    }

    if (tables.length === 0) {
        return (
            <div className="h-full grid place-items-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center text-sm text-slate-500 dark:text-gray-400">
                    No schema metadata found for this selection.
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full min-h-0 bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#eef2ff_42%,_#f8fafc_80%)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a,_#0b1220_42%,_#0a1020_80%)] flex flex-col">
            <div className="shrink-0 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                {connection} / {database} / {schema}
            </div>
            <div ref={flowWrapperRef} className="flex-1 min-h-0">
                <ReactFlow
                    className="h-full w-full"
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onInit={(instance) => {
                        flowRef.current = instance;
                        fitGraph(320);
                    }}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.2}
                    maxZoom={2.3}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
                        style: { stroke: '#38bdf8', strokeWidth: 1.4 },
                    }}
                >
                    <Panel position="top-right">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm">
                            <div>{tables.length} tables</div>
                            <div>{relationships.length} relationships</div>
                            <div>{isolatedCount} isolated</div>
                        </div>
                    </Panel>
                    <Controls className="!bg-white/85 dark:!bg-slate-900/85 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !shadow-sm" />
                    <MiniMap
                        pannable
                        zoomable
                        className="!bg-white/90 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-700 !rounded-lg"
                        maskColor="rgba(148, 163, 184, 0.18)"
                        nodeColor={(node) => ((node.data as TableNodeData | undefined)?.isIsolated ? '#cbd5e1' : '#60a5fa')}
                        nodeStrokeColor="#0f172a"
                    />
                    <Background color="#94a3b8" gap={20} size={1.15} />
                </ReactFlow>
            </div>
        </div>
    );
};
