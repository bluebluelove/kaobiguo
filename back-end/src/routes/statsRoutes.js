const router = require('express').Router();
const { today, bookProgress } = require('../controllers/statsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/today', protect, today);
router.get('/book-progress', protect, bookProgress);

module.exports = router;
