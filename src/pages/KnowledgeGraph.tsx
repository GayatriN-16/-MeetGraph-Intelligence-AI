
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  RefreshCw,
  Network,
  CalendarDays,
  ListChecks,
  UserRound,
  FileText,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

import { api, type ProjectIntelligence } from '../api/client';

interface KnowledgeGraphProps {
  projectId: number;
}

function createGraphData(data: ProjectIntelligence): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const assignees = new Map<string, string>();

  const meetingX = 80;
  const taskX = 480;
  const personX = 900;
  const decisionX = 1300;

  const meetingGap = 260;
  const taskGap = 145;

  data.meetings.forEach((meeting, index) => {
    const meetingId = `meeting-${meeting.meeting_id}`;

    nodes.push({
      id: meetingId,
      position: {
        x: meetingX,
        y: 100 + index * meetingGap,
      },
      data: {
        label: `Meeting: ${meeting.title}`,
      },
      style: {
        background: '#F0E9FF',
        backgroundColor: '#F0E9FF',
        color: '#5135E8',
        border: '1px solid #6810D9',
        borderRadius: 14,
        padding: 16,
        width: 250,
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 5px 15px rgba(104, 16, 217, 0.10)',
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
        y: 80 + index * taskGap,
      },
      data: {
        label: `Task: ${task.task_description}`,
      },
      style: {
        background: '#FFFFFF',
        color: '#17152B',
        border: '1px solid #E2DDF5',
        borderRadius: 12,
        padding: 14,
        width: 250,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 5px 15px rgba(37, 33, 59, 0.08)',
      },
    });

    if (nodes.some((node) => node.id === meetingId)) {
      edges.push({
        id: `edge-${meetingId}-${taskId}`,
        source: meetingId,
        target: taskId,
        animated: true,
        style: {
          stroke: '#6810D9',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6810D9',
        },
      });
    }

    if (assignee !== 'Unassigned') {
      const assigneeId = `assignee-${assignee
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

      if (!assignees.has(assigneeId)) {
        assignees.set(assigneeId, assignee);

        nodes.push({
          id: assigneeId,
          position: {
            x: personX,
            y: 80 + index * taskGap,
          },
          data: {
            label: `Person: ${assignee}`,
          },
          style: {
            background: '#F0E9FF',
            color: '#625D7A',
            border: '1px solid #E2DDF5',
            borderRadius: 12,
            padding: 14,
            width: 190,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 5px 15px rgba(37, 33, 59, 0.08)',
          },
        });
      }

      edges.push({
        id: `edge-${taskId}-${assigneeId}`,
        source: taskId,
        target: assigneeId,
        style: {
          stroke: '#6810D9',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6810D9',
        },
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
        y: 100 + index * 160,
      },
      data: {
        label: `Decision: ${decision.title}`,
      },
      style: {
        background: '#F0E9FF',
        color: '#5135E8',
        border: '1px solid #6810D9',
        borderRadius: 12,
        padding: 14,
        width: 240,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 5px 15px rgba(104, 16, 217, 0.10)',
      },
    });

    if (nodes.some((node) => node.id === meetingId)) {
      edges.push({
        id: `edge-${meetingId}-${decisionId}`,
        source: meetingId,
        target: decisionId,
        style: {
          stroke: '#6810D9',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6810D9',
        },
      });
    }
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

  const assigneeCount = new Set(
    intelligence?.action_items
      .map((item) => item.assignee_name?.trim())
      .filter((name): name is string => Boolean(name)),
  ).size;

  const stats = [
    {
      label: 'Meetings',
      value: intelligence?.meetings.length ?? 0,
      detail: 'Recorded discussions',
      icon: CalendarDays,
      color: 'bg-[#F0E9FF] text-[#5135E8]',
    },
    {
      label: 'Action Items',
      value: intelligence?.action_items.length ?? 0,
      detail: 'Identified responsibilities',
      icon: ListChecks,
      color: 'bg-[#F0E9FF] text-[#625D7A]',
    },
    {
      label: 'Assignees',
      value: assigneeCount,
      detail: 'Named participants',
      icon: UserRound,
      color: 'bg-[#F0E9FF] text-[#625D7A]',
    },
    {
      label: 'Decisions',
      value: intelligence?.decisions.length ?? 0,
      detail: 'Recorded decisions',
      icon: FileText,
      color: 'bg-[#F0E9FF] text-[#5135E8]',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E9FF]">
          <RefreshCw
            className="animate-spin text-[#6810D9]"
            size={28}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#17152B]">
          Building your knowledge graph...
        </p>
        <p className="mt-1 text-xs text-[#89849F]">
          Connecting meetings, tasks and participants
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-8">
        <h2 className="font-bold text-[#DC2626]">
          Unable to load knowledge graph
        </h2>
        <p className="mt-2 text-sm text-[#DC2626]">{error}</p>
        <button
          type="button"
          onClick={() => void loadGraph()}
          className="mt-5 rounded-xl bg-[#6810D9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5135E8]"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#6810D9]/20 bg-gradient-to-r from-[#7412D8] to-[#5135E8] px-7 py-9 text-white shadow-[0_8px_24px_rgba(81,53,232,0.16)] md:px-9">
        <div className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-100px] right-[25%] h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <Sparkles size={14} className="text-white" />
              Project intelligence workspace
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Knowledge Graph
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 md:text-base">
              Discover how your meetings, responsibilities,
              participants and decisions connect in one
              intelligent workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-xl border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-white">
                <Network size={14} className="mr-2 inline text-white" />
                {nodeCount} graph nodes
              </span>
              <span className="rounded-xl border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-white">
                <ArrowUpRight size={14} className="mr-2 inline text-white" />
                {edgeCount} connections
              </span>
            </div>
          </div>

          <div className="hidden h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-white shadow-sm md:flex">
            <Network size={55} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={21} />
              </div>
              <ArrowUpRight size={18} className="text-[#89849F]" />
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17152B]">
              {value}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#17152B]">
              {label}
            </p>

            <p className="mt-1 text-xs text-[#89849F]">
              {detail}
            </p>
          </div>
        ))}
      </section>

      {/* Graph section */}
      <section className="overflow-hidden rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DDF5] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#F0E9FF] p-2 text-[#6810D9]">
                <Network size={19} />
              </div>
              <h2 className="text-lg font-bold text-[#17152B]">
                Project Relationship Map
              </h2>
            </div>

            <p className="mt-2 text-xs text-[#89849F]">
              {nodeCount} nodes · {edgeCount} connections
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadGraph()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E2DDF5] bg-[#F0E9FF] px-4 py-2.5 text-sm font-semibold text-[#17152B] shadow-sm transition hover:border-[#6810D9] hover:bg-[#F0E9FF] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh Graph
          </button>
        </div>

        {nodeCount === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-[#F0E9FF] p-5 text-[#6810D9]">
              <Network size={38} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#17152B]">
              No graph data available
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#89849F]">
              Upload and process meeting recordings to create
              connections between meetings, tasks and participants.
            </p>
          </div>
        ) : (
          <div className="h-[650px] w-full bg-[#F8F5FF]">
            <ReactFlow
              nodes={graph.nodes}
              edges={graph.edges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.15}
              maxZoom={2}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              proOptions={{ hideAttribution: false }}
            >
              <Background
                color="#E2DDF5"
                gap={22}
                size={1}
                variant={BackgroundVariant.Dots}
              />

              <Controls
                className="!overflow-hidden !rounded-xl !border-[#E2DDF5] !bg-[#FFFFFF] !shadow-md"
              />

              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => {
                  if (node.id.startsWith('meeting-')) return '#F0E9FF';
                  if (node.id.startsWith('task-')) return '#FFFFFF';
                  if (node.id.startsWith('assignee-')) return '#F0E9FF';
                  return '#E2DDF5';
                }}
                maskColor="rgba(248, 245, 255, 0.75)"
                className="!overflow-hidden !rounded-xl !border-[#E2DDF5] !bg-[#FFFFFF]"
              />
            </ReactFlow>
          </div>
        )}
      </section>

      {/* Legend */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#17152B]">
              Graph Legend
            </h3>
            <p className="mt-1 text-xs text-[#89849F]">
              Understand the different relationship types.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ['#F0E9FF', 'Meetings'],
              ['#FFFFFF', 'Action Items'],
              ['#F0E9FF', 'Assignees'],
              ['#E2DDF5', 'Decisions'],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-md border border-[#E2DDF5]"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-[#625D7A]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
