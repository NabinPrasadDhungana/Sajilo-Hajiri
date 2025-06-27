export const getCSRFToken = async () => {
  try {
    // First try reading from cookie
    const cookieToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    if (cookieToken) return cookieToken;
    
    // If not found, fetch fresh token
    await fetch('/api/csrf/', { credentials: 'include' });
    
    // Try reading again after fetch
    const newCookieToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    if (!newCookieToken) throw new Error('CSRF token not available');
    return newCookieToken;
  } catch (error) {
    console.error('CSRF token error:', error);
    throw error;
  }
};

// Utility for authenticated requests
export const authFetch = async (url, options = {}) => {
  const csrfToken = await getCSRFToken();
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      ...options.headers,
    },
  });
};