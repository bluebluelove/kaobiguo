<template>
  <div class="register-view">
    <el-card class="register-card">
      <template #header>
        <span>考必过 · 注册</span>
      </template>
      <el-form :model="form" :rules="rules" @submit.prevent="handleSubmit">
        <el-form-item label="QQ 邮箱" prop="account">
          <el-input v-model="form.account" type="email" placeholder="xxx@qq.com" />
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="code">
          <div style="display: flex; gap: 8px; width: 100%">
            <el-input v-model="form.code" placeholder="6 位验证码" maxlength="6" show-word-limit />
            <el-button
              type="primary"
              :loading="codeLoading"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ codeLoading ? '发送中…' : countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}
            </el-button>
          </div>
          <div class="code-hint">邮件可能需 1～2 分钟到达，请耐心等待；未收到可检查垃圾箱。</div>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="至少 6 位" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称（选填）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
        <el-form-item>
          <router-link to="/login">已有账号？去登录</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({ account: '', code: '', password: '', nickname: '' });
const loading = ref(false);
const codeLoading = ref(false);
const countdown = ref(0);
let countdownTimer = null;

const rules = {
  account: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请先获取邮箱验证码', trigger: 'blur' }, { len: 6, message: '验证码为 6 位', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
};

async function handleSendCode() {
  if (!form.account || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.account)) {
    ElMessage.warning('请先输入有效的邮箱地址');
    return;
  }
  codeLoading.value = true;
  try {
    await authStore.sendCode(form.account, 'register');
    ElMessage.success('验证码已发送，请到邮箱查收（有时需 1～2 分钟）');
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(countdownTimer);
    }, 1000);
  } catch (err) {
    ElMessage.error(err.response?.data?.message ?? '发送验证码失败');
  } finally {
    codeLoading.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    await authStore.register(form);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (err) {
    ElMessage.error(err.response?.data?.message ?? '注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.register-card {
  width: 100%;
  max-width: 400px;
}
.code-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;
  line-height: 1.4;
}
</style>
