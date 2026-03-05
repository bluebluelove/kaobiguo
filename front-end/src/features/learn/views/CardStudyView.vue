<template>
  <div class="page-view card-study-page">
    <div class="glass-card card-study-card">
      <!-- 顶部：课程信息 + 进度 -->
      <div class="card-study-header">
        <h2 class="card-study-title">{{ currentBookName }} · 第{{ lessonIndex }}课</h2>
        <p class="card-study-progress">{{ progressLine }}</p>
      </div>

      <!-- 本课已全部学完（有词但都学过） -->
      <template v-if="totalInLesson > 0 && !list.length">
        <div class="empty-state">
          <p>本课已全部学完，无需再学。</p>
          <router-link :to="backRoute" class="back-btn">返回单词列表</router-link>
        </div>
      </template>
      <!-- 该课暂无单词 -->
      <template v-else-if="!fullLessonList.length">
        <div class="empty-state">
          <p>该课暂无单词，请先返回单词列表。</p>
          <router-link :to="backRoute" class="back-btn">返回单词列表</router-link>
        </div>
      </template>

      <template v-else>
        <!-- 左右翻页箭头 -->
        <button
          type="button"
          class="nav-arrow nav-arrow--left"
          aria-label="上一个"
          :disabled="currentIndex <= 0"
          @click="prev"
        >
          ‹
        </button>
        <button
          type="button"
          class="nav-arrow nav-arrow--right"
          aria-label="下一个"
          :disabled="currentIndex >= list.length - 1"
          @click="next"
        >
          ›
        </button>

        <!-- 中央单词卡片 -->
        <div class="word-card">
          <div class="word-card-main">
            <div class="word-row">
              <span class="word-text">{{ currentWord?.word }}</span>
              <span v-if="currentWord?.phonetic" class="word-phonetic">{{ currentWord.phonetic }}</span>
              <button
                v-if="currentWord?.word"
                type="button"
                class="audio-btn"
                aria-label="播放发音"
                @click="playWordAudio"
              >
                🔊
              </button>
              <button
                v-if="currentWord?.id"
                type="button"
                class="add-word-list-btn"
                :disabled="addingToWordList"
                @click="addCurrentToWordList"
              >
                {{ addingToWordList ? '加入中…' : '加入生词本' }}
              </button>
              <router-link to="/word-list" class="enter-word-list-link">进入生词本</router-link>
            </div>
            <div class="word-definition">
              <span class="def-label">释义：</span>
              <span class="def-content">{{ formatDefinitions(currentWord?.definitions) }}</span>
            </div>
            <!-- 构词、例句暂无，预留占位 -->
            <div v-if="false" class="word-etymology">
              <span class="def-label">构词：</span>
              <span class="def-content">（暂无）</span>
            </div>
            <div v-if="false" class="word-example">
              <span class="def-label">例句：</span>
              <span class="def-content">（暂无）</span>
            </div>
            <div class="word-practice">
              <p class="practice-hint">您还可以临摹下单词：</p>
              <div class="practice-input-wrap">
                <input
                  v-model="typedWord"
                  type="text"
                  class="practice-input"
                  :class="{ 'practice-input--correct': typedWord.trim() && isTypedCorrect, 'practice-input--wrong': typedWord.trim() && !isTypedCorrect }"
                  :placeholder="'输入 ' + (currentWord?.word ?? '')"
                  autocomplete="off"
                  @keydown="onInputKeydown"
                />
                <span v-if="typedWord.trim()" class="practice-feedback" :class="isTypedCorrect ? 'practice-feedback--correct' : 'practice-feedback--wrong'" aria-hidden="true">
                  {{ isTypedCorrect ? '✓' : '✗' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部：说明 + 按钮 -->
        <div class="card-study-footer">
          <p class="keyboard-hint">支持键盘「← → 回车」翻页，F9 单词发音</p>
          <div class="footer-actions">
            <router-link :to="backRoute" class="btn-secondary">返回单词列表</router-link>
            <button
              v-if="isLastWord"
              type="button"
              class="btn-complete"
              :disabled="completing"
              @click="completeLesson"
            >
              {{ completing ? '提交中…' : '完成' }}
            </button>
            <span class="btn-placeholder">马上测试（敬请期待）</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLearnStore } from '../store/learnStore';
import { useWordBookStore } from '@/features/word-book/store/wordBookStore';
import { useWordListStore } from '@/features/word-list/store/wordListStore';
import { useStatsStore } from '@/features/stats/store/statsStore';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const wordBookStore = useWordBookStore();
const wordListStore = useWordListStore();
const statsStore = useStatsStore();

const currentIndex = ref(0);
const typedWord = ref('');

const lessonIndex = computed(() => Number(route.params.lessonIndex) || 1);
/** 本课全部单词（含已学） */
const fullLessonList = computed(() => learnStore.lessonWords.list);
/** 本课总词数（按当前每课词数） */
const totalInLesson = computed(() => learnStore.lessonWords.totalInLesson ?? 0);
/** 只含本课未学单词，用于卡片学习与「完成」统计 */
const list = computed(() => fullLessonList.value.filter((w) => !w.learned));
const totalWords = computed(() => list.value.length);
/** 进度文案：待学数/本课总词数，若有已学则提示 */
const progressLine = computed(() => {
  const total = totalInLesson.value;
  const unlearned = list.value.length;
  if (total <= 0) return `${currentPosition.value} / ${unlearned}`;
  const learned = total - unlearned;
  if (learned > 0) {
    return `${currentPosition.value} / ${unlearned}（本课共 ${total} 词，已学 ${learned} 词）`;
  }
  return `${currentPosition.value} / ${unlearned}`;
});
const currentBookName = computed(
  () =>
    wordBookStore.currentBook?.name ??
    wordBookStore.list.find((b) => b.id === wordBookStore.currentBookId)?.name ??
    '当前词书'
);

const currentWord = computed(() => list.value[currentIndex.value] ?? null);
const currentPosition = computed(() => currentIndex.value + 1);
/** 临摹输入是否与当前单词一致（忽略首尾空格、大小写） */
const isTypedCorrect = computed(() => {
  const typed = typedWord.value.trim().toLowerCase();
  const target = currentWord.value?.word?.trim().toLowerCase() ?? '';
  if (!typed || !target) return false;
  return typed === target;
});
const backRoute = computed(() => ({ name: 'LessonWords', params: { lessonIndex: lessonIndex.value } }));

/** 是否在最后一词（显示「完成」按钮） */
const isLastWord = computed(() => list.value.length > 0 && currentIndex.value === list.value.length - 1);

const addingToWordList = ref(false);
const completing = ref(false);

function formatDefinitions(defs) {
  if (!defs || !Array.isArray(defs)) return '—';
  return defs.map((d) => (d.pos ? `${d.pos} ${d.meaning}` : d.meaning)).join('； ') || '—';
}

async function addCurrentToWordList() {
  const word = currentWord.value;
  const id = word?.id;
  if (import.meta.env.DEV) {
    console.log('[加入生词本] currentWord=', word, 'id=', id, 'baseURL=', import.meta.env.VITE_API_BASE_URL);
  }
  if (id == null || (typeof id === 'number' && Number.isNaN(id))) {
    ElMessage.warning('当前单词数据异常，请刷新后重试');
    return;
  }
  addingToWordList.value = true;
  try {
    await wordListStore.add(id);
    ElMessage.success('已加入生词本');
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('[加入生词本 失败]', e?.code, e?.message, e?.response?.status, e?.response?.data);
    }
    const status = e.response?.status;
    const msg = e.response?.data?.message ?? '';
    if (msg.includes('已在生词本') || status === 400) {
      ElMessage.info(msg || '该词已在生词本中');
    } else if (status === 401) {
      ElMessage.error('请先登录后再操作');
    } else if (!e.response) {
      ElMessage.error('请求失败，请确认后端已启动（端口 5000）；F12 Console 有详细错误');
    } else {
      ElMessage.error(msg || '加入失败，请稍后重试');
    }
  } finally {
    addingToWordList.value = false;
  }
}

