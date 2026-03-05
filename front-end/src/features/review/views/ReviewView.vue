<template>
  <div class="page-view">
    <div class="glass-card review-card">
      <h2 class="glass-card-header">复习</h2>
      <template v-if="list.length === 0">
        <p class="card-desc">今日暂无待复习单词，继续保持。</p>
      </template>
      <template v-else>
        <p class="review-count">今日待复习：<strong>{{ list.length }}</strong> 个</p>
        <div class="review-actions">
          <button type="button" class="btn-primary" @click="handleKnown">认识</button>
          <button type="button" class="btn-secondary" @click="handleUnknown">不认识</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReviewStore } from '../store/reviewStore';

const reviewStore = useReviewStore();
const list = ref([]);

onMounted(async () => {
  try {
    list.value = await reviewStore.fetchTodayList();
  } catch {
    list.value = [];
  }
});

function handleKnown() {
  // TODO: 提交认识，进入下一题
}
function handleUnknown() {
  // TODO: 提交不认识，进入下一题
}
</script>

<style lang="scss" scoped>
.review-card {
  max-width: 480px;
}

.card-desc {
  color: var(--kb-text-muted);
}

.review-count {
  margin-bottom: 1.25rem;
  color: var(--kb-text);

  strong {
    color: var(--kb-primary);
  }
}

.review-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
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

.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--kb-text);
  background: var(--kb-glass);
  border: 1px solid var(--kb-glass-border);
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.06);
    border-color: rgba(37, 99, 235, 0.2);
  }
}
</style>
