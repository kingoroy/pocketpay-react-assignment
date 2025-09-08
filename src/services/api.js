import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});


// Simple client-side mock for auth endpoints so json-server doesn't need custom routes.
api.interceptors.request.use(async (config) => {
  // If the request is to auth endpoints, let the caller hit json-server first; we'll mock POSTs locally
  return config;
});

export default api;
