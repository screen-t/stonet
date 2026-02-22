/**
 * Client for the Stonet FastAPI backend.
 * All requests use the stored access token (localStorage) for auth.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "access_token";

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail));
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// --- Profile ---
const profile = {
  getMyProfile: () =>
    fetch(`${API_BASE_URL}/profile/me`, { headers: getAuthHeaders() }).then(handleResponse),
  getProfile: (username: string) =>
    fetch(`${API_BASE_URL}/profile/${encodeURIComponent(username)}`, { headers: getAuthHeaders() }).then(handleResponse),
  updateProfile: (data: Record<string, unknown>) =>
    fetch(`${API_BASE_URL}/profile/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  addWorkExperience: (data: Record<string, unknown>) =>
    fetch(`${API_BASE_URL}/profile/work-experience`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateWorkExperience: (id: string, data: Record<string, unknown>) =>
    fetch(`${API_BASE_URL}/profile/work-experience/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteWorkExperience: (id: string) =>
    fetch(`${API_BASE_URL}/profile/work-experience/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  addEducation: (data: Record<string, unknown>) =>
    fetch(`${API_BASE_URL}/profile/education`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateEducation: (id: string, data: Record<string, unknown>) =>
    fetch(`${API_BASE_URL}/profile/education/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteEducation: (id: string) =>
    fetch(`${API_BASE_URL}/profile/education/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  addSkill: (skillName: string) =>
    fetch(`${API_BASE_URL}/profile/skills`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill: skillName }),
    }).then(handleResponse),
  deleteSkill: (skillId: string) =>
    fetch(`${API_BASE_URL}/profile/skills/${skillId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// --- Posts ---
const posts = {
  getFeed: (feedType: "for_you" | "following", limit: number, offset: number) =>
    fetch(
      `${API_BASE_URL}/posts?feed_type=${feedType}&limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>),
  getUserPosts: async (username: string, limit: number, offset: number) => {
    const list = await fetch(
      `${API_BASE_URL}/posts/user/${encodeURIComponent(username)}?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>);
    return { posts: Array.isArray(list) ? list : [] };
  },
  createPost: (data: {
    content: string;
    post_type?: string;
    visibility?: string;
    media?: Array<{ url: string; media_type: string; thumbnail_url?: string | null }>;
    poll?: {
      question: string;
      options: Array<{ option_text: string; display_order: number }>;
      ends_at?: string;
    };
    scheduled_at?: string;
    is_draft?: boolean;
  }) =>
    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  likePost: (postId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  unlikePost: (postId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  addComment: (postId: string, content: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    }).then(handleResponse),
  repost: (postId: string, comment?: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/repost`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: comment ? JSON.stringify({ comment }) : undefined,
    }).then(handleResponse),
  unrepost: (postId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/repost`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  getComments: (postId: string, limit: number, offset: number) =>
    fetch(
      `${API_BASE_URL}/posts/${postId}/comments?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>),
  votePoll: (postId: string, optionId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/poll/vote`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ option_id: optionId }),
    }).then(handleResponse),
};

// --- Connections ---
const connections = {
  getConnections: (status: string, limit: number, offset: number) =>
    fetch(
      `${API_BASE_URL}/connections?status=${status}&limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>),
  getConnectionStatus: (username: string) =>
    fetch(`${API_BASE_URL}/connections/check/${encodeURIComponent(username)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse<{ status: string; connection_id?: string; is_requester?: boolean; can_connect?: boolean }>),
  sendRequest: (receiverId: string) =>
    fetch(`${API_BASE_URL}/connections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiver_id: receiverId }),
    }).then(handleResponse),
  respondToRequest: (connectionId: string, accept: boolean) =>
    fetch(`${API_BASE_URL}/connections/${connectionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: accept ? "accepted" : "declined" }),
    }).then(handleResponse),
  removeConnection: (connectionId: string) =>
    fetch(`${API_BASE_URL}/connections/${connectionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  getSuggestions: (limit: number) =>
    fetch(`${API_BASE_URL}/connections/suggestions?limit=${limit}`, {
      headers: getAuthHeaders(),
    }).then(async (res) => {
      const data = await handleResponse<{ suggestions: unknown[] }>(res);
      return Array.isArray(data) ? data : (data.suggestions ?? []);
    }),
};

// --- Messages ---
async function getConversationWithUser(otherUserId: string): Promise<{ id: string } | null> {
  const list = await fetch(`${API_BASE_URL}/messages/conversations`, {
    headers: getAuthHeaders(),
  }).then(handleResponse<Array<{ id: string; participants?: Array<{ id: string }> }>>);
  const arr = Array.isArray(list) ? list : [];
  const conv = arr.find(
    (c) => c.participants?.some((p: { id: string }) => p.id === otherUserId)
  );
  return conv ? { id: conv.id } : null;
}

const messages = {
  getConversations: async (_limit?: number, _offset?: number) => {
    const list = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    }).then(handleResponse<unknown[]>);
    return { conversations: Array.isArray(list) ? list : [] };
  },
  getMessages: async (otherUserId: string, limit: number, offset: number) => {
    const conv = await getConversationWithUser(otherUserId);
    if (!conv) return { messages: [] };
    const list = await fetch(
      `${API_BASE_URL}/messages/conversations/${conv.id}/messages?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>);
    return { messages: Array.isArray(list) ? list : [] };
  },
  sendMessage: (recipientId: string, content: string) =>
    fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiver_id: recipientId, content }),
    }).then(handleResponse),
  markAsRead: (messageId: string) =>
    fetch(`${API_BASE_URL}/messages/messages/${messageId}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  getUnreadCount: () =>
    fetch(`${API_BASE_URL}/messages/unread-count`, {
      headers: getAuthHeaders(),
    }).then(handleResponse<{ count: number }>),
};

// --- Notifications ---
const notifications = {
  getNotifications: async (limit: number, offset: number, unreadOnly?: boolean) => {
    const list = await fetch(
      `${API_BASE_URL}/notifications?limit=${limit}&offset=${offset}&unread_only=${unreadOnly ?? false}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<unknown[]>);
    return { notifications: Array.isArray(list) ? list : [] };
  },
  getUnreadCount: () =>
    fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders(),
    }).then(handleResponse<{ count: number }>),
  markAsRead: (notificationId: string) =>
    fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  markAllAsRead: () =>
    fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
    }).then(handleResponse),
  deleteNotification: (notificationId: string) =>
    fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// --- Search ---
const search = {
  searchAll: async (q: string, limit?: number) => {
    const data = await fetch(
      `${API_BASE_URL}/search/all?q=${encodeURIComponent(q)}&users_limit=${limit ?? 20}&posts_limit=${limit ?? 20}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<{ users?: { results: unknown[] }; posts?: { results: unknown[] } }>);
    return {
      users: data.users?.results ?? [],
      posts: data.posts?.results ?? [],
    };
  },
  searchUsers: async (q: string, limit: number, _offset?: number) => {
    const data = await fetch(
      `${API_BASE_URL}/search/users?q=${encodeURIComponent(q)}&limit=${limit}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<{ results: unknown[]; count?: number }>);
    return { users: Array.isArray(data.results) ? data.results : [] };
  },
  searchPosts: async (q: string, limit: number, _offset?: number) => {
    const data = await fetch(
      `${API_BASE_URL}/search/posts?q=${encodeURIComponent(q)}&limit=${limit}`,
      { headers: getAuthHeaders() }
    ).then(handleResponse<{ results: unknown[]; count?: number }>);
    return { posts: Array.isArray(data.results) ? data.results : [] };
  },
};

export const backendApi = {
  profile,
  posts,
  connections,
  messages,
  notifications,
  search,
};
