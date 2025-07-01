import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Box,
  Snackbar,
  Alert,
  TablePagination,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Email,
  History,
  Delete,
  Warning,
  MoreVert
} from '@mui/icons-material';
import {
  fetchAccessRequests,
  updateAccessRequest,
} from "../../../components/api/api";

const statusConfig = {
  pending: { color: 'warning', icon: <History color="warning" /> },
  accepted: { color: 'success', icon: <CheckCircle color="success" /> },
  denied: { color: 'error', icon: <Cancel color="error" /> },
  default: { color: 'default', icon: <Warning color="action" /> }
};

export default function Permissions() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAccessRequests();
        setRequests(data);
      } catch (err) {
        handleError('Failed to load access requests');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    setLoading(true);
    try {
      const updatedRequest = await updateAccessRequest(requestId, action);
      
      setRequests(prev => {
        if (action === 'delete') {
          return prev.filter(req => req.id !== requestId);
        }
        return prev.map(req => 
          req.id === requestId ? { ...req, ...updatedRequest } : req
        );
      });
      
      setSnackbar({ open: true, message: `Request ${action} successfully!`, severity: 'success' });
    } catch (err) {
      handleError(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message) => {
    setError(message);
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusConfig = (status) => 
    statusConfig[status] || statusConfig.default;

  const handleDropdownOpen = (event, requestId) => {
    setDropdownAnchor(event.currentTarget);
    setSelectedRequestId(requestId);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
    setSelectedRequestId(null);
  };

  const handleActionClick = (action) => {
    if (selectedRequestId) {
      handleRequestAction(selectedRequestId, action);
    }
    handleDropdownClose();
  };

  // Calculate paginated requests
  const paginatedRequests = requests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ 
      p: 3, 
      position: 'relative',
      borderRadius: 4,
      boxShadow: '0px 8px 24px rgba(0, 150, 136, 0.1)',
      background: 'linear-gradient(145deg, #f0faf9 30%, #ffffff 90%)'
    }}>
      {loading && <LinearProgress sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        height: 4,
        '& .MuiLinearProgress-bar': { backgroundColor: '#009688' }
      }} />}
      
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Typography variant="h4" color="#00695c" fontWeight={600}>
          Access Permissions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<History sx={{ color: '#009688' }} />}
          onClick={() => setShowLogs(true)}
          sx={{ 
            ml: 'auto',
            borderColor: '#009688',
            color: '#009688',
            '&:hover': { borderColor: '#00695c' }
          }}
        >
          View Logs
        </Button>
      </Box>

      <Table sx={{ 
        '& .MuiTableCell-root': { py: 1.5 },
        '& .MuiTableRow-hover:hover': { backgroundColor: '#e0f2f1' }
      }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#e0f2f1' }}>
            <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Employer</TableCell>
            <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Documents</TableCell>
            <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Request Date</TableCell>
            <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ color: '#00695c', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRequests.map(request => {
            const status = getStatusConfig(request.status);
            return (
              <TableRow 
                key={request.id}
                hover
                sx={{ '&:hover': { transform: 'scale(1.005)', boxShadow: '0px 2px 8px rgba(0, 150, 136, 0.1)' } }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email sx={{ color: '#009688' }} />
                    {request.employer.name}
                  </Box>
                </TableCell>
                <TableCell>
                  {request.requestedDocs.map(doc => (
                    <Chip
                      key={`${request.id}-${doc}`}
                      label={doc}
                      size="small"
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        bgcolor: '#e0f2f1',
                        '& .MuiChip-label': { color: '#00695c' }
                      }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(request.requestDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={status.icon}
                    label={request.status}
                    color={status.color}
                    variant="outlined"
                    sx={{ 
                      borderWidth: 2,
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: 'inherit !important' }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Actions">
                    <IconButton
                      onClick={(event) => handleDropdownOpen(event, request.id)}
                      sx={{ color: '#009688', '&:hover': { bgcolor: '#b2dfdb' } }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton 
                      onClick={() => setSelectedRequest(request)}
                      sx={{ color: '#009688', '&:hover': { bgcolor: '#b2dfdb' } }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={requests.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-toolbar': { color: '#00695c' },
          '& .MuiTablePagination-selectLabel': { color: '#00695c' },
          '& .MuiTablePagination-displayedRows': { color: '#00695c' }
        }}
      />

      {/* Actions Dropdown Menu */}
      <Menu
        anchorEl={dropdownAnchor}
        open={Boolean(dropdownAnchor)}
        onClose={handleDropdownClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0px 8px 24px rgba(0, 150, 136, 0.15)',
            '& .MuiMenuItem-root': {
              color: '#00695c',
              '&:hover': { bgcolor: '#e0f2f1' }
            }
          }
        }}
      >
        {selectedRequestId && (() => {
          const request = requests.find(req => req.id === selectedRequestId);
          if (request?.status === 'pending') {
            return (
              <>
                <MenuItem onClick={() => handleActionClick('accepted')}>
                  <CheckCircle sx={{ mr: 1, color: '#009688' }} />
                  Accept Request
                </MenuItem>
                <MenuItem onClick={() => handleActionClick('denied')}>
                  <Cancel sx={{ mr: 1, color: '#e53935' }} />
                  Deny Request
                </MenuItem>
              </>
            );
          } else {
            return (
              <MenuItem onClick={() => handleActionClick('delete')}>
                <Delete sx={{ mr: 1, color: '#e53935' }} />
                Delete Record
              </MenuItem>
            );
          }
        })()}
      </Menu>

      {requests.length === 0 && !loading && !error && (
        <Typography variant="body1" sx={{ p: 3, textAlign: 'center', color: '#00695c' }}>
          No pending access requests
        </Typography>
      )}

      {/* Request Details Dialog */}
      <Dialog 
        open={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: '#009688', color: 'white' }}>
          Access Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="#00695c">Employer:</Typography>
                <Typography>{selectedRequest.employer.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="#00695c">Documents:</Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedRequest.requestedDocs.map(doc => (
                    <Chip
                      key={`${selectedRequest.id}-${doc}`}
                      label={doc}
                      size="small"
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        bgcolor: '#e0f2f1',
                        '& .MuiChip-label': { color: '#00695c' }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="#00695c">Request Date:</Typography>
                <Typography>
                  {new Date(selectedRequest.requestDate).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="#00695c">Expiry Date:</Typography>
                <Typography>
                  {new Date(selectedRequest.expiryDate).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSelectedRequest(null)}
            sx={{ color: '#009688' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access Logs Dialog */}
      <Dialog 
        open={showLogs} 
        onClose={() => setShowLogs(false)} 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: '#009688', color: 'white' }}>
          Access Log History
        </DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e0f2f1' }}>
                <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>IP Address</TableCell>
                <TableCell sx={{ color: '#00695c', fontWeight: 600 }}>Document</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests
                .flatMap(req => req.accessLogs)
                .map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`} hover>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={
                          log.action === 'viewed' ? 'info' : 
                          log.action === 'downloaded' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>{log.document}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowLogs(false)}
            sx={{ color: '#009688' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            bgcolor: snackbar.severity === 'error' ? '#ffebee' : '#e0f2f1',
            color: snackbar.severity === 'error' ? '#d32f2f' : '#00695c'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}