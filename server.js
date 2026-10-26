// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// src/data/mockData.ts
var SPEAKERS = {
  PS: {
    id: "sp_ps",
    name: "Priya Sharma",
    role: "Tech Lead",
    avatarInitials: "PS",
    colorBg: "bg-indigo-600 text-white"
  },
  AM: {
    id: "sp_am",
    name: "Arjun Mehta",
    role: "Product Lead",
    avatarInitials: "AM",
    colorBg: "bg-emerald-600 text-white"
  },
  AV: {
    id: "sp_av",
    name: "Alex Vance",
    role: "Core Architect / Admin",
    avatarInitials: "AV",
    colorBg: "bg-amber-600 text-white"
  },
  DC: {
    id: "sp_dc",
    name: "David Chen",
    role: "Security Engineer",
    avatarInitials: "DC",
    colorBg: "bg-blue-600 text-white"
  },
  GS: {
    id: "sp_gs",
    name: "Gina Smith",
    role: "Research Scientist",
    avatarInitials: "GS",
    colorBg: "bg-slate-600 text-white"
  }
};
var INITIAL_MEETINGS = [
  {
    id: "mtg-1",
    title: "Q3 Product Roadmap Planning",
    project: "Product Launch v1",
    date: "Oct 24, 2026",
    time: "10:00 AM EST",
    duration: "54m 12s",
    durationSeconds: 3252,
    speakers: [SPEAKERS.PS, SPEAKERS.AM, SPEAKERS.AV],
    graphStatus: "Completed / Indexed",
    sourceType: "Google Meet",
    summary: "Reviewed key milestones for the Q3 Capstone release. Decided to postpone public beta signup to Oct 28 pending security audit signoffs. Arjun aligned product messaging around connected graph memory.",
    keyTakeaways: [
      "Beta launch moved to Oct 28 due to pending penetration test report",
      "Vector-hybrid indexing confirmed for core transcript knowledge graph",
      "External review board checkpoint scheduled for Nov 2"
    ],
    audioFileName: "Q3_Roadmap_Planning_Oct24.m4a",
    audioSizeMb: 86,
    transcript: [
      {
        id: "t-101",
        speakerId: "sp_am",
        speakerName: "Arjun Mehta",
        timecode: "04:12",
        seconds: 252,
        text: "Looking at our current velocity and the remaining security audit items, we need to ensure public beta expectations are realistic.",
        sentiment: "neutral"
      },
      {
        id: "t-102",
        speakerId: "sp_ps",
        speakerName: "Priya Sharma",
        timecode: "18:45",
        seconds: 1125,
        text: "The vector-hybrid pipeline tests on Neo4j showed a 4x reduction in multi-hop query latency.",
        sentiment: "positive",
        isKeyDecision: true
      },
      {
        id: "t-103",
        speakerId: "sp_am",
        speakerName: "Arjun Mehta",
        timecode: "41:05",
        seconds: 2465,
        text: "Let us officially postpone public beta signup to Oct 28 pending final security audit approvals.",
        sentiment: "positive",
        isKeyDecision: true
      }
    ]
  },
  {
    id: "mtg-2",
    title: "Engineering Sprint Review",
    project: "Core Engine",
    date: "Oct 22, 2026",
    time: "02:30 PM EST",
    duration: "42m 08s",
    durationSeconds: 2528,
    speakers: [SPEAKERS.AM, SPEAKERS.DC],
    graphStatus: "Completed / Indexed",
    sourceType: "Microsoft Teams",
    summary: "Evaluated Sprint 4 performance. Priya introduced vector-hybrid indexing for graph relationship extraction. David validated SOC2 compliance for transcript tokenization.",
    keyTakeaways: [
      "Adopted vector-hybrid indexing for Capstone v2.4 with 98.4% confidence score",
      "Dual-channel audio diarization passed stress testing with 3 simultaneous speakers",
      "Cypher query optimization queue created for low-latency citation retrieval"
    ],
    audioFileName: "Eng_Sprint_Review_Oct22.mp3",
    audioSizeMb: 64,
    transcript: [
      {
        id: "t-201",
        speakerId: "sp_dc",
        speakerName: "David Chen",
        timecode: "11:20",
        seconds: 680,
        text: "Security tokenization passed SOC2 type II audit specs. Audio stream buffers are wiped instantly after transcription.",
        sentiment: "positive"
      },
      {
        id: "t-202",
        speakerId: "sp_ps",
        speakerName: "Priya Sharma",
        timecode: "24:18",
        seconds: 1458,
        text: "We are adopting vector-hybrid indexing for graph relationship extraction in Capstone v2.4 to support high precision citations.",
        sentiment: "positive",
        isKeyDecision: true
      }
    ]
  },
  {
    id: "mtg-3",
    title: "AI Research Discussion",
    project: "Core Engine",
    date: "Oct 20, 2026",
    time: "11:15 AM EST",
    duration: "1h 12m",
    durationSeconds: 4320,
    speakers: [SPEAKERS.PS, SPEAKERS.DC, SPEAKERS.GS],
    graphStatus: "Completed / Indexed",
    sourceType: "Zoom",
    summary: "Explored multi-modal Whisper fine-tuning for low-latency speaker diarization and semantic node extraction in complex technical discussions.",
    keyTakeaways: [
      "Fine-tuning dataset needs dual-channel audio tokens for 99%+ voice isolation",
      "Graph extraction entity models updated with domain-specific engineering taxonomy"
    ],
    audioFileName: "AI_Research_Discussion_Oct20.wav",
    audioSizeMb: 128,
    transcript: [
      {
        id: "t-301",
        speakerId: "sp_gs",
        speakerName: "Gina Smith",
        timecode: "15:30",
        seconds: 930,
        text: "By combining fine-tuned Whisper embeddings with Neo4j entity graphs, citation accuracy increased to 96.8%.",
        sentiment: "positive"
      }
    ]
  },
  {
    id: "mtg-4",
    title: "Client Review & Feedback Session",
    project: "Client Review",
    date: "Oct 21, 2026",
    time: "04:00 PM EST",
    duration: "38m 45s",
    durationSeconds: 2325,
    speakers: [SPEAKERS.AM, SPEAKERS.DC],
    graphStatus: "Completed / Indexed",
    sourceType: "Google Meet",
    summary: "Reviewed early client access feedback. Logged commitment for Oct 14 initial delivery milestone, creating a 14-day schedule mismatch with internal Oct 28 Q3 roadmap target.",
    keyTakeaways: [
      "Logged commit date for Oct 14 in client meeting notes",
      "Conflict flag automatically generated in MeetGraph timeline engine"
    ],
    audioFileName: "Client_Review_Oct21.m4a",
    audioSizeMb: 52,
    transcript: [
      {
        id: "t-401",
        speakerId: "sp_am",
        speakerName: "Arjun Mehta",
        timecode: "12:08",
        seconds: 728,
        text: "We told the client review committee we would aim for an Oct 14 preview deployment commit.",
        sentiment: "conflict",
        isKeyDecision: true
      }
    ]
  }
];
var INITIAL_DECISIONS = [
  {
    id: "dec-1",
    title: "Adopt vector-hybrid indexing for graph relationship extraction in Capstone v2.4",
    confidence: 98.4,
    speaker: SPEAKERS.PS,
    sourceMeetingId: "mtg-2",
    sourceMeetingTitle: "Engineering Sprint Review",
    timecode: "24:18",
    status: "Verified",
    category: "Architecture",
    graphTraceNodes: ["Vector Indexing", "Priya S.", "Neo4j Graph"]
  },
  {
    id: "dec-2",
    title: "Postpone public beta signup to Oct 28 pending security audit approvals",
    confidence: 96.1,
    speaker: SPEAKERS.AM,
    sourceMeetingId: "mtg-1",
    sourceMeetingTitle: "Q3 Product Roadmap Planning",
    timecode: "41:05",
    status: "Verified",
    category: "Release Management",
    graphTraceNodes: ["Q3 Roadmap", "Arjun M.", "Sep 28 Launch", "Security Audit"]
  },
  {
    id: "dec-3",
    title: "Enforce dual-channel Whisper tokenization for all incoming executive audio streams",
    confidence: 97.2,
    speaker: SPEAKERS.GS,
    sourceMeetingId: "mtg-3",
    sourceMeetingTitle: "AI Research Discussion",
    timecode: "15:30",
    status: "Verified",
    category: "AI Pipeline",
    graphTraceNodes: ["Whisper v3", "Gina S.", "Dual-Channel Audio"]
  },
  {
    id: "dec-4",
    title: "Standardize Neo4j Cypher index caching with 15-minute TTL for real-time dashboards",
    confidence: 94.8,
    speaker: SPEAKERS.AV,
    sourceMeetingId: "mtg-2",
    sourceMeetingTitle: "Engineering Sprint Review",
    timecode: "32:10",
    status: "Verified",
    category: "Database",
    graphTraceNodes: ["Neo4j Cypher", "Alex V."]
  }
];
var INITIAL_ACTION_ITEMS = [
  {
    id: "act-1",
    taskDescription: "Finalize Whisper fine-tuning dataset with dual-channel audio tokens",
    assignee: SPEAKERS.PS,
    dueDate: "Oct 29, 2026",
    priority: "High",
    completed: false,
    sourceMeetingId: "mtg-3",
    sourceMeetingTitle: "AI Research Discussion",
    timecode: "28:14",
    jiraTicketId: "MEET-104"
  },
  {
    id: "act-2",
    taskDescription: "Sync revised milestone targets with external Capstone review board",
    assignee: SPEAKERS.AM,
    dueDate: "Nov 02, 2026",
    priority: "Medium",
    completed: false,
    sourceMeetingId: "mtg-1",
    sourceMeetingTitle: "Q3 Product Roadmap Planning",
    timecode: "45:20",
    jiraTicketId: "MEET-108"
  },
  {
    id: "act-3",
    taskDescription: "Implement Neo4j Cypher query optimization for multi-hop citations",
    assignee: SPEAKERS.AV,
    dueDate: "Nov 05, 2026",
    priority: "Low",
    completed: false,
    sourceMeetingId: "mtg-2",
    sourceMeetingTitle: "Engineering Sprint Review",
    timecode: "36:40",
    jiraTicketId: "MEET-112"
  },
  {
    id: "act-4",
    taskDescription: "Resolve 14-day schedule conflict between Client Review commit and Q3 Beta Launch",
    assignee: SPEAKERS.AM,
    dueDate: "Oct 27, 2026",
    priority: "High",
    completed: false,
    sourceMeetingId: "mtg-4",
    sourceMeetingTitle: "Client Review & Feedback Session",
    timecode: "12:08",
    jiraTicketId: "MEET-101"
  },
  {
    id: "act-5",
    taskDescription: "Complete SOC2 type II encryption verification for real-time audio socket streams",
    assignee: SPEAKERS.DC,
    dueDate: "Oct 30, 2026",
    priority: "High",
    completed: true,
    sourceMeetingId: "mtg-2",
    sourceMeetingTitle: "Engineering Sprint Review",
    timecode: "11:20",
    jiraTicketId: "MEET-092"
  }
];
var AUDIT_LOGS = [
  {
    id: "log-1",
    timestamp: "2026-10-26 10:24:18",
    user: "Alex Vance (Admin)",
    action: "Triggered GraphRAG Entity Extraction",
    module: "GraphRAG",
    status: "Success",
    ipAddress: "192.168.1.104"
  },
  {
    id: "log-2",
    timestamp: "2026-10-26 10:18:02",
    user: "Priya Sharma",
    action: "Uploaded Audio Stream Q3_Roadmap_Planning.m4a",
    module: "Transcription",
    status: "Success",
    ipAddress: "192.168.1.112"
  },
  {
    id: "log-3",
    timestamp: "2026-10-26 09:45:10",
    user: "System Bot",
    action: "Synced 4 Action Items with Jira REST API",
    module: "Jira Sync",
    status: "Success",
    ipAddress: "10.0.4.18"
  },
  {
    id: "log-4",
    timestamp: "2026-10-26 08:30:00",
    user: "David Chen",
    action: "Rotated JWT Secret & Verified RBAC Token",
    module: "Auth",
    status: "Success",
    ipAddress: "192.168.1.108"
  }
];

