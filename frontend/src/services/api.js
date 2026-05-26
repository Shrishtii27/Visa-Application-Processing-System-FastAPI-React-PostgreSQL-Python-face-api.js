const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export const api = {
  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Essential for HttpOnly cookies
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch(e) {
            errorData = { detail: "An unexpected error occurred" };
        }
        throw new Error(errorData.detail || "Request failed");
    }
    
    // For 204 No Content or empty responses
    if (response.status === 204) return null;
    
    return response.json();
  },

  get(endpoint, options) {
    return this.fetch(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options) {
    return this.fetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options) {
    return this.fetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options) {
    return this.fetch(endpoint, { ...options, method: "DELETE" });
  },
};
