import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container, Paper, TextField, Button, Typography,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Switch, Collapse, Chip, Divider,
  Box, Avatar, LinearProgress, Card, CardContent, CardActions,
  Table, TableContainer, TableBody, TableCell, TableHead, TableRow,
  IconButton, Accordion, AccordionSummary, AccordionDetails,
  Grid, Badge, Alert
} from '@mui/material';
import {
  Lock, CheckCircle, VerifiedUser, PendingActions, Cancel,
  CameraAlt, CloudUpload, Visibility, Edit, Add, Work,
  Description, School, Person, ExpandMore, DateRange, AttachFile
} from '@mui/icons-material';
import { teal, green, orange, red } from '@mui/material/colors';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated API calls
const fetchProfile = async () => ({
  id: 'SP-1234567',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  dob: '1990-01-01',
  pan: 'ABCDE1234F',
  aadhaar: '123456789012',
  qualification: 'Masters',
  experience: 5,
  verificationStatus: 'verified',
  profileImage: null,
  documents: {
    aadhaarFront: { name: 'aadhaar_front.pdf', status: 'verified', uploadDate: '2024-01-15' },
    aadhaarBack: { name: 'aadhaar_back.pdf', status: 'verified', uploadDate: '2024-01-15' },
    panCard: { name: 'pan_card.pdf', status: 'verified', uploadDate: '2024-01-15' },
    degreeCertificate: { name: 'degree.pdf', status: 'pending', uploadDate: '2024-01-20' },
    marksheet: null,
    resume: { name: 'resume.pdf', status: 'verified', uploadDate: '2024-01-10' }
  },
  jobHistory: [
    {
      id: 1,
      company: 'Tech Corp Ltd',
      designation: 'Senior Developer',
      startDate: '2022-01-15',
      endDate: '2024-01-10',
      currentlyWorking: false,
      status: 'verified',
      documents: {
        offerLetter: 'offer_tech_corp.pdf',
        relievingLetter: 'relieving_tech_corp.pdf',
        payslips: 'payslips_tech_corp.zip'
      }
    },
    {
      id: 2,
      company: 'StartUp Inc',
      designation: 'Full Stack Developer',
      startDate: '2020-06-01',
      endDate: '2021-12-31',
      currentlyWorking: false,
      status: 'pending',
      documents: {
        offerLetter: 'offer_startup.pdf',
        relievingLetter: null,
        payslips: 'payslips_startup.zip'
      }
    }
  ]
});

const updateProfile = async (formData) => {
  console.log('Updating profile:', Object.fromEntries(formData));
  return {
    ...Object.fromEntries(formData),
    profileImage: formData.get('profileImage') ? URL.createObjectURL(formData.get('profileImage')) : null
  };
};

const uploadDocument = async (docType, file) => {
  console.log('Uploading document:', docType, file.name);
  return { name: file.name, status: 'pending', uploadDate: new Date().toISOString().split('T')[0] };
};

const addJobRecord = async (jobData) => {
  console.log('Adding job record:', jobData);
  return { ...jobData, id: Date.now(), status: 'pending' };
};

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email().required(),
  phone: yup.string().matches(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  dob: yup.date().required('Date of birth is required'),
  pan: yup.string().matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Invalid PAN format'),
  aadhaar: yup.string().matches(/^[2-9]{1}[0-9]{11}$/, 'Invalid Aadhaar number'),
  qualification: yup.string().required(),
  experience: yup.number().positive().required()
});

const jobSchema = yup.object().shape({
  company: yup.string().required('Company name is required'),
  designation: yup.string().required('Designation is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().when('currentlyWorking', {
    is: false,
    then: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date')
  })
});