// server.ts
import path from "path";
import { fileURLToPath } from "url";
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "50mb" }));
var meetingsList = [...INITIAL_MEETINGS];
var decisionsList = [...INITIAL_DECISIONS];
var actionItemsList = [...INITIAL_ACTION_ITEMS];
var auditLogsList = [...AUDIT_LOGS];
var projectsList = [
  {
    id: "proj-1",
    name: "Acme Engineering - Capstone v2.4",
    description: "Main release gate for executive meeting intelligence platform.",
    membersCount: 8,
    meetingsCount: 18,
    decisionsCount: 52,
    tasksCount: 8,
    health: "High Risk",
    createdAt: "2026-09-01"
  },
  {
    id: "proj-2",
    name: "Product Launch v1",
    description: "Go-to-market milestone planning.",
    membersCount: 5,
    meetingsCount: 14,
    decisionsCount: 42,
    tasksCount: 5,
    health: "On Track",
    createdAt: "2026-09-15"
  },
  {
    id: "proj-3",
    name: "Core Engine",
    description: "Faster-Whisper diarization & Neo4j graph algorithms.",
    membersCount: 4,
    meetingsCount: 10,
    decisionsCount: 32,
    tasksCount: 4,
    health: "On Track",
    createdAt: "2026-10-01"
  }
];
var apiKey = process.env.GEMINI_API_KEY || "";
var aiInstance = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Backend Gemini AI initialization warning:", err);
  }
}
var router = express.Router();
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    version: "v1.0.0",
    service: "MeetGraph AI API (FastAPI / Express Compatible)",
    databases: {
      postgresql: "Connected",
      neo4j: "bolt://localhost:7687 Connected",
      pgvector: "Active"
    },
    aiPipeline: {
      whisperDiarization: "Faster-Whisper v3 Active",
      llmClient: aiInstance ? "Gemini 2.5 Flash" : "Grounded AI Engine"
    }
  });
});
router.post("/auth/login", (req, res) => {
  const { email, role } = req.body;
  const user = {
    id: "usr-" + Date.now(),
    email: email || "alex.vance@meetgraph.ai",
    name: (email || "alex.vance").split("@")[0].replace(".", " "),
    role: role || "Admin",
    avatarInitials: "AV"
  };
  res.json({ user, token: `jwt_token_${user.role.toLowerCase()}_${Date.now()}` });
});
router.get("/auth/me", (req, res) => {
  res.json({
    user: {
      id: "usr-admin-1",
      email: "alex.vance@meetgraph.ai",
      name: "Alex Vance",
      role: "Admin",
      avatarInitials: "AV"
    }
  });
});
router.get("/projects", (req, res) => {
  res.json({ projects: projectsList });
});
router.post("/projects", (req, res) => {
  const { name, description } = req.body;
  const newProject = {
    id: "proj-" + Date.now(),
    name: name || "New Project",
    description: description || "Project created via API",
    membersCount: 1,
    meetingsCount: 0,
    decisionsCount: 0,
    tasksCount: 0,
    health: "On Track",
    createdAt: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10)
  };
  projectsList.unshift(newProject);
  res.status(201).json({ project: newProject });
});
router.get("/meetings", (req, res) => {
  res.json({ meetings: meetingsList });
});
router.get("/meetings/:id", (req, res) => {
  const meeting = meetingsList.find((m) => m.id === req.params.id) || meetingsList[0];
  res.json({ meeting });
});
router.get("/meetings/:id/status", (req, res) => {
  const meeting = meetingsList.find((m) => m.id === req.params.id);
  res.json({
    meetingId: req.params.id,
    status: meeting ? meeting.graphStatus : "Completed",
    percent: 100
  });
});
router.post("/meetings", (req, res) => {
  const { title, projectId, audioFileName, audioSizeMb } = req.body;
  const newMeeting = {
    id: "mtg-" + Date.now(),
    projectId: projectId || "proj-1",
    project: "Product Launch v1",
    title: title || "Executive Briefing",
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: "11:00 AM EST",
    duration: "28m 15s",
    durationSeconds: 1695,
    speakers: [SPEAKERS.PS, SPEAKERS.AM, SPEAKERS.AV],
    processingStage: "Completed",
    graphStatus: "Completed / Indexed",
    statusPercent: 100,
    summary: "Uploaded executive stream. Diarized with 3 distinct voices and indexed into Neo4j graph cluster.",
    keyDiscussionPoints: [
      "Validated multi-channel audio stream tokenization",
      "Indexed meeting memory into Neo4j graph cluster"
    ],
    keyTakeaways: [
      "Validated multi-channel audio stream tokenization",
      "Indexed meeting memory into Neo4j graph cluster"
    ],
    audioFileName: audioFileName || "Executive_Briefing.m4a",
    audioSizeMb: audioSizeMb || 42,
    sourceType: "MP3",
    transcript: [
      {
        id: "t-new-1",
        speakerId: "sp_ps",
        speakerName: "Priya Sharma",
        timecode: "02:14",
        seconds: 134,
        text: "We have verified the Neo4j Cypher query latency improvements across all active project schemas.",
        sentiment: "positive",
        isKeyDecision: true
      }
    ]
  };
  meetingsList.unshift(newMeeting);
  res.status(201).json({ meeting: newMeeting });
});
router.get("/tasks", (req, res) => {
  res.json({ tasks: actionItemsList });
});
router.post("/tasks", (req, res) => {
  const { taskDescription, assigneeName, dueDate, priority } = req.body;
  const newTask = {
    id: "act-" + Date.now(),
    projectId: "proj-1",
    title: taskDescription || "New Task",
    taskDescription: taskDescription || "New Task",
    assignee: {
      id: "sp_ps",
      name: assigneeName || "Priya Sharma",
      role: "Team Member",
      avatarInitials: "PS",
      colorBg: "bg-indigo-600 text-white"
    },
    dueDate: dueDate || "Nov 05, 2026",
    priority: priority || "High",
    completed: false,
    status: "AI Extracted",
    sourceMeetingId: "mtg-1",
    sourceMeetingTitle: "Q3 Product Roadmap Planning",
    timecode: "10:00"
  };
  actionItemsList.unshift(newTask);
  res.status(201).json({ task: newTask });
});
router.patch("/tasks/:id/toggle", (req, res) => {
  const { id } = req.params;
  let targetTask = null;
  actionItemsList = actionItemsList.map((item) => {
    if (item.id === id) {
      targetTask = { ...item, completed: !item.completed };
      return targetTask;
    }
    return item;
  });
  res.json({ success: true, task: targetTask });
});
router.get("/decisions", (req, res) => {
  res.json({ decisions: decisionsList });
});
router.patch("/decisions/:id/confirm", (req, res) => {
  const { id } = req.params;
  let targetDec = null;
  decisionsList = decisionsList.map((d) => {
    if (d.id === id) {
      targetDec = { ...d, status: "Verified" };
      return targetDec;
    }
    return d;
  });
  res.json({ decision: targetDec });
});
router.get("/graph", (req, res) => {
  res.json({
    nodes: [
      { id: "n-mtg-1", type: "default", data: { label: "Q3 Product Roadmap Planning", entityType: "Meeting", project: "Product Launch v1" }, position: { x: 250, y: 150 } },
      { id: "n-mtg-2", type: "default", data: { label: "Engineering Sprint Review", entityType: "Meeting", project: "Core Engine" }, position: { x: 600, y: 150 } },
      { id: "n-person-1", type: "default", data: { label: "Priya Sharma (Tech Lead)", entityType: "Person" }, position: { x: 420, y: 20 } },
      { id: "n-person-2", type: "default", data: { label: "Arjun Mehta (Product Lead)", entityType: "Person" }, position: { x: 100, y: 20 } },
      { id: "n-dec-1", type: "default", data: { label: "Decision: Vector-Hybrid Indexing", entityType: "Decision", confidence: 98.4 }, position: { x: 650, y: 320 } },
      { id: "n-dec-2", type: "default", data: { label: "Decision: Beta Launch Moved to Oct 28", entityType: "Decision", confidence: 96.1 }, position: { x: 200, y: 320 } },
      { id: "n-risk-1", type: "default", data: { label: "Risk: 14-Day Launch Mismatch", entityType: "Risk", delta: "14 Days" }, position: { x: 420, y: 440 } }
    ],
    edges: [
      { id: "e-1", source: "n-person-1", target: "n-mtg-2", label: "Attended" },
      { id: "e-2", source: "n-person-1", target: "n-mtg-1", label: "Attended" },
      { id: "e-3", source: "n-person-2", target: "n-mtg-1", label: "Led Meeting" },
      { id: "e-4", source: "n-mtg-2", target: "n-dec-1", label: "Produced Decision" },
      { id: "e-5", source: "n-mtg-1", target: "n-dec-2", label: "Produced Decision" },
      { id: "e-6", source: "n-dec-2", target: "n-risk-1", label: "Conflict Dependency" }
    ]
  });
});
router.get("/risks", (req, res) => {
  res.json({
    risks: [
      {
        id: "conf-1",
        title: "Schedule Mismatch Detected",
        deltaDays: 14,
        description: "In Q3 Planning (Oct 24), launch date was shifted to Oct 28. However, Client Review (Oct 21) logged commit for Oct 14.",
        status: "Possible conflict \u2014 review required",
        node1: {
          title: "Node 1: Q3 Roadmap Planning",
          meetingTitle: "Q3 Product Roadmap Planning",
          meetingId: "mtg-1",
          date: "Oct 24, 2026",
          targetDate: "Target: Oct 28",
          quote: '"Let us officially postpone public beta signup to Oct 28 pending final security audit approvals."',
          speaker: "Arjun Mehta (Product Lead)",
          timecode: "41:05"
        },
        node2: {
          title: "Node 2: Client Review",
          meetingTitle: "Client Review & Feedback Session",
          meetingId: "mtg-4",
          date: "Oct 21, 2026",
          targetDate: "Target: Oct 14",
          quote: '"We told the client review committee we would aim for an Oct 14 preview deployment commit."',
          speaker: "Arjun Mehta (Product Lead)",
          timecode: "12:08"
        }
      }
    ]
  });
});
router.post("/search", async (req, res) => {
  const { prompt } = req.body;
  if (aiInstance && prompt) {
    try {
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Grounded Neo4j Executive Memory Query: ${prompt}
Context: ${JSON.stringify(meetingsList.slice(0, 3))}`
      });
      if (response.text) {
        return res.json({
          answer: response.text,
          citations: ["Q3 Product Roadmap Planning [41:05]", "Engineering Sprint Review [24:18]"],
          sourceNodes: ["Priya S.", "Arjun M.", "Vector Indexing"]
        });
      }
    } catch (err) {
      console.warn("Backend search API error:", err);
    }
  }
  res.json({
    answer: `### \u{1F50D} MeetGraph Evidence-Grounded Answer
**Query:** "${prompt || "Summary"}"
* **Vector Indexing Decision:** Priya Sharma confirmed adoption of vector-hybrid indexing in *Engineering Sprint Review* @ 24:18.
* **Release Gate:** Beta launch shifted to Oct 28 pending security audit signoff.`,
    citations: ["Engineering Sprint Review [24:18]", "Q3 Product Roadmap Planning [41:05]"],
    sourceNodes: ["Priya S.", "Vector Indexing", "Oct 28 Launch"]
  });
});
router.get("/notifications", (req, res) => {
  res.json({
    notifications: [
      {
        id: "n-1",
        title: "Cross-Meeting Timeline Conflict Detected",
        message: "14-day delivery timeline mismatch synthesized between Q3 Product Roadmap Planning and Client Review.",
        timestamp: "10 mins ago",
        type: "alert",
        read: false
      }
    ]
  });
});
app.use("/api/v1", router);
app.use("/api", router);
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`\u{1F680} MeetGraph AI API Server listening on http://localhost:${PORT}`);
  });
}
startServer();
