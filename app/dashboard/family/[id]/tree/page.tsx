'use client';

import ReactFlow, {
    Controls,
    Background,
    Node,
    Edge,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    NodeDragHandler,
    NodeChange,
    applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, TreePine, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useCallback, useEffect } from 'react';
import NodeEditor from '@/components/NodeEditor';
import NodeViewer from '@/components/NodeViewer';
import CustomNode from '@/components/CustomNode';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const nodeTypes = {
    custom: CustomNode,
};

interface TreeNodeData {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    photo_url?: string;
    x: number;
    y: number;
}

interface TreeEdgeData {
    id: string;
    source: string;
    target: string;
    source_id?: string;
    target_id?: string;
}

export default function FamilyTreePage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [nodes, setNodes] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [deleteEdgeOpen, setDeleteEdgeOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [pendingPositions, setPendingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

    const { data: treeNodes = [], isLoading: nodesLoading } = useQuery({
        queryKey: ['nodes', id],
        queryFn: () => api.get<TreeNodeData[]>(`/api/nodes/?family=${id}`),
    });

    const { data: treeEdges = [], isLoading: edgesLoading } = useQuery({
        queryKey: ['edges', id],
        queryFn: () => api.get<TreeEdgeData[]>(`/api/edges/?family=${id}`),
    });

    useEffect(() => {
        if (treeNodes.length > 0) {
            const flowNodes: Node[] = treeNodes.map((n) => ({
                id: String(n.id),
                type: 'custom',
                data: {
                    label: n.name,
                    name: n.name,
                    birthDate: n.birth_date,
                    deathDate: n.death_date,
                    bio: n.bio,
                    photoUrl: n.photo_url,
                },
                position: { x: n.x || 250, y: n.y || 100 },
            }));
            setNodes(flowNodes);
        } else if (treeNodes.length === 0 && !nodesLoading) {
            setNodes([]);
        }
    }, [treeNodes, setNodes, nodesLoading]);

    useEffect(() => {
        if (treeEdges.length > 0) {
            const flowEdges: Edge[] = treeEdges.map((e) => {
                const sourceId = e.source_id || e.source || String(e.source);
                const targetId = e.target_id || e.target || String(e.target);
                return {
                    id: e.id || `${sourceId}-${targetId}`,
                    source: String(sourceId),
                    target: String(targetId),
                    type: 'smoothstep',
                };
            });
            setEdges(flowEdges);
        } else if (treeEdges.length === 0 && !edgesLoading) {
            setEdges([]);
        }
    }, [treeEdges, setEdges, edgesLoading]);

    const createNode = useMutation({
        mutationFn: (data: {
            name: string;
            birth_date?: string;
            x?: number;
            y?: number;
        }) =>
            api.post<TreeNodeData>('/api/nodes/', {
                name: data.name,
                birth_date: data.birth_date,
                family: id,
                x: data.x || 250,
                y: data.y || 100,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка создания узла');
        },
    });

    const updateNode = useMutation({
        mutationFn: ({
            nodeId,
            data,
            photo,
        }: {
            nodeId: string;
            data: any;
            photo?: File;
        }) => {
            if (photo) {
                const formData = new FormData();
                formData.append('photo', photo);
                Object.keys(data).forEach((key) => {
                    if (data[key] !== undefined && data[key] !== null) {
                        formData.append(key, data[key]);
                    }
                });
                return api.patch<TreeNodeData>(`/api/nodes/${nodeId}/`, formData, true);
            }
            return api.patch<TreeNodeData>(`/api/nodes/${nodeId}/`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
        },
        onError: (err: any) => {
            const errorMsg = err.message || err.detail || 'Ошибка обновления узла';
            toast.error(errorMsg);
        },
    });

    const saveAllPositions = useMutation({
        mutationFn: async (positions: Map<string, { x: number; y: number }>) => {
            const existingNodeIds = new Set(nodes.map(n => String(n.id)));
            const validPositions = Array.from(positions.entries()).filter(([nodeId]) =>
                existingNodeIds.has(String(nodeId))
            );

            if (validPositions.length === 0) {
                setPendingPositions(new Map());
                return;
            }

            const updates = validPositions.map(async ([nodeId, pos]) => {
                try {
                    const nodeIdStr = String(nodeId);
                    return await api.patch(`/api/nodes/${nodeIdStr}/`, { x: pos.x, y: pos.y });
                } catch (error: any) {
                    console.error(`Ошибка сохранения узла ${nodeId}:`, error);
                    throw error;
                }
            });
            await Promise.all(updates);
        },
        onSuccess: () => {
            setPendingPositions(new Map());
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
            toast.success('Позиции успешно сохранены');
        },
        onError: (err: any) => {
            const errorMsg = err.message || err.detail || 'Ошибка сохранения позиций';
            toast.error(errorMsg);
        },
    });

    const saveEdge = useMutation({
        mutationFn: ({ source, target }: { source: string; target: string }) =>
            api.post('/api/edges/', {
                source: String(source),
                target: String(target),
                family: id,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edges', id] });
        },
        onError: (err: any) => {
            const errorMsg = err.message || err.detail || 'Ошибка создания связи';
            toast.error(errorMsg);
        },
    });

    const deleteNode = useMutation({
        mutationFn: (nodeId: string) => api.delete(`/api/nodes/${nodeId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
            queryClient.invalidateQueries({ queryKey: ['edges', id] });
            setViewerOpen(false);
            setSelectedNode(null);
        },
        onError: (err: any) => {
            const errorMsg = err.message || err.detail || 'Ошибка удаления узла';
            toast.error(errorMsg);
        },
    });

    const deleteEdge = useMutation({
        mutationFn: (edgeId: string) => api.delete(`/api/edges/${edgeId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edges', id] });
            setDeleteEdgeOpen(false);
            setSelectedEdge(null);
            toast.success('Связь успешно удалена');
        },
        onError: (err: any) => {
            const errorMsg = err.message || err.detail || 'Ошибка удаления связи';
            toast.error(errorMsg);
        },
    });

    const onConnect = useCallback(
        (params: Connection) => {
            if (!params.source || !params.target) return;

            if (params.source === params.target) {
                toast.error('Нельзя связать узел сам с собой');
                return;
            }

            const edgeId = `${params.source}-${params.target}`;
            const existingEdge = edges.find(
                (e) => e.source === params.source && e.target === params.target
            );
            if (existingEdge) {
                toast.error('Связь уже существует');
                return;
            }

            setEdges((eds) => addEdge({ ...params, type: 'smoothstep', id: edgeId }, eds));
            saveEdge.mutate(
                { source: params.source, target: params.target },
                {
                    onError: () => {
                        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
                    },
                }
            );
        },
        [edges, setEdges, saveEdge]
    );

    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const updatedNodes = applyNodeChanges(changes, nodes);
            setNodes(updatedNodes);

            changes.forEach((change) => {
                if (change.type === 'position' && change.dragging === false && change.position) {
                    const nodeId = String(change.id);
                    setPendingPositions((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(nodeId, { x: change.position!.x, y: change.position!.y });
                        return newMap;
                    });
                }

                if (change.type === 'select') {
                    if (!change.selected && change.id === selectedNode?.id) {
                        setSelectedNode(null);
                    }
                }
            });
        },
        [nodes, selectedNode, setNodes]
    );

    const onNodeDragStop: NodeDragHandler = useCallback(
        (_, node) => {
            setPendingPositions((prev) => {
                const newMap = new Map(prev);
                newMap.set(String(node.id), { x: node.position.x, y: node.position.y });
                return newMap;
            });
        },
        []
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNode(node);
        setViewerOpen(true);
    }, []);

    const onEdgeClick = useCallback((_: any, edge: Edge) => {
        setSelectedEdge(edge);
        setDeleteEdgeOpen(true);
    }, []);

    const handleDeleteEdge = useCallback(() => {
        if (selectedEdge) {
            const treeEdge = treeEdges.find((e: TreeEdgeData) => {
                const sourceId = e.source_id || e.source || String(e.source);
                const targetId = e.target_id || e.target || String(e.target);
                return (
                    selectedEdge.id === e.id ||
                    (selectedEdge.source === String(sourceId) &&
                        selectedEdge.target === String(targetId))
                );
            });
            if (treeEdge && treeEdge.id) {
                deleteEdge.mutate(treeEdge.id);
            } else if (selectedEdge.id) {
                deleteEdge.mutate(selectedEdge.id);
            }
        }
    }, [selectedEdge, treeEdges, deleteEdge]);

    const handleEditNode = useCallback(() => {
        setViewerOpen(false);
        setEditorOpen(true);
    }, []);

    const handleDeleteNode = useCallback(() => {
        if (selectedNode) {
            deleteNode.mutate(String(selectedNode.id));
        }
    }, [selectedNode, deleteNode]);

    const handleSaveNode = useCallback(
        (data: any) => {
            if (selectedNode) {
                updateNode.mutate({
                    nodeId: String(selectedNode.id),
                    data: {
                        name: data.name,
                        birth_date: data.birthDate,
                        death_date: data.deathDate || null,
                        bio: data.bio || '',
                    },
                    photo: data.photo,
                });
            } else {
                createNode.mutate({
                    name: data.name,
                    birth_date: data.birthDate,
                    x: 300,
                    y: 300,
                });
            }
            setEditorOpen(false);
            setSelectedNode(null);
        },
        [selectedNode, updateNode, createNode]
    );

    const addNode = () => {
        setSelectedNode(null);
        setEditorOpen(true);
    };

    if (nodesLoading || edgesLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Загрузка дерева...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="h-screen flex flex-col bg-gray-50">
                <div className="p-3 sm:p-4 md:p-6 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href={`/dashboard/family/${id}`}>
                            <Button variant="ghost" size="sm" className="shrink-0">
                                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Назад</span>
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                                Семейное древо
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {nodes.length}{' '}
                                {nodes.length === 1
                                    ? 'человек'
                                    : nodes.length < 5
                                      ? 'человека'
                                      : 'человек'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {pendingPositions.size > 0 && (
                            <Button
                                onClick={() => saveAllPositions.mutate(pendingPositions)}
                                variant="outline"
                                size="sm"
                                disabled={saveAllPositions.isPending}
                                className="flex-1 sm:flex-none"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {saveAllPositions.isPending
                                        ? 'Сохранение...'
                                        : `Сохранить (${pendingPositions.size})`}
                                </span>
                                <span className="sm:hidden">
                                    {saveAllPositions.isPending ? '...' : `(${pendingPositions.size})`}
                                </span>
                            </Button>
                        )}
                        <Button
                            onClick={addNode}
                            size="sm"
                            variant="default"
                            className="flex-1 sm:flex-none"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Добавить человека</span>
                            <span className="sm:hidden">Добавить</span>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={handleNodesChange}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        elementsSelectable={true}
                        selectNodesOnDrag={false}
                        onEdgesChange={(changes) => {
                            onEdgesChange(changes);
                            changes.forEach((change) => {
                                if (change.type === 'remove' && change.id) {
                                    const treeEdge = treeEdges.find((e: TreeEdgeData) => {
                                        const sourceId =
                                            e.source_id || e.source || String(e.source);
                                        const targetId =
                                            e.target_id || e.target || String(e.target);
                                        return (
                                            change.id === e.id ||
                                            (change.id &&
                                                change.id.includes(String(sourceId)) &&
                                                change.id.includes(String(targetId)))
                                        );
                                    });
                                    if (treeEdge && treeEdge.id) {
                                        deleteEdge.mutate(treeEdge.id);
                                    }
                                }
                            });
                        }}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onNodeDragStop={onNodeDragStop}
                        edgesFocusable={true}
                        edgesUpdatable={false}
                        fitView
                        className="bg-gray-50"
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
                            <Card className="text-center p-8 max-w-md shadow-xl">
                                <TreePine className="h-16 w-16 mx-auto mb-4 text-primary" />
                                <h3 className="text-xl font-semibold mb-2">Дерево пусто</h3>
                                <p className="text-muted-foreground mb-6">
                                    Начните с добавления первого человека в ваше семейное древо
                                </p>
                                <Button onClick={addNode} size="lg">
                                    <Plus className="mr-2 h-4 w-4" /> Добавить первого человека
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <NodeViewer
                open={viewerOpen}
                onClose={() => {
                    setViewerOpen(false);
                    setSelectedNode(null);
                }}
                node={selectedNode}
                onEdit={handleEditNode}
                onDelete={handleDeleteNode}
                isDeleting={deleteNode.isPending}
            />
            <NodeEditor
                open={editorOpen}
                onClose={() => {
                    setEditorOpen(false);
                    setSelectedNode(null);
                }}
                node={selectedNode}
                onSave={handleSaveNode}
            />

            <AlertDialog open={deleteEdgeOpen} onOpenChange={setDeleteEdgeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить эту связь между узлами? Это действие
                            нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteEdgeOpen(false)}>
                            Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEdge}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteEdge.isPending}
                        >
                            {deleteEdge.isPending ? 'Удаление...' : 'Удалить'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}