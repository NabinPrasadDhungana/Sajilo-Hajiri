export const authFetch = async (url, options = {}) => {
  // Get CSRF token from cookie
  const getCookie = (name) => {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
  };
  
  const csrfToken = getCookie('csrftoken');
  
  if (!csrfToken) {
    throw new Error('CSRF token not found');
  }

  // Merge headers
  const headers = {
    'X-CSRFToken': csrfToken,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include',  // Required for cookies
    headers: headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response;
};