const   Profile=({ hasEditAccess = true }) =>{
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema)
  });
  const { register: registerJob, handleSubmit: handleJobSubmit, reset: resetJob, formState: { errors: jobErrors } } = useForm({
    resolver: yupResolver(jobSchema)
  });

  const [editMode, setEditMode] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [jobDocuments, setJobDocuments] = useState({
    offerLetter: null,
    relievingLetter: null,
    payslips: null
  });

  useEffect(() => {
    fetchProfile().then(data => {
      reset(data);
      setProfileData(data);
      setVerificationStatus(data.verificationStatus);
      if (data.profileImage) setPreview(data.profileImage);
    });
  }, [reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG/PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('File size exceeds 2MB limit');
      return;
    }

    setImageError('');
    setSelectedFile(file);
  };

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;

    setUploadingDocs(prev => ({ ...prev, [docType]: true }));
    try {
      const result = await uploadDocument(docType, file);
      setProfileData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: result
        }
      }));
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleJobDocumentUpload = (docType, file) => {
    if (!file) return;
    setJobDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const handleJobSave = async (data) => {
    try {
      const jobData = {
        ...data,
        currentlyWorking,
        documents: {
          offerLetter: jobDocuments.offerLetter ? jobDocuments.offerLetter.name : null,
          relievingLetter: jobDocuments.relievingLetter ? jobDocuments.relievingLetter.name : null,
          payslips: jobDocuments.payslips ? jobDocuments.payslips.name : null
        }
      };
      const newJob = await addJobRecord(jobData);
      setProfileData(prev => ({
        ...prev,
        jobHistory: [...prev.jobHistory, newJob]
      }));
      setJobDialogOpen(false);
      resetJob();
      setCurrentlyWorking(false);
      setJobDocuments({ offerLetter: null, relievingLetter: null, payslips: null });
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (selectedFile) formData.append('profileImage', selectedFile);

      const result = await updateProfile(formData);
      setProfileData(prev => ({ ...prev, ...result }));
      setPreview(result.profileImage);
      setVerificationStatus('pending');
      setConfirmationOpen(false);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status = verificationStatus) => {
    const statusConfig = {
      verified: { color: green[500], icon: <VerifiedUser />, label: 'Verified' },
      pending: { color: orange[500], icon: <PendingActions />, label: 'Under Review' },
      rejected: { color: red[500], icon: <Cancel />, label: 'Rejected' }
    };
    const { color, icon, label } = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        sx={{
          backgroundColor: `${color}20`,
          border: `1px solid ${color}`,
          color,
          fontWeight: 600
        }}
      />
    );
  };

  const maskSensitiveInfo = (value, fieldName) => {
    if (!editMode && ['pan', 'aadhaar'].includes(fieldName)) {
      return value?.replace?.(/.(?=.{4})/g, '•') || '';
    }
    return value || '';
  };

  const documentFields = [
    { key: 'aadhaarFront', label: 'Aadhaar Front', icon: <Person /> },
    { key: 'aadhaarBack', label: 'Aadhaar Back', icon: <Person /> },
    { key: 'panCard', label: 'PAN Card', icon: <Description /> },
    { key: 'degreeCertificate', label: 'Degree Certificate', icon: <School /> },
    { key: 'marksheet', label: 'Marksheet', icon: <School /> },
    { key: 'resume', label: 'Resume', icon: <Description /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={8} sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${teal[50]} 0%, #ffffff 100%)`,
          boxShadow: '0px 12px 40px rgba(0, 128, 128, 0.15)'
        }}>
          {/* Header Section */}
          <Box sx={{
            background: `linear-gradient(135deg, ${teal[600]} 0%, ${teal[400]} 100%)`,
            color: 'white',
            p: 4
          }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box sx={{ position: 'relative' }}>
                <label htmlFor="profileImageInput">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '2.5rem',
                      cursor: editMode ? 'pointer' : 'default',
                      border: '4px solid rgba(255,255,255,0.3)',
                      '&:hover': editMode ? { opacity: 0.8 } : {}
                    }}
                    src={preview}
                  >
                    {!preview && profileData?.fullName?.[0]}
                  </Avatar>
                  {editMode && (
                    <CameraAlt sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: teal[600],
                      borderRadius: '50%',
                      padding: 1,
                      fontSize: '1.5rem'
                    }} />
                  )}
                </label>
                <input
                  type="file"
                  id="profileImageInput"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!editMode}
                />
              </Box>

              <Box flex={1}>
                <Typography variant="h4" component="h1" fontWeight="bold" mb={1}>
                  {profileData?.fullName || 'My Profile'}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }} mb={1}>
                  StaffProof ID: SP-{profileData?.id?.slice(-7).toUpperCase()}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {getStatusBadge()}
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                {imageError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {imageError}
                  </Alert>
                )}
              </Box>

              {hasEditAccess && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editMode}
                      onChange={() => setEditMode(!editMode)}
                      sx={{
                        '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.3)' },
                        '& .MuiSwitch-thumb': { backgroundColor: 'white' }
                      }}
                    />
                  }
                  label="Edit Mode"
                  sx={{
                    color: 'white',
                    '& .MuiFormControlLabel-label': { fontWeight: 500 }
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Content Section */}
          <Box p={4}>
            {!hasEditAccess && (
              <Alert
                severity="info"
                icon={<Lock />}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Purchase "Profile Edit" add-on to modify your information
              </Alert>
            )}

            {/* Profile Form */}
            <Accordion expanded={editMode || activeTab === 'profile'} sx={{ mb: 2, boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: teal[50] }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Person color="primary" />
                  <Typography variant="h6" fontWeight="600">Personal Information</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Collapse in={editMode}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleSubmit(() => setConfirmationOpen(true))}>
                      <Grid container spacing={3}>
                        {[
                          { name: 'fullName', label: 'Full Name', icon: <Person /> },
                          { name: 'email', label: 'Email', type: 'email', icon: <Person /> },
                          { name: 'phone', label: 'Phone Number', icon: <Person /> },
                          { name: 'dob', label: 'Date of Birth', type: 'date', icon: <DateRange /> },
                          { name: 'pan', label: 'PAN Number', icon: <Description /> },
                          { name: 'aadhaar', label: 'Aadhaar Number', icon: <Description /> },
                          { name: 'qualification', label: 'Highest Qualification', icon: <School /> },
                          { name: 'experience', label: 'Experience (years)', type: 'number', icon: <Work /> },
                        ].map((field) => (
                          <Grid item xs={12} md={6} key={field.name}>
                            <TextField
                              fullWidth
                              label={field.label}
                              type={field.type || 'text'}
                              {...register(field.name)}
                              error={!!errors[field.name]}
                              helperText={errors[field.name]?.message}
                              value={maskSensitiveInfo(watch(field.name), field.name)}
                              InputProps={{
                                readOnly: !editMode,
                                startAdornment: <Box sx={{ mr: 1, color: teal[500] }}>{field.icon}</Box>
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&.Mui-focused fieldset': { borderColor: teal[500] }
                                }
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>

                      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(false);
                            setSelectedFile(null);
                            setPreview(profileData?.profileImage || '');
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          disabled={loading}
                          sx={{ borderRadius: 2, backgroundColor: teal[500] }}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </form>
                  </motion.div>
                </Collapse>

                {!editMode && (
                  <Grid container spacing={2}>
                    {[
                      { label: 'Full Name', value: profileData?.fullName },
                      { label: 'Email', value: profileData?.email },
                      { label: 'Phone', value: profileData?.phone },
                      { label: 'Date of Birth', value: profileData?.dob },
                      { label: 'PAN Number', value: maskSensitiveInfo(profileData?.pan, 'pan') },
                      { label: 'Aadhaar', value: maskSensitiveInfo(profileData?.aadhaar, 'aadhaar') },
                      { label: 'Qualification', value: profileData?.qualification },
                      { label: 'Experience', value: `${profileData?.experience} years` }
                    ].map((item, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ p: 2, backgroundColor: teal[25], borderRadius: 2 }}>
                          <Typography variant="caption" color="textSecondary" fontWeight="600">
                            {item.label}
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Documents Section */}
            <Accordion sx={{ mb: 2, boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: teal[50] }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Description color="primary" />
                  <Typography variant="h6" fontWeight="600">Documents</Typography>
                  <Badge badgeContent={Object.values(profileData?.documents || {}).filter(doc => doc?.status === 'verified').length} color="success">
                    <CheckCircle />
                  </Badge>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {documentFields.map(({ key, label, icon }) => {
                    const doc = profileData?.documents?.[key];
                    const isUploading = uploadingDocs[key];

                    return (
                      <Grid item xs={12} md={6} key={key}>
                        <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              {icon}
                              <Typography variant="subtitle1" fontWeight="600">
                                {label}
                              </Typography>
                              {doc && getStatusBadge(doc.status)}
                            </Box>

                            {doc ? (
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Uploaded: {doc.uploadDate}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No document uploaded
                              </Typography>
                            )}
                          </CardContent>

                          <CardActions>
                            <input
                              type="file"
                              id={`upload-${key}`}
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(key, e.target.files[0])}
                              disabled={isUploading}
                            />
                            <label htmlFor={`upload-${key}`}>
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={isUploading ? <LinearProgress /> : <CloudUpload />}
                                disabled={isUploading}
                                size="small"
                                sx={{ borderRadius: 2 }}
                                aria-label={`Upload ${label}`}
                              >
                                {doc ? 'Re-upload' : 'Upload'}
                              </Button>
                            </label>

                            {doc && (
                              <Button
                                startIcon={<Visibility />}
                                size="small"
                                sx={{ borderRadius: 2 }}
                                aria-label={`View ${label}`}
                              >
                                View
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Job History Section */}
            <Accordion sx={{ mb: 2, boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: teal[50] }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Work color="primary" />
                  <Typography variant="h6" fontWeight="600">Employment History</Typography>
                  <Badge badgeContent={profileData?.jobHistory?.length || 0} color="primary">
                    <Work />
                  </Badge>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" justifyContent="flex-end" mb={3}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setJobDialogOpen(true)}
                    sx={{ borderRadius: 2, backgroundColor: teal[500] }}
                    aria-label="Add Job Record"
                  >
                    Add Job Record
                  </Button>
                </Box>

                {profileData?.jobHistory?.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: teal[50] }}>
                          <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {profileData.jobHistory.map((job) => (
                          <TableRow key={job.id} hover>
                            <TableCell>
                              <Typography fontWeight="500">{job.company}</Typography>
                            </TableCell>
                            <TableCell>{job.designation}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(job.startDate).toLocaleDateString()} - 
                                {job.currentlyWorking ? ' Present' : new Date(job.endDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>{getStatusBadge(job.status)}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" aria-label="View Job Details">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" color="primary" aria-label="Edit Job">
                                <Edit />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" py={6}>
                    <Work sx={{ fontSize: 64, color: teal[200], mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" mb={1}>
                      No Employment History
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add your work experience to strengthen your profile
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Changes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to save these changes?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleSave)}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleJobSubmit(handleJobSave)}>
          <DialogTitle sx={{ backgroundColor: teal[50] }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Work color="primary" />
              <Typography variant="h6">Add Employment Record</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  {...registerJob('company')}
                  error={!!jobErrors.company}
                  helperText={jobErrors.company?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  {...registerJob('designation')}
                  error={!!jobErrors.designation}
                  helperText={jobErrors.designation?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...registerJob('startDate')}
                  error={!!jobErrors.startDate}
                  helperText={jobErrors.startDate?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...registerJob('endDate')}
                  error={!!jobErrors.endDate}
                  helperText={jobErrors.endDate?.message}
                  disabled={currentlyWorking}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentlyWorking}
                      onChange={(e) => setCurrentlyWorking(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Currently Working Here"
                />
              </Grid>

              {/* Document Upload Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" mb={2}>Upload Documents</Typography>
                <Grid container spacing={2}>
                  {[
                    { key: 'offerLetter', label: 'Offer Letter' },
                    { key: 'relievingLetter', label: 'Relieving Letter' },
                    { key: 'payslips', label: 'Last 3 Payslips' }
                  ].map(({ key, label }) => (
                    <Grid item xs={12} md={4} key={key}>
                      <Box border={1} borderColor="grey.300" borderRadius={2} p={2} textAlign="center">
                        <AttachFile sx={{ fontSize: 40, color: teal[400], mb: 1 }} />
                        <Typography variant="subtitle2" mb={1}>{label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {jobDocuments[key]?.name || 'No file selected'}
                        </Typography>
                        <input
                          type="file"
                          id={`job-doc-${key}`}
                          hidden
                          accept=".pdf,.zip"
                          onChange={(e) => handleJobDocumentUpload(key, e.target.files[0])}
                        />
                        <label htmlFor={`job-doc-${key}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            size="small"
                            sx={{ borderRadius: 2, mt: 1 }}
                            aria-label={`Upload ${label}`}
                          >
                            Choose File
                          </Button>
                        </label>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setJobDialogOpen(false);
                resetJob();
                setCurrentlyWorking(false);
                setJobDocuments({ offerLetter: null, relievingLetter: null, payslips: null });
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2 }}
              disabled={loading}
            >
              Save Job
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Profile