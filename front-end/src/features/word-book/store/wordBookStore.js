import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/api/request';

export const useWordBookStore = defineStore('wordBook', () => {
  const list = ref([]);
  const currentBookId = ref(null);

  const currentBook = computed(() => list.value.find((b) => b.id === currentBookId.value) ?? null);

  async function fetchList() {
    const data = await request.get('/word-books');
    list.value = data.list ?? data ?? [];
    return list.value;
  }

  async function selectBook(bookId) {
    await request.put('/word-books/current', { bookId });
    currentBookId.value = bookId;
  }

  async function fetchCurrent() {
    const data = await request.get('/word-books/current', { params: { _t: Date.now() } });
    currentBookId.value = data?.id ?? data?.bookId ?? null;
    return currentBookId.value;
  }

  return {
    list,
    currentBookId,
    currentBook,
    fetchList,
    selectBook,
    fetchCurrent,
  };
});
