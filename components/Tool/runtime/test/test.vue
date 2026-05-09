<template>
  <section class="test-tool">
    <div class="panel-head">
      <div>
        <p class="kicker">Route Tool</p>
        <h1>测试工具</h1>
      </div>
      <span class="status-badge">站内组件</span>
    </div>

    <div class="input-area">
      <label class="field-label" for="test-text">输入内容</label>
      <textarea
        id="test-text"
        v-model="inputText"
        class="text-input"
        placeholder="在这里输入任意内容，用于测试工具展开后的组件加载效果。"
      />
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <span>字符数</span>
        <strong>{{ charCount }}</strong>
      </div>
      <div class="stat-item">
        <span>行数</span>
        <strong>{{ lineCount }}</strong>
      </div>
      <div class="stat-item">
        <span>组件路径</span>
        <strong>/test/test</strong>
      </div>
    </div>

    <div class="action-row">
      <button class="primary-btn" type="button" @click="fillDemo">填充示例</button>
      <button class="ghost-btn" type="button" @click="clearText">清空</button>
    </div>
  </section>
</template>

<script setup>
const inputText = ref('');

const charCount = computed(() => inputText.value.length);
const lineCount = computed(() => inputText.value ? inputText.value.split('\n').length : 0);

const fillDemo = () => {
  inputText.value = '这是 /test/test 对应的测试工具组件。\n它会被工具列表展开区域直接渲染，不再 iframe 整个页面。';
};

const clearText = () => {
  inputText.value = '';
};
</script>

<style scoped>
.test-tool {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.kicker {
  color: #26a67a;
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}
h1 {
  color: #1f2937;
  font-size: 24px;
  margin: 0;
}
.status-badge {
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
}
.input-area {
  margin-bottom: 18px;
}
.field-label {
  color: #374151;
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}
.text-input {
  width: 100%;
  min-height: 180px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.7;
  outline: none;
  padding: 12px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.text-input:focus {
  border-color: #26a67a;
  box-shadow: 0 0 0 3px rgba(38, 166, 122, 0.14);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.stat-item {
  background: #f9fafb;
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 12px;
}
.stat-item span {
  color: #6b7280;
  display: block;
  font-size: 12px;
  margin-bottom: 6px;
}
.stat-item strong {
  color: #111827;
  font-size: 16px;
}
.action-row {
  display: flex;
  gap: 10px;
}
.primary-btn,
.ghost-btn {
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  height: 36px;
  padding: 0 16px;
}
.primary-btn {
  background: #26a67a;
  border: 1px solid #26a67a;
  color: #fff;
}
.ghost-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}
@media (max-width: 720px) {
  .panel-head,
  .action-row {
    flex-direction: column;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
