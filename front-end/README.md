# 考必过 - 前端

基于 Vue 3 + Vite + Pinia + Vue Router + Element Plus 的响应式背单词前端，与需求文档中的 MVP 功能对应。

## 技术栈

- Vue 3（Composition API）
- Vite
- Vue Router 4（路由懒加载）
- Pinia
- Element Plus
- Axios
- Sass

## 目录结构（feature-based）

```
src/
  api/           # 请求封装
  components/    # 全局共享组件
  views/         # 布局与首页
  features/      # 按功能拆分
    auth/        # 用户：登录、注册、个人中心
    word-book/   # 词书与选词
    learn/       # 学新词
    review/      # 复习
    word-list/   # 生词本
    stats/       # 学习统计
  router/
  styles/
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务（默认 http://localhost:5173）
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 环境变量

复制 `.env.example` 为 `.env.development`（或 `.env.local`），按需修改：

- `VITE_API_BASE_URL`：后端 API 基础地址，开发阶段可用 Vite 代理（见 `vite.config.js` 的 `proxy`）。

## 规范

- 组件文件：PascalCase（如 `WordBooksView.vue`）
- 变量/函数：camelCase
- 模板中组件：kebab-case（如 `<word-books-view />`）
- 使用 ESLint + Prettier：`npm run lint`、`npm run format`

## 后端对接

当前接口为占位，需与 Express 后端联调。主要接口前缀：`/api/v1`，鉴权使用 Header `Authorization: Bearer <token>`。
