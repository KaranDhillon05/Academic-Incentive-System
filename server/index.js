const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Set global flag for in-memory mode
global.IN_MEMORY_MODE = true;

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const projectRoutes = require('./routes/projects');
const journalRoutes = require('./routes/journals');
const excelRoutes = require('./routes/excel');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const bookUploadsDir = path.join(uploadsDir, 'books');
const projectUploadsDir = path.join(uploadsDir, 'projects');
const journalUploadsDir = path.join(uploadsDir, 'journals');
const excelDir = path.join(__dirname, 'excel_data');

[uploadsDir, bookUploadsDir, projectUploadsDir, journalUploadsDir, excelDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/excel', excelRoutes);

// Log that we're using in-memory mode
console.log('Running in in-memory mode');

// Default route
app.get('/', (req, res) => {
  res.send('Academic Incentive System API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
