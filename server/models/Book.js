const mongoose = require('mongoose');

// In-memory books database for testing
const books = [];
let bookId = 1;

// Define schema for validation
const BookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide the title of the book']
  },
  publisher: {
    type: String,
    required: [true, 'Please provide the publisher']
  },
  type: {
    type: String,
    enum: ['Book', 'Book Chapter'],
    required: [true, 'Please specify if this is a book or book chapter']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Please provide the publication date']
  },
  totalAuthors: {
    type: Number,
    required: [true, 'Please provide the total number of authors'],
    min: 1
  },
  srmistAuthors: {
    type: Number,
    default: 0
  },
  isbn: {
    type: String,
    required: [true, 'Please provide the ISBN number']
  },
  proofFilePath: {
    type: String,
    required: [true, 'Please upload proof of publication']
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a mock model for in-memory mode
const BookModel = {
  create: async function(data) {
    const book = {
      _id: bookId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    books.push(book);
    console.log('Book created:', book);
    return book;
  },

  find: function(query = {}) {
    // Simple query implementation
    let filteredBooks = [...books];

    if (query.userId) {
      filteredBooks = filteredBooks.filter(b => b.userId == query.userId);
    }

    // Add sort method to the returned object
    return {
      sort: function(sortField) {
        // Simple sort implementation
        if (sortField === '-createdAt') {
          return filteredBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return filteredBooks;
      }
    };
  },

  findById: async function(id) {
    return books.find(b => b._id == id);
  },

  findByIdAndUpdate: async function(id, updateData, options) {
    const index = books.findIndex(b => b._id == id);
    if (index === -1) return null;

    const updatedBook = {
      ...books[index],
      ...updateData,
      updatedAt: new Date()
    };

    books[index] = updatedBook;

    return updatedBook;
  }
};

// Export the appropriate model based on environment
module.exports = process.env.MONGO_URI ? mongoose.model('Book', BookSchema) : BookModel;
module.exports.books = books; // Export books array for testing
