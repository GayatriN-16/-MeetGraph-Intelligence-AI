import { Meeting, Decision, ActionItem, TimelineConflict, ExtractionPipelineStep, GraphNode, Speaker, AuditLog, IntegrationService } from '../types';

export const SPEAKERS: Record<string, Speaker> = {
  PS: {
    id: 'sp_ps',
    name: 'Priya Sharma',
    role: 'Tech Lead',
    avatarInitials: 'PS',
    colorBg: 'bg-indigo-600 text-white'
  },
  AM: {
    id: 'sp_am',
    name: 'Arjun Mehta',
    role: 'Product Lead',
    avatarInitials: 'AM',
    colorBg: 'bg-emerald-600 text-white'
  },
  AV: {
    id: 'sp_av',
    name: 'Alex Vance',
    role: 'Core Architect / Admin',
    avatarInitials: 'AV',
    colorBg: 'bg-amber-600 text-white'
  },
  DC: {
    id: 'sp_dc',
    name: 'David Chen',
    role: 'Security Engineer',
    avatarInitials: 'DC',
    colorBg: 'bg-blue-600 text-white'
  },
  GS: {
    id: 'sp_gs',
    name: 'Gina Smith',
    role: 'Research Scientist',
    avatarInitials: 'GS',
    colorBg: 'bg-slate-600 text-white'
  }
};

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Q3 Product Roadmap Planning',
    project: 'Product Launch v1',
    date: 'Oct 24, 2026',
    time: '10:00 AM EST',
    duration: '54m 12s',
    durationSeconds: 3252,
    speakers: [SPEAKERS.PS, SPEAKERS.AM, SPEAKERS.AV],
    graphStatus: 'Completed / Indexed',
    sourceType: 'Google Meet',
    summary: 'Reviewed key milestones for the Q3 Capstone release. Decided to postpone public beta signup to Oct 28 pending security audit signoffs. Arjun aligned product messaging around connected graph memory.',
    keyTakeaways: [
      'Beta launch moved to Oct 28 due to pending penetration test report',
      'Vector-hybrid indexing confirmed for core transcript knowledge graph',
      'External review board checkpoint scheduled for Nov 2'
    ],
    audioFileName: 'Q3_Roadmap_Planning_Oct24.m4a',
    audioSizeMb: 86,
    transcript: [
      {
        id: 't-101',
        speakerId: 'sp_am',
        speakerName: 'Arjun Mehta',
        timecode: '04:12',
        seconds: 252,
        text: 'Looking at our current velocity and the remaining security audit items, we need to ensure public beta expectations are realistic.',
        sentiment: 'neutral'
      },
      {
        id: 't-102',
        speakerId: 'sp_ps',
        speakerName: 'Priya Sharma',
        timecode: '18:45',
        seconds: 1125,
        text: 'The vector-hybrid pipeline tests on Neo4j showed a 4x reduction in multi-hop query latency.',
        sentiment: 'positive',
        isKeyDecision: true
      },
      {
        id: 't-103',
        speakerId: 'sp_am',
        speakerName: 'Arjun Mehta',
        timecode: '41:05',
        seconds: 2465,
        text: 'Let us officially postpone public beta signup to Oct 28 pending final security audit approvals.',
        sentiment: 'positive',
        isKeyDecision: true
      }
    ]
  },
  {
    id: 'mtg-2',
    title: 'Engineering Sprint Review',
    project: 'Core Engine',
    date: 'Oct 22, 2026',
    time: '02:30 PM EST',
    duration: '42m 08s',
    durationSeconds: 2528,
    speakers: [SPEAKERS.AM, SPEAKERS.DC],
    graphStatus: 'Completed / Indexed',
    sourceType: 'Microsoft Teams',
    summary: 'Evaluated Sprint 4 performance. Priya introduced vector-hybrid indexing for graph relationship extraction. David validated SOC2 compliance for transcript tokenization.',
    keyTakeaways: [
      'Adopted vector-hybrid indexing for Capstone v2.4 with 98.4% confidence score',
      'Dual-channel audio diarization passed stress testing with 3 simultaneous speakers',
      'Cypher query optimization queue created for low-latency citation retrieval'
    ],
    audioFileName: 'Eng_Sprint_Review_Oct22.mp3',
    audioSizeMb: 64,
    transcript: [
      {
        id: 't-201',
        speakerId: 'sp_dc',
        speakerName: 'David Chen',
        timecode: '11:20',
        seconds: 680,
        text: 'Security tokenization passed SOC2 type II audit specs. Audio stream buffers are wiped instantly after transcription.',
        sentiment: 'positive'
      },
      {
        id: 't-202',
        speakerId: 'sp_ps',
        speakerName: 'Priya Sharma',
        timecode: '24:18',
        seconds: 1458,
        text: 'We are adopting vector-hybrid indexing for graph relationship extraction in Capstone v2.4 to support high precision citations.',
        sentiment: 'positive',
        isKeyDecision: true
      }
    ]
  },
  {
    id: 'mtg-3',
    title: 'AI Research Discussion',
    project: 'Core Engine',
    date: 'Oct 20, 2026',
    time: '11:15 AM EST',
    duration: '1h 12m',
    durationSeconds: 4320,
    speakers: [SPEAKERS.PS, SPEAKERS.DC, SPEAKERS.GS],
    graphStatus: 'Completed / Indexed',
    sourceType: 'Zoom',
    summary: 'Explored multi-modal Whisper fine-tuning for low-latency speaker diarization and semantic node extraction in complex technical discussions.',
    keyTakeaways: [
      'Fine-tuning dataset needs dual-channel audio tokens for 99%+ voice isolation',
      'Graph extraction entity models updated with domain-specific engineering taxonomy'
    ],
    audioFileName: 'AI_Research_Discussion_Oct20.wav',
    audioSizeMb: 128,
    transcript: [
      {
        id: 't-301',
        speakerId: 'sp_gs',
        speakerName: 'Gina Smith',
        timecode: '15:30',
        seconds: 930,
        text: 'By combining fine-tuned Whisper embeddings with Neo4j entity graphs, citation accuracy increased to 96.8%.',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'mtg-4',
    title: 'Client Review & Feedback Session',
    project: 'Client Review',
    date: 'Oct 21, 2026',
    time: '04:00 PM EST',
    duration: '38m 45s',
    durationSeconds: 2325,
    speakers: [SPEAKERS.AM, SPEAKERS.DC],
    graphStatus: 'Completed / Indexed',
    sourceType: 'Google Meet',
    summary: 'Reviewed early client access feedback. Logged commitment for Oct 14 initial delivery milestone, creating a 14-day schedule mismatch with internal Oct 28 Q3 roadmap target.',
    keyTakeaways: [
      'Logged commit date for Oct 14 in client meeting notes',
      'Conflict flag automatically generated in MeetGraph timeline engine'
    ],
    audioFileName: 'Client_Review_Oct21.m4a',
    audioSizeMb: 52,
    transcript: [
      {
        id: 't-401',
        speakerId: 'sp_am',
        speakerName: 'Arjun Mehta',
        timecode: '12:08',
        seconds: 728,
        text: 'We told the client review committee we would aim for an Oct 14 preview deployment commit.',
        sentiment: 'conflict',
        isKeyDecision: true
      }
    ]
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    title: 'Adopt vector-hybrid indexing for graph relationship extraction in Capstone v2.4',
    confidence: 98.4,
    speaker: SPEAKERS.PS,
    sourceMeetingId: 'mtg-2',
    sourceMeetingTitle: 'Engineering Sprint Review',
    timecode: '24:18',
    status: 'Verified',
    category: 'Architecture',
    graphTraceNodes: ['Vector Indexing', 'Priya S.', 'Neo4j Graph']
  },
  {
    id: 'dec-2',
    title: 'Postpone public beta signup to Oct 28 pending security audit approvals',
    confidence: 96.1,
    speaker: SPEAKERS.AM,
    sourceMeetingId: 'mtg-1',
    sourceMeetingTitle: 'Q3 Product Roadmap Planning',
    timecode: '41:05',
    status: 'Verified',
    category: 'Release Management',
    graphTraceNodes: ['Q3 Roadmap', 'Arjun M.', 'Sep 28 Launch', 'Security Audit']
  },
  {
    id: 'dec-3',
    title: 'Enforce dual-channel Whisper tokenization for all incoming executive audio streams',
    confidence: 97.2,
    speaker: SPEAKERS.GS,
    sourceMeetingId: 'mtg-3',
    sourceMeetingTitle: 'AI Research Discussion',
    timecode: '15:30',
    status: 'Verified',
    category: 'AI Pipeline',
    graphTraceNodes: ['Whisper v3', 'Gina S.', 'Dual-Channel Audio']
  },
  {
    id: 'dec-4',
    title: 'Standardize Neo4j Cypher index caching with 15-minute TTL for real-time dashboards',
    confidence: 94.8,
    speaker: SPEAKERS.AV,
    sourceMeetingId: 'mtg-2',
    sourceMeetingTitle: 'Engineering Sprint Review',
    timecode: '32:10',
    status: 'Verified',
    category: 'Database',
    graphTraceNodes: ['Neo4j Cypher', 'Alex V.']
  }
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    taskDescription: 'Finalize Whisper fine-tuning dataset with dual-channel audio tokens',
    assignee: SPEAKERS.PS,
    dueDate: 'Oct 29, 2026',
    priority: 'High',
    completed: false,
    sourceMeetingId: 'mtg-3',
    sourceMeetingTitle: 'AI Research Discussion',
    timecode: '28:14',
    jiraTicketId: 'MEET-104'
  },
  {
    id: 'act-2',
    taskDescription: 'Sync revised milestone targets with external Capstone review board',
    assignee: SPEAKERS.AM,
    dueDate: 'Nov 02, 2026',
    priority: 'Medium',
    completed: false,
    sourceMeetingId: 'mtg-1',
    sourceMeetingTitle: 'Q3 Product Roadmap Planning',
    timecode: '45:20',
    jiraTicketId: 'MEET-108'
  },
  {
    id: 'act-3',
    taskDescription: 'Implement Neo4j Cypher query optimization for multi-hop citations',
    assignee: SPEAKERS.AV,
    dueDate: 'Nov 05, 2026',
    priority: 'Low',
    completed: false,
    sourceMeetingId: 'mtg-2',
    sourceMeetingTitle: 'Engineering Sprint Review',
    timecode: '36:40',
    jiraTicketId: 'MEET-112'
  },
  {
    id: 'act-4',
    taskDescription: 'Resolve 14-day schedule conflict between Client Review commit and Q3 Beta Launch',
    assignee: SPEAKERS.AM,
    dueDate: 'Oct 27, 2026',
    priority: 'High',
    completed: false,
    sourceMeetingId: 'mtg-4',
    sourceMeetingTitle: 'Client Review & Feedback Session',
    timecode: '12:08',
    jiraTicketId: 'MEET-101'
  },
  {
    id: 'act-5',
    taskDescription: 'Complete SOC2 type II encryption verification for real-time audio socket streams',
    assignee: SPEAKERS.DC,
    dueDate: 'Oct 30, 2026',
    priority: 'High',
    completed: true,
    sourceMeetingId: 'mtg-2',
    sourceMeetingTitle: 'Engineering Sprint Review',
    timecode: '11:20',
    jiraTicketId: 'MEET-092'
  }
];

