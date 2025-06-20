/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Database/DependencyGraph.tsx
'use client'
import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import Controls from "reactflow";
import Background from 'reactflow';
import 'reactflow/dist/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import DatabaseService from '@/lib/database-service';

interface DependencyGraphProps {
    isOpen: boolean;
    onClose: () => void;
    schema: string;
    table: string;
    connectionId: string;
}

export const DependencyGraph = ({
    isOpen,
    onClose,
    schema,
    table,
    connectionId
}: DependencyGraphProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadGraphData = useCallback(async () => {
        setIsLoading(true);
        try {
            const dbService = DatabaseService.getInstance();
            const { nodes: dbNodes, edges: dbEdges } = await dbService.getTableDependencies(
                connectionId,
                schema,
                table
            );

            const formattedNodes = dbNodes.map((node: any) => ({
                id: node.id,
                type: 'table',
                position: node.position,
                data: {
                    label: node.label,
                    columns: node.columns
                },
                style: {
                    width: 250,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                }
            }));

            const formattedEdges = dbEdges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
                style: {
                    stroke: '#64748b'
                },
                label: edge.label,
                labelStyle: {
                    fill: '#94a3b8',
                    fontSize: '0.8rem'
                }
            }));

            setNodes(formattedNodes);
            setEdges(formattedEdges);
        } catch (error) {
            console.error('Failed to load dependency graph:', error);
        } finally {
            setIsLoading(false);
        }
    }, [connectionId, schema, table]);

    useEffect(() => {
        if (isOpen) {
            loadGraphData();
        }
    }, [isOpen, loadGraphData]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>
                        Dependency Graph: {schema}.{table}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            fitView
                        >
                            <Controls />
                            <Background />
                        </ReactFlow>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};