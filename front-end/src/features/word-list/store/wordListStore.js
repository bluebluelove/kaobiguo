import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';

export const useWordListStore = defineStore('wordList', () => {
  const list = ref([]);

  async function fetchList() {
    const data = await request.get('/word-list');
    list.value = data.list ?? data ?? [];
    return list.value;
  }

  async function add(wordId) {
    const id = wordId != null ? Number(wordId) : undefined;
    if (id == null || Number.isNaN(id)) {
      throw new Error('无效的单词 id');
    }
    const url = (request.defaults.baseURL || '') + '/word-list';
    if (import.meta.env.DEV) {
      console.log('[API] POST', url, { wordId: id });
    }
    await request.post('/word-list', { wordId: id });
    await fetchList();
  }

  async function remove(wordId) {
    await request.delete(`/word-list/${wordId}`);
    list.value = list.value.filter((item) => item.wordId !== wordId);
  }

  return {
    list,
    fetchList,
    add,
    remove,
  };
});
