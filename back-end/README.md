# 考必过 - 后端 API

Node.js 18+ / Express / MySQL（Sequelize），RESTful API，JWT 鉴权。接口基址：`/api/v1`。

## 快速开始

1. 复制环境变量并修改：
   ```bash
   cp .env.example .env
   ```
2. 创建 MySQL 数据库（如 `kaobiguo`），并填写 `.env` 中的 `DB_*`、`JWT_SECRET`。
3. **QQ 邮箱发验证码**：在 `.env` 中配置 `MAIL_USER`（你的 QQ 邮箱）、`MAIL_PASS`（QQ 邮箱 SMTP 授权码）。在 QQ 邮箱网页版 → 设置 → 账户 → POP3/SMTP 服务 中开启并获取授权码。
4. 安装依赖并启动（首次启动会自动建表）：
   ```bash
   npm install
   npm run dev
   ```
5. 可选：执行种子脚本，插入示例词书与单词：
   ```bash
   npm run seed
   ```
6. **导入真实词书**：准备「每行一个单词」的词表文件（如 `word-lists/cet4.txt`），用 Free Dictionary API 拉取音标和释义后写入数据库：
   ```bash
   node src/scripts/import-word-list.js --book "四级词汇" --file word-lists/cet4.txt
   ```
   详见 `doc/词书数据获取与导入.md`。

## 接口一览

- **认证**：`POST /api/v1/auth/send-code`（发验证码）、`POST /api/v1/auth/register`（邮箱+验证码+密码注册）、`POST /api/v1/auth/login-by-code`（验证码登录）、`POST /api/v1/auth/login`（密码登录）、`GET /api/v1/auth/me`
- **学习**：`GET /api/v1/learn/today-new`、`GET /api/v1/learn/next`、`POST /api/v1/learn/learned`
- **复习**：`GET /api/v1/review/today`、`POST /api/v1/review/result`
- **统计**：`GET /api/v1/stats/today`、`GET /api/v1/stats/book-progress`
- **生词本**：`GET /api/v1/word-list`、`POST /api/v1/word-list`、`DELETE /api/v1/word-list/:wordId`
- **词书**：`GET /api/v1/word-books`、`GET /api/v1/word-books/current`、`PUT /api/v1/word-books/current`

需登录的接口请在请求头携带：`Authorization: Bearer <token>`。详见 `.cursor/docs/API接口文档.md`。

## 项目结构

```
src/
├── config/       # 配置、数据库连接
├── controllers/  # 请求处理
├── middlewares/  # 鉴权、错误处理
├── models/       # Sequelize 模型
├── routes/       # 路由
├── services/     # 业务逻辑
├── validation/   # Joi 校验
├── utils/        # 工具（如 JWT）
├── app.js        # Express 应用
└── server.js     # 启动与 DB 连接
```

## 技术栈

- Express、helmet、cors、compression、express-rate-limit
- Sequelize + mysql2
- JWT（jsonwebtoken）、bcryptjs
- Joi 校验、express-async-handler
