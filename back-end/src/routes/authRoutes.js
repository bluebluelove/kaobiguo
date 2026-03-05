const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, sendCode, loginByCode, register, me } = require('../controllers/authController');
const { validateLogin, validateRegister, validateSendCode, validateLoginByCode } = require('../validation/authValidation');
const { protect } = require('../middlewares/authMiddleware');

const sendCodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: { message: '发送验证码过于频繁，请 1 分钟后再试' },
});
router.post('/send-code', sendCodeLimiter, validateSendCode, sendCode);
router.post('/login', validateLogin, login);
router.post('/login-by-code', validateLoginByCode, loginByCode);
router.post('/register', validateRegister, register);
router.get('/me', protect, me);

module.exports = router;
