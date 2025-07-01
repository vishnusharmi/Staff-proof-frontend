import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Typography, 
  Chip,
  LinearProgress,
  IconButton,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
  Grid
} from '@mui/material';
import { 
  Description, 
  CheckCircle, 
  Error, 
  PendingActions, 
  Delete,
  Visibility
} from '@mui/icons-material';

// Mock API functions - replace with real API calls
const fetchDocuments = () => {
  return Promise.resolve({
    identity: [
      { id: 1, name: 'Aadhaar Front.jpg', status: 'Verified', date: '2023-05-15', type: 'Identity' },
      { id: 2, name: 'Aadhaar Back.jpg', status: 'Verified', date: '2023-05-15', type: 'Identity' },
      { id: 3, name: 'PAN Card.pdf', status: 'Pending', date: '2023-05-20', type: 'Identity' }
    ],
    education: [
      { id: 4, name: 'Bachelor Degree.pdf', status: 'Verified', date: '2023-04-10', type: 'Education' },
      { id: 5, name: 'Marksheet.pdf', status: 'Rejected', date: '2023-05-01', type: 'Education' },
      { id: 6, name: '12th Certificate.pdf', status: 'Pending', date: '2023-05-22', type: 'Education' }
    ],
    resume: [
      { id: 7, name: 'My_Resume.pdf', status: 'Pending', date: '2023-05-25', type: 'Resume' }
    ],
    experience: [
      { id: 8, name: 'Experience Letter 1.pdf', status: 'Verified', date: '2023-04-15', type: 'Experience' },
      { id: 9, name: 'Experience Letter 2.pdf', status: 'Pending', date: '2023-05-18', type: 'Experience' },
      { id: 10, name: 'Relieving Letter.pdf', status: 'Rejected', date: '2023-05-20', type: 'Experience' }
    ]
  });
};

const deleteDocument = (docId) => {
  return Promise.resolve({ success: true });
};

// Mock function to fetch document content - replace with real API call
const fetchDocumentContent = (docId) => {
  return Promise.resolve({
    id: docId,
    content: 'This is a sample document content. In a real application, this would be the actual document content or a URL to view the document.',
    url: 'https://example.com/document.pdf',
    type: 'pdf'
  });
};

const statusConfig = {
  Verified: { color: 'success', icon: <CheckCircle /> },
  Pending: { color: 'warning', icon: <PendingActions /> },
  Rejected: { color: 'error', icon: <Error /> }
};

