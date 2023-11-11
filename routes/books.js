const express = require('express');
const router = express.Router();

const booksController = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');

router.get('', booksController.getBooks);
router.get('/bestrating', booksController.getThreeBooksBestrating);
router.get('/:id', booksController.getIdBook);
router.post('', auth, multer, sharp, booksController.postBook);
router.post('/:id/rating', auth, booksController.postBookRating);
router.put('/:id', auth, multer, sharp, booksController.putBook);
router.delete('/:id', auth, booksController.deleteBook);

module.exports = router;