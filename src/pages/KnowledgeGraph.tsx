
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  RefreshCw,
  Network,
  CalendarDays,
  ListChecks,
  UserRound,
  FileText,
} from 'lucide-react';

import {
  api,
  type ProjectIntelligence,
} from '../api/client';

interface KnowledgeGraphProps {
  projectId: number;
}

function createGraphData(data: ProjectIntelligence): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const meetingX = 80;
  const meetingY = 100;
  const meetingGap = 240;

  const taskX = 480;
  const taskY = 80;
  const taskGap = 130;

  const decisionX = 900;

  const assignees = new Map<string, string>();

  data.meetings.forEach((meeting, index) => {
    const meetingId = `meeting-${meeting.meeting_id}`;

    nodes.push({
      id: meetingId,
      position: {
        x: meetingX,
        y: meetingY + index * meetingGap,
      },
      data: {
        label: `Meeting: ${meeting.title}`,
      },
      style: {
        background: '#4A3B2A',
        color: '#FFFFFF',
        border: '1px solid #4A3B2A',
        borderRadius: 12,
        padding: 14,
        width: 230,
        fontSize: 13,
        fontWeight: 600,
      },
    });
  });

  data.action_items.forEach((task, index) => {
    const taskId = `task-${task.id}`;
    const meetingId = `meeting-${task.meeting_id}`;

    const assignee =
      task.assignee_name?.trim() || 'Unassigned';

    nodes.push({
      id: taskId,
      position: {
        x: taskX,
        y: taskY + index * taskGap,
      },
      data: {
        label: `Task: ${task.task_description}`,
      },
      style: {
        background: '#FFFDF9',
        color: '#3F3022',
        border: '1px solid #CBB994',
        borderRadius: 10,
        padding: 12,
        width: 230,
        fontSize: 12,
      },
    });

    edges.push({
      id: `edge-${meetingId}-${taskId}`,
      source: meetingId,
      target: taskId,
      animated: true,
      style: { stroke: '#B58B3F', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed },
    });

    if (assignee !== 'Unassigned') {
      const assigneeId = `assignee-${assignee.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      if (!assignees.has(assigneeId)) {
        assignees.set(assigneeId, assignee);

        nodes.push({
          id: assigneeId,
          position: {
            x: 800,
            y: taskY + index * taskGap,
          },
          data: {
            label: `Person: ${assignee}`,
          },
          style: {
            background: '#EFE2C9',
            color: '#765522',
            border: '1px solid #B58B3F',
            borderRadius: 10,
            padding: 12,
            width: 180,
            fontSize: 12,
            fontWeight: 600,
          },
        });
      }

      edges.push({
        id: `edge-${taskId}-${assigneeId}`,
        source: taskId,
        target: assigneeId,
        style: { stroke: '#A47A32', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
  });

  data.decisions.forEach((decision, index) => {
    const decisionId = `decision-${decision.id}`;
    const meetingId = `meeting-${decision.meeting_id}`;

    nodes.push({
      id: decisionId,
      position: {
        x: decisionX,
        y: 100 + index * 150,
      },
      data: {
        label: `Decision: ${decision.title}`,
      },
      style: {
        background: '#F3EEE5',
        color: '#3F3022',
        border: '1px solid #9C8665',
        borderRadius: 10,
        padding: 12,
        width: 230,
        fontSize: 12,
      },
    });

    edges.push({
      id: `edge-${meetingId}-${decisionId}`,
      source: meetingId,
      target: decisionId,
      style: { stroke: '#8B7B6A', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });

  return { nodes, edges };
}

export default function KnowledgeGraph({
  projectId,
}: KnowledgeGraphProps) {
  const [intelligence, setIntelligence] =
    useState<ProjectIntelligence | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.getIntelligence(projectId);
      setIntelligence(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load knowledge graph.',
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  const graph = useMemo(
    () =>
      intelligence
        ? createGraphData(intelligence)
        : { nodes: [], edges: [] },
    [intelligence],
  );

  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-[#B58B3F]" size={28} />
        <span className="ml-3 text-sm text-[#766654]">
          Building project knowledge graph...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load knowledge graph
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          onClick={() => void loadGraph()}
          className="mt-4 rounded-lg bg-[#4A3B2A] px-4 py-2 text-sm text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#B58B3F]">
            Project Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#3F3022]">
            Knowledge Graph
          </h1>
          <p className="mt-2 text-sm text-[#766654]">
            Explore relationships between meetings, tasks, assignees and decisions.
          </p>
        </div>

        <button
          onClick={() => void loadGraph()}
          className="flex items-center gap-2 rounded-lg border border-[#DED3C3] bg-[#FFFDF9] px-4 py-2.5 text-sm font-semibold text-[#3F3022] hover:bg-[#EFE2C9]"
        >
          <RefreshCw size={16} />
          Refresh Graph
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: 'Meetings',
            value: intelligence?.meetings.length ?? 0,
            icon: CalendarDays,
          },
          {
            label: 'Action Items',
            value: intelligence?.action_items.length ?? 0,
            icon: ListChecks,
          },
          {
            label: 'Assignees',
            value: new Set(
              intelligence?.action_items
                .map((item) => item.assignee_name?.trim())
                .filter((name): name is string => Boolean(name)),
            ).size,
            icon: UserRound,
          },
          {
            label: 'Decisions',
            value: intelligence?.decisions.length ?? 0,
            icon: FileText,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#766654]">{label}</span>
              <Icon size={18} className="text-[#A47A32]" />
            </div>
            <p className="mt-3 text-2xl font-bold text-[#3F3022]">
              {value}
            </p>
          </div>
        ))}
      </section>

      {nodeCount === 0 ? (
        <div className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-12 text-center">
          <Network size={36} className="mx-auto text-[#B58B3F]" />
          <h2 className="mt-4 font-bold text-[#3F3022]">
            No graph data available
          </h2>
          <p className="mt-2 text-sm text-[#766654]">
            Upload and process meeting recordings to create graph connections.
          </p>
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-xl border border-[#DED3C3] bg-[#FFFDF9]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DED3C3] px-5 py-4">
              <div>
                <h2 className="font-bold text-[#3F3022]">
                  Project Relationship Map
                </h2>
                <p className="mt-1 text-xs text-[#766654]">
                  {nodeCount} nodes · {edgeCount} connections
                </p>
              </div>
              <span className="text-xs text-[#766654]">
                Drag nodes and zoom to explore
              </span>
            </div>

            <div className="h-[620px] w-full">
              <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={2}
                nodesDraggable
                nodesConnectable={false}
                elementsSelectable
              >
                <Background color="#DED3C3" gap={20} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    if (node.id.startsWith('meeting-')) return '#4A3B2A';
                    if (node.id.startsWith('task-')) return '#CBB994';
                    if (node.id.startsWith('assignee-')) return '#B58B3F';
                    return '#9C8665';
                  }}
                />
              </ReactFlow>
            </div>
          </section>

          <section className="flex flex-wrap gap-5 rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-4">
            {[
              ['#4A3B2A', 'Meetings'],
              ['#CBB994', 'Action Items'],
              ['#B58B3F', 'Assignees'],
              ['#9C8665', 'Decisions'],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-[#766654]">{label}</span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
