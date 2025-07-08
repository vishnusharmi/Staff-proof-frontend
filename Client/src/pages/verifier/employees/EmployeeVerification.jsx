import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@mui/material';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work,
  School,
  Person,
  CheckCircle,
  Cancel,
  PendingActions,
  Visibility,
  Download,
  Business,
  CalendarToday,
  LocationOn,
  Description,
  Verified,
  Warning,
  Error,
  Timeline
} from '@mui/icons-material';
import { fetchVerificationCase, updateCaseStatus, updateDocumentVerification, updateJobHistoryVerification } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`verification-tabpanel-${index}`}
    aria-labelledby={`verification-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const EmployeeVerification = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobHistory, setSelectedJobHistory] = useState(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentStatus, setDocumentStatus] = useState('pending');
  const [documentNotes, setDocumentNotes] = useState('');
  const [jobHistoryStatus, setJobHistoryStatus] = useState('pending');
  const [jobHistoryNotes, setJobHistoryNotes] = useState('');
  const [profileStatus, setProfileStatus] = useState('updated');
  const [profileNotes, setProfileNotes] = useState('');

  useEffect(() => {
    const loadCaseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchVerificationCase(caseId);
        setCaseData(response);
        
        // Set initial statuses
        setProfileStatus(response.profileStatus || 'updated');
        setJobHistoryStatus(response.jobHistoryStatus || 'pending');
        
      } catch (err) {
        console.error('Error loading case data:', err);
        setError(err.response?.data?.message || 'Failed to load case data');
      } finally {
        setLoading(false);
      }
    };

    if (caseId && user) {
      loadCaseData();
    }
  }, [caseId, user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleJobHistoryClick = (jobHistory) => {
    setSelectedJobHistory(jobHistory);
    setDocumentDialogOpen(true);
  };

  const handleDocumentStatusUpdate = async () => {
    try {
      await updateDocumentVerification(
        caseId,
        selectedDocument.documentType,
        selectedDocument.jobHistoryIndex,
        selectedDocument.documentIndex,
        documentStatus,
        documentNotes
      );
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        documentVerifications: [
          ...prev.documentVerifications.filter(d => 
            d.documentType !== selectedDocument.documentType ||
            d.jobHistoryIndex !== selectedDocument.jobHistoryIndex ||
            d.documentIndex !== selectedDocument.documentIndex
          ),
          {
            documentType: selectedDocument.documentType,
            jobHistoryIndex: selectedDocument.jobHistoryIndex,
            documentIndex: selectedDocument.documentIndex,
            status: documentStatus,
            notes: documentNotes,
            verifiedBy: user._id,
            verifiedAt: new Date()
          }
        ]
      }));
      
      setDocumentDialogOpen(false);
      setSelectedDocument(null);
      setDocumentStatus('pending');
      setDocumentNotes('');
      
    } catch (err) {
      console.error('Error updating document status:', err);
      setError(err.response?.data?.message || 'Failed to update document status');
    }
  };

  const handleJobHistoryStatusUpdate = async (jobHistoryIndex) => {
    try {
      await updateJobHistoryVerification(
        caseId,
        jobHistoryIndex,
        jobHistoryStatus,
        jobHistoryNotes
      );
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        jobHistoryVerifications: [
          ...prev.jobHistoryVerifications.filter(j => j.jobHistoryIndex !== jobHistoryIndex),
          {
            jobHistoryIndex,
            status: jobHistoryStatus,
            notes: jobHistoryNotes,
            verifiedBy: user._id,
            verifiedAt: new Date()
          }
        ]
      }));
      
      setJobHistoryStatus('pending');
      setJobHistoryNotes('');
      
    } catch (err) {
      console.error('Error updating job history status:', err);
      setError(err.response?.data?.message || 'Failed to update job history status');
    }
  };

  const handleProfileStatusUpdate = async () => {
    try {
      await updateCaseStatus(caseId, {
        status: profileStatus === 'verified' ? 'completed' : 'in_progress',
        notes: profileNotes
      });
      
      setCaseData(prev => ({
        ...prev,
        profileStatus,
        verificationNotes: profileNotes
      }));
      
      setProfileStatus('pending');
      setProfileNotes('');
      
    } catch (err) {
      console.error('Error updating profile status:', err);
      setError(err.response?.data?.message || 'Failed to update profile status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'updated':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'updated':
        return <Verified />;
      case 'pending':
      default:
        return <PendingActions />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!caseData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No case data found
      </Alert>
    );
  }

  const employee = caseData.employee;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Verification - {employee.firstName} {employee.lastName}
      </Typography>
      
      {/* Case Summary */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardHeader
          title="Case Summary"
          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Employee Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {employee.firstName} {employee.middleName || ''} {employee.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {employee.email}
                </Typography>
                <Typography variant="body2">
                  <strong>StaffProof ID:</strong> {employee.staffProofId || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Case ID:</strong> {caseData._id}
                </Typography>
                <Typography variant="body2">
                  <strong>Case Type:</strong> {caseData.caseType?.replace('_', ' ').toUpperCase()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Verification Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getStatusIcon(caseData.profileStatus)}
                    label={`Profile: ${caseData.profileStatus?.toUpperCase()}`}
                    color={getStatusColor(caseData.profileStatus)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getStatusIcon(caseData.jobHistoryStatus)}
                    label={`Job History: ${caseData.jobHistoryStatus?.toUpperCase()}`}
                    color={getStatusColor(caseData.jobHistoryStatus)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getStatusIcon(caseData.documentStatus)}
                    label={`Documents: ${caseData.documentStatus?.toUpperCase()}`}
                    color={getStatusColor(caseData.documentStatus)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getStatusIcon(caseData.status)}
                    label={`Overall: ${caseData.status?.replace('_', ' ').toUpperCase()}`}
                    color={getStatusColor(caseData.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {employee.jobHistory?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Job Records
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {Object.values(employee.documents || {}).flat().length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Documents
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {caseData.documentVerifications?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Verified Docs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {caseData.history?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Activities
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Progress Indicator */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Verification Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Timeline color="primary" />
              <Typography variant="body2">
                {(() => {
                  const totalSteps = 3;
                  const completedSteps = [
                    caseData.profileStatus === 'verified' || caseData.profileStatus === 'rejected',
                    caseData.jobHistoryStatus === 'verified' || caseData.jobHistoryStatus === 'rejected',
                    caseData.documentStatus === 'verified' || caseData.documentStatus === 'rejected'
                  ].filter(Boolean).length;
                  return `${completedSteps}/${totalSteps} sections completed`;
                })()}
              </Typography>
            </Box>
            <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
              <Box
                sx={{
                  width: `${(() => {
                    const totalSteps = 3;
                    const completedSteps = [
                      caseData.profileStatus === 'verified' || caseData.profileStatus === 'rejected',
                      caseData.jobHistoryStatus === 'verified' || caseData.jobHistoryStatus === 'rejected',
                      caseData.documentStatus === 'verified' || caseData.documentStatus === 'rejected'
                    ].filter(Boolean).length;
                    return (completedSteps / totalSteps) * 100;
                  })()}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
          
          {/* Recent Activities */}
          {caseData.history && caseData.history.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent Activities
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {caseData.history.slice(0, 5).map((activity, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: index < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.performedAt).toLocaleString()} by {activity.performedBy?.firstName} {activity.performedBy?.lastName}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          
          {caseData.verificationNotes && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                Verification Notes
              </Typography>
              <Typography variant="body2" color="warning.dark">
                {caseData.verificationNotes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="verification tabs">
          <Tab label="Job History" icon={<Work />} />
          <Tab label="Profile Details" icon={<Person />} />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Job History Verification
        </Typography>
        
        {employee.jobHistory && employee.jobHistory.length > 0 ? (
          <Grid container spacing={3}>
            {employee.jobHistory.map((job, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business />
                        <Typography variant="h6">{job.companyName}</Typography>
                      </Box>
                    }
                    subheader={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">
                          {job.designation}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(job.verificationStatus)}
                          label={job.verificationStatus?.toUpperCase()}
                          color={getStatusColor(job.verificationStatus)}
                          size="small"
                        />
                      </Box>
                    }
                    action={
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleJobHistoryClick(job)}
                        startIcon={<Visibility />}
                      >
                        View Documents
                      </Button>
                    }
                  />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary="Duration"
                          secondary={`${new Date(job.startDate).toLocaleDateString()} - ${
                            job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()
                          }`}
                        />
                      </ListItem>
                      {job.location && (
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText
                            primary="Location"
                            secondary={job.location}
                          />
                        </ListItem>
                      )}
                    </List>
                    
                    <Box mt={2}>
                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Final Status</InputLabel>
                        <Select
                          value={jobHistoryStatus}
                          onChange={(e) => setJobHistoryStatus(e.target.value)}
                          label="Final Status"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="verified">Verified</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        value={jobHistoryNotes}
                        onChange={(e) => setJobHistoryNotes(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      
                      <Button
                        variant="contained"
                        onClick={() => handleJobHistoryStatusUpdate(index)}
                        disabled={!jobHistoryStatus || jobHistoryStatus === 'pending'}
                      >
                        Update Status
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No job history found for this employee.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Profile Details Verification
        </Typography>
        
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={`${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={employee.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={employee.phone}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Employment Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Designation"
                      secondary={employee.designation}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Department"
                      secondary={employee.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Joining Date"
                      secondary={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Employment Type"
                      secondary={employee.employmentType}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Documents
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(employee.documents || {}).map(([docType, docs]) => (
                  docs && docs.length > 0 && (
                    <Grid item xs={12} md={6} key={docType}>
                      <Card variant="outlined">
                        <CardHeader
                          title={docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          subheader={`${docs.length} document(s)`}
                        />
                        <CardContent>
                          {docs.map((doc, docIndex) => (
                            <Box key={docIndex} display="flex" alignItems="center" gap={1} mb={1}>
                              <Description />
                              <Typography variant="body2" flex={1}>
                                {doc.originalName}
                              </Typography>
                              <Chip
                                icon={getStatusIcon(doc.verificationStatus)}
                                label={doc.verificationStatus?.toUpperCase()}
                                color={getStatusColor(doc.verificationStatus)}
                                size="small"
                              />
                              <Tooltip title="View Document">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedDocument({
                                      documentType: docType,
                                      jobHistoryIndex: -1,
                                      documentIndex: docIndex,
                                      ...doc
                                    });
                                    setDocumentStatus(doc.verificationStatus || 'pending');
                                    setDocumentNotes(doc.verificationNotes || '');
                                    setDocumentDialogOpen(true);
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                ))}
              </Grid>
            </Box>
            
            <Box mt={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Profile Status</InputLabel>
                <Select
                  value={profileStatus}
                  onChange={(e) => setProfileStatus(e.target.value)}
                  label="Profile Status"
                >
                  <MenuItem value="updated">Updated</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={profileNotes}
                onChange={(e) => setProfileNotes(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                onClick={handleProfileStatusUpdate}
                disabled={!profileStatus || profileStatus === 'updated'}
              >
                Update Profile Status
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Document Verification Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Verification - {selectedDocument?.originalName}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Document Type: {selectedDocument?.documentType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Size: {(selectedDocument?.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploaded: {selectedDocument?.uploadedAt ? new Date(selectedDocument.uploadedAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              href={selectedDocument?.url}
              target="_blank"
            >
              View Document
            </Button>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={documentStatus}
              onChange={(e) => setDocumentStatus(e.target.value)}
              label="Verification Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={documentNotes}
            onChange={(e) => setDocumentNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDocumentStatusUpdate}
            disabled={!documentStatus || documentStatus === 'pending'}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeVerification; 