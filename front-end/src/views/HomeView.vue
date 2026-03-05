<template>
  <div class="home-view">
    <section class="home-hero">
      <h1 class="home-hero-title">欢迎使用考必过</h1>
      <p class="home-hero-desc">在真题语境中背单词，专注考试提分</p>
      <div class="home-hero-glow" aria-hidden="true" />
    </section>
    <section class="home-actions">
      <button
        v-for="action in actions"
        :key="action.path"
        type="button"
        class="action-card"
        @click="goTo(action.path)"
      >
        <span class="action-card-icon" :aria-hidden="true">{{ action.icon }}</span>
        <span class="action-card-label">{{ action.label }}</span>
        <span class="action-card-desc">{{ action.desc }}</span>
      </button>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const actions = [
  { path: '/word-books', label: '选词书', desc: '选择词书，绑定进度', icon: '📚' },
  { path: '/learn', label: '学新词', desc: '今日新词，真题例句', icon: '✨' },
  { path: '/review', label: '复习', desc: '今日待复习', icon: '🔄' },
  { path: '/word-list', label: '生词本', desc: '我的生词', icon: '📝' },
];

function goTo(path) {
  router.push(path);
}
</script>

<style lang="scss" scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.home-hero {
  position: relative;
  text-align: center;
  padding: 3rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: var(--kb-radius);
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.08) 0%,
    rgba(124, 58, 237, 0.06) 50%,
    rgba(6, 182, 212, 0.06) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: var(--kb-shadow);
  overflow: hidden;
}

.home-hero-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(37, 99, 235, 0.12) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.home-hero-title {
  position: relative;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--kb-text);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.home-hero-desc {
  position: relative;
  font-size: 1rem;
  color: var(--kb-text-muted);
}

.home-actions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.action-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: left;
  background: var(--kb-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--kb-glass-border);
  border-radius: var(--kb-radius);
  box-shadow: var(--kb-shadow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--kb-shadow-lg);
    border-color: rgba(37, 99, 235, 0.2);
  }

  &:active {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--kb-primary);
    outline-offset: 2px;
  }
}

.action-card-icon {
  font-size: 2rem;
  line-height: 1;
}

.action-card-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--kb-text);
}

.action-card-desc {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
}
</style>