export const TIMELINE_CONFLICT: TimelineConflict = {
  id: 'conf-1',
  title: 'Schedule Mismatch Detected',
  deltaDays: 14,
  description: 'In Q3 Planning (Oct 24), launch date was shifted to Oct 28. However, Client Review (Oct 21) logged commit for Oct 14. Cross-meeting dependency is unaligned.',
  node1: {
    title: 'Node 1: Q3 Roadmap Planning',
    meetingTitle: 'Q3 Product Roadmap Planning',
    date: 'Oct 24, 2026',
    targetDate: 'Target: Oct 28',
    quote: '"Let us officially postpone public beta signup to Oct 28 pending final security audit approvals."',
    speaker: 'Arjun Mehta (Product Lead)',
    timecode: '41:05'
  },
  node2: {
    title: 'Node 2: Client Review',
    meetingTitle: 'Client Review & Feedback Session',
    date: 'Oct 21, 2026',
    targetDate: 'Target: Oct 14',
    quote: '"We told the client review committee we would aim for an Oct 14 preview deployment commit."',
    speaker: 'Arjun Mehta (Product Lead)',
    timecode: '12:08'
  }
};

export const EXTRACTION_PIPELINE: ExtractionPipelineStep[] = [
  {
    id: 'pipe-1',
    title: 'Neo4j Entities Indexed',
    subtitle: 'Extracted 28 relationships from Sprint Review',
    timeAgo: '3 mins ago',
    status: 'completed',
    iconType: 'neo4j'
  },
  {
    id: 'pipe-2',
    title: 'Whisper Transcription Complete',
    subtitle: 'Speaker diarization resolved for 3 voices',
    timeAgo: '8 mins ago',
    status: 'completed',
    iconType: 'whisper'
  },
  {
    id: 'pipe-3',
    title: 'Audio Ingestion Queued',
    subtitle: 'Client_Briefing_Oct26.m4a (142 MB)',
    timeAgo: '14 mins ago',
    status: 'processing',
    iconType: 'audio'
  }
];

