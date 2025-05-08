const express = require('express');
const { createProject, getProjects, getProject, updateProject, deleteProject } = require('../controllers/projects');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: 'sanctionOrder', maxCount: 1 },
  { name: 'ddCopy', maxCount: 1 }
]);

router.route('/')
  .post(protect, uploadFields, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, uploadFields, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
