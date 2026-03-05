<template>
  <div class="login-view">
    <div class="login-bg" aria-hidden="true" />
    <main class="login-main" role="main">
      <section class="login-card" aria-labelledby="login-heading">
        <h1 id="login-heading" class="login-title">登录</h1>
        <p class="login-subtitle">考必过 · 真题语境背单词</p>

        <form class="login-form" @submit.prevent="handleSubmit" novalidate>
          <div class="form-group">
            <label for="account" class="form-label">QQ 账号</label>
            <input
              id="account"
              v-model="form.account"
              type="text"
              class="form-input"
              placeholder="QQ 号或邮箱"
              autocomplete="username"
              required
              aria-required="true"
              aria-invalid="!!fieldErrors.account"
              aria-describedby="account-error"
            />
            <span v-if="fieldErrors.account" id="account-error" class="form-error" role="alert">
              {{ fieldErrors.account }}
            </span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入注册时设置的密码"
              autocomplete="current-password"
              required
              aria-required="true"
              aria-invalid="!!fieldErrors.password"
              aria-describedby="password-error"
            />
            <button
              type="button"
              class="form-toggle-pwd"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
            <span v-if="fieldErrors.password" id="password-error" class="form-error" role="alert">
              {{ fieldErrors.password }}
            </span>
          </div>

          <button
            type="submit"
            class="form-submit"
            :disabled="loading"
            aria-busy="loading"
          >
            <span v-if="loading" class="form-submit-spinner" aria-hidden="true" />
            <span v-else>登录</span>
          </button>
        </form>

        <p class="login-footer">
          还没有账号？
          <router-link to="/register" class="form-link">去注册</router-link>
        </p>

        <p v-if="isDev" class="login-dev">
          <button type="button" class="form-link" @click="enterDevPreview">
            开发预览：直接进入首页
          </button>
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isDev = import.meta.env.DEV;
const form = reactive({
  account: '',
  password: '',
});
const loading = ref(false);
const showPassword = ref(false);
const fieldErrors = ref({});

function validate() {
  const e = {};
  const raw = form.account.trim();
  if (!raw) e.account = '请输入 QQ 账号';
  else if (!/^\d+$/.test(raw) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) e.account = '请输入 QQ 号或邮箱';
  if (!form.password) e.password = '请输入密码';
  else if (form.password.length < 6) e.password = '密码至少 6 位';
  return e;
}

function getAccountForLogin() {
  const raw = form.account.trim();
  return /^\d+$/.test(raw) ? raw + '@qq.com' : raw;
}

async function handleSubmit() {
  const validationErrors = validate();
  fieldErrors.value = validationErrors;
  if (Object.keys(validationErrors).length) {
    ElMessage.warning(validationErrors.account || validationErrors.password || '请填写完整');
    return;
  }
  loading.value = true;
  try {
    await authStore.login(getAccountForLogin(), form.password);
    ElMessage.success('登录成功');
    const redirect = route.query.redirect ?? '/';
    router.push(redirect);
  } catch (err) {
    ElMessage.error(err.response?.data?.message ?? '登录失败，请检查邮箱和密码');
  } finally {
    loading.value = false;
  }
}

function enterDevPreview() {
  authStore.setToken('dev-preview');
  authStore.setUser({ nickname: '预览用户', account: 'dev' });
  router.push(route.query.redirect ?? '/');
}
</script>

<style lang="scss" scoped>
$primary: #2563eb;
$primary-hover: #1d4ed8;
$primary-active: #1e40af;
$white: #ffffff;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-500: #6b7280;
$gray-700: #374151;
$gray-900: #111827;
$error: #dc2626;
$shadow: rgba(37, 99, 235, 0.15);
$glass: rgba(255, 255, 255, 0.75);
$glass-border: rgba(255, 255, 255, 0.9);

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: $gray-900;
  position: relative;
}

.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.login-main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
}

.login-title {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: $gray-900;
  letter-spacing: -0.02em;
}