export const KNOWLEDGE_GRAPH_NODES: GraphNode[] = [
  { id: 'gn-1', label: 'Q3 Roadmap', type: 'meeting', connectedIds: ['gn-2', 'gn-3', 'gn-4'] },
  { id: 'gn-2', label: 'Priya S.', type: 'speaker', connectedIds: ['gn-1', 'gn-3', 'gn-5'] },
  { id: 'gn-3', label: 'Arjun M.', type: 'speaker', connectedIds: ['gn-1', 'gn-2', 'gn-4'] },
  { id: 'gn-4', label: 'Sep 28 Launch', type: 'milestone', connectedIds: ['gn-1', 'gn-3'] },
  { id: 'gn-5', label: 'Vector Indexing', type: 'topic', connectedIds: ['gn-2', 'gn-6'] },
  { id: 'gn-6', label: 'Neo4j Graph', type: 'topic', connectedIds: ['gn-5', 'gn-1'] },
  { id: 'gn-7', label: 'Whisper v3', type: 'topic', connectedIds: ['gn-2'] },
  { id: 'gn-8', label: 'Security Audit', type: 'risk', connectedIds: ['gn-1', 'gn-3'] }
];

export const AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-26 10:24:18',
    user: 'Alex Vance (Admin)',
    action: 'Triggered GraphRAG Entity Extraction',
    module: 'GraphRAG',
    status: 'Success',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-26 10:18:02',
    user: 'Priya Sharma',
    action: 'Uploaded Audio Stream Q3_Roadmap_Planning.m4a',
    module: 'Transcription',
    status: 'Success',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-26 09:45:10',
    user: 'System Bot',
    action: 'Synced 4 Action Items with Jira REST API',
    module: 'Jira Sync',
    status: 'Success',
    ipAddress: '10.0.4.18'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-26 08:30:00',
    user: 'David Chen',
    action: 'Rotated JWT Secret & Verified RBAC Token',
    module: 'Auth',
    status: 'Success',
    ipAddress: '192.168.1.108'
  }
];

