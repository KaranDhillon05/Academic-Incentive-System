const mongoose = require('mongoose');

// In-memory journals database for testing
const journals = [];
let journalId = 1;

// Define schema for validation
const JournalSchema = new mongoose.Schema({
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
  paperTitle: {
    type: String,
    required: [true, 'Please provide the paper title']
  },
  journalName: {
    type: String,
    required: [true, 'Please provide the journal name']
  },
  issn: {
    type: String,
    required: [true, 'Please provide the ISSN number']
  },
  authorLevel: {
    type: String,
    required: [true, 'Please specify your author level']
  },
  isCorrespondingAuthor: {
    type: Boolean,
    required: [true, 'Please specify if you are the corresponding author']
  },
  affiliation1stAuthor: {
    type: String,
    enum: ['SRM', 'Other'],
    required: [true, 'Please specify the affiliation of the 1st author']
  },
  affiliationCorrespondingAuthor: {
    type: String,
    enum: ['SRM', 'Other'],
    required: [true, 'Please specify the affiliation of the corresponding author']
  },
  isSameAuthor: {
    type: Boolean,
    required: [true, 'Please specify if 1st and corresponding author are the same']
  },
  correspondingAuthorsCount: {
    type: Number,
    default: 0
  },
  authorsCount: {
    type: Number,
    default: 0
  },
  citationCount: {
    type: Number,
    default: 0
  },
  isInterdisciplinary: {
    type: Boolean,
    default: false
  },
  interdisciplinaryType: {
    type: String
  },
  indexed: {
    type: String,
    enum: ['IF', 'SNIP', 'Both'],
    required: [true, 'Please specify the indexing type']
  },
  publishedDate: {
    type: Date,
    required: [true, 'Please provide the publication date']
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
const JournalModel = {
  create: async function(data) {
    const journal = {
      _id: journalId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    journals.push(journal);
    console.log('Journal created:', journal);
    return journal;
  },

  find: function(query = {}) {
    // Simple query implementation
    let filteredJournals = [...journals];

    if (query.userId) {
      filteredJournals = filteredJournals.filter(j => j.userId == query.userId);
    }

    // Add sort method to the returned object
    return {
      sort: function(sortField) {
        // Simple sort implementation
        if (sortField === '-createdAt') {
          return filteredJournals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return filteredJournals;
      }
    };
  },

  findById: async function(id) {
    return journals.find(j => j._id == id);
  },

  findByIdAndUpdate: async function(id, updateData, options) {
    const index = journals.findIndex(j => j._id == id);
    if (index === -1) return null;

    const updatedJournal = {
      ...journals[index],
      ...updateData,
      updatedAt: new Date()
    };

    journals[index] = updatedJournal;

    return updatedJournal;
  }
};

// Export the appropriate model based on environment
module.exports = process.env.MONGO_URI ? mongoose.model('Journal', JournalSchema) : JournalModel;
module.exports.journals = journals; // Export journals array for testing
