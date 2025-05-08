import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  FileDownload as FileDownloadIcon,
  Book as BookIcon,
  Assignment as ProjectIcon,
  MenuBook as JournalIcon
} from '@mui/icons-material';
import axios from 'axios';

const ExcelDownload = () => {
  const [loading, setLoading] = useState({
    books: false,
    projects: false,
    journals: false
  });
  const [error, setError] = useState('');

  const handleDownload = async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError('');
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Make a request to download the Excel file
      const response = await axios({
        url: `http://localhost:5001/api/excel/${type}`,
        method: 'GET',
        responseType: 'blob', // Important for file downloads
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.xlsx`);
      
      // Append the link to the body
      document.body.appendChild(link);
      
      // Click the link to trigger the download
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error downloading ${type} Excel file:`, err);
      setError(err.response?.data?.message || `Failed to download ${type} Excel file. You may not have admin privileges.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Download Excel Reports
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Download Excel files containing all the data submitted by users. Only administrators can download these files.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BookIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Books & Chapters
            </Typography>
            <Button
              variant="contained"
              startIcon={loading.books ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={() => handleDownload('books')}
              disabled={loading.books}
              fullWidth
            >
              {loading.books ? 'Downloading...' : 'Download Excel'}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ProjectIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Funded Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={loading.projects ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={() => handleDownload('projects')}
              disabled={loading.projects}
              fullWidth
            >
              {loading.projects ? 'Downloading...' : 'Download Excel'}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <JournalIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Journal Publications
            </Typography>
            <Button
              variant="contained"
              startIcon={loading.journals ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={() => handleDownload('journals')}
              disabled={loading.journals}
              fullWidth
            >
              {loading.journals ? 'Downloading...' : 'Download Excel'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExcelDownload;
