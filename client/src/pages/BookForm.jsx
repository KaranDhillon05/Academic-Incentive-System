import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    type: '',
    publicationDate: null,
    totalAuthors: '',
    srmistAuthors: '',
    isbn: ''
  });
  const [proofFile, setProofFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);

  useEffect(() => {
    // Fetch book data if in edit mode
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          setFetchLoading(true);
          const res = await axios.get(`/api/books/${id}`);
          const book = res.data.data;
          
          setFormData({
            title: book.title,
            publisher: book.publisher,
            type: book.type,
            publicationDate: new Date(book.publicationDate),
            totalAuthors: book.totalAuthors,
            srmistAuthors: book.srmistAuthors,
            isbn: book.isbn
          });
        } catch (err) {
          console.error('Error fetching book:', err);
          setSubmitError('Failed to load book data. Please try again.');
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchBook();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear submit error when user types
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      publicationDate: date
    });
    
    // Clear field error when user selects a date
    if (formErrors.publicationDate) {
      setFormErrors({
        ...formErrors,
        publicationDate: ''
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setFormErrors({
          ...formErrors,
          proofFile: 'Only PDF files are allowed'
        });
        return;
      }
      
      // Check file size (4MB = 4 * 1024 * 1024 bytes)
      if (file.size > 4 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          proofFile: 'File size should not exceed 4MB'
        });
        return;
      }
      
      setProofFile(file);
      
      // Clear file error
      if (formErrors.proofFile) {
        setFormErrors({
          ...formErrors,
          proofFile: ''
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    
    if (!formData.publisher) {
      errors.publisher = 'Publisher is required';
    }
    
    if (!formData.type) {
      errors.type = 'Please select book type';
    }
    
    if (!formData.publicationDate) {
      errors.publicationDate = 'Publication date is required';
    }
    
    if (!formData.totalAuthors) {
      errors.totalAuthors = 'Total authors is required';
    } else if (isNaN(formData.totalAuthors) || parseInt(formData.totalAuthors) < 1) {
      errors.totalAuthors = 'Please enter a valid number';
    }
    
    if (formData.srmistAuthors && (isNaN(formData.srmistAuthors) || parseInt(formData.srmistAuthors) < 0)) {
      errors.srmistAuthors = 'Please enter a valid number';
    }
    
    if (!formData.isbn) {
      errors.isbn = 'ISBN is required';
    }
    
    if (!isEditMode && !proofFile) {
      errors.proofFile = 'Please upload proof of publication';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Create FormData object
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('publisher', formData.publisher);
        formDataObj.append('type', formData.type);
        formDataObj.append('publicationDate', format(formData.publicationDate, 'yyyy-MM-dd'));
        formDataObj.append('totalAuthors', formData.totalAuthors);
        formDataObj.append('srmistAuthors', formData.srmistAuthors || 0);
        formDataObj.append('isbn', formData.isbn);
        
        if (proofFile) {
          formDataObj.append('proofFile', proofFile);
        }
        
        let res;
        if (isEditMode) {
          res = await axios.put(`/api/books/${id}`, formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          res = await axios.post('/api/books', formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        // Navigate back to dashboard on success
        navigate('/');
      } catch (err) {
        console.error('Error submitting form:', err);
        setSubmitError(err.response?.data?.message || 'Failed to submit form. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Book Publication' : 'Add Book Publication'}
      </Typography>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Title of the Book"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="publisher"
                name="publisher"
                label="Book Chapter/Publisher"
                value={formData.publisher}
                onChange={handleChange}
                error={!!formErrors.publisher}
                helperText={formErrors.publisher}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel id="type-label">Book/Book Chapter</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  label="Book/Book Chapter"
                  onChange={handleChange}
                >
                  <MenuItem value="Book">Book</MenuItem>
                  <MenuItem value="Book Chapter">Book Chapter</MenuItem>
                </Select>
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Publication Date"
                value={formData.publicationDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.publicationDate,
                    helperText: formErrors.publicationDate
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="isbn"
                name="isbn"
                label="ISBN Number"
                value={formData.isbn}
                onChange={handleChange}
                error={!!formErrors.isbn}
                helperText={formErrors.isbn}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="totalAuthors"
                name="totalAuthors"
                label="Total Number of Authors including you (Only Faculty)"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={formData.totalAuthors}
                onChange={handleChange}
                error={!!formErrors.totalAuthors}
                helperText={formErrors.totalAuthors}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="srmistAuthors"
                name="srmistAuthors"
                label="Number of Authors from SRMIST other than you (Only Faculty)"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.srmistAuthors}
                onChange={handleChange}
                error={!!formErrors.srmistAuthors}
                helperText={formErrors.srmistAuthors}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                sx={{ mr: 2 }}
              >
                Upload Proof (PDF, max 4MB)
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {proofFile && (
                <Typography variant="body2" component="span">
                  {proofFile.name}
                </Typography>
              )}
              {formErrors.proofFile && (
                <FormHelperText error>{formErrors.proofFile}</FormHelperText>
              )}
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Submit')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default BookForm;
