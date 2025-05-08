const { Book } = require('../utils/inMemoryDb');
const excelManager = require('../utils/excelManager');
const path = require('path');
const fs = require('fs');

// @desc    Create new book entry
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    // Add user info to request body
    req.body.userId = req.user.id;
    req.body.employeeId = req.user.employeeId;
    req.body.userName = req.user.name;
    req.body.department = req.user.department;

    // Add file path if file was uploaded
    if (req.file) {
      req.body.proofFilePath = `/uploads/books/${req.file.filename}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload proof of publication'
      });
    }

    // Create book entry
    const book = await Book.create(req.body);

    // Add to Excel file
    const excelResult = await excelManager.addBookEntry(book);
    if (!excelResult) {
      console.warn('Failed to add book entry to Excel file');
    } else {
      console.log('Book entry added to Excel file successfully');
    }

    res.status(201).json({
      success: true,
      data: book
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

// @desc    Get all books for current user
// @route   GET /api/books
// @access  Private
exports.getBooks = async (req, res) => {
  try {
    let query;

    // If user is admin, get all books, otherwise only user's books
    if (req.user.role === 'admin') {
      query = Book.find();
    } else {
      // Convert userId to string for comparison if we're in in-memory mode
      query = Book.find({ userId: req.user.id.toString() });
    }

    // Sort by most recent first
    query = query.sort('-createdAt');

    const books = await query;

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Make sure user owns the book or is admin
    if (book.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this book'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Make sure user owns the book or is admin
    if (book.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }

    // Add file path if file was uploaded
    if (req.file) {
      // Delete old file if it exists
      if (book.proofFilePath) {
        const oldFilePath = path.join(__dirname, '..', book.proofFilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      req.body.proofFilePath = `/uploads/books/${req.file.filename}`;
    }

    // Update book
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update Excel file (for simplicity, we'll just add a new entry)
    await excelManager.addBookEntry(book);

    res.status(200).json({
      success: true,
      data: book
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

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Make sure user owns the book or is admin
    if (book.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this book'
      });
    }

    // Delete file if it exists
    if (book.proofFilePath) {
      const filePath = path.join(__dirname, '..', book.proofFilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await book.deleteOne();

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