export const INTEGRATIONS: IntegrationService[] = [
  {
    id: 'int-1',
    name: 'Google Meet',
    category: 'Live Meetings',
    icon: 'video',
    status: 'Connected',
    lastSynced: '10 mins ago',
    meetingsSyncedCount: 24
  },
  {
    id: 'int-2',
    name: 'Microsoft Teams',
    category: 'Live Meetings',
    icon: 'users',
    status: 'Connected',
    lastSynced: '1 hour ago',
    meetingsSyncedCount: 12
  },
  {
    id: 'int-3',
    name: 'Zoom',
    category: 'Live Meetings',
    icon: 'video',
    status: 'Connected',
    lastSynced: '2 hours ago',
    meetingsSyncedCount: 8
  },
  {
    id: 'int-4',
    name: 'Google Calendar',
    category: 'Calendar & Tasks',
    icon: 'calendar',
    status: 'Connected',
    lastSynced: 'Real-time',
    meetingsSyncedCount: 48
  },
  {
    id: 'int-5',
    name: 'Jira Software',
    category: 'Calendar & Tasks',
    icon: 'check-square',
    status: 'Connected',
    lastSynced: '5 mins ago',
    meetingsSyncedCount: 19
  },
  {
    id: 'int-6',
    name: 'Slack',
    category: 'Messaging & Ops',
    icon: 'message-square',
    status: 'Connected',
    lastSynced: 'Real-time',
    meetingsSyncedCount: 48
  }
];
