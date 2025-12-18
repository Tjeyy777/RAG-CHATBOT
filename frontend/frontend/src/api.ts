const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getToken();

  return fetch(API_BASE + url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
}
