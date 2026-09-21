import axios from 'axios';

// When running in production / tunnel, use current origin + '/api' so it works on any mobile or remote domain
// When running locally on dev server, fallback to VITE_API_URL or http://localhost:5000/api
const getBaseURL = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined') {
    // If running under Vercel, cloudflared or any remote host, route via relative /api (proxied via vercel.json or express)
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL()
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('indore_dental_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
