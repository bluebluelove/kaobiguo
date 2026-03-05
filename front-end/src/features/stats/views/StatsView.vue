<template>
  <div class="page-view">
    <div class="glass-card stats-card">
      <h2 class="glass-card-header">学习统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ statsStore.todayLearned }}</span>
          <span class="stat-label">今日已学</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ statsStore.todayReviewed }}</span>
          <span class="stat-label">今日已复习</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ statsStore.bookProgress.learned }} / {{ statsStore.bookProgress.total }}</span>
          <span class="stat-label">词书进度</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStatsStore } from '../store/statsStore';

const statsStore = useStatsStore();

onMounted(async () => {
  try {
    await statsStore.fetchToday();
    await statsStore.fetchBookProgress();
  } catch {
    // 静默失败
  }
});
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
}

.stat-item {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--kb-radius-sm);
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(37, 99, 235, 0.06);
    border-color: rgba(37, 99, 235, 0.2);
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
  }
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--kb-primary);
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
}
</style>
