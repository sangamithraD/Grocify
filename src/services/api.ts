import axios from 'axios';
import storage from '../utils/storage';
import Constants from 'expo-constants';

// Dynamically resolve backend host API URL for production deployment vs development tunnel
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "https://hzf8au-ip-106-192-171-223.tunnelmole.net";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

// Request interceptor to automatically attach JWT authorization headers and Accept-Language header
api.interceptors.request.use(
  async (config) => {
    // 1. Attach authorization token
    const token = await storage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach selected app language for backend localization
    const language = await storage.getItem('app_language');
    if (language && config.headers) {
      config.headers['Accept-Language'] = language;
    } else if (config.headers) {
      config.headers['Accept-Language'] = 'en'; // default fallback
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
