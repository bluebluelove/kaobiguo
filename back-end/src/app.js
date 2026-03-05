const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const config = require('./config/config');

const authRoutes = require('./routes/authRoutes');
const learnRoutes = require('./routes/learnRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const statsRoutes = require('./routes/statsRoutes');
const wordListRoutes = require('./routes/wordListRoutes');
const wordBookRoutes = require('./routes/wordBookRoutes');

const app = express();

// 部署在 Nginx 反向代理后必须设置，否则 express-rate-limit 会因 X-Forwarded-For 报错并导致请求失败
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: '请求过于频繁，请 15 分钟后再试' },
  })
);

// 禁止缓存：与当前用户/词书强相关，避免切换词书后仍返回旧数据（尤其生产环境 Nginx/浏览器缓存）
app.use('/api/v1', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/learn', learnRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/word-list', wordListRoutes);
app.use('/api/v1/word-books', wordBookRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
