// Thin wrapper around the Django backend endpoints used by the
// All / Unread / Pending / Groups tabs and the WhatsApp-style Status page.

import BACKEND_URL from "../config";

export type ContactItem = {
  id: string;
  name: string;
  image: string;
  msg: string;
  time: string;
  count: number;
  color: string;
  is_unread: boolean;
  is_pending: boolean;
};

export type GroupItem = {
  id: string;
  name: string;
  image: string;
  time: string;
};

export type StatusItem = {
  id: string;
  username: string;
  name: string;
  profile_image: string;
  content_image: string;
  caption: string;
  created_at: string;
  expires_at: string;
  viewer_count: number;
  viewed_by_me: boolean;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

// ── Contacts (All / Unread / Pending) ──
export function fetchContacts(owner: string, filter: "all" | "unread" | "pending") {
  return request<{ results: ContactItem[] }>(
    `/app/api/contacts/?owner=${encodeURIComponent(owner)}&filter=${filter}`
  );
}

export function createContact(payload: {
  owner_username: string;
  name: string;
  image?: string;
  msg?: string;
  time?: string;
  count?: number;
  color?: string;
  is_unread?: boolean;
  is_pending?: boolean;
}) {
  return request<{ success: boolean; contact: ContactItem }>(`/app/api/contacts/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Groups ──
export function fetchGroups(owner: string) {
  return request<{ results: GroupItem[] }>(`/app/api/groups/?owner=${encodeURIComponent(owner)}`);
}

export function createGroup(payload: { owner_username: string; name: string; image?: string; time?: string }) {
  return request<{ success: boolean; group: GroupItem }>(`/app/api/groups/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Status / Moments ──
export function postStatus(payload: {
  username: string;
  name?: string;
  profile_image?: string;
  content_image: string;
  caption?: string;
}) {
  return request<{ success: boolean; status: StatusItem }>(`/app/api/status/create/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyStatus(username: string) {
  return request<{ results: StatusItem[]; total_unique_viewers: number }>(
    `/app/api/status/my/?username=${encodeURIComponent(username)}`
  );
}

export function fetchStatusFeed(username: string) {
  return request<{ results: StatusItem[] }>(
    `/app/api/status/feed/?username=${encodeURIComponent(username)}`
  );
}

export function markStatusViewed(payload: {
  status_id: string;
  viewer_username: string;
  viewer_name?: string;
  viewer_image?: string;
}) {
  return request<{ success: boolean; status: StatusItem }>(`/app/api/status/view/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type StatusViewer = {
  id?: number | string;

  username?: string;
  viewer_username?: string;

  name?: string;
  viewer_name?: string;

  phone?: string;
  email?: string;
  about?: string;

  image?: string;
  profile_image?: string;
  viewer_image?: string;
  profileImage?: string;

  viewed_at?: string;
};

export function fetchStatusViewers(statusId: string) {
  return request<{
    status_id: string;
    viewer_count: number;
    viewers: StatusViewer[];
  }>(
    `/app/api/status/viewers/?status_id=${encodeURIComponent(statusId)}`
  );
}


export function deleteStatus(
  statusId: string,
  username: string
) {
  return request<{
    success: boolean;
    message: string;
  }>(
    `/app/api/status/delete/?status_id=${encodeURIComponent(
      statusId
    )}&username=${encodeURIComponent(username)}`,
    {
      method: "DELETE",
    }
  );
}