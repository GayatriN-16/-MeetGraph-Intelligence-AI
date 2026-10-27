import { Meeting, Decision, Task, TimelineConflictRisk, ReactFlowNode, ReactFlowEdge, User, Project, NotificationItem } from '../types';

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
  }
};
