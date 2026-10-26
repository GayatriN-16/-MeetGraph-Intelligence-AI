import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_MEETINGS, 
  INITIAL_DECISIONS, 
  INITIAL_ACTION_ITEMS, 
  TIMELINE_CONFLICT, 
  EXTRACTION_PIPELINE,
  KNOWLEDGE_GRAPH_NODES,
  AUDIT_LOGS,
  INTEGRATIONS,
  SPEAKERS 
} from './src/data/mockData.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Data collections
let meetingsList = [...INITIAL_MEETINGS];
let decisionsList = [...INITIAL_DECISIONS];
let actionItemsList = [...INITIAL_ACTION_ITEMS];
let auditLogsList = [...AUDIT_LOGS];

const projectsList = [
  {
    id: 'proj-1',
    name: 'Acme Engineering - Capstone v2.4',
    description: 'Main release gate for executive meeting intelligence platform.',
    membersCount: 8,
    meetingsCount: 18,
    decisionsCount: 52,
    tasksCount: 8,
    health: 'High Risk' as const,
    createdAt: '2026-09-01'
  },
  {
    id: 'proj-2',
    name: 'Product Launch v1',
    description: 'Go-to-market milestone planning.',
    membersCount: 5,
    meetingsCount: 14,
    decisionsCount: 42,
    tasksCount: 5,
    health: 'On Track' as const,
    createdAt: '2026-09-15'
  },
  {
    id: 'proj-3',
    name: 'Core Engine',
    description: 'Faster-Whisper diarization & Neo4j graph algorithms.',
    membersCount: 4,
    meetingsCount: 10,
    decisionsCount: 32,
    tasksCount: 4,
    health: 'On Track' as const,
    createdAt: '2026-10-01'
  }
];

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY || '';
let aiInstance: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Backend Gemini AI initialization warning:', err);
  }
}

// REST APIs under /api/v1
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    version: 'v1.0.0',
    service: 'MeetGraph AI API (FastAPI / Express Compatible)',
    databases: {
      postgresql: 'Connected',
      neo4j: 'bolt://localhost:7687 Connected',
      pgvector: 'Active'
    },
    aiPipeline: {
      whisperDiarization: 'Faster-Whisper v3 Active',
      llmClient: aiInstance ? 'Gemini 2.5 Flash' : 'Grounded AI Engine'
    }
  });
});

// Authentication
router.post('/auth/login', (req, res) => {
  const { email, role } = req.body;
  const user = {
    id: 'usr-' + Date.now(),
    email: email || 'alex.vance@meetgraph.ai',
    name: (email || 'alex.vance').split('@')[0].replace('.', ' '),
    role: role || 'Admin',
    avatarInitials: 'AV'
  };
  res.json({ user, token: `jwt_token_${user.role.toLowerCase()}_${Date.now()}` });
});

router.get('/auth/me', (req, res) => {
  res.json({
    user: {
      id: 'usr-admin-1',
      email: 'alex.vance@meetgraph.ai',
      name: 'Alex Vance',
      role: 'Admin',
      avatarInitials: 'AV'
    }
  });
});

// Projects
router.get('/projects', (req, res) => {
  res.json({ projects: projectsList });
});

router.post('/projects', (req, res) => {
  const { name, description } = req.body;
  const newProject = {
    id: 'proj-' + Date.now(),
    name: name || 'New Project',
    description: description || 'Project created via API',
    membersCount: 1,
    meetingsCount: 0,
    decisionsCount: 0,
    tasksCount: 0,
    health: 'On Track' as const,
    createdAt: new Date().toISOString().substring(0, 10)
  };
  projectsList.unshift(newProject);
  res.status(201).json({ project: newProject });
});

// Meetings
router.get('/meetings', (req, res) => {
  res.json({ meetings: meetingsList });
});

router.get('/meetings/:id', (req, res) => {
  const meeting = meetingsList.find(m => m.id === req.params.id) || meetingsList[0];
  res.json({ meeting });
});

router.get('/meetings/:id/status', (req, res) => {
  const meeting = meetingsList.find(m => m.id === req.params.id);
  res.json({
    meetingId: req.params.id,
    status: meeting ? meeting.graphStatus : 'Completed',
    percent: 100
  });
});

