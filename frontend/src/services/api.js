const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// Token management
const TOKEN_KEY = "access_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = {
  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = tokenStorage.get();
    const headers = {
      ...options.headers,
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch(e) {
        errorData = { detail: "An unexpected error occurred" };
      }
      
      let errorMessage = errorData.detail || "Request failed";
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof errorData.detail === "object" && errorData.detail !== null) {
        errorMessage = JSON.stringify(errorData.detail);
      }
      
      throw new Error(errorMessage);
    }
    
    // For 204 No Content or empty responses
    if (response.status === 204) return null;
    
    return response.json();
  },

  async fetchBlob(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = tokenStorage.get();
    const headers = { ...options.headers };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: "An unexpected error occurred" };
      }
      throw new Error(errorData.detail || "Request failed");
    }

    return response.blob();
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

  patch(endpoint, body, options) {
    return this.fetch(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options) {
    return this.fetch(endpoint, { ...options, method: "DELETE" });
  },
};
