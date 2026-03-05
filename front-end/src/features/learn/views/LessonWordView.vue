<template>
  <div class="page-view">
    <div class="glass-card lesson-words-card">
      <!-- 课程信息 -->
      <div class="lesson-header">
        <router-link to="/learn" class="back-link">← 返回课程</router-link>
        <h2 class="lesson-title">
          {{ currentBookName }} · 第{{ lessonIndex }}课
        </h2>
        <p class="lesson-meta">生词 1–{{ displayList.length }}/共{{ totalInLesson }}词</p>
      </div>

      <p class="hint-text">不勾选的单词将不加入学习和测试中</p>

      <!-- 单词列表 -->
      <div v-if="loading" class="loading-hint">加载中…</div>
      <div v-else-if="!list.length" class="empty-hint">该课暂无单词</div>
      <div v-else class="word-table-wrap">
        <table class="word-table">
          <thead>
            <tr>
              <th class="col-check">
                <input
                  :checked="selectAll"
                  type="checkbox"
                  class="check-all"
                  :indeterminate.prop="indeterminate"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="col-word">单词</th>
              <th class="col-phonetic">音标</th>
              <th class="col-def">释义</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in displayList" :key="w.id" class="word-row">
              <td class="col-check">
                <input
                  :checked="selectedIds.includes(w.id)"
                  type="checkbox"
                  class="check-one"
                  @change="toggleOne(w.id)"
                />
              </td>
              <td class="col-word">
                {{ w.word }}
                <span v-if="w.learned" class="badge-learned">已学</span>
              </td>
              <td class="col-phonetic">
                <span class="phonetic-inner">
                  <span>{{ w.phonetic || '—' }}</span>
                  <button
                    v-if="w.word"
                    type="button"
                    class="audio-btn"
                    aria-label="播放发音"
                    @click="playAudio(w)"
                  >
                    🔊
                  </button>
                </span>
              </td>
              <td class="col-def">{{ formatDefinitions(w.definitions) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页（每页 10 条） -->
      <div v-if="totalPages > 1" class="pagination">
        <button type="button" class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">上一页</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
      </div>

      <!-- 底部操作 -->
      <div class="bottom-actions">
        <router-link :to="cardLearnRoute" class="action-primary">卡片学习</router-link>
        <span class="action-placeholder">马上测试（敬请期待）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLearnStore } from '../store/learnStore';
import { useWordBookStore } from '@/features/word-book/store/wordBookStore';

const route = useRoute();
const learnStore = useLearnStore();
const wordBookStore = useWordBookStore();

const loading = ref(true);
const selectedIds = ref([]);
/** 避免「当前环境暂不支持语音合成」重复弹出（手机端点多个词会刷屏） */
const ttsUnsupportedShown = ref(false);
const selectAll = computed(
  () => displayList.value.length > 0 && displayList.value.every((w) => selectedIds.value.includes(w.id))
);
const currentPage = ref(1);
const pageSize = 10;

const lessonIndex = computed(() => Number(route.params.lessonIndex) || 1);
const list = computed(() => learnStore.lessonWords.list);
const totalInLesson = computed(() => learnStore.lessonWords.totalInLesson);
const currentBookName = computed(() => wordBookStore.currentBook?.name ?? wordBookStore.list.find((b) => b.id === wordBookStore.currentBookId)?.name ?? '当前词书');

const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / pageSize)));
const displayList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return list.value.slice(start, start + pageSize);
});

const indeterminate = computed(() => {
  const ids = displayList.value.map((w) => w.id);
  const n = ids.filter((id) => selectedIds.value.includes(id)).length;
  return n > 0 && n < ids.length;
});

const cardLearnRoute = computed(() => ({ name: 'CardStudy', params: { lessonIndex: lessonIndex.value } }));

function formatDefinitions(defs) {
  if (!defs || !Array.isArray(defs)) return '—';
  return defs.map((d) => (d.pos ? `${d.pos} ${d.meaning}` : d.meaning)).join('； ') || '—';
}

function toggleSelectAll() {
  const ids = displayList.value.map((w) => w.id);
  const allSelected = ids.every((id) => selectedIds.value.includes(id));
  if (allSelected) {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])];
  }
}

