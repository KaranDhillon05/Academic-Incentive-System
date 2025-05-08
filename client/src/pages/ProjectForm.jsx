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
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    fundingAgency: '',
    role: 'PI',
    principalInvestigator: '',
    coPrincipalInvestigator: '',
    numberOfCoPIs: '',
    grantDate: null,
    grantAmount: '',
    amountReceived: '',
    dateReceived: null
  });
  const [sanctionOrderFile, setSanctionOrderFile] = useState(null);
  const [ddFile, setDdFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);

  useEffect(() => {
    // Fetch project data if in edit mode
    if (isEditMode) {
      const fetchProject = async () => {
        try {
          setFetchLoading(true);
          const res = await axios.get(`/api/projects/${id}`);
          const project = res.data.data;
          
          setFormData({
            title: project.title,
            fundingAgency: project.fundingAgency,
            role: project.role,
            principalInvestigator: project.principalInvestigator,
            coPrincipalInvestigator: project.coPrincipalInvestigator || '',
            numberOfCoPIs: project.numberOfCoPIs || '',
            grantDate: project.grantDate ? new Date(project.grantDate) : null,
            grantAmount: project.grantAmount,
            amountReceived: project.amountReceived || '',
            dateReceived: project.dateReceived ? new Date(project.dateReceived) : null
          });
        } catch (err) {
          console.error('Error fetching project:', err);
          setSubmitError('Failed to load project data. Please try again.');
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchProject();
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

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
    
    // Clear field error when user selects a date
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setFormErrors({
          ...formErrors,
          [fileType]: 'Only PDF files are allowed'
        });
        return;
      }
      
      // Check file size (4MB = 4 * 1024 * 1024 bytes)
      if (file.size > 4 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          [fileType]: 'File size should not exceed 4MB'
        });
        return;
      }
      
      if (fileType === 'sanctionOrderFile') {
        setSanctionOrderFile(file);
      } else if (fileType === 'ddFile') {
        setDdFile(file);
      }
      
      // Clear file error
      if (formErrors[fileType]) {
        setFormErrors({
          ...formErrors,
          [fileType]: ''
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) {
      errors.title = 'Project title is required';
    }
    
    if (!formData.fundingAgency) {
      errors.fundingAgency = 'Funding agency is required';
    }
    
    if (!formData.principalInvestigator) {
      errors.principalInvestigator = 'Principal investigator is required';
    }
    
    if (formData.role === 'Co-PI' && !formData.coPrincipalInvestigator) {
      errors.coPrincipalInvestigator = 'Co-principal investigator is required';
    }
    
    if (formData.numberOfCoPIs && (isNaN(formData.numberOfCoPIs) || parseInt(formData.numberOfCoPIs) < 0)) {
      errors.numberOfCoPIs = 'Please enter a valid number';
    }
    
    if (!formData.grantDate) {
      errors.grantDate = 'Grant date is required';
    }
    
    if (!formData.grantAmount) {
      errors.grantAmount = 'Grant amount is required';
    } else if (isNaN(formData.grantAmount) || parseFloat(formData.grantAmount) <= 0) {
      errors.grantAmount = 'Please enter a valid amount';
    }
    
    if (formData.amountReceived && (isNaN(formData.amountReceived) || parseFloat(formData.amountReceived) < 0)) {
      errors.amountReceived = 'Please enter a valid amount';
    }
    
    if (formData.amountReceived && !formData.dateReceived) {
      errors.dateReceived = 'Date received is required if amount received is specified';
    }
    
    if (!isEditMode && !sanctionOrderFile) {
      errors.sanctionOrderFile = 'Please upload sanction order';
    }
    
    if (formData.amountReceived && !isEditMode && !ddFile) {
      errors.ddFile = 'Please upload DD copy if amount received is specified';
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
        formDataObj.append('fundingAgency', formData.fundingAgency);
        formDataObj.append('role', formData.role);
        formDataObj.append('principalInvestigator', formData.principalInvestigator);
        
        if (formData.coPrincipalInvestigator) {
          formDataObj.append('coPrincipalInvestigator', formData.coPrincipalInvestigator);
        }
        
        if (formData.numberOfCoPIs) {
          formDataObj.append('numberOfCoPIs', formData.numberOfCoPIs);
        }
        
        formDataObj.append('grantDate', format(formData.grantDate, 'yyyy-MM-dd'));
        formDataObj.append('grantAmount', formData.grantAmount);
        
        if (formData.amountReceived) {
          formDataObj.append('amountReceived', formData.amountReceived);
        }
        
        if (formData.dateReceived) {
          formDataObj.append('dateReceived', format(formData.dateReceived, 'yyyy-MM-dd'));
        }
        
        if (sanctionOrderFile) {
          formDataObj.append('sanctionOrder', sanctionOrderFile);
        }
        
        if (ddFile) {
          formDataObj.append('ddCopy', ddFile);
        }
        
        let res;
        if (isEditMode) {
          res = await axios.put(`/api/projects/${id}`, formDataObj, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          res = await axios.post('/api/projects', formDataObj, {
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
        {isEditMode ? 'Edit Funded Project' : 'Add Funded Project'}
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
                Project Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Project Title"
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
                id="fundingAgency"
                name="fundingAgency"
                label="Funding Agency"
                value={formData.fundingAgency}
                onChange={handleChange}
                error={!!formErrors.fundingAgency}
                helperText={formErrors.fundingAgency}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Your Role
                </Typography>
                <RadioGroup
                  row
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <FormControlLabel value="PI" control={<Radio />} label="PI" />
                  <FormControlLabel value="Co-PI" control={<Radio />} label="Co-PI" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="principalInvestigator"
                name="principalInvestigator"
                label="Principal Investigator"
                value={formData.principalInvestigator}
                onChange={handleChange}
                error={!!formErrors.principalInvestigator}
                helperText={formErrors.principalInvestigator}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="coPrincipalInvestigator"
                name="coPrincipalInvestigator"
                label="Co-Principal Investigator"
                value={formData.coPrincipalInvestigator}
                onChange={handleChange}
                error={!!formErrors.coPrincipalInvestigator}
                helperText={formErrors.coPrincipalInvestigator}
                required={formData.role === 'Co-PI'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="numberOfCoPIs"
                name="numberOfCoPIs"
                label="Number of Co-PIs from SRMIST"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.numberOfCoPIs}
                onChange={handleChange}
                error={!!formErrors.numberOfCoPIs}
                helperText={formErrors.numberOfCoPIs}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Grant Date"
                value={formData.grantDate}
                onChange={(date) => handleDateChange(date, 'grantDate')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!formErrors.grantDate,
                    helperText: formErrors.grantDate
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="grantAmount"
                name="grantAmount"
                label="Grant Amount (₹)"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.grantAmount}
                onChange={handleChange}
                error={!!formErrors.grantAmount}
                helperText={formErrors.grantAmount}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                sx={{ mr: 2 }}
              >
                Upload Sanction Order (PDF, max 4MB)
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => handleFileChange(e, 'sanctionOrderFile')}
                />
              </Button>
              {sanctionOrderFile && (
                <Typography variant="body2" component="span">
                  {sanctionOrderFile.name}
                </Typography>
              )}
              {formErrors.sanctionOrderFile && (
                <FormHelperText error>{formErrors.sanctionOrderFile}</FormHelperText>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Amount Received This Year (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="amountReceived"
                name="amountReceived"
                label="Amount Received This Year (₹)"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={formData.amountReceived}
                onChange={handleChange}
                error={!!formErrors.amountReceived}
                helperText={formErrors.amountReceived}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date of Amount Received"
                value={formData.dateReceived}
                onChange={(date) => handleDateChange(date, 'dateReceived')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.dateReceived,
                    helperText: formErrors.dateReceived
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                sx={{ mr: 2 }}
                disabled={!formData.amountReceived}
              >
                Upload DD Copy (PDF, max 4MB)
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => handleFileChange(e, 'ddFile')}
                  disabled={!formData.amountReceived}
                />
              </Button>
              {ddFile && (
                <Typography variant="body2" component="span">
                  {ddFile.name}
                </Typography>
              )}
              {formErrors.ddFile && (
                <FormHelperText error>{formErrors.ddFile}</FormHelperText>
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

export default ProjectForm;