.login-subtitle {
  margin: 0 0 1.75rem;
  font-size: 14px;
  color: $gray-500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-weight: 500;
  color: $gray-700;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 14px;
  font-family: inherit;
  color: $gray-900;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &::placeholder {
    color: $gray-500;
  }

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.2);
  }

  &[aria-invalid="true"] {
    border-color: $error;
  }
}

.form-group:has(.form-toggle-pwd) .form-input {
  padding-right: 4rem;
}

.form-toggle-pwd {
  position: absolute;
  right: 0.5rem;
  bottom: 2.1rem;
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  color: $gray-500;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: $primary;
    background: $gray-100;
  }
}

.form-error {
  font-size: 12px;
  color: $error;
}

.form-code-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}
.form-input-code {
  flex: 1;
  min-width: 0;
}
.form-send-code {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  font-size: 14px;
  font-weight: 500;
  color: $primary;
  background: rgba($primary, 0.08);
  border: 1px solid rgba($primary, 0.3);
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    background: rgba($primary, 0.12);
    border-color: $primary;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.form-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 14px;
  color: $gray-700;
}

.form-checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: $primary;
  cursor: pointer;
}

.form-checkbox-text {
  user-select: none;
}

.form-link {
  font-size: 14px;
  color: $primary;
  text-decoration: none;
  transition: color 0.2s, text-decoration 0.2s;

  &:hover {
    color: $primary-hover;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.form-submit {
  margin-top: 0.25rem;
  padding: 0.875rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  color: $white;
  background: $primary;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba($primary, 0.35);

  &:hover:not(:disabled) {
    background: $primary-hover;
    box-shadow: 0 4px 12px rgba($primary, 0.4);
  }

  &:active:not(:disabled) {
    background: $primary-active;
    transform: scale(0.99);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.form-submit-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: $white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-divider {
  margin: 1.5rem 0;
  text-align: center;
  font-size: 12px;
  color: $gray-500;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: 40px;
    height: 1px;
    margin: 0 0.5rem;
    vertical-align: middle;
    background: $gray-200;
  }
}

.login-social {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 14px;
  font-family: inherit;
  color: $gray-700;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: 10px;
  cursor: not-allowed;
  opacity: 0.7;

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.login-footer {
  margin: 1.5rem 0 0;
  font-size: 14px;
  color: $gray-500;
  text-align: center;
}

.login-dev {
  margin: 1rem 0 0;
  font-size: 12px;
  color: $gray-500;
  text-align: center;
}

// 移动端适配
@media (max-width: 640px) {
  .login-view {
    padding: 1rem;
    min-height: 100vh;
    min-height: 100dvh; // 动态视口高度，避免移动端地址栏影响
    align-items: flex-start;
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .login-main {
    width: 100%;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .login-card {
    max-width: none;
    padding: 1.5rem 1.25rem;
    border-radius: 12px;
    margin: 0;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    margin-bottom: 1.25rem;
    font-size: 13px;
  }

  .login-form {
    gap: 1rem;
  }

  .form-input {
    padding: 0.875rem 1rem;
    font-size: 16px; // 避免 iOS 自动放大
  }

  .form-group:has(.form-toggle-pwd) .form-input {
    padding-right: 3.75rem;
  }

  .form-toggle-pwd {
    bottom: 2.25rem;
    padding: 0.375rem 0.5rem;
    min-height: 2rem; // 增大触控区域
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-submit {
    padding: 0.9375rem 1.5rem;
    min-height: 48px; // 满足触控最小尺寸
  }

  .login-divider::before,
  .login-divider::after {
    width: 24px;
  }

  .login-social {
    flex-direction: column;
    gap: 0.5rem;
  }

  .social-btn {
    min-height: 48px;
  }

  .login-footer {
    margin-top: 1.25rem;
  }
}

// 小屏手机（可选）
@media (max-width: 380px) {
  .login-view {
    padding: 0.75rem;
  }

  .login-card {
    padding: 1.25rem 1rem;
  }

  .login-title {
    font-size: 1.375rem;
  }
}
</style>
