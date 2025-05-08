import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  FormHelperText,
  MenuItem,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const JournalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    paperTitle: '',
    journalName: '',
    issn: '',
    authorLevel: '',
    isCorrespondingAuthor: 'false',
    affiliation1stAuthor: 'SRM',
    affiliationCorrespondingAuthor: 'SRM',
    isSameAuthor: 'false',
    correspondingAuthorsCount: '',
    authorsCount: '',
    citationCount: '',
    isInterdisciplinary: 'false',
    interdisciplinaryType: '',
    indexed: '',
    publishedDate: null
  });
  const [proofFile, setProofFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);

  useEffect(() => {
    // Fetch journal data if in edit mode
    if (isEditMode) {
      const fetchJournal = async () => {
        try {
          setFetchLoading(true);
          const res = await axios.get(`/api/journals/${id}`);
          const journal = res.data.data;
          
          setFormData({
            paperTitle: journal.paperTitle,
            journalName: journal.journalName,
            issn: journal.issn,
            authorLevel: journal.authorLevel,
            isCorrespondingAuthor: journal.isCorrespondingAuthor.toString(),
            affiliation1stAuthor: journal.affiliation1stAuthor,
            affiliationCorrespondingAuthor: journal.affiliationCorrespondingAuthor,
            isSameAuthor: journal.isSameAuthor.toString(),
            correspondingAuthorsCount: journal.correspondingAuthorsCount || '',
            authorsCount: journal.authorsCount || '',
            citationCount: journal.citationCount || '',
            isInterdisciplinary: journal.isInterdisciplinary.toString(),
            interdisciplinaryType: journal.interdisciplinaryType || '',
            indexed: journal.indexed,
            publishedDate: journal.publishedDate ? new Date(journal.publishedDate) : null
          });
        } catch (err) {
          console.error('Error fetching journal:', err);
          setSubmitError('Failed to load journal data. Please try again.');
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchJournal();
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
      publishedDate: date
    });
    
    // Clear field error when user selects a date
    if (formErrors.publishedDate) {
      setFormErrors({
        ...formErrors,
        publishedDate: ''
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
    
    if (!formData.paperTitle) {
      errors.paperTitle = 'Paper title is required';
    }
    
    if (!formData.journalName) {
      errors.journalName = 'Journal name is required';
    }
    
    if (!formData.issn) {
      errors.issn = 'ISSN number is required';
    }
    
    if (!formData.authorLevel) {
      errors.authorLevel = 'Author level is required';
    }
    
    if (!formData.indexed) {
      errors.indexed = 'Indexed type is required';
    }
    
    if (!formData.publishedDate) {
      errors.publishedDate = 'Published date is required';
    }
    
    if (formData.correspondingAuthorsCount && (isNaN(formData.correspondingAuthorsCount) || parseInt(formData.correspondingAuthorsCount) < 0)) {
      errors.correspondingAuthorsCount = 'Please enter a valid number';
    }
    
    if (formData.authorsCount && (isNaN(formData.authorsCount) || parseInt(formData.authorsCount) < 0)) {
      errors.authorsCount = 'Please enter a valid number';
    }
    
    if (formData.citationCount && (isNaN(formData.citationCount) || parseInt(formData.citationCount) < 0)) {
      errors.citationCount = 'Please enter a valid number';
    }
    
    if (formData.isInterdisciplinary === 'true' && !formData.interdisciplinaryType) {
      errors.interdisciplinaryType = 'Please specify the interdisciplinary type';
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
        formDataObj.append('paperTitle', formData.paperTitle);
        formDataObj.append('journalName', formData.journalName);
        formDataObj.append('issn', formData.issn);
        formDataObj.append('authorLevel', formData.authorLevel);
        formDataObj.append('isCorrespondingAuthor', formData.isCorrespondingAuthor);
        formDataObj.append('affiliation1stAuthor', formData.affiliation1stAuthor);
        formDataObj.append('affiliationCorrespondingAuthor', formData.affiliationCorrespondingAuthor);
        formDataObj.append('isSameAuthor', formData.isSameAuthor);
        
        if (formData.correspondingAuthorsCount) {
          formDataObj.append('correspondingAuthorsCount', formData.correspondingAuthorsCount);
        }
        
        if (formData.authorsCount) {
          formDataObj.append('authorsCount', formData.authorsCount);
        }
        
        if (formData.citationCount) {
          formDataObj.append('citationCount', formData.citationCount);
        }
        
        formDataObj.append('isInterdisciplinary', formData.isInterdisciplinary);
        
        if (formData.interdisciplinaryType) {
          formDataObj.append('interdisciplinaryType', formData.interdisciplinaryType);
        }
        
        formDataObj.append('indexed', formData.indexed);
        formDataObj.append('publishedDate', format(formData.publishedDate, 'yyyy-MM-dd'));
        
        if (proofFile) {
          formDataObj.append('proofFile', proofFile);
        }
        
        let res;
        if (isEditMode) {
          res = await axios.put(`/api/journals/${id}`, formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          res = await axios.post('/api/journals', formDataObj, {
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
        {isEditMode ? 'Edit Journal Publication' : 'Add Journal Publication'}
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
              <Typography variant="h6" gutterBottom>
                Journal Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="paperTitle"
                name="paperTitle"
                label="Paper Title"
                value={formData.paperTitle}
                onChange={handleChange}
                error={!!formErrors.paperTitle}
                helperText={formErrors.paperTitle}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="journalName"
                name="journalName"
                label="Journal Name"
                value={formData.journalName}
                onChange={handleChange}
                error={!!formErrors.journalName}
                helperText={formErrors.journalName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="issn"
                name="issn"
                label="ISSN Number"
                value={formData.issn}
                onChange={handleChange}
                error={!!formErrors.issn}
                helperText={formErrors.issn}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.authorLevel}>
                <InputLabel id="authorLevel-label">Author Level</InputLabel>
                <Select
                  labelId="authorLevel-label"
                  id="authorLevel"
                  name="authorLevel"
                  value={formData.authorLevel}
                  label="Author Level"
                  onChange={handleChange}
                >
                  <MenuItem value="1st Author">1st Author</MenuItem>
                  <MenuItem value="2nd Author">2nd Author</MenuItem>
                  <MenuItem value="3rd Author">3rd Author</MenuItem>
                  <MenuItem value="4th Author">4th Author</MenuItem>
                  <MenuItem value="5th Author">5th Author</MenuItem>
                  <MenuItem value="6th Author and above">6th Author and above</MenuItem>
                </Select>
                {formErrors.authorLevel && <FormHelperText>{formErrors.authorLevel}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Are You Corresponding Author?
                </Typography>
                <RadioGroup
                  row
                  name="isCorrespondingAuthor"
                  value={formData.isCorrespondingAuthor}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Affiliation of 1st Author
                </Typography>
                <RadioGroup
                  row
                  name="affiliation1stAuthor"
                  value={formData.affiliation1stAuthor}
                  onChange={handleChange}
                >
                  <FormControlLabel value="SRM" control={<Radio />} label="SRM" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Affiliation of Corresponding Author
                </Typography>
                <RadioGroup
                  row
                  name="affiliationCorrespondingAuthor"
                  value={formData.affiliationCorrespondingAuthor}
                  onChange={handleChange}
                >
                  <FormControlLabel value="SRM" control={<Radio />} label="SRM" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Is 1st and Corresponding Author the Same?
                </Typography>
                <RadioGroup
                  row
                  name="isSameAuthor"
                  value={formData.isSameAuthor}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="correspondingAuthorsCount"
                name="correspondingAuthorsCount"
                label="Number of Corresponding Authors from SRMIST other than you"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.correspondingAuthorsCount}
                onChange={handleChange}
                error={!!formErrors.correspondingAuthorsCount}
                helperText={formErrors.correspondingAuthorsCount}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="authorsCount"
                name="authorsCount"
                label="Number of Authors from SRMIST other than you"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.authorsCount}
                onChange={handleChange}
                error={!!formErrors.authorsCount}
                helperText={formErrors.authorsCount}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="citationCount"
                name="citationCount"
                label="Number of Citation by SRM faculty excluding self-citation"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.citationCount}
                onChange={handleChange}
                error={!!formErrors.citationCount}
                helperText={formErrors.citationCount}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Is the paper an interdisciplinary publication?
                </Typography>
                <RadioGroup
                  row
                  name="isInterdisciplinary"
                  value={formData.isInterdisciplinary}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="interdisciplinaryType"
                name="interdisciplinaryType"
                label="Interdisciplinary Type"
                value={formData.interdisciplinaryType}
                onChange={handleChange}
                error={!!formErrors.interdisciplinaryType}
                helperText={formErrors.interdisciplinaryType}
                disabled={formData.isInterdisciplinary !== 'true'}
                required={formData.isInterdisciplinary === 'true'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.indexed}>
                <InputLabel id="indexed-label">Indexed</InputLabel>
                <Select
                  labelId="indexed-label"
                  id="indexed"
                  name="indexed"
                  value={formData.indexed}
                  label="Indexed"
                  onChange={handleChange}
                >
                  <MenuItem value="IF">IF</MenuItem>
                  <MenuItem value="SNIP">SNIP</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                </Select>
                {formErrors.indexed && <FormHelperText>{formErrors.indexed}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Published Date"
                value={formData.publishedDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.publishedDate,
                    helperText: formErrors.publishedDate
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                sx={{ mr: 2 }}
              >
                Upload Proof of Publication (PDF, max 4MB)
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

export default JournalForm;
