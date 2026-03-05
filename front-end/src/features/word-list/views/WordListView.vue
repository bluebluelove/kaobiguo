<template>
  <div class="page-view">
    <div class="glass-card word-list-card">
      <h2 class="glass-card-header">生词本</h2>
      <template v-if="list.length === 0">
        <p class="empty-state">暂无生词，在学习或复习时可将单词加入生词本。</p>
      </template>
      <div v-else class="word-table-wrap">
        <table class="word-table">
          <thead>
            <tr>
              <th>单词</th>
              <th>音标</th>
              <th>释义</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.wordId ?? row.id">
              <td class="td-word">{{ row.word ?? '—' }}</td>
              <td class="td-phonetic">{{ row.phonetic ?? '—' }}</td>
              <td class="td-definitions">{{ formatDefinitions(row.definitions) }}</td>
              <td class="td-actions">
                <button
                  type="button"
                  class="link-danger"
                  @click="handleRemove(row.wordId ?? row.id)"
                >
                  移除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWordListStore } from '../store/wordListStore';
import { ElMessage } from 'element-plus';

const wordListStore = useWordListStore();
const list = ref([]);

onMounted(async () => {
  try {
    list.value = await wordListStore.fetchList();
  } catch {
    ElMessage.error('加载生词本失败');
  }
});

function formatDefinitions(defs) {
  if (!defs || !Array.isArray(defs)) return '—';
  return defs.map((d) => (d.pos ? `${d.pos} ${d.meaning}` : d.meaning)).join('； ') || '—';
}

async function handleRemove(wordId) {
  try {
    await wordListStore.remove(wordId);
    list.value = await wordListStore.fetchList();
    ElMessage.success('已移除');
  } catch {
    ElMessage.error('移除失败');
  }
}
</script>

<style lang="scss" scoped>
.word-list-card {
  overflow: hidden;
}

.empty-state {
  color: var(--kb-text-muted);
  padding: 2rem 0;
  text-align: center;
}

.word-table-wrap {
  overflow-x: auto;
  border-radius: var(--kb-radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.word-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.875rem 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  th {
    font-weight: 600;
    color: var(--kb-text-muted);
    background: rgba(0, 0, 0, 0.02);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(37, 99, 235, 0.03);
  }
}

.td-word {
  font-weight: 600;
  color: var(--kb-text-primary, #1f2937);
}

.td-phonetic {
  color: var(--kb-text-muted);
  font-size: 0.9em;
}

.td-definitions {
  max-width: 320px;
  word-break: break-word;
  color: var(--kb-text-secondary);
  font-size: 0.9rem;
}

.th-actions,
.td-actions {
  width: 100px;
  text-align: right;
}

.link-danger {
  font-size: 0.9rem;
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s;

  &:hover {
    color: #b91c1c;
    text-decoration: underline;
  }
}
</style>