function toggleOne(id) {
  const i = selectedIds.value.indexOf(id);
  if (i === -1) selectedIds.value = [...selectedIds.value, id];
  else selectedIds.value = selectedIds.value.filter((x) => x !== id);
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

function playAudio(wordItem) {
  const word = typeof wordItem === 'string' ? wordItem : wordItem?.word;
  if (!word) return;
  const url = wordItem?.pronunciation_url;
  if (url && url.startsWith('http')) {
    const audio = new Audio(url);
    audio.addEventListener('error', () => onApiAudioFailed(word, true));
    audio.play().catch(() => onApiAudioFailed(word, true));
    return;
  }
  playAudioTTS(word, false);
}

/** 在线发音加载失败时的 fallback（先试 TTS，不支持则提示一次） */
function onApiAudioFailed(word, fromApi) {
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
  playAudioTTS(word, fromApi);
}

function playAudioTTS(text, fromApiFallback) {
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

function doLoadLessonWords() {
  const bookId = wordBookStore.currentBookId;
  return learnStore.fetchLessonWords(lessonIndex.value, bookId);
}

onMounted(async () => {
  if (!wordBookStore.currentBookId) await wordBookStore.fetchCurrent();
  loading.value = true;
  try {
    await doLoadLessonWords();
    selectedIds.value = list.value.map((w) => w.id);
    currentPage.value = 1;
  } catch {
    ElMessage.error('加载课程单词失败');
  } finally {
    loading.value = false;
  }
});

watch(lessonIndex, () => {
  loading.value = true;
  learnStore.clearLessonWords();
  doLoadLessonWords()
    .then(() => {
      selectedIds.value = list.value.map((w) => w.id);
      currentPage.value = 1;
    })
    .catch(() => ElMessage.error('加载课程单词失败'))
    .finally(() => { loading.value = false; });
});

// 切换词书后重新拉取当前课单词，避免仍显示上一本词书
watch(() => wordBookStore.currentBookId, () => {
  if (!wordBookStore.currentBookId) return;
  loading.value = true;
  learnStore.clearLessonWords();
  doLoadLessonWords()
    .then(() => {
      selectedIds.value = list.value.map((w) => w.id);
      currentPage.value = 1;
    })
    .catch(() => ElMessage.error('加载课程单词失败'))
    .finally(() => { loading.value = false; });
});
</script>

<style lang="scss" scoped>
.lesson-words-card {
  max-width: 900px;
}

.lesson-header {
  margin-bottom: 1rem;
}

.back-link {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--kb-primary);
  margin-bottom: 0.5rem;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--kb-primary-dark);
  }
}

.lesson-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--kb-text);
  margin: 0 0 0.25rem;
}

.lesson-meta {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
  margin: 0;
}

.hint-text {
  font-size: 0.875rem;
  color: var(--kb-text-muted);
  margin-bottom: 1rem;
}

.loading-hint,
.empty-hint {
  color: var(--kb-text-muted);
  padding: 2rem 0;
  text-align: center;
}

.word-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.word-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.75rem 0.75rem;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  th {
    font-weight: 600;
    color: var(--kb-text-muted);
    background: rgba(0, 0, 0, 0.02);
  }
}

.col-check {
  width: 2.5rem;
  vertical-align: middle;
}

.col-word {
  min-width: 100px;
  font-weight: 600;
  color: var(--kb-text);
}

.badge-learned {
  margin-left: 0.5rem;
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #15803d;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 4px;
}

.col-phonetic {
  min-width: 120px;
  color: var(--kb-text-muted);
}

.phonetic-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  vertical-align: middle;
}

.audio-btn {
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.col-def {
  color: var(--kb-text);
  line-height: 1.5;
}

.check-all,
.check-one {
  cursor: pointer;
  accent-color: var(--kb-primary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}

.page-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--kb-primary);
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
}

.bottom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.action-primary {
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, var(--kb-primary), var(--kb-gradient-end, #6366f1));
  border: none;
  border-radius: var(--kb-radius-sm);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  }
}

.action-placeholder {
  font-size: 0.9rem;
  color: var(--kb-text-muted);
  align-self: center;
}
</style>
