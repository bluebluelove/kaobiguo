const router = require('express').Router();
const { todayNew, next, learned, settings, setSettings, lessons, lessonWords } = require('../controllers/learnController');
const { protect } = require('../middlewares/authMiddleware');
const { validateLearned, validateSetSettings } = require('../validation/learnValidation');

router.get('/today-new', protect, todayNew);
router.get('/next', protect, next);
router.post('/learned', protect, validateLearned, learned);
router.get('/settings', protect, settings);
router.put('/settings', protect, validateSetSettings, setSettings);
router.get('/lessons', protect, lessons);
router.get('/lessons/:lessonIndex/words', protect, lessonWords);

module.exports = router;
