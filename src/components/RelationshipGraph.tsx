import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useMemo } from "react";

export type RelationNodeView = {
  id: string;
  label: string;
  kind: "tale" | "figure" | "institution" | "motif";
  subtitle: string;
  x: number;
  y: number;
};

export type RelationEdgeView = {
  id: string;
  source: string;
  target: string;
  label: string;
  kind?: string;
};

type GraphNodeData = {
  label: string;
  kind: RelationNodeView["kind"];
  subtitle: string;
};

type RelationshipGraphProps = {
  nodes: RelationNodeView[];
  edges: RelationEdgeView[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

function RegisterNode({ data, selected }: NodeProps<Node<GraphNodeData>>) {
  return (
    <div className={`relation-node relation-node--${data.kind}${selected ? " is-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <span>{data.kind}</span>
      <strong>{data.label}</strong>
      <small>{data.subtitle}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { registerNode: RegisterNode };

export function RelationshipGraph({ nodes, edges, selectedId, onSelect }: RelationshipGraphProps) {
  const flowNodes = useMemo<Array<Node<GraphNodeData>>>(() => nodes.map((node) => ({
    id: node.id,
    type: "registerNode",
    position: { x: node.x, y: node.y },
    selected: node.id === selectedId,
    data: { label: node.label, kind: node.kind, subtitle: node.subtitle },
  })), [nodes, selectedId]);

  const flowEdges = useMemo<Edge[]>(() => edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    markerEnd: { type: MarkerType.ArrowClosed },
    className: `relation-edge relation-edge--${edge.kind ?? "related"}`,
  })), [edges]);

  return (
    <section className="workspace-view relations-view" aria-labelledby="relations-title">
      <header className="workspace-view-heading">
        <div>
          <h1 id="relations-title">The relation register</h1>
          <p>Editorial links among records, figures, institutions, and recurring motifs. Drag to inspect; select any slip to return to its evidence.</p>
        </div>
        <dl>
          <div><dt>Visible slips</dt><dd>{nodes.length}</dd></div>
          <div><dt>Declared links</dt><dd>{edges.length}</dd></div>
        </dl>
      </header>
      <div className="relationship-canvas" aria-label="Interactive relationship network">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onSelect(node.id)}
          fitView
          minZoom={0.35}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Lines} gap={36} size={0.7} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}
