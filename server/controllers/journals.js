const { Journal } = require('../utils/inMemoryDb');
const excelManager = require('../utils/excelManager');
const path = require('path');
const fs = require('fs');

// @desc    Create new journal entry
// @route   POST /api/journals
// @access  Private
exports.createJournal = async (req, res) => {
  try {
    // Add user info to request body
    req.body.userId = req.user.id;
    req.body.employeeId = req.user.employeeId;
    req.body.userName = req.user.name;
    req.body.department = req.user.department;

    // Convert string boolean values to actual booleans
    if (req.body.isCorrespondingAuthor) {
      req.body.isCorrespondingAuthor = req.body.isCorrespondingAuthor === 'true';
    }
    if (req.body.isSameAuthor) {
      req.body.isSameAuthor = req.body.isSameAuthor === 'true';
    }
    if (req.body.isInterdisciplinary) {
      req.body.isInterdisciplinary = req.body.isInterdisciplinary === 'true';
    }

    // Add file path if file was uploaded
    if (req.file) {
      req.body.proofFilePath = `/uploads/journals/${req.file.filename}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload proof of publication'
      });
    }

    // Create journal entry
    const journal = await Journal.create(req.body);

    // Add to Excel file
    const excelResult = await excelManager.addJournalEntry(journal);
    if (!excelResult) {
      console.warn('Failed to add journal entry to Excel file');
    } else {
      console.log('Journal entry added to Excel file successfully');
    }

    res.status(201).json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error(error);

    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all journals for current user
// @route   GET /api/journals
// @access  Private
exports.getJournals = async (req, res) => {
  try {
    let query;

    // If user is admin, get all journals, otherwise only user's journals
    if (req.user.role === 'admin') {
      query = Journal.find();
    } else {
      // Convert userId to string for comparison if we're in in-memory mode
      query = Journal.find({ userId: req.user.id.toString() });
    }

    // Sort by most recent first
    query = query.sort('-createdAt');

    const journals = await query;

    res.status(200).json({
      success: true,
      count: journals.length,
      data: journals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single journal
// @route   GET /api/journals/:id
// @access  Private
exports.getJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    // Make sure user owns the journal or is admin
    if (journal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this journal'
      });
    }

    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update journal
// @route   PUT /api/journals/:id
// @access  Private
exports.updateJournal = async (req, res) => {
  try {
    let journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    // Make sure user owns the journal or is admin
    if (journal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this journal'
      });
    }

    // Convert string boolean values to actual booleans
    if (req.body.isCorrespondingAuthor) {
      req.body.isCorrespondingAuthor = req.body.isCorrespondingAuthor === 'true';
    }
    if (req.body.isSameAuthor) {
      req.body.isSameAuthor = req.body.isSameAuthor === 'true';
    }
    if (req.body.isInterdisciplinary) {
      req.body.isInterdisciplinary = req.body.isInterdisciplinary === 'true';
    }

    // Add file path if file was uploaded
    if (req.file) {
      // Delete old file if it exists
      if (journal.proofFilePath) {
        const oldFilePath = path.join(__dirname, '..', journal.proofFilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      req.body.proofFilePath = `/uploads/journals/${req.file.filename}`;
    }

    // Update journal
    journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update Excel file (for simplicity, we'll just add a new entry)
    await excelManager.addJournalEntry(journal);

    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error(error);

    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete journal
// @route   DELETE /api/journals/:id
// @access  Private
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    // Make sure user owns the journal or is admin
    if (journal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this journal'
      });
    }

    // Delete file if it exists
    if (journal.proofFilePath) {
      const filePath = path.join(__dirname, '..', journal.proofFilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await journal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
