const apiBaseUrl = import.meta.env.VITE_API_URL || '';

export async function sendChatMessage(messages, userId = null) {
  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, user_id: userId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || body.detail || `Chat failed (${response.status})`);
  }

  const data = await response.json();
  return data.reply;
}

export async function fetchSuggestions(userId) {
  try {
    const url = userId
      ? `${apiBaseUrl}/api/chat/suggestions?user_id=${encodeURIComponent(userId)}`
      : `${apiBaseUrl}/api/chat/suggestions`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.suggestions || null;
  } catch {
    return null;
  }
}
