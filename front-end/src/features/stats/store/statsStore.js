import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';

export const useStatsStore = defineStore('stats', () => {
  const todayLearned = ref(0);
  const todayReviewed = ref(0);
  const bookProgress = ref({ learned: 0, total: 0 });

  async function fetchToday() {
    const data = await request.get('/stats/today');
    todayLearned.value = data.learned ?? 0;
    todayReviewed.value = data.reviewed ?? 0;
    return data;
  }

  async function fetchBookProgress() {
    const data = await request.get('/stats/book-progress');
    bookProgress.value = { learned: data.learned ?? 0, total: data.total ?? 0 };
    return bookProgress.value;
  }

  return {
    todayLearned,
    todayReviewed,
    bookProgress,
    fetchToday,
    fetchBookProgress,
  };
});
