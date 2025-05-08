const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create different folders for different form types
    const formType = req.baseUrl.split('/').pop(); // 'books', 'projects', 'journals'
    const uploadDir = path.join(__dirname, `../uploads/${formType}`);
    
    // Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with user ID, timestamp and original extension
    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}_${timestamp}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure upload with 4MB limit
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: fileFilter
});

module.exports = upload;
