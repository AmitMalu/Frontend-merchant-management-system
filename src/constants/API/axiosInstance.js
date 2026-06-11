import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
error => {
    if (error.response) {
      const { status, data } = error.response;
      
      // ✅ Check for password expired scenario FIRST
      // This prevents auto-logout for password expiry
      if (data?.passwordExpired === true) {
        // Let the calling component handle this (Login.jsx will redirect)
        return Promise.reject(error);
      }

      // ✅ Handle token expiry or unauthorized access
      if (status === 401 || status === 403) {
    
        // Check if error message mentions token expiry
        if (data?.message?.toLowerCase().includes("expired") || 
            data?.message?.toLowerCase().includes("token")) {
          
          // Clear all auth data
          localStorage.removeItem("authToken");
          localStorage.removeItem("userType");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("customerId");
          localStorage.removeItem("permissions");
          localStorage.removeItem("firstLogin");
          
          // Redirect to login
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;