import React, { useEffect, useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  TextField,
  ListSubheader,
  Avatar,
  Box,
  Grow,
  Fade,
  Slide,
  TablePagination
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  MarkEmailRead,
  Delete,
  Search,
  Refresh
} from '@mui/icons-material';
import { teal } from '@mui/material/colors';

const notificationConfig = {
  success: { color: teal[500], icon: <CheckCircle /> },
  warning: { color: teal[700], icon: <Warning /> },
  error: { color: teal[900], icon: <Error /> },
  info: { color: teal[300], icon: <Info /> }
};

// Dummy data
const sampleNotifications = [
  { id: 1, message: 'Your document has been approved', date: '2 min ago', type: 'success', read: false },
  { id: 2, message: 'Payment received for invoice #1234', date: '15 min ago', type: 'info', read: false },
  { id: 3, message: 'System maintenance scheduled tonight', date: '1 hour ago', type: 'warning', read: true },
  { id: 4, message: 'Security alert: New login detected', date: '5 hours ago', type: 'error', read: false },
  { id: 5, message: 'New document shared with you', date: '1 day ago', type: 'info', read: true },
  { id: 6, message: 'Profile update completed successfully', date: '2 days ago', type: 'success', read: true },
  { id: 7, message: 'New verification request received', date: '3 days ago', type: 'info', read: false },
  { id: 8, message: 'Document verification failed', date: '3 days ago', type: 'error', read: true },
  { id: 9, message: 'System backup completed', date: '4 days ago', type: 'success', read: true },
  { id: 10, message: 'Password change notification', date: '4 days ago', type: 'warning', read: false },
  { id: 11, message: 'New message from admin', date: '5 days ago', type: 'info', read: true },
  { id: 12, message: 'Account settings updated', date: '5 days ago', type: 'success', read: true },
  { id: 13, message: 'Login attempt from new device', date: '6 days ago', type: 'warning', read: false },
  { id: 14, message: 'Document upload successful', date: '6 days ago', type: 'success', read: true },
  { id: 15, message: 'Verification process started', date: '1 week ago', type: 'info', read: true },
  { id: 16, message: 'System update available', date: '1 week ago', type: 'warning', read: false },
  { id: 17, message: 'Account verification completed', date: '1 week ago', type: 'success', read: true },
  { id: 18, message: 'New feature available', date: '2 weeks ago', type: 'info', read: true },
  { id: 19, message: 'Security scan completed', date: '2 weeks ago', type: 'success', read: true },
  { id: 20, message: 'Maintenance window scheduled', date: '2 weeks ago', type: 'warning', read: false },
];

export default function Notifications() {
  const [notes, setNotes] = useState(sampleNotifications);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    filterNotifications();
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, selectedType, notes]);

  const filterNotifications = () => {
    let result = notes.filter(note => {
      const matchesSearch = note.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.date.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || note.type === selectedType;
      return matchesSearch && matchesType;
    });
    setFilteredNotes(result);
  };

  const handleMarkRead = (id) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, read: true } : note
    ));
  };

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated notifications
  const paginatedNotifications = filteredNotes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper sx={{ 
        p: 2, 
        position: 'relative',
        background: `linear-gradient(45deg, ${teal[50]}, ${teal[100]})`,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 128, 128, 0.1)'
      }}>
        {loading && <LinearProgress sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          '& .MuiLinearProgress-bar': { backgroundColor: teal[500] }
        }} />}
        
        <Box display="flex" alignItems="center" mb={2} gap={2}>
          <Typography variant="h4" sx={{ color: teal[800], fontWeight: 'bold' }}>
            Notifications
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search notifications..."
              InputProps={{ 
                startAdornment: <Search sx={{ color: teal[500] }} />,
                sx: { borderRadius: 20 }
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: teal[300] },
                  '&:hover fieldset': { borderColor: teal[500] },
                }
              }}
            />
            <IconButton 
              onClick={() => setNotes([...sampleNotifications])}
              sx={{ 
                backgroundColor: teal[50],
                '&:hover': { backgroundColor: teal[100] }
              }}
            >
              <Refresh sx={{ color: teal[600] }} />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={selectedType}
          onChange={(e, newValue) => setSelectedType(newValue)}
          sx={{ 
            mb: 2,
            '& .MuiTab-root': { color: teal[600] },
            '& .Mui-selected': { color: teal[800] },
            '& .MuiTabs-indicator': { backgroundColor: teal[500] }
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Success" value="success" />
          <Tab label="Warnings" value="warning" />
          <Tab label="Errors" value="error" />
          <Tab label="Info" value="info" />
        </Tabs>

        <List
          subheader={
            <ListSubheader sx={{ 
              backgroundColor: teal[50],
              borderRadius: 2,
              color: teal[800],
              fontWeight: 'bold'
            }}>
              {filteredNotes.length} notifications found
            </ListSubheader>
          }
        >
          {paginatedNotifications.map((note, index) => (
            <Grow key={note.id} in={true} timeout={(index + 1) * 150}>
              <div>
                <ListItem
                  sx={{
                    bgcolor: note.read ? 'white' : teal[50],
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: `0 4px 16px ${teal[100]}`
                    }
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: notificationConfig[note.type].color,
                    boxShadow: `0 4px 12px ${notificationConfig[note.type].color}80`
                  }}>
                    {notificationConfig[note.type].icon}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" sx={{ color: teal[800] }}>
                          {note.message}
                        </Typography>
                        {!note.read && (
                          <Chip 
                            label="New" 
                            size="small" 
                            sx={{ 
                              backgroundColor: teal[100],
                              color: teal[800],
                              fontWeight: 'bold'
                            }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={note.date}
                    secondaryTypographyProps={{ color: teal[600] }}
                    sx={{ ml: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!note.read && (
                      <IconButton 
                        onClick={() => handleMarkRead(note.id)}
                        sx={{
                          '&:hover': { backgroundColor: teal[100] }
                        }}
                      >
                        <MarkEmailRead sx={{ color: teal[600] }} />
                      </IconButton>
                    )}
                    <IconButton 
                      onClick={() => handleDelete(note.id)}
                      sx={{
                        '&:hover': { backgroundColor: teal[100] }
                      }}
                    >
                      <Delete sx={{ color: teal[600] }} />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider variant="inset" component="li" sx={{ borderColor: teal[100] }} />
              </div>
            </Grow>
          ))}
        </List>

        {/* Pagination Component */}
        {filteredNotes.length > 0 && (
          <TablePagination
            component="div"
            count={filteredNotes.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              borderTop: `1px solid ${teal[100]}`,
              mt: 2,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: teal[800],
                fontWeight: 500
              },
              '& .MuiTablePagination-select': {
                color: teal[600]
              },
              '& .MuiIconButton-root': {
                color: teal[600],
                '&:hover': {
                  backgroundColor: `${teal[100]}40`
                },
                '&.Mui-disabled': {
                  color: teal[300]
                }
              }
            }}
          />
        )}

        {filteredNotes.length === 0 && !loading && (
          <Fade in={true}>
            <Typography variant="body1" sx={{ 
              p: 3, 
              textAlign: 'center',
              color: teal[600]
            }}>
              No notifications found
            </Typography>
          </Fade>
        )}
      </Paper>
    </Slide>
  );
}