/** 完成本课：将本课所有单词记为已学，并刷新学习统计 */
async function completeLesson() {
  if (completing.value || !list.value.length) return;
  completing.value = true;
  try {
    for (const w of list.value) {
      if (w?.id) {
        try {
          await learnStore.markLearned(w.id);
        } catch {
          // 已学过等错误静默跳过
        }
      }
    }
    await statsStore.fetchToday();
    await statsStore.fetchBookProgress();
    await learnStore.fetchLessons();
    ElMessage.success('本课已完成，已计入学习统计');
    router.push({ name: 'Learn' });
  } catch (e) {
    ElMessage.error(e?.response?.data?.message ?? '提交失败，请稍后重试');
  } finally {
    completing.value = false;
  }
}

/** 等待语音列表加载完成（移动端常延迟，未就绪时 speak 会静默失败） */
function getVoicesAsync() {
  if (!window.speechSynthesis) return Promise.resolve([]);
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) return Promise.resolve(list);
  return new Promise((resolve) => {
    const onVoices = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = onVoices;
    window.speechSynthesis.getVoices();
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

const ttsUnsupportedShown = ref(false);

function playWordAudio() {
  const word = currentWord.value;
  if (!word?.word) return;

  const url = word.pronunciation_url;
  if (url && url.startsWith('http')) {
    const audio = new Audio(url);
    audio.addEventListener('error', () => onApiAudioFailed(word.word));
    audio.play().catch(() => onApiAudioFailed(word.word));
    return;
  }

  tryTTS(word.word);
}

function onApiAudioFailed(text) {
  if (!window.speechSynthesis) {
    if (!ttsUnsupportedShown.value) {
      ttsUnsupportedShown.value = true;
      ElMessage.warning({
        message: '在线发音加载失败，且当前环境不支持语音朗读。请检查网络或使用电脑/Chrome 等浏览器。',
        duration: 5000,
      });
    }
    return;
  }
  tryTTS(text);
}

function tryTTS(text) {
  if (!text) return;
  if (!window.speechSynthesis) {
    if (!ttsUnsupportedShown.value) {
      ttsUnsupportedShown.value = true;
      ElMessage.warning({
        message: '当前环境暂不支持语音合成。建议使用电脑端或 Chrome 等浏览器。',
        duration: 5000,
      });
    }
    return;
  }
  window.speechSynthesis.cancel();
  getVoicesAsync().then((voices) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) u.voice = enVoice;
    u.onerror = () => {
      ElMessage.warning({
        message: '发音失败。请尝试：① 刷新页面后再点发音 ② 右键点击标签页看是否「取消静音此网站」③ 确认系统未静音 ④ Chrome：设置→语言，添加英语并下载语音',
        duration: 7000,
      });
    };
    window.speechSynthesis.speak(u);
  });
}

