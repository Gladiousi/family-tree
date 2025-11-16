'use client';

import ReactFlow, { Controls, Background, Node, Edge, addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TreeNodeData {
    id: string;
    name: string;
    birth_date?: string;
    photo_url?: string;
    x: number;
    y: number;
}

export default function FamilyTreePage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

    const { data: treeNodes = [] } = useQuery({
        queryKey: ['nodes', id],
        queryFn: () => api.get<TreeNodeData[]>(`/nodes/?family=${id}`),
        onSuccess: (data) => {
            const flowNodes: Node[] = data.map((n) => ({
                id: n.id,
                type: 'default',
                data: { label: n.name },
                position: { x: n.x || 250, y: n.y || 100 },
            }));
            setNodes(flowNodes);
        },
    });

    const { data: treeEdges = [] } = useQuery({
        queryKey: ['edges', id],
        queryFn: () => api.get<any[]>(`/edges/?family=${id}`),
        onSuccess: (data) => {
            const flowEdges: Edge[] = data.map((e) => ({
                id: `${e.source}-${e.target}`,
                source: e.source,
                target: e.target,
                type: 'smoothstep',
            }));
            setEdges(flowEdges);
        },
    });

    const createNode = useMutation({
        mutationFn: (name: string) =>
            api.post('/nodes/', { name, family: id, x: 250, y: 100 }),
        onSuccess: (newNode) => {
            const flowNode: Node = {
                id: newNode.id,
                type: 'default',
                data: { label: newNode.name },
                position: { x: newNode.x || 250, y: newNode.y || 100 },
            };
            setNodes((nds) => [...nds, flowNode]);
            toast.success('Узел создан');
        },
        onError: () => toast.error('Ошибка создания'),
    });

    const saveEdges = useMutation({
        mutationFn: (edges: Edge[]) =>
            Promise.all(
                edges
                    .filter((e) => !e.id.startsWith('reactflow'))
                    .map((edge) =>
                        api.post('/edges/', {
                            source: edge.source,
                            target: edge.target,
                            family: id,
                        })
                    )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edges', id] });
            toast.success('Связи сохранены');
        },
    });

    const onConnect = (params: any) => {
        setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds));
    };

    const addNode = () => {
        const name = prompt('Имя человека:');
        if (name) createNode.mutate(name);
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white z-10">
                <h1 className="text-2xl font-bold">Семейное древо</h1>
                <div className="flex gap-2">
                    <Button onClick={addNode} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Добавить
                    </Button>
                    <Button onClick={() => saveEdges.mutate(edges)} variant="outline" size="sm">
                        <Save className="mr-2 h-4 w-4" /> Сохранить связи
                    </Button>
                </div>
            </div>
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-gray-50"
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}