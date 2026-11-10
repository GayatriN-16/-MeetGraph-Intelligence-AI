import { 
  Meeting, 
  Decision, 
  Task, 
  TimelineConflictRisk, 
  ReactFlowNode, 
  ReactFlowEdge, 
  User, 
  Project, 
  NotificationItem,
  GoogleAuthStatus,
  GoogleMeetSpaceValidation,
  GoogleMeetSyncResult
} from '../types';

const API_BASE = '/api/v1';

let authToken: string | null = localStorage.getItem('meetgraph_jwt_token') || 'demo_jwt_token_admin';

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('meetgraph_jwt_token', token);
  } else {
    localStorage.removeItem('meetgraph_jwt_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (err) {
    console.warn(`[MeetGraph API Client] Endpoint ${endpoint} fallback:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: async (email: string, role: 'Admin' | 'Member') => {
    return fetchAPI<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  },

  getMe: async () => {
    return fetchAPI<{ user: User }>('/auth/me');
  },

  // Projects
  getProjects: async () => {
    return fetchAPI<{ projects: Project[] }>('/projects');
  },

  createProject: async (name: string, description: string) => {
    return fetchAPI<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  },

  // Meetings
  getMeetings: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return fetchAPI<{ meetings: Meeting[] }>(`/meetings${query}`);
  },

  getMeetingDetails: async (id: string) => {
    return fetchAPI<{ meeting: Meeting }>(`/meetings/${id}`);
  },

  getMeetingStatus: async (id: string) => {
    return fetchAPI<{ meetingId: string; status: string; percent: number }>(`/meetings/${id}/status`);
  },

  uploadMeeting: async (data: { title: string; projectId: string; audioFileName: string; audioSizeMb: number }) => {
    return fetchAPI<{ meeting: Meeting }>('/meetings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  transcribeMeeting: async (payload: {
    title: string;
    project: string;
    audioData?: string;
    mimeType?: string;
    fileName?: string;
    audioSizeMb?: number;
    recordedDuration?: string;
    sampleAudio?: boolean;
    elevenLabsApiKey?: string;
    liveTranscript?: Array<{ timecode?: string; seconds?: number; speakerName?: string; text: string }>;
  }) => {
    const customHeaders: Record<string, string> = {};
    if (payload.elevenLabsApiKey) {
      customHeaders['x-elevenlabs-api-key'] = payload.elevenLabsApiKey;
    }
    return fetchAPI<{
      success: boolean;
      message: string;
      meeting: Meeting;
      report: string;
      decisions: Decision[];
      tasks: Task[];
    }>('/meetings/transcribe', {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify(payload)
    });
  },

  getElevenLabsStatus: async () => {
    return fetchAPI<{
      configured: boolean;
      model: string;
      provider: string;
      diarizationSupported: boolean;
    }>('/elevenlabs/status');
  },

  getMeetingReport: async (id: string) => {
    return fetchAPI<{
      meetingId: string;
      title: string;
      reportMarkdown: string;
      decisionsCount: number;
      tasksCount: number;
      generatedAt: string;
    }>(`/meetings/${id}/report`);
  },

  getReportDownloadUrl: (id: string) => `${API_BASE}/meetings/${id}/report/download`,

  // Tasks
  getTasks: async () => {
    return fetchAPI<{ tasks: Task[] }>('/tasks');
  },

  createTask: async (task: Partial<Task>) => {
    return fetchAPI<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  toggleTask: async (id: string) => {
    return fetchAPI<{ success: boolean; task: Task }>(`/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  // Decisions
  getDecisions: async () => {
    return fetchAPI<{ decisions: Decision[] }>('/decisions');
  },

  confirmDecision: async (id: string) => {
    return fetchAPI<{ decision: Decision }>(`/decisions/${id}/confirm`, {
      method: 'PATCH'
    });
  },

  // Knowledge Graph (React Flow)
  getGraph: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return fetchAPI<{ nodes: ReactFlowNode[]; edges: ReactFlowEdge[] }>(`/graph${query}`);
  },

  // Risks & Conflict Detection
  getRisks: async () => {
    return fetchAPI<{ risks: TimelineConflictRisk[] }>('/risks');
  },

  // Ask GraphRAG
  askGraphRAG: async (prompt: string, projectId?: string) => {
    return fetchAPI<{ answer: string; citations: string[]; sourceNodes: string[] }>('/search', {
      method: 'POST',
      body: JSON.stringify({ prompt, projectId })
    });
  },

  // Notifications
  getNotifications: async () => {
    return fetchAPI<{ notifications: NotificationItem[] }>('/notifications');
  },

  // Google OAuth 2.0 & Google Meet Integration
  getGoogleAuthUrl: async () => {
    return fetchAPI<{ url: string; state: string; configured: boolean }>('/auth/google/url');
  },

  getGoogleStatus: async () => {
    return fetchAPI<GoogleAuthStatus>('/google/status');
  },

  disconnectGoogle: async () => {
    return fetchAPI<{ success: boolean; message: string }>('/google/disconnect', {
      method: 'POST'
    });
  },

  connectDeveloperGoogle: async (email?: string, name?: string) => {
    return fetchAPI<{ success: boolean; user: GoogleAuthStatus }>('/auth/google/dev-connect', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    });
  },

  validateGoogleMeet: async (meetUrl: string) => {
    return fetchAPI<GoogleMeetSpaceValidation>('/google/meet/validate', {
      method: 'POST',
      body: JSON.stringify({ meetUrl })
    });
  },

  syncGoogleMeet: async (meetingCode: string, meetingTitle?: string, project?: string) => {
    return fetchAPI<GoogleMeetSyncResult>('/google/meet/sync', {
      method: 'POST',
      body: JSON.stringify({ meetingCode, meetingTitle, project })
    });
  }
};
