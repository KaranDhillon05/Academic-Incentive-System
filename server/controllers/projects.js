const { Project } = require('../utils/inMemoryDb');
const excelManager = require('../utils/excelManager');
const path = require('path');
const fs = require('fs');

// @desc    Create new project entry
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    // Add user info to request body
    req.body.userId = req.user.id;
    req.body.employeeId = req.user.employeeId;
    req.body.userName = req.user.name;
    req.body.department = req.user.department;

    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.sanctionOrder) {
        req.body.sanctionOrderFilePath = `/uploads/projects/${req.files.sanctionOrder[0].filename}`;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please upload sanction order'
        });
      }

      if (req.files.ddCopy && req.files.ddCopy[0]) {
        req.body.ddFilePath = `/uploads/projects/${req.files.ddCopy[0].filename}`;
      }
    } else if (req.file) {
      // For single file upload
      req.body.sanctionOrderFilePath = `/uploads/projects/${req.file.filename}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload sanction order'
      });
    }

    // Create project entry
    const project = await Project.create(req.body);

    // Add to Excel file
    const excelResult = await excelManager.addProjectEntry(project);
    if (!excelResult) {
      console.warn('Failed to add project entry to Excel file');
    } else {
      console.log('Project entry added to Excel file successfully');
    }

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);

    // If there was an error and files were uploaded, delete them
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    } else if (req.file) {
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

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query;

    // If user is admin, get all projects, otherwise only user's projects
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      // Convert userId to string for comparison if we're in in-memory mode
      query = Project.find({ userId: req.user.id.toString() });
    }

    // Sort by most recent first
    query = query.sort('-createdAt');

    const projects = await query;

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user owns the project or is admin
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user owns the project or is admin
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.sanctionOrder) {
        // Delete old file if it exists
        if (project.sanctionOrderFilePath) {
          const oldFilePath = path.join(__dirname, '..', project.sanctionOrderFilePath);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        req.body.sanctionOrderFilePath = `/uploads/projects/${req.files.sanctionOrder[0].filename}`;
      }

      if (req.files.ddCopy && req.files.ddCopy[0]) {
        // Delete old file if it exists
        if (project.ddFilePath) {
          const oldFilePath = path.join(__dirname, '..', project.ddFilePath);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        req.body.ddFilePath = `/uploads/projects/${req.files.ddCopy[0].filename}`;
      }
    } else if (req.file) {
      // For single file upload
      // Delete old file if it exists
      if (project.sanctionOrderFilePath) {
        const oldFilePath = path.join(__dirname, '..', project.sanctionOrderFilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      req.body.sanctionOrderFilePath = `/uploads/projects/${req.file.filename}`;
    }

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update Excel file (for simplicity, we'll just add a new entry)
    await excelManager.addProjectEntry(project);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);

    // If there was an error and files were uploaded, delete them
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    } else if (req.file) {
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

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user owns the project or is admin
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Delete files if they exist
    if (project.sanctionOrderFilePath) {
      const filePath = path.join(__dirname, '..', project.sanctionOrderFilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (project.ddFilePath) {
      const filePath = path.join(__dirname, '..', project.ddFilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await project.deleteOne();

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
