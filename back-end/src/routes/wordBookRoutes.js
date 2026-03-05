const router = require('express').Router();
const { list, current, setCurrent } = require('../controllers/wordBookController');
const { protect } = require('../middlewares/authMiddleware');
const { validateSetCurrentBook } = require('../validation/wordBookValidation');

router.get('/', list);
router.get('/current', protect, current);
router.put('/current', protect, validateSetCurrentBook, setCurrent);

module.exports = router;
