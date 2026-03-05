import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';

export const useReviewStore = defineStore('review', () => {
  const todayList = ref([]);
  const currentIndex = ref(0);

  async function fetchTodayList() {
    const data = await request.get('/review/today');
    todayList.value = data.list ?? data ?? [];
    currentIndex.value = 0;
    return todayList.value;
  }

  async function submitResult(wordId, known) {
    await request.post('/review/result', { wordId, known });
  }

  return {
    todayList,
    currentIndex,
    fetchTodayList,
    submitResult,
  };
});
