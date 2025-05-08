const express = require('express');
const { createJournal, getJournals, getJournal, updateJournal, deleteJournal } = require('../controllers/journals');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .post(protect, upload.single('proofFile'), createJournal)
  .get(protect, getJournals);

router.route('/:id')
  .get(protect, getJournal)
  .put(protect, upload.single('proofFile'), updateJournal)
  .delete(protect, deleteJournal);

module.exports = router;
