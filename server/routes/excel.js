const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Download Excel file
// @route   GET /api/excel/:type
// @access  Private (Admin only)
router.get('/:type', protect, authorize('admin'), (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    if (!['books', 'projects', 'journals'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file type'
      });
    }
    
    // Get file path
    const filePath = path.join(__dirname, `../excel_data/${type}.xlsx`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `Excel file for ${type} not found`
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}.xlsx`);
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
