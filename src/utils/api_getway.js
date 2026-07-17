import axios from 'axios';

const apiGatewayClient = axios.create({
  baseURL: import.meta.env.VITE_API_GETWAY_URL,
  timeout: 10000, 
  headers: { 'Content-Type': 'application/json' }
});

apiGatewayClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiGatewayClient;