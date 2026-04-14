import axios from 'axios';
import { auth } from '../firebase/auth';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

instance.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
