'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeTypes,
  Position,
} from 'react-flow-renderer';
import { Button } from '@/components/ui/button';
import NodeEditor from './NodeEditor';
import InviteModal from './InviteModal';
import { useFamilyStore } from '@/store/useFamilyStore';

const nodeTypes: NodeTypes = {
  person: ({ data }: any) => (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md text-center min-w-32 cursor-pointer">
      {data.photoUrl && (
        <img src={data.photoUrl} alt={data.name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
      )}
      <div className="font-semibold text-sm">{data.name}</div>
      {data.birthDate && <div className="text-xs text-gray-500">{data.birthDate}</div>}
    </div>
  ),
};

interface FamilyTreeProps {
  familyId: string;
}

export default function FamilyTree({ familyId }: FamilyTreeProps) {
  const { currentTree, setCurrentTree } = useFamilyStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Загружаем дерево из Zustand
  useEffect(() => {
    if (currentTree) {
      const flowNodes: Node[] = currentTree.nodes.map((n) => ({
        id: n.id,
        type: 'person',
        data: {
          name: n.name,
          birthDate: n.birthDate,
          photoUrl: n.photoUrl,
          bio: n.bio,
        },
        position: n.position,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }));
      const flowEdges: Edge[] = currentTree.edges.map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        animated: true,
      }));
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentTree, setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    setEditorOpen(true);
  };

  const handleSaveNode = (data: any) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, ...data, photoUrl: data.photoUrl || n.data.photoUrl } }
            : n
        )
      );
    } else {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'person',
        data: { name: data.name, birthDate: data.birthDate, photoUrl: data.photoUrl },
        position: { x: 300, y: 300 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
      setNodes((nds) => [...nds, newNode]);
    }
  };

  const addNode = () => {
    setSelectedNode(null);
    setEditorOpen(true);
  };

  return (
    <>
      <div className="h-screen w-full border rounded-lg relative bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>

        <div className="absolute top-4 left-4 flex gap-2 bg-white p-2 rounded-lg shadow">
          <Button size="sm" onClick={addNode}>
            Добавить
          </Button>
          <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
            Пригласить
          </Button>
        </div>
      </div>

      <NodeEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        node={selectedNode}
        onSave={handleSaveNode}
      />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        familyId={familyId}
      />
    </>
  );
}