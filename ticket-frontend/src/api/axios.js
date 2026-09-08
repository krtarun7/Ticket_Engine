import axios from 'axios';

// Create a custom Axios instance
const apiClient = axios.create({
  // Point this to your FastAPI server URL
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to automatically inject the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Check if the user is logged in by looking for the token
    const token = localStorage.getItem('access_token');
    
    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;