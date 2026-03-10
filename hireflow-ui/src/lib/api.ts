import axios from 'axios';
import { useUpgradeStore } from '../components/UpgradeModal';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hireflow_token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403 && error.response?.data?.code === 'upgrade_required') {
      useUpgradeStore.getState().show(error.response.data.requiredPlan ?? 'pro');
    }
    return Promise.reject(error);
  }
);

export default api;