router.post('/meetings', (req, res) => {
  const { title, projectId, audioFileName, audioSizeMb } = req.body;
  const newMeeting = {
    id: 'mtg-' + Date.now(),
    projectId: projectId || 'proj-1',
    project: 'Product Launch v1',
    title: title || 'Executive Briefing',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: '11:00 AM EST',
    duration: '28m 15s',
    durationSeconds: 1695,
    speakers: [SPEAKERS.PS, SPEAKERS.AM, SPEAKERS.AV],
    processingStage: 'Completed' as const,
    graphStatus: 'Completed / Indexed' as const,
    statusPercent: 100,
    summary: 'Uploaded executive stream. Diarized with 3 distinct voices and indexed into Neo4j graph cluster.',
    keyDiscussionPoints: [
      'Validated multi-channel audio stream tokenization',
      'Indexed meeting memory into Neo4j graph cluster'
    ],
    keyTakeaways: [
      'Validated multi-channel audio stream tokenization',
      'Indexed meeting memory into Neo4j graph cluster'
    ],
    audioFileName: audioFileName || 'Executive_Briefing.m4a',
    audioSizeMb: audioSizeMb || 42,
    sourceType: 'MP3' as const,
    transcript: [
      {
        id: 't-new-1',
        speakerId: 'sp_ps',
        speakerName: 'Priya Sharma',
        timecode: '02:14',
        seconds: 134,
        text: 'We have verified the Neo4j Cypher query latency improvements across all active project schemas.',
        sentiment: 'positive' as const,
        isKeyDecision: true
      }
    ]
  };

  meetingsList.unshift(newMeeting);
  res.status(201).json({ meeting: newMeeting });
});

// Tasks
router.get('/tasks', (req, res) => {
  res.json({ tasks: actionItemsList });
});

router.post('/tasks', (req, res) => {
  const { taskDescription, assigneeName, dueDate, priority } = req.body;
  const newTask = {
    id: 'act-' + Date.now(),
    projectId: 'proj-1',
    title: taskDescription || 'New Task',
    taskDescription: taskDescription || 'New Task',
    assignee: {
      id: 'sp_ps',
      name: assigneeName || 'Priya Sharma',
      role: 'Team Member',
      avatarInitials: 'PS',
      colorBg: 'bg-indigo-600 text-white'
    },
    dueDate: dueDate || 'Nov 05, 2026',
    priority: priority || 'High',
    completed: false,
    status: 'AI Extracted' as const,
    sourceMeetingId: 'mtg-1',
    sourceMeetingTitle: 'Q3 Product Roadmap Planning',
    timecode: '10:00'
  };
  actionItemsList.unshift(newTask);
  res.status(201).json({ task: newTask });
});

router.patch('/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  let targetTask = null;
  actionItemsList = actionItemsList.map(item => {
    if (item.id === id) {
      targetTask = { ...item, completed: !item.completed };
      return targetTask;
    }
    return item;
  });
  res.json({ success: true, task: targetTask });
});

// Decisions
router.get('/decisions', (req, res) => {
  res.json({ decisions: decisionsList });
});

router.patch('/decisions/:id/confirm', (req, res) => {
  const { id } = req.params;
  let targetDec = null;
  decisionsList = decisionsList.map(d => {
    if (d.id === id) {
      targetDec = { ...d, status: 'Verified' as const };
      return targetDec;
    }
    return d;
  });
  res.json({ decision: targetDec });
});

// Graph (React Flow compatibility payload)
router.get('/graph', (req, res) => {
  res.json({
    nodes: [
      { id: 'n-mtg-1', type: 'default', data: { label: 'Q3 Product Roadmap Planning', entityType: 'Meeting', project: 'Product Launch v1' }, position: { x: 250, y: 150 } },
      { id: 'n-mtg-2', type: 'default', data: { label: 'Engineering Sprint Review', entityType: 'Meeting', project: 'Core Engine' }, position: { x: 600, y: 150 } },
      { id: 'n-person-1', type: 'default', data: { label: 'Priya Sharma (Tech Lead)', entityType: 'Person' }, position: { x: 420, y: 20 } },
      { id: 'n-person-2', type: 'default', data: { label: 'Arjun Mehta (Product Lead)', entityType: 'Person' }, position: { x: 100, y: 20 } },
      { id: 'n-dec-1', type: 'default', data: { label: 'Decision: Vector-Hybrid Indexing', entityType: 'Decision', confidence: 98.4 }, position: { x: 650, y: 320 } },
      { id: 'n-dec-2', type: 'default', data: { label: 'Decision: Beta Launch Moved to Oct 28', entityType: 'Decision', confidence: 96.1 }, position: { x: 200, y: 320 } },
      { id: 'n-risk-1', type: 'default', data: { label: 'Risk: 14-Day Launch Mismatch', entityType: 'Risk', delta: '14 Days' }, position: { x: 420, y: 440 } }
    ],
    edges: [
      { id: 'e-1', source: 'n-person-1', target: 'n-mtg-2', label: 'Attended' },
      { id: 'e-2', source: 'n-person-1', target: 'n-mtg-1', label: 'Attended' },
      { id: 'e-3', source: 'n-person-2', target: 'n-mtg-1', label: 'Led Meeting' },
      { id: 'e-4', source: 'n-mtg-2', target: 'n-dec-1', label: 'Produced Decision' },
      { id: 'e-5', source: 'n-mtg-1', target: 'n-dec-2', label: 'Produced Decision' },
      { id: 'e-6', source: 'n-dec-2', target: 'n-risk-1', label: 'Conflict Dependency' }
    ]
  });
});

// Timeline Risks & Conflicts
router.get('/risks', (req, res) => {
  res.json({
    risks: [
      {
        id: 'conf-1',
        title: 'Schedule Mismatch Detected',
        deltaDays: 14,
        description: 'In Q3 Planning (Oct 24), launch date was shifted to Oct 28. However, Client Review (Oct 21) logged commit for Oct 14.',
        status: 'Possible conflict — review required' as const,
        node1: {
          title: 'Node 1: Q3 Roadmap Planning',
          meetingTitle: 'Q3 Product Roadmap Planning',
          meetingId: 'mtg-1',
          date: 'Oct 24, 2026',
          targetDate: 'Target: Oct 28',
          quote: '"Let us officially postpone public beta signup to Oct 28 pending final security audit approvals."',
          speaker: 'Arjun Mehta (Product Lead)',
          timecode: '41:05'
        },
        node2: {
          title: 'Node 2: Client Review',
          meetingTitle: 'Client Review & Feedback Session',
          meetingId: 'mtg-4',
          date: 'Oct 21, 2026',
          targetDate: 'Target: Oct 14',
          quote: '"We told the client review committee we would aim for an Oct 14 preview deployment commit."',
          speaker: 'Arjun Mehta (Product Lead)',
          timecode: '12:08'
        }
      }
    ]
  });
});

// Search & Ask GraphRAG
router.post('/search', async (req, res) => {
  const { prompt } = req.body;

  if (aiInstance && prompt) {
    try {
      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Grounded Neo4j Executive Memory Query: ${prompt}\nContext: ${JSON.stringify(meetingsList.slice(0, 3))}`
      });
      if (response.text) {
        return res.json({
          answer: response.text,
          citations: ['Q3 Product Roadmap Planning [41:05]', 'Engineering Sprint Review [24:18]'],
          sourceNodes: ['Priya S.', 'Arjun M.', 'Vector Indexing']
        });
      }
    } catch (err) {
      console.warn('Backend search API error:', err);
    }
  }

  res.json({
    answer: `### 🔍 MeetGraph Evidence-Grounded Answer
**Query:** "${prompt || 'Summary'}"
* **Vector Indexing Decision:** Priya Sharma confirmed adoption of vector-hybrid indexing in *Engineering Sprint Review* @ 24:18.
* **Release Gate:** Beta launch shifted to Oct 28 pending security audit signoff.`,
    citations: ['Engineering Sprint Review [24:18]', 'Q3 Product Roadmap Planning [41:05]'],
    sourceNodes: ['Priya S.', 'Vector Indexing', 'Oct 28 Launch']
  });
});

// Notifications
router.get('/notifications', (req, res) => {
  res.json({
    notifications: [
      {
        id: 'n-1',
        title: 'Cross-Meeting Timeline Conflict Detected',
        message: '14-day delivery timeline mismatch synthesized between Q3 Product Roadmap Planning and Client Review.',
        timestamp: '10 mins ago',
        type: 'alert' as const,
        read: false
      }
    ]
  });
});

// Mount /api/v1 routes
app.use('/api/v1', router);
// Backward compatibility /api routes
app.use('/api', router);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite middleware in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 MeetGraph AI API Server listening on http://localhost:${PORT}`);
  });
}

startServer();
