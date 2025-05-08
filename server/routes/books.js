const express = require('express');
const { createBook, getBooks, getBook, updateBook, deleteBook } = require('../controllers/books');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .post(protect, upload.single('proofFile'), createBook)
  .get(protect, getBooks);

router.route('/:id')
  .get(protect, getBook)
  .put(protect, upload.single('proofFile'), updateBook)
  .delete(protect, deleteBook);

module.exports = router;
