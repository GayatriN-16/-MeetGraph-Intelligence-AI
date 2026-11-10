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
        background: '#DDF3F3',
        backgroundColor: '#DDF3F3',
        color: '#187D87',
        border: '1px solid #269BA5',
        borderRadius: 14,
        padding: 16,
        width: 250,
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 5px 15px rgba(24, 125, 135, 0.07)',
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
        color: '#187D87',
        border: '1px solid #C6E5E6',
        borderRadius: 12,
        padding: 14,
        width: 250,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 5px 15px rgba(24, 125, 135, 0.06)',
      },
    });

    if (nodes.some((node) => node.id === meetingId)) {
      edges.push({
        id: `edge-${meetingId}-${taskId}`,
        source: meetingId,
        target: taskId,
        animated: true,
        style: {
          stroke: '#269BA5',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#269BA5',
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
            background: '#F3FAFA',
            color: '#187D87',
            border: '1px solid #B4DCDD',
            borderRadius: 12,
            padding: 14,
            width: 190,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 5px 15px rgba(24, 125, 135, 0.06)',
          },
        });
      }

      edges.push({
        id: `edge-${taskId}-${assigneeId}`,
        source: taskId,
        target: assigneeId,
        style: {
          stroke: '#269BA5',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#269BA5',
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
        background: '#DDF3F3',
        color: '#187D87',
        border: '1px solid #269BA5',
        borderRadius: 12,
        padding: 14,
        width: 240,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 5px 15px rgba(24, 125, 135, 0.06)',
      },
    });

    if (nodes.some((node) => node.id === meetingId)) {
      edges.push({
        id: `edge-${meetingId}-${decisionId}`,
        source: meetingId,
        target: decisionId,
        style: {
          stroke: '#269BA5',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#269BA5',
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
      color: 'bg-[#DDF3F3] text-[#269BA5]',
    },
    {
      label: 'Action Items',
      value: intelligence?.action_items.length ?? 0,
      detail: 'Identified responsibilities',
      icon: ListChecks,
      color: 'bg-[#F3FAFA] text-[#55505A]',
    },
    {
      label: 'Assignees',
      value: assigneeCount,
      detail: 'Named participants',
      icon: UserRound,
      color: 'bg-[#F3FAFA] text-[#55505A]',
    },
    {
      label: 'Decisions',
      value: intelligence?.decisions.length ?? 0,
      detail: 'Recorded decisions',
      icon: FileText,
      color: 'bg-[#DDF3F3] text-[#269BA5]',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDF3F3]">
          <RefreshCw
            className="animate-spin text-[#269BA5]"
            size={28}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#187D87]">
          Building your knowledge graph...
        </p>
        <p className="mt-1 text-xs text-[#89818B]">
          Connecting meetings, tasks and participants
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h2 className="font-bold text-red-800">
          Unable to load knowledge graph
        </h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadGraph()}
          className="mt-5 rounded-xl bg-[#187D87] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#269BA5]"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#C6E5E6] bg-white px-7 py-9 text-[#187D87] shadow-sm md:px-9">
        <div className="absolute -right-12 -top-28 h-80 w-80 rounded-full bg-[#269BA5]/20 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[25%] h-60 w-60 rounded-full bg-[#DDF3F3]/80 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C6E5E6] bg-[#F3FAFA] px-3 py-1.5 text-xs font-semibold text-[#55505A]">
              <Sparkles size={14} className="text-[#269BA5]" />
              Project intelligence workspace
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#187D87] md:text-4xl">
              Knowledge Graph
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#55505A] md:text-base">
              Discover how your meetings, responsibilities,
              participants and decisions connect in one
              intelligent workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-xl border border-[#C6E5E6] bg-[#F3FAFA] px-4 py-2 text-xs font-semibold text-[#187D87]">
                <Network size={14} className="mr-2 inline text-[#269BA5]" />
                {nodeCount} graph nodes
              </span>
              <span className="rounded-xl border border-[#C6E5E6] bg-[#F3FAFA] px-4 py-2 text-xs font-semibold text-[#187D87]">
                <ArrowUpRight size={14} className="mr-2 inline text-[#269BA5]" />
                {edgeCount} connections
              </span>
            </div>
          </div>

          <div className="hidden h-28 w-28 items-center justify-center rounded-3xl border border-[#C6E5E6] bg-[#DDF3F3] text-[#269BA5] shadow-sm md:flex">
            <Network size={55} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={21} />
              </div>
              <ArrowUpRight size={18} className="text-[#89818B]" />
            </div>

            <p className="mt-5 text-3xl font-bold text-[#187D87]">
              {value}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#187D87]">
              {label}
            </p>

            <p className="mt-1 text-xs text-[#89818B]">
              {detail}
            </p>
          </div>
        ))}
      </section>

      {/* Graph section */}
      <section className="overflow-hidden rounded-2xl border border-[#C6E5E6] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C6E5E6] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#DDF3F3] p-2 text-[#269BA5]">
                <Network size={19} />
              </div>
              <h2 className="text-lg font-bold text-[#187D87]">
                Project Relationship Map
              </h2>
            </div>

            <p className="mt-2 text-xs text-[#89818B]">
              {nodeCount} nodes · {edgeCount} connections
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadGraph()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#C6E5E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#187D87] shadow-sm transition hover:border-[#269BA5] hover:bg-[#F3FAFA] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh Graph
          </button>
        </div>

        {nodeCount === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-[#DDF3F3] p-5 text-[#269BA5]">
              <Network size={38} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#187D87]">
              No graph data available
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#89818B]">
              Upload and process meeting recordings to create
              connections between meetings, tasks and participants.
            </p>
          </div>
        ) : (
          <div className="h-[650px] w-full bg-[#F3FAFA]">
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
                color="#C6E5E6"
                gap={22}
                size={1}
                variant={BackgroundVariant.Dots}
              />

              <Controls
                className="!overflow-hidden !rounded-xl !border-[#C6E5E6] !bg-white !shadow-md"
              />

              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => {
                  if (node.id.startsWith('meeting-')) return '#DDF3F3';
                  if (node.id.startsWith('task-')) return '#FFFFFF';
                  if (node.id.startsWith('assignee-')) return '#B4DCDD';
                  return '#C6E5E6';
                }}
                maskColor="rgba(243, 250, 250, 0.7)"
                className="!overflow-hidden !rounded-xl !border-[#C6E5E6] !bg-white"
              />
            </ReactFlow>
          </div>
        )}
      </section>

      {/* Legend */}
      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#187D87]">
              Graph Legend
            </h3>
            <p className="mt-1 text-xs text-[#89818B]">
              Understand the different relationship types.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              ['#DDF3F3', 'Meetings'],
              ['#FFFFFF', 'Action Items'],
              ['#B4DCDD', 'Assignees'],
              ['#C6E5E6', 'Decisions'],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-md border border-[#C6E5E6]"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-[#55505A]">
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