import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Fade,
  Grow,
  Alert,
  useTheme,
  FormControl,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { teal } from "@mui/material/colors";
import { fetchAccessRequests, approveAccessRequest, denyAccessRequest } from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

// Custom Status Badge component
const StatusBadge = ({ status }) => {
  const theme = useTheme();

  const statusStyles = {
    Pending: {
      bgcolor: theme.palette.warning.light,
      color: theme.palette.warning.dark,
      icon: <PendingActionsIcon fontSize="small" />,
    },
    Approved: {
      bgcolor: theme.palette.success.light,
      color: theme.palette.success.dark,
      icon: <CheckCircleOutlineIcon fontSize="small" />,
    },
    Denied: {
      bgcolor: theme.palette.error.light,
      color: theme.palette.error.dark,
      icon: <CancelIcon fontSize="small" />,
    },
  };

  const style = statusStyles[status] || {};

  return (
    <Chip
      label={status}
      size="small"
      icon={style.icon}
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: "medium",
        borderRadius: 1,
        px: 1,
      }}
    />
  );
};

const AccessRequest = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const itemsPerPage = 5;

  const { user } = useContext(UserContext);

  // Teal color palette
  const tealColors = {
    light: teal[50],
    main: teal[500],
    dark: teal[700],
    contrast: "#fff",
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAccessRequests({
        page,
        limit: itemsPerPage,
        search,
        status: statusFilter,
        documentType: typeFilter
      });
      
      setLogs(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalRequests(response.pagination?.total || 0);
      
    } catch (err) {
      console.error('Error fetching access requests:', err);
      setError(err.response?.data?.message || 'Failed to load access request logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, page, search, statusFilter, typeFilter]);

  const handleAction = async (action, id, firstName, lastName, documentType) => {
    setLoading(true);
    setError(null);
    try {
      if (action === "approve") {
        await approveAccessRequest(id, { approved: true });
        alert(`Approved access request for ${firstName} ${lastName}'s ${documentType}`);
      } else if (action === "deny") {
        await denyAccessRequest(id, { denied: true });
        alert(`Denied access request for ${firstName} ${lastName}'s ${documentType}`);
      }
      await loadData();
    } catch (err) {
      console.error(`Error ${action}ing access request:`, err);
      setError(`Failed to ${action} access request for ${firstName} ${lastName}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <CircularProgress sx={{ color: '#008080' }} />
            <span className="ml-3 text-teal-600">Loading access requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={true} timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: tealColors.dark,
                fontWeight: 700,
                mb: 1,
              }}
            >
              Access Request Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and approve document access requests from employers
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Grow in={true} timeout={600}>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by employee or employer name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: tealColors.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: tealColors.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: tealColors.main,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.light,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.main,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.main,
                        },
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Denied">Denied</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.light,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.main,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: tealColors.main,
                        },
                      }}
                    >
                      <MenuItem value="">All Document Types</MenuItem>
                      <MenuItem value="Resume">Resume</MenuItem>
                      <MenuItem value="Aadhaar">Aadhaar</MenuItem>
                      <MenuItem value="Payslip">Payslip</MenuItem>
                      <MenuItem value="Experience Letter">Experience Letter</MenuItem>
                      <MenuItem value="Educational Certificate">Educational Certificate</MenuItem>
                      <MenuItem value="Passport">Passport</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grow>

          {/* Stats */}
          <Grow in={true} timeout={700}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    background: `linear-gradient(135deg, ${tealColors.light} 0%, ${tealColors.main}20 100%)`,
                  }}
                >
                  <Typography variant="h4" sx={{ color: tealColors.dark, fontWeight: 700 }}>
                    {totalRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    background: `linear-gradient(135deg, ${tealColors.light} 0%, ${tealColors.main}20 100%)`,
                  }}
                >
                  <Typography variant="h4" sx={{ color: "warning.main", fontWeight: 700 }}>
                    {logs.filter(log => log.status === "Pending").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    background: `linear-gradient(135deg, ${tealColors.light} 0%, ${tealColors.main}20 100%)`,
                  }}
                >
                  <Typography variant="h4" sx={{ color: "success.main", fontWeight: 700 }}>
                    {logs.filter(log => log.status === "Approved").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    background: `linear-gradient(135deg, ${tealColors.light} 0%, ${tealColors.main}20 100%)`,
                  }}
                >
                  <Typography variant="h4" sx={{ color: "error.main", fontWeight: 700 }}>
                    {logs.filter(log => log.status === "Denied").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Denied
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grow>

          {/* Table */}
          <Grow in={true} timeout={800}>
            <Paper
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: tealColors.light }}>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Employer
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Document Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Request Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: tealColors.dark }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow
                        key={log.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: tealColors.light + "20",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.employee_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.employer_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.document_type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(log.request_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={log.status} />
                        </TableCell>
                        <TableCell>
                          {log.status === "Pending" && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  handleAction("approve", log.id, log.first_name, log.last_name, log.document_type)
                                }
                                disabled={loading}
                                sx={{
                                  backgroundColor: "success.main",
                                  "&:hover": {
                                    backgroundColor: "success.dark",
                                  },
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() =>
                                  handleAction("deny", log.id, log.first_name, log.last_name, log.document_type)
                                }
                                disabled={loading}
                                sx={{
                                  backgroundColor: "error.main",
                                  "&:hover": {
                                    backgroundColor: "error.dark",
                                  },
                                }}
                              >
                                Deny
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    p: 2,
                    borderTop: `1px solid ${tealColors.light}`,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, newPage) => setPage(newPage)}
                    color="primary"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: tealColors.dark,
                      },
                      "& .Mui-selected": {
                        backgroundColor: tealColors.main,
                        color: "white",
                        "&:hover": {
                          backgroundColor: tealColors.dark,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grow>
        </Box>
      </Fade>
    </Container>
  );
};

export default AccessRequest;
