<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="app-header-inner">
        <router-link to="/" class="logo">
          <span class="logo-text">考必过</span>
        </router-link>
        <nav class="app-nav" role="navigation" aria-label="主导航">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ 'nav-link--active': activeMenu === item.path }"
          >
            <span class="nav-link-text">{{ item.label }}</span>
            <span class="nav-link-indicator" />
          </router-link>
          <router-link
            to="/profile"
            class="nav-link nav-link--profile"
            :class="{ 'nav-link--active': activeMenu === '/profile' }"
          >
            <span class="nav-link-text">个人中心</span>
            <span class="nav-link-indicator" />
          </router-link>
        </nav>
      </div>
      <div class="app-header-gradient" aria-hidden="true" />
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <suspense>
            <component :is="Component" />
            <template #fallback>
              <div class="page-view">
                <div class="glass-card">
                  <div class="skeleton-block" />
                  <div class="skeleton-block" />
                  <div class="skeleton-block" />
                </div>
              </div>
            </template>
          </suspense>
        </transition>
      </router-view>
    </main>
    <div class="app-bg" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeMenu = computed(() => route.path);

const navItems = [
  { path: '/', label: '首页' },
  { path: '/word-books', label: '选词书' },
  { path: '/learn', label: '学新词' },
  { path: '/review', label: '复习' },
  { path: '/word-list', label: '生词本' },
  { path: '/stats', label: '学习统计' },
];
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    160deg,
    #f0f9ff 0%,
    #e0f2fe 25%,
    #faf5ff 50%,
    #f0f9ff 100%
  );
  pointer-events: none;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--kb-nav-height);
  min-height: var(--kb-nav-height);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  padding-top: var(--kb-safe-top);
  padding-left: max(1.5rem, var(--kb-safe-left));
  padding-right: max(1.5rem, var(--kb-safe-right));
  height: calc(var(--kb-nav-height) + var(--kb-safe-top));
  min-height: calc(var(--kb-nav-height) + var(--kb-safe-top));
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 20px rgba(37, 99, 235, 0.06);
}

.app-header-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.app-header-gradient {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--kb-primary-light),
    var(--kb-accent),
    transparent
  );
  opacity: 0.4;
  pointer-events: none;
}

.logo {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-text {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--kb-gradient-start), var(--kb-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.nav-link {
  position: relative;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--kb-text-muted);
  border-radius: var(--kb-radius-sm);
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: var(--kb-primary);
    background: rgba(37, 99, 235, 0.06);
  }

  &:focus-visible {
    outline: 2px solid var(--kb-primary);
    outline-offset: 2px;
  }
}

.nav-link--active {
  color: var(--kb-primary);
  font-weight: 600;
}

.nav-link--active .nav-link-indicator {
  opacity: 1;
  transform: scaleX(1);
}

.nav-link-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--kb-primary), var(--kb-accent));
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.nav-link:hover .nav-link-indicator {
  opacity: 0.6;
  transform: translateX(-50%) scaleX(1);
}

.nav-link--profile {
  margin-left: auto;
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.skeleton-block {
  height: 24px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 25%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.2s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 小屏：导航单独一行并允许换行，避免「后面选项显示不出来」 */
@media (max-width: 768px) {
  .app-header {
    height: auto;
    min-height: calc(var(--kb-nav-height) + var(--kb-safe-top));
  }
  .app-header-inner {
    flex-wrap: wrap;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .logo {
    flex-shrink: 0;
    align-self: flex-start;
  }
  .app-nav {
    order: 1;
    width: 100%;
    min-width: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .nav-link {
    flex-shrink: 0;
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
  .nav-link--profile {
    margin-left: 0;
  }
}
</style>
