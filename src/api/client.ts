
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || '/api/v1'
).replace(/\/+$/, '');

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorData = await response.json();
      message =
        errorData.detail ||
        errorData.message ||
        message;
    } catch {
      // The response was not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
}

export interface Meeting {
  id: number;
  project_id: number;
  title: string;
  original_filename: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  meeting_date: string | null;
  status: string;
  processing_error?: string | null;
  created_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  task_description: string;
  assignee_name: string | null;
  assignee_speaker_id: number | null;
  due_date: string | null;
  estimated_duration_minutes: number | null;
  status: string;
  evidence_text: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
}

export interface Decision {
  id: number;
  meeting_id: number;
  title: string;
  description: string | null;
  speaker_id: number | null;
  status: string;
  evidence_text: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
  confidence: number | null;
}

export interface ProjectMeetingIntelligence {
  meeting_id: number;
  title: string;
  status: string;
  duration_seconds: number | null;
  summary: string;
  key_points: {
    text: string;
    speaker: string | null;
    start_seconds: number | null;
    end_seconds: number | null;
  }[];
  action_item_count: number;
  decision_count: number;
}

export interface ProjectIntelligence {
  project_id: number;
  project_name: string;
  total_meetings: number;
  processed_meetings: number;
  total_action_items: number;
  pending_action_items: number;
  completed_action_items: number;
  total_decisions: number;
  meetings: ProjectMeetingIntelligence[];
  action_items: ActionItem[];
  decisions: Decision[];
}

export interface QuestionSource {
  meeting_id: number;
  meeting_title: string;
  source_type: string;
  evidence_text: string;
  speaker: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
}

export interface QuestionResponse {
  project_id: number;
  question: string;
  answer: string;
  answer_method: string;
  sources: QuestionSource[];
}

export interface DeleteMeetingResponse {
  message: string;
  meeting_id: number;
}

export interface TranscriptSegment {
  id: number;
  text: string;
  start_seconds: number;
  end_seconds: number;
  speaker_id?: number | null;
  speaker_name?: string | null;
}

export interface MeetingTranscript {
  meeting_id: number;
  title: string;
  status: string;
  segments: TranscriptSegment[];
}

export const api = {
  getProjects: () =>
    request<Project[]>('/projects'),

  getMeetings: (projectId: number) =>
    request<Meeting[]>(`/meetings?project_id=${projectId}`),

  getMeeting: (meetingId: number) =>
    request<Meeting>(`/meetings/${meetingId}`),

  getMeetingTranscript: (meetingId: number) =>
    request<MeetingTranscript>(
      `/meetings/${meetingId}/transcript`,
    ),

  getIntelligence: (projectId: number) =>
    request<ProjectIntelligence>(
      `/projects/${projectId}/intelligence`,
    ),

  askQuestion: (
    projectId: number,
    question: string,
    meetingId: number | null = null,
  ) =>
    request<QuestionResponse>(
      `/projects/${projectId}/ask`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          meeting_id: meetingId,
        }),
      },
    ),

  uploadMeeting: (
    projectId: number,
    title: string,
    recording: File,
  ) => {
    const formData = new FormData();

    formData.append('project_id', String(projectId));
    formData.append('title', title);
    formData.append('recording', recording);

    return request<Meeting>('/meetings/upload', {
      method: 'POST',
      body: formData,
    });
  },

  uploadTranscript: (
    projectId: number,
    title: string,
    transcript: File,
  ) => {
    const formData = new FormData();

    formData.append('project_id', String(projectId));
    formData.append('title', title);
    formData.append('transcript', transcript);

    return request<Meeting>('/meetings/upload-transcript', {
      method: 'POST',
      body: formData,
    });
  },

  transcribeMeeting: (meetingId: number) =>
    request<unknown>(`/meetings/${meetingId}/transcribe`, {
      method: 'POST',
    }),

  deleteMeeting: (meetingId: number) =>
    request<DeleteMeetingResponse>(
      `/meetings/${meetingId}`,
      {
        method: 'DELETE',
      },
    ),
};