export default function DocumentCenter() {
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, docId: null, docName: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, doc: null, content: null, loading: false });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const data = await fetchDocuments();
        
        // Flatten all documents into a single array
        const flattenedDocs = [
          ...data.identity,
          ...data.education,
          ...data.resume,
          ...data.experience
        ];
        
        setAllDocuments(flattenedDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to load documents', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, []);

  const handleDeleteClick = (doc) => {
    setDeleteDialog({
      open: true,
      docId: doc.id,
      docName: doc.name
    });
  };

  const handleViewClick = async (doc) => {
    setViewDialog({ open: true, doc, content: null, loading: true });
    
    try {
      const content = await fetchDocumentContent(doc.id);
      setViewDialog(prev => ({ ...prev, content, loading: false }));
    } catch (error) {
      console.error('Error loading document content:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load document content', 
        severity: 'error' 
      });
      setViewDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, doc: null, content: null, loading: false });
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteDocument(deleteDialog.docId);
      
      // Remove document from state
      setAllDocuments(prev => prev.filter(doc => doc.id !== deleteDialog.docId));
      
      // Adjust page if necessary after deletion
      const newTotalDocs = allDocuments.length - 1;
      const maxPage = Math.ceil(newTotalDocs / rowsPerPage) - 1;
      if (page > maxPage && maxPage >= 0) {
        setPage(maxPage);
      }
      
      setSnackbar({ 
        open: true, 
        message: 'Document deleted successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete document', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, docId: null, docName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, docId: null, docName: '' });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedDocuments = allDocuments.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Calculate document statistics
  const stats = {
    total: allDocuments.length,
    verified: allDocuments.filter(doc => doc.status === 'Verified').length,
    pending: allDocuments.filter(doc => doc.status === 'Pending').length,
    rejected: allDocuments.filter(doc => doc.status === 'Rejected').length
  };

  return (
    <Box>
      <Paper sx={{ 
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(145deg, #f0faf9 30%, #ffffff 90%)',
        boxShadow: '0px 8px 32px rgba(0, 150, 136, 0.15)',
        minHeight: '80vh',
        position: 'relative'
      }}>
        {loading && (
          <LinearProgress sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            '& .MuiLinearProgress-bar': { backgroundColor: '#009688' }
          }} />
        )}

        <Box display="flex" alignItems="center" mb={4} gap={2}>
          <Description sx={{ fontSize: 40, color: '#009688' }} />
          <Typography variant="h4" sx={{ 
            color: '#00695c',
            fontWeight: 700,
            letterSpacing: -0.5,
            flexGrow: 1
          }}>
            Document Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#00695c' }}>
            Total Documents: {stats.total}
          </Typography>
        </Box>

        {/* Document Statistics */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Chip 
            icon={<CheckCircle />}
            label={`Verified: ${stats.verified}`}
            color="success"
            variant="outlined"
            sx={{ borderWidth: 2, fontWeight: 500 }}
          />
          <Chip 
            icon={<PendingActions />}
            label={`Pending: ${stats.pending}`}
            color="warning"
            variant="outlined"
            sx={{ borderWidth: 2, fontWeight: 500 }}
          />
          <Chip 
            icon={<Error />}
            label={`Rejected: ${stats.rejected}`}
            color="error"
            variant="outlined"
            sx={{ borderWidth: 2, fontWeight: 500 }}
          />
        </Box>

        {/* Documents Table */}
        <Paper sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 20px rgba(0, 150, 136, 0.1)'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e0f2f1' }}>
                <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>
                  Document Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>
                  Document Type
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#00695c' }}>
                  Upload Date
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#00695c' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDocuments.length > 0 ? paginatedDocuments.map((doc) => (
                <TableRow 
                  key={doc.id}
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#e0f2f1',
                      transform: 'scale(1.002)',
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: `4px solid ${
                      doc.status === 'Verified' ? '#4caf50' : 
                      doc.status === 'Pending' ? '#ff9800' : '#f44336'
                    }`
                  }}
                >
                  <TableCell sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Description sx={{ color: '#009688' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {doc.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: '#00695c',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: 0.5
                    }}>
                      {doc.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      color={statusConfig[doc.status].color}
                      icon={statusConfig[doc.status].icon}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderWidth: 2, 
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'inherit !important' }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(doc.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleViewClick(doc)}
                        sx={{ 
                          color: '#009688', 
                          '&:hover': { 
                            bgcolor: '#e0f2f1',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeleteClick(doc)}
                        sx={{ 
                          color: '#f44336', 
                          '&:hover': { 
                            bgcolor: '#ffebee',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Description sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
                        No Documents Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                        Upload some documents to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Component */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={allDocuments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid #e0e0e0',
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#00695c',
                fontWeight: 500
              },
              '& .MuiTablePagination-select': {
                color: '#009688'
              },
              '& .MuiIconButton-root': {
                color: '#009688',
                '&:hover': {
                  backgroundColor: 'rgba(0, 150, 136, 0.1)'
                },
                '&.Mui-disabled': {
                  color: '#bdbdbd'
                }
              }
            }}
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            color: '#00695c',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Delete sx={{ color: '#f44336' }} />
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this document?
            </Typography>
            <Box sx={{ 
              bgcolor: '#ffebee', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid #ffcdd2'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                <strong>Document:</strong> {deleteDialog.docName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#d32f2f' }}>
                This action cannot be undone.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleDeleteCancel}
              sx={{ 
                color: '#009688',
                '&:hover': { bgcolor: '#e0f2f1' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{ 
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' }
              }}
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={handleViewClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#009688',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Visibility />
            View Document
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {viewDialog.loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <LinearProgress sx={{ width: '100%' }} />
              </Box>
            ) : viewDialog.doc && (
              <Box>
                {/* Document Header */}
                <Box sx={{ 
                  bgcolor: '#e0f2f1', 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 3,
                  border: '1px solid #b2dfdb'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="#00695c" fontWeight={600}>
                        Document Name:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {viewDialog.doc.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="#00695c" fontWeight={600}>
                        Document Type:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, textTransform: 'uppercase' }}>
                        {viewDialog.doc.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="#00695c" fontWeight={600}>
                        Status:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={viewDialog.doc.status}
                          color={statusConfig[viewDialog.doc.status].color}
                          icon={statusConfig[viewDialog.doc.status].icon}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderWidth: 2, 
                            fontWeight: 500,
                            '& .MuiChip-icon': { color: 'inherit !important' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="#00695c" fontWeight={600}>
                        Upload Date:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {new Date(viewDialog.doc.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Document Content */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#00695c' }}>
                    Document Content
                  </Typography>
                  
                  {viewDialog.content?.type === 'pdf' ? (
                    <Box sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2, 
                      p: 2,
                      bgcolor: '#fafafa'
                    }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Description sx={{ color: '#009688' }} />
                        <Typography variant="body1" fontWeight={500}>
                          PDF Document
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        href={viewDialog.content.url}
                        target="_blank"
                        startIcon={<Visibility />}
                        sx={{ 
                          bgcolor: '#009688',
                          '&:hover': { bgcolor: '#00695c' }
                        }}
                      >
                        Open Document
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2, 
                      p: 3,
                      bgcolor: '#fafafa',
                      minHeight: '200px',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {viewDialog.content?.content || 'Document content not available'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button 
              onClick={handleViewClose}
              sx={{ 
                color: '#009688',
                '&:hover': { bgcolor: '#e0f2f1' }
              }}
            >
              Close
            </Button>
            {viewDialog.content?.url && (
              <Button 
                variant="contained"
                href={viewDialog.content.url}
                target="_blank"
                startIcon={<Visibility />}
                sx={{ 
                  bgcolor: '#009688',
                  '&:hover': { bgcolor: '#00695c' }
                }}
              >
                Open in New Tab
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}