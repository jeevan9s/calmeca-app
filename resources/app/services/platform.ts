export const apiRequest = async (path: string, init?: RequestInit) => {
  try {
    const response = await fetch(path, {
      credentials: 'include',
      ...init,
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

export async function getLoggedInUser() {
  return apiRequest('/api/auth/user');
}

export async function startGoogleLogin() {
  return apiRequest('/api/auth/google/login');
}

export async function googleLogout() {
  return apiRequest('/api/auth/logout');
}

export async function fetchGoogleCalendarEvents(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const result = await apiRequest(`/api/calendar/events${query}`);
  return Array.isArray(result) ? result : [];
}

export async function addGoogleCalendarEvent(
  summary: string,
  start: string,
  end: string,
  allDay = false,
  recurrence = 'none'
// ) {
//   return apiRequest('/api/calendar/events', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ summary, start, end, allDay, recurrence }),
//   });
// }

// export async function deleteGoogleCalendarEvent(eventId: string) {
//   return apiRequest(`/api/calendar/events/${encodeURIComponent(eventId)}`, {
//     method: 'DELETE',
//   });
// }

// export async function extractCourseFromPDF(base64: string) {
//   const result = await apiRequest('/api/pdf/extract', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ pdf: base64 }),
//   });
//   return result ?? { success: false, error: 'Unavailable' };
// }
