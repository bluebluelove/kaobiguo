import { useAuthStore } from '../store/authStore';
import { storeToRefs } from 'pinia';

/**
 * @returns {{ isLoggedIn, user, login, register, logout }}
 */
export function useAuth() {
  const store = useAuthStore();
  const { user, isLoggedIn } = storeToRefs(store);
  return {
    isLoggedIn,
    user,
    login: store.login,
    register: store.register,
    logout: store.logout,
  };
}
