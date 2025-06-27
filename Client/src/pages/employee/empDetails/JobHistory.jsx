import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, LinearProgress, Box, Card, CardContent,
  Avatar, Stack, Divider
} from '@mui/material';
import {
  Visibility, Delete, Description, WorkHistory,
  CheckCircle, PendingActions, Cancel, ChevronLeft, ChevronRight,
  Business, DateRange, Person
} from '@mui/icons-material';
import { fetchJobHistory, deleteJobRecord } from '../../../components/api/api';
import { motion } from 'framer-motion';

const statusConfig = {
  Verified: { color: 'success', icon: <CheckCircle /> },
  Pending: { color: 'warning', icon: <PendingActions /> },
  Rejected: { color: 'error', icon: <Cancel /> }
};

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Preview pagination state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const recordsPerView = 3; // Show 3 records in preview mode

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchJobHistory();
        setJobs(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteJobRecord(deletingId);
      setJobs(prev => prev.filter(job => job.id !== deletingId));
      setDeletingId(null);
      
      // Adjust current index if necessary after deletion
      const newTotalJobs = jobs.length - 1;
      if (currentIndex >= newTotalJobs && newTotalJobs > 0) {
        setCurrentIndex(Math.max(0, newTotalJobs - recordsPerView));
      }
    } finally {
      setLoading(false);
    }
  };

  // Preview navigation handlers
  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - recordsPerView));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(jobs.length - recordsPerView, currentIndex + recordsPerView));
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + recordsPerView < jobs.length;

  // Get current preview records
  const previewJobs = jobs.slice(currentIndex, currentIndex + recordsPerView);
  const totalPages = Math.ceil(jobs.length / recordsPerView);
  const currentPage = Math.floor(currentIndex / recordsPerView) + 1;

  // JobCard component for preview mode
  const JobCard = ({ job, index }) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card sx={{ 
        mb: 2, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0, 150, 136, 0.1)',
        border: '1px solid rgba(0, 150, 136, 0.1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 150, 136, 0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: '#009688', width: 48, height: 48 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6" color="#00695c" fontWeight="600">
                  {job.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.designation}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={statusConfig[job.status].icon}
              label={job.status}
              color={statusConfig[job.status].color}
              variant="outlined"
              sx={{ borderWidth: 2, fontWeight: 500 }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <DateRange sx={{ color: '#009688', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(job.startDate).toLocaleDateString()} -{' '}
              {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Tooltip title="View Documents">
              <IconButton 
                onClick={() => setViewingJob(job)} 
                sx={{ 
                  color: '#009688',
                  '&:hover': { bgcolor: 'rgba(0, 150, 136, 0.1)' }
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => setDeletingId(job.id)} 
                sx={{ 
                  color: '#e53935',
                  '&:hover': { bgcolor: 'rgba(229, 57, 53, 0.1)' }
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 4,
      background: 'linear-gradient(145deg, #e0f2f1 30%, #ffffff 90%)',
      boxShadow: '0px 8px 24px rgba(0, 150, 136, 0.1)',
      position: 'relative'
    }}>
      {loading && <LinearProgress sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        '& .MuiLinearProgress-bar': { backgroundColor: '#009688' }
      }} />}
      
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <WorkHistory fontSize="large" sx={{ color: '#009688' }} />
          <Typography variant="h5" color="#00695c" fontWeight="600">
            Employment History
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: '#00695c' }}>
            Total Records: {jobs.length}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowPreview(!showPreview)}
            sx={{ 
              color: '#009688', 
              borderColor: '#009688',
              '&:hover': { 
                borderColor: '#00695c',
                bgcolor: 'rgba(0, 150, 136, 0.1)'
              }
            }}
          >
            {showPreview ? 'Table View' : 'Preview View'}
          </Button>
        </Box>
      </Box>

      {showPreview ? (
        // Preview Mode
        <Box>
          {previewJobs.length > 0 ? (
            previewJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))
          ) : (
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No employment records found
              </Typography>
            </Card>
          )}

          {/* Preview Navigation */}
          {jobs.length > recordsPerView && (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              gap={2} 
              mt={3}
              p={2}
              sx={{ 
                bgcolor: 'rgba(0, 150, 136, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(0, 150, 136, 0.1)'
              }}
            >
              <IconButton 
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                sx={{ 
                  color: '#009688',
                  '&:hover': { bgcolor: 'rgba(0, 150, 136, 0.1)' },
                  '&.Mui-disabled': { color: '#bdbdbd' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <Typography variant="body2" color="#00695c" fontWeight="500">
                Page {currentPage} of {totalPages}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                (Showing {currentIndex + 1}-{Math.min(currentIndex + recordsPerView, jobs.length)} of {jobs.length})
              </Typography>
              
              <IconButton 
                onClick={handleNext}
                disabled={!canGoNext}
                sx={{ 
                  color: '#009688',
                  '&:hover': { bgcolor: 'rgba(0, 150, 136, 0.1)' },
                  '&.Mui-disabled': { color: '#bdbdbd' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        // Table Mode (Original)
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#e0f2f1' }}>
              <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#00695c' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                hover={{ backgroundColor: '#e0f2f1' }}
              >
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.designation}</TableCell>
                <TableCell>
                  {new Date(job.startDate).toLocaleDateString()} -{' '}
                  {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={statusConfig[job.status].icon}
                    label={job.status}
                    color={statusConfig[job.status].color}
                    variant="outlined"
                    sx={{ borderWidth: 2, fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Documents">
                    <IconButton onClick={() => setViewingJob(job)} sx={{ color: '#009688' }}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => setDeletingId(job.id)} sx={{ color: '#e53935' }}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </motion.tr>
            ))}
            {jobs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No employment records found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* View Documents Dialog */}
      <Dialog open={!!viewingJob} onClose={() => setViewingJob(null)} maxWidth="md">
        <DialogTitle sx={{ bgcolor: '#009688', color: 'white' }}>
          {viewingJob?.company} Documents
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {viewingJob?.documents?.offerLetter?.map((doc, index) => (
              <Box key={`offer-${index}`} display="flex" alignItems="center" gap={2} p={1}>
                <Description sx={{ color: '#009688' }} />
                <Typography>{doc}</Typography>
                <CheckCircle color="success" />
              </Box>
            ))}
            {viewingJob?.documents?.relievingLetter?.map((doc, index) => (
              <Box key={`relieving-${index}`} display="flex" alignItems="center" gap={2} p={1}>
                <Description sx={{ color: '#009688' }} />
                <Typography>{doc}</Typography>
                <CheckCircle color="success" />
              </Box>
            ))}
            {viewingJob?.documents?.payslips?.map((doc, index) => (
              <Box key={`payslip-${index}`} display="flex" alignItems="center" gap={2} p={1}>
                <Description sx={{ color: '#009688' }} />
                <Typography>{doc}</Typography>
                <PendingActions color="warning" />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewingJob(null)}
            sx={{ color: '#009688' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
        <DialogTitle sx={{ color: '#009688' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this job record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingId(null)} sx={{ color: '#009688' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            sx={{ 
              bgcolor: '#009688',
              color: 'white',
              '&:hover': { bgcolor: '#00695c' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}