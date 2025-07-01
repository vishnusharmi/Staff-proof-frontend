import React, { useState, useEffect } from "react";
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

// Static data to simulate API response
const staticLogs = [
  {
    id: 1,
    employee_name: "John Doe",
    employer_name: "Acme Corp",
    document_type: "Resume",
    request_date: "2025-05-20T10:00:00Z",
    status: "Pending",
  },
  {
    id: 2,
    employee_name: "Jane Smith",
    employer_name: "Tech Solutions",
    document_type: "Aadhaar",
    request_date: "2025-05-19T14:30:00Z",
    status: "Approved",
  },
  {
    id: 3,
    employee_name: "Alice Johnson",
    employer_name: "Global Inc",
    document_type: "Payslip",
    request_date: "2025-05-18T09:15:00Z",
    status: "Denied",
  },
  {
    id: 4,
    employee_name: "Bob Brown",
    employer_name: "Future Tech",
    document_type: "Experience Letter",
    request_date: "2025-05-17T16:45:00Z",
    status: "Pending",
  },
  {
    id: 5,
    employee_name: "Emma Davis",
    employer_name: "Innovate Ltd",
    document_type: "Educational Certificate",
    request_date: "2025-05-16T12:20:00Z",
    status: "Approved",
  },
  {
    id: 6,
    employee_name: "Michael Wilson",
    employer_name: "Star Enterprises",
    document_type: "Passport",
    request_date: "2025-05-15T11:10:00Z",
    status: "Pending",
  },
];

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
  const itemsPerPage = 5;

  // Teal color palette
  const tealColors = {
    light: teal[50],
    main: teal[500],
    dark: teal[700],
    contrast: "#fff",
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLogs(staticLogs);
    } catch (err) {
      setError("Failed to load access request logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, typeFilter]);

  const handleAction = async (action, id, employeeName, documentType) => {
    setLoading(true);
    setError(null);
    try {
      if (action === "approve") {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        alert(`Approved access request for ${employeeName}'s ${documentType}`);
      } else if (action === "deny") {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        alert(`Denied access request for ${employeeName}'s ${documentType}`);
      }
      await loadData();
    } catch (err) {
      setError(`Failed to ${action} access request for ${employeeName}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      log.employer_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter ? log.status === statusFilter : true;
    const matchesType = typeFilter ? log.document_type === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with animation */}
      <Fade in={true} timeout={800}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: tealColors.dark,
            mb: 4,
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Access Request Logs
        </Typography>
      </Fade>

      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={30} style={{ color: tealColors.main }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and filters section */}
      <Grow in={true} timeout={600}>
        <Paper
          elevation={2}
          sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: tealColors.light }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by employee or employer name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: tealColors.main }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} md={3.5}>
              <Select
                fullWidth
                variant="outlined"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  bgcolor: "white",
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Denied">Denied</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={6} md={3.5}>
              <Select
                fullWidth
                variant="outlined"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  bgcolor: "white",
                }}
              >
                <MenuItem value="">All Document Types</MenuItem>
                <MenuItem value="Resume">Resume</MenuItem>
                <MenuItem value="Aadhaar">Aadhaar</MenuItem>
                <MenuItem value="Payslip">Payslip</MenuItem>
                <MenuItem value="Experience Letter">Experience Letter</MenuItem>
                <MenuItem value="Educational Certificate">
                  Educational Certificate
                </MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Paper>
      </Grow>

      {/* Logs table */}
      <Grow in={filteredLogs.length > 0} timeout={700}>
        <Box>
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{ borderRadius: 3, mb: 4 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: tealColors.main }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Employer
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Document Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Request Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "white" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <Grow in={true} timeout={index * 100} key={log.id}>
                    <TableRow
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { bgcolor: tealColors.light },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {log.id}
                      </TableCell>
                      <TableCell>{log.employee_name}</TableCell>
                      <TableCell>{log.employer_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.document_type}
                          size="small"
                          sx={{
                            bgcolor: tealColors.light,
                            color: tealColors.dark,
                            fontWeight: "medium",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(log.request_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell align="right">
                        {log.status === "Pending" && (
                          <FormControl size="small" fullWidth>
                            <Select
                              displayEmpty
                              defaultValue=""
                              onChange={(e) => {
                                const action = e.target.value;
                                if (action === "approve" || action === "deny") {
                                  handleAction(
                                    action,
                                    log.id,
                                    log.employee_name,
                                    log.document_type
                                  );
                                }
                              }}
                              disabled={loading}
                              sx={{ minWidth: 150 }}
                            >
                              <MenuItem value="" disabled>
                                Select Action
                              </MenuItem>
                              <MenuItem value="approve">Approve</MenuItem>
                              <MenuItem value="deny">Deny</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Empty state */}
          {filteredLogs.length === 0 && !loading && (
            <Paper
              elevation={2}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                bgcolor: tealColors.light,
              }}
            >
              <Typography variant="h6" sx={{ color: tealColors.dark }}>
                No access request logs found
              </Typography>
            </Paper>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="body1" sx={{ color: tealColors.dark }}>
                Showing <b>{(page - 1) * itemsPerPage + 1}</b> to{" "}
                <b>{Math.min(page * itemsPerPage, filteredLogs.length)}</b> of{" "}
                <b>{filteredLogs.length}</b> logs
              </Typography>

              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: tealColors.dark,
                    "&.Mui-selected": {
                      bgcolor: tealColors.light,
                      fontWeight: "bold",
                    },
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Grow>
    </Container>
  );
};

export default AccessRequest;
