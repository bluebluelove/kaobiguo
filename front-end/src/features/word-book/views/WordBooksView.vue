<template>
  <div class="page-view">
    <div class="glass-card word-books-card">
      <h2 class="glass-card-header">选词书</h2>
      <p class="card-desc">选择要学习的词书，学习进度将与该词书绑定。</p>
      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-row" />
      </div>
      <div v-else class="book-list">
        <button
          v-for="book in wordBookStore.list"
          :key="book.id"
          type="button"
          class="book-item"
          :class="{ 'book-item--active': selectedId === book.id }"
          @click="handleSelect(book.id)"
        >
          <span class="book-item-name">{{ book.name }}</span>
          <span class="book-item-count">约 {{ book.word_count ?? book.wordCount ?? 0 }} 词</span>
        </button>
        <p v-if="wordBookStore.list.length === 0" class="empty-hint">暂无词书，请等待后台配置。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWordBookStore } from '../store/wordBookStore';
import { ElMessage } from 'element-plus';

const wordBookStore = useWordBookStore();
const loading = ref(true);
const selectedId = ref(null);

onMounted(async () => {
  try {
    await wordBookStore.fetchList();
    await wordBookStore.fetchCurrent();
    selectedId.value = wordBookStore.currentBookId;
  } catch {
    ElMessage.error('加载词书列表失败');
  } finally {
    loading.value = false;
  }
});

async function handleSelect(bookId) {
  try {
    await wordBookStore.selectBook(bookId);
    selectedId.value = bookId;
    ElMessage.success('已切换词书');
  } catch (err) {
    if (err.response?.status === 401) {
      ElMessage.error('请先登录后再选词书');
    } else {
      ElMessage.error(err.response?.data?.message || '切换失败');
    }
  }
}
</script>

<style lang="scss" scoped>
.word-books-card {
  max-width: 560px;
}

.card-desc {
  color: var(--kb-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-row {
  height: 56px;
  border-radius: var(--kb-radius-sm);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 25%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.2s ease-in-out infinite;
}

@keyframes skeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.book-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(37, 99, 235, 0.06);
    border-color: rgba(37, 99, 235, 0.2);
  }

  &:focus-visible {
    outline: 2px solid var(--kb-primary);
    outline-offset: 2px;
  }
}

.book-item--active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.06));
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
}

.book-item-name {
  font-weight: 600;
  color: var(--kb-text);
}

.book-item-count {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
}

.empty-hint {
  color: var(--kb-text-muted);
  font-size: 0.95rem;
  padding: 1rem 0;
}
</style>
