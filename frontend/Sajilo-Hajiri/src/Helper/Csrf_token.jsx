async function getCSRFToken() {
  const response = await fetch('/api/csrf/', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.csrfToken; // or read from document.cookie
}

export default getCSRFToken;