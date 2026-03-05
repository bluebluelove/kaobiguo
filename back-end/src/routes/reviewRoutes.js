const router = require('express').Router();
const { today, result } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { validateReviewResult } = require('../validation/reviewValidation');

router.get('/today', protect, today);
router.post('/result', protect, validateReviewResult, result);

module.exports = router;
