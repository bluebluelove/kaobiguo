import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/api/request';

export const useLearnStore = defineStore('learn', () => {
  const todayNewCount = ref(0);
  const currentWord = ref(null);
  const learnedIds = ref([]);
  const wordsPerDay = ref(20);
  const lessons = ref({ list: [], wordsPerLesson: 20, totalWords: 0 });
  const lessonWords = ref({ list: [], lessonIndex: 0, totalInLesson: 0 });

  async function fetchTodayNew() {
    const data = await request.get('/learn/today-new');
    todayNewCount.value = data.count ?? data ?? 0;
    return todayNewCount.value;
  }

  async function fetchLearnSettings() {
    const data = await request.get('/learn/settings');
    wordsPerDay.value = data.wordsPerDay ?? 20;
    return wordsPerDay.value;
  }

  async function setWordsPerDay(n) {
    const data = await request.put('/learn/settings', { wordsPerDay: n });
    wordsPerDay.value = data.wordsPerDay ?? n;
    return wordsPerDay.value;
  }

  function clearLessons() {
    lessons.value = { list: [], wordsPerLesson: wordsPerDay.value, totalWords: 0 };
    // 课程结构变化（词数/词书）时一并清空当前课单词缓存，避免课程页、卡片页仍显示旧课
    lessonWords.value = { list: [], lessonIndex: 0, totalInLesson: 0 };
  }

  async function fetchLessons(bookId) {
    const params = { _t: Date.now() };
    if (bookId != null && bookId !== '') params.bookId = bookId;
    const data = await request.get('/learn/lessons', { params });
    lessons.value = { list: data.list ?? [], wordsPerLesson: data.wordsPerLesson ?? 20, totalWords: data.totalWords ?? 0 };
    return lessons.value;
  }

  function clearLessonWords() {
    lessonWords.value = { list: [], lessonIndex: 0, totalInLesson: 0 };
  }

  async function fetchLessonWords(lessonIndex, bookId) {
    const params = { _t: Date.now() };
    if (bookId != null && bookId !== '') params.bookId = bookId;
    const data = await request.get(`/learn/lessons/${lessonIndex}/words`, { params });
    lessonWords.value = { list: data.list ?? [], lessonIndex: data.lessonIndex ?? lessonIndex, totalInLesson: data.totalInLesson ?? 0 };
    return lessonWords.value;
  }

  async function fetchNextWord() {
    const data = await request.get('/learn/next');
    currentWord.value = data;
    return data;
  }

  async function markLearned(wordId) {
    await request.post('/learn/learned', { wordId });
    learnedIds.value.push(wordId);
  }

  return {
    todayNewCount,
    currentWord,
    learnedIds,
    wordsPerDay,
    lessons,
    lessonWords,
    fetchTodayNew,
    fetchLearnSettings,
    setWordsPerDay,
    clearLessons,
    clearLessonWords,
    fetchLessons,
    fetchLessonWords,
    fetchNextWord,
    markLearned,
  };
});