function ensureVoices() {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    typedWord.value = '';
  }
}

function next() {
  if (currentIndex.value < list.value.length - 1) {
    currentIndex.value++;
    typedWord.value = '';
  }
}

function onInputKeydown(e) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    next();
  }
}

function onKeydown(e) {
  if (e.key === 'F9') {
    e.preventDefault();
    playWordAudio();
  }
}

onMounted(async () => {
  if (!wordBookStore.currentBookId) await wordBookStore.fetchCurrent();
  const needFetch =
    learnStore.lessonWords.lessonIndex !== lessonIndex.value || learnStore.lessonWords.list.length === 0;
  if (needFetch) {
    await learnStore.fetchLessonWords(lessonIndex.value, wordBookStore.currentBookId);
  }
  currentIndex.value = 0;
  typedWord.value = '';
  ensureVoices();
  window.addEventListener('keydown', onKeydown);
});

watch(
  () => route.params.lessonIndex,
  async (newIdx) => {
    const idx = Number(newIdx) || 1;
    await learnStore.fetchLessonWords(idx, wordBookStore.currentBookId);
    currentIndex.value = 0;
    typedWord.value = '';
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="scss" scoped>
.card-study-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem 0 2rem;
}

.card-study-card {
  position: relative;
  max-width: 560px;
  width: 100%;
  min-height: 420px;
}

.card-study-header {
  margin-bottom: 1.25rem;
}

.card-study-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--kb-text);
  margin: 0 0 0.25rem;
}

.card-study-progress {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--kb-text-muted);

  p {
    margin-bottom: 1rem;
  }
}

.back-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  color: var(--kb-primary);
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: var(--kb-radius-sm);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.12);
    border-color: var(--kb-primary);
  }
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  font-size: 2rem;
  line-height: 1;
  color: var(--kb-text-muted);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    color: var(--kb-primary);
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.25);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &--left {
    left: -24px;
  }

  &--right {
    right: -24px;
  }
}

.word-card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--kb-radius-sm);
  padding: 1.75rem 1.5rem;
  margin: 0 2rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.word-card-main {
  min-height: 200px;
}

.word-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.word-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--kb-primary);
}

.word-phonetic {
  font-size: 1rem;
  color: var(--kb-text-muted);
}

.audio-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.add-word-list-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--kb-primary);
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.12);
    border-color: var(--kb-primary);
  }
}

.enter-word-list-link {
  font-size: 0.85rem;
  color: var(--kb-text-muted);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--kb-primary);
  }
}

.word-definition,
.word-etymology,
.word-example {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.def-label {
  color: var(--kb-text-muted);
  margin-right: 0.25rem;
}

.def-content {
  color: var(--kb-text);
}

.word-practice {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.practice-hint {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
  margin: 0 0 0.5rem;
}

.practice-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.practice-input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--kb-primary);
  }

  &--correct {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.04);
  }

  &--wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.04);
  }
}

.practice-feedback {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;

  &--correct {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.15);
  }

  &--wrong {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
  }
}

.card-study-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.keyboard-hint {
  font-size: 0.8rem;
  color: var(--kb-text-muted);
  margin: 0 0 1rem;
}

.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.btn-secondary {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--kb-text);
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: var(--kb-radius-sm);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: var(--kb-primary);
    color: var(--kb-primary);
  }
}

.btn-complete {
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, var(--kb-primary), var(--kb-gradient-end, #6366f1));
  border: none;
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-placeholder {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
}
</style>
