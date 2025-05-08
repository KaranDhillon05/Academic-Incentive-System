const mongoose = require('mongoose');

// In-memory projects database for testing
const projects = [];
let projectId = 1;

// Define schema for validation
const ProjectSchema = new mongoose.Schema({
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
    required: [true, 'Please provide the project title']
  },
  fundingAgency: {
    type: String,
    required: [true, 'Please provide the funding agency']
  },
  role: {
    type: String,
    enum: ['PI', 'Co-PI'],
    required: [true, 'Please specify your role (PI or Co-PI)']
  },
  principalInvestigator: {
    type: String,
    required: [true, 'Please provide the principal investigator name']
  },
  coPrincipalInvestigator: {
    type: String
  },
  numberOfCoPIs: {
    type: Number,
    default: 0
  },
  grantDate: {
    type: Date,
    required: [true, 'Please provide the grant date']
  },
  grantAmount: {
    type: Number,
    required: [true, 'Please provide the grant amount']
  },
  sanctionOrderFilePath: {
    type: String,
    required: [true, 'Please upload the sanction order']
  },
  amountReceived: {
    type: Number,
    default: 0
  },
  ddFilePath: {
    type: String
  },
  dateReceived: {
    type: Date
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
const ProjectModel = {
  create: async function(data) {
    const project = {
      _id: projectId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    projects.push(project);
    console.log('Project created:', project);
    return project;
  },

  find: function(query = {}) {
    // Simple query implementation
    let filteredProjects = [...projects];

    if (query.userId) {
      filteredProjects = filteredProjects.filter(p => p.userId == query.userId);
    }

    // Add sort method to the returned object
    return {
      sort: function(sortField) {
        // Simple sort implementation
        if (sortField === '-createdAt') {
          return filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return filteredProjects;
      }
    };
  },

  findById: async function(id) {
    return projects.find(p => p._id == id);
  },

  findByIdAndUpdate: async function(id, updateData, options) {
    const index = projects.findIndex(p => p._id == id);
    if (index === -1) return null;

    const updatedProject = {
      ...projects[index],
      ...updateData,
      updatedAt: new Date()
    };

    projects[index] = updatedProject;

    return updatedProject;
  }
};

// Export the appropriate model based on environment
module.exports = process.env.MONGO_URI ? mongoose.model('Project', ProjectSchema) : ProjectModel;
module.exports.projects = projects; // Export projects array for testing
