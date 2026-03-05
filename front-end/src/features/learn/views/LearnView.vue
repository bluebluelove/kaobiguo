<template>
  <div class="page-view">
    <div class="glass-card learn-card">
      <h2 class="glass-card-header">背单词</h2>
      <p class="card-desc">选择每天背几个单词，系统会按课划分；选择课程后可查看该课单词列表。</p>

      <!-- 未选词书 -->
      <template v-if="!hasBook">
        <p class="hint">请先在「选词书」页选择词书。</p>
        <router-link to="/word-books" class="cta-link">去选词书 →</router-link>
      </template>

      <template v-else>
        <!-- 每天背几个单词 -->
        <section class="section">
          <h3 class="section-title">每天背几个单词？</h3>
          <div class="words-per-day">
            <button
              v-for="n in [10, 20, 30, 50]"
              :key="n"
              type="button"
              class="wpd-btn"
              :class="{ 'wpd-btn--active': wordsPerDay === n }"
              @click="handleSetWordsPerDay(n)"
            >
              {{ n }} 词
            </button>
          </div>
        </section>

        <!-- 课程列表 -->
        <section class="section">
          <h3 class="section-title">选择课程</h3>
          <div v-if="lessonsLoading" class="loading-hint">加载中…</div>
          <div v-else-if="lessons.list.length === 0" class="hint">当前词书暂无单词，请等待后台配置。</div>
          <div v-else class="lesson-grid">
            <router-link
              v-for="item in lessons.list"
              :key="item.lessonIndex"
              :to="{ name: 'LessonWords', params: { lessonIndex: item.lessonIndex } }"
              class="lesson-card"
              :class="{ 'lesson-card--completed': item.completed }"
            >
              <span class="lesson-card-title">第{{ item.lessonIndex }}课</span>
              <span class="lesson-card-count">{{ item.wordCount }} 词</span>
            </router-link>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from 'vue';
import { useLearnStore } from '../store/learnStore';
import { useWordBookStore } from '@/features/word-book/store/wordBookStore';

const learnStore = useLearnStore();
const wordBookStore = useWordBookStore();

const hasBook = computed(() => !!wordBookStore.currentBookId);
const wordsPerDay = computed(() => learnStore.wordsPerDay);
const lessons = computed(() => learnStore.lessons);
const lessonsLoading = ref(false);

async function ensureBookThenLoad() {
  try {
    await wordBookStore.fetchCurrent();
    if (!wordBookStore.list.length) await wordBookStore.fetchList();
  } catch {
    // ignore
  }
  if (!hasBook.value) return;
  try {
    await learnStore.fetchLearnSettings();
    await loadLessons();
  } catch {
    // ignore
  }
}

onMounted(() => {
  ensureBookThenLoad();
});

// 从其他页（如选词书）回到学新词时，按当前词书重新拉取课程
onActivated(() => {
  ensureBookThenLoad();
});

watch(hasBook, (v) => {
  if (v) loadLessons();
});

// 切换词书后立即清空课程并重新拉取，避免仍显示旧词书
watch(() => wordBookStore.currentBookId, () => {
  if (!hasBook.value) return;
  learnStore.clearLessons();
  loadLessons();
});

async function handleSetWordsPerDay(n) {
  try {
    await learnStore.setWordsPerDay(n);
    await loadLessons();
  } catch (e) {
    console.error(e);
  }
}

async function loadLessons() {
  if (!hasBook.value) return;
  const bookId = wordBookStore.currentBookId;
  learnStore.clearLessons();
  lessonsLoading.value = true;
  try {
    await learnStore.fetchLessons(bookId);
  } finally {
    lessonsLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.learn-card {
  max-width: 640px;
}

.card-desc {
  color: var(--kb-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.hint {
  color: var(--kb-text-muted);
  margin-bottom: 1rem;
}

.cta-link {
  display: inline-block;
  font-weight: 600;
  color: var(--kb-primary);
  transition: color 0.2s;

  &:hover {
    color: var(--kb-primary-dark);
  }
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--kb-text);
  margin-bottom: 0.75rem;
}

.words-per-day {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wpd-btn {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--kb-text);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.25);
  }

  &--active {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.08));
    border-color: var(--kb-primary);
    color: var(--kb-primary);
  }
}

.loading-hint {
  color: var(--kb-text-muted);
  font-size: 0.9rem;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--kb-radius-sm);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;

  &:hover {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.06));
    border-color: rgba(37, 99, 235, 0.3);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  }

  &--completed {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.08));
    border-color: rgba(34, 197, 94, 0.4);
    color: #15803d;

    .lesson-card-title {
      color: #15803d;
    }

    .lesson-card-count {
      color: rgba(21, 128, 61, 0.85);
    }

    &:hover {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.12));
      border-color: rgba(34, 197, 94, 0.5);
    }
  }
}

.lesson-card-title {
  font-weight: 600;
  color: var(--kb-text);
}

.lesson-card-count {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
  margin-top: 0.25rem;
}
</style>
