const router = require('express').Router();
const { getList, addWord, removeWord } = require('../controllers/wordListController');
const { protect } = require('../middlewares/authMiddleware');
const { validateAddWord } = require('../validation/wordListValidation');

router.get('/', protect, getList);
router.post('/', protect, validateAddWord, addWord);
router.delete('/:wordId', protect, removeWord);

module.exports = router;
