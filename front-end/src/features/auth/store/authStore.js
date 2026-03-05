import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/api/request';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? '');
  const user = ref(null);

  const isLoggedIn = computed(() => !!token.value);

  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }

  function setUser(userData) {
    user.value = userData;
  }

  async function login(account, password) {
    const data = await request.post('/auth/login', { account, password });
    setToken(data.token);
    setUser(data.user ?? null);
    return data;
  }

  async function sendCode(email, type) {
    await request.post('/auth/send-code', { email, type });
  }

  async function loginByCode(account, code) {
    const data = await request.post('/auth/login-by-code', { account, code });
    setToken(data.token);
    setUser(data.user ?? null);
    return data;
  }

  async function register(payload) {
    const data = await request.post('/auth/register', payload);
    setToken(data.token ?? '');
    setUser(data.user ?? null);
    return data;
  }

  function logout() {
    setToken('');
    setUser(null);
  }

  async function fetchUser() {
    const data = await request.get('/auth/me');
    setUser(data);
    return data;
  }

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    setUser,
    login,
    sendCode,
    loginByCode,
    register,
    logout,
    fetchUser,
  };
});
