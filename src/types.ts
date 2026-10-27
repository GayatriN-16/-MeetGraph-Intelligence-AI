export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'meetings'
  | 'tasks-decisions'
  | 'knowledge-graph'
  | 'ask-ai'
  | 'projects'
  | 'notifications'
  | 'architecture'
  | 'integrations'
  | 'admin-audit'
  | 'settings';

export interface Project {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  meetingsCount: number;
  decisionsCount: number;
  tasksCount: number;
  health: 'On Track' | 'High Risk' | 'Needs Review';
  createdAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  colorBg: string;
}

export type ProcessingStage =
  | 'Queued'
  | 'Audio preprocessing'
  | 'Transcribing'
  | 'Extracting summaries, tasks and decisions'
  | 'Building knowledge relationships'
  | 'Indexing for retrieval'
  | 'Completed'
  | 'Failed';

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  timecode: string; // e.g. "24:18"
  seconds: number;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'conflict';
  isKeyDecision?: boolean;
}

export interface Meeting {
  id: string;
  projectId?: string;
  project: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  durationSeconds: number;
  speakers: Speaker[];
  graphStatus?: 'Completed / Indexed' | 'Processing' | 'Queued';
  processingStage?: ProcessingStage;
  statusPercent?: number;
  summary: string;
  keyDiscussionPoints?: string[];
  keyTakeaways: string[];
  audioFileName?: string;
  audioSizeMb?: number;
  sourceType?: 'MP3' | 'MP4' | 'WAV' | 'M4A' | 'Google Meet' | 'Microsoft Teams' | 'Teams' | 'Zoom' | 'Manual Upload';
  transcript: TranscriptSegment[];
}

export interface Decision {
  id: string;
  projectId?: string;
  title: string;
  topic?: string;
  confidence: number;
  speaker: Speaker;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  timecode: string;
  status: 'Verified' | 'AI Extracted' | 'User Confirmed' | 'Needs Review';
  category?: string;
  rationale?: string;
  graphTraceNodes?: string[];
  createdAt?: string;
}

export interface Task {
  id: string;
  projectId?: string;
  title?: string;
  taskDescription: string;
  assignee: Speaker;
  assigneeName?: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  status?: 'AI Extracted' | 'User Confirmed' | 'Completed' | 'Overdue';
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  timecode: string;
  jiraTicketId?: string;
}

// Alias for backward compatibility
export type ActionItem = Task;

export interface GraphNodeData {
  label: string;
  entityType?: 'Meeting' | 'Person' | 'Project' | 'Task' | 'Decision' | 'Topic' | 'Risk';
  category?: string;
  sourceMeetingTitle?: string;
  confidence?: number;
  date?: string;
  details?: string;
  summary?: string;
  role?: string;
  quotes?: string[];
  status?: string;
  delta?: string;
  [key: string]: unknown;
}

export interface ReactFlowNode {
  id: string;
  type?: string;
  data: GraphNodeData;
  position: { x: number; y: number };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, string>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'project' | 'meeting' | 'speaker' | 'decision' | 'action' | 'topic' | 'milestone' | 'risk';
  category?: string;
  x?: number;
  y?: number;
  connectedIds: string[];
}

export interface TimelineConflictRisk {
  id: string;
  title: string;
  deltaDays: number;
  description: string;
  status?: 'Possible conflict â€” review required' | 'Resolved';
  node1: {
    title: string;
    meetingTitle: string;
    meetingId?: string;
    date: string;
    targetDate: string;
    quote: string;
    speaker: string;
    timecode: string;
  };
  node2: {
    title: string;
    meetingTitle: string;
    meetingId?: string;
    date: string;
    targetDate: string;
    quote: string;
    speaker: string;
    timecode: string;
  };
}

// Alias for backward compatibility
export type TimelineConflict = TimelineConflictRisk;

export interface ExtractionPipelineStep {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  status: 'completed' | 'processing' | 'queued';
  iconType: 'neo4j' | 'whisper' | 'audio';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
  meetingId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: 'Transcription' | 'Neo4j Graph' | 'GraphRAG' | 'Auth' | 'Jira Sync';
  status: 'Success' | 'Warning' | 'Error';
  ipAddress: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: 'Live Meetings' | 'Calendar & Tasks' | 'Messaging & Ops';
  icon: string;
  status: 'Connected' | 'Available' | 'Syncing';
  lastSynced: string;
  meetingsSyncedCount: number;
}
