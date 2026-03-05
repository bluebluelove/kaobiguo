<template>
  <div class="page-view">
    <div class="glass-card profile-card">
      <h2 class="glass-card-header">个人中心</h2>
      <div v-if="user" class="profile-info">
        <p class="profile-nickname">{{ user.nickname ?? user.account }}</p>
        <p class="profile-account">账号：{{ user.account }}</p>
      </div>
      <button type="button" class="btn-logout" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.profile-card {
  max-width: 420px;
}

.profile-info {
  margin-bottom: 1.5rem;
}

.profile-nickname {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--kb-text);
  margin-bottom: 0.25rem;
}

.profile-account {
  font-size: 0.95rem;
  color: var(--kb-text-muted);
}

.btn-logout {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, var(--kb-primary), var(--kb-gradient-end));
  border: none;
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  }
}
</style>
