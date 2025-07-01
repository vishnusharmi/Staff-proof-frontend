import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  useTheme,
  Fade,
  Grow,
  Slide,
  Zoom,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const theme = useTheme();

  // Teal color palette
  const tealColors = {
    50: "#e0f2f1",
    100: "#b2dfdb",
    200: "#80cbc4",
    300: "#4db6ac",
    500: "#009688",
    600: "#00897b",
    700: "#00796b",
    800: "#00695c",
    900: "#004d40",
  };

  // Static dummy data
  const staticEmployees = [
    {
      id: "SP001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      status: "Pending",
    },
    {
      id: "SP002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-234-5678",
      status: "Verified",
    },
    {
      id: "SP003",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+1-555-345-6789",
      status: "Rejected",
    },
    {
      id: "SP004",
      name: "Bob Brown",
      email: "bob.brown@example.com",
      phone: "+1-555-456-7890",
      status: "Pending",
    },
    {
      id: "SP005",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      phone: "+1-555-567-8901",
      status: "Verified",
    },
    {
      id: "SP006",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      phone: "+1-555-678-9012",
      status: "Pending",
    },
  ];

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setEmployees(staticEmployees);
      } catch (error) {
        setError("Error fetching employees");
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase()) ||
        employee.phone.includes(search) ||
        employee.id.includes(search)) &&
      (statusFilter === "" || employee.status === statusFilter)
  );

  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleVerify = async (id, name) => {
    setLoading(true);
    try {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, status: "Verified" } : emp
        )
      );
      alert(`Verified ${name}`);
    } catch (error) {
      setError(`Error verifying employee ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id, name) => {
    setLoading(true);
    try {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, status: "Rejected" } : emp
        )
      );
      alert(`Rejected ${name}`);
    } catch (error) {
      setError(`Error rejecting employee ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 600,
        borderRadius: 1,
        ...(status === "Verified" && {
          bgcolor: `${tealColors[100]} !important`,
          color: tealColors[800],
          boxShadow: `0 2px 4px ${tealColors[100]}`,
        }),
        ...(status === "Pending" && {
          bgcolor: `${theme.palette.warning.light} !important`,
          color: theme.palette.warning.dark,
          boxShadow: `0 2px 4px ${theme.palette.warning.light}`,
        }),
        ...(status === "Rejected" && {
          bgcolor: `${theme.palette.error.light} !important`,
          color: theme.palette.error.dark,
          boxShadow: `0 2px 4px ${theme.palette.error.light}`,
        }),
      }}
    />
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tealColors[50]} 0%, ${tealColors[100]} 100%)`,
        transition: "all 0.5s ease",
      }}
    >
      <Fade in={!loading} timeout={500}>
        <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: tealColors[900],
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: 80,
                  height: 4,
                  background: `linear-gradient(90deg, ${tealColors[500]}, ${tealColors[300]})`,
                  borderRadius: 2,
                },
              }}
            >
              Employee Management
            </Typography>

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: tealColors[700],
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  boxShadow: `0 4px 12px ${tealColors[100]}`,
                }}
              >
                <CircularProgress
                  size={20}
                  sx={{ mr: 1.5, color: tealColors[500] }}
                />
                <Typography variant="body2">Processing...</Typography>
              </Box>
            )}
          </Box>

          {error && (
            <Slide in={Boolean(error)} direction="down">
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Filters */}
          <Grow in={!loading} timeout={600}>
            <Paper
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                boxShadow: `0 8px 24px ${tealColors[100]}`,
                background: `linear-gradient(145deg, ${tealColors[50]}, #ffffff)`,
                border: `1px solid ${tealColors[200]}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search by name, email, phone, or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    maxWidth: 500,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: tealColors[200],
                      },
                      "&:hover fieldset": {
                        borderColor: tealColors[300],
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: tealColors[500],
                        boxShadow: `0 0 0 2px ${tealColors[200]}`,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color={tealColors[500]} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{
                    minWidth: 180,
                    borderRadius: 2,
                    bgcolor: "white",
                    "& .MuiSelect-select": {
                      py: 1.2,
                    },
                    "& fieldset": {
                      borderColor: tealColors[200],
                    },
                    "&:hover fieldset": {
                      borderColor: tealColors[300],
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: tealColors[500],
                      boxShadow: `0 0 0 2px ${tealColors[200]}`,
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>

                {/* <Button
                  variant="contained"
                  onClick={() => setPage(1)}
                  sx={{
                    bgcolor: tealColors[600],
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${tealColors[200]}`,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: tealColors[700],
                      transform: "translateY(-2px)",
                      boxShadow: `0 6px 16px ${tealColors[300]}`,
                    },
                  }}
                >
                  Apply Filters
                </Button> */}
              </Box>
            </Paper>
          </Grow>

          {/* Table */}
          <Slide in={!loading} direction="up" timeout={700}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 12px 40px ${tealColors[200]}`,
                bgcolor: "background.paper",
                mb: 4,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: tealColors[50] }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        StaffProof ID
                      </TableCell>
                      <TableCell
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        Email
                      </TableCell>
                      <TableCell
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        Phone
                      </TableCell>
                      <TableCell
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: tealColors[800],
                          fontWeight: 700,
                          borderBottom: `2px solid ${tealColors[100]}`,
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 4, color: tealColors[600] }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              py: 4,
                            }}
                          >
                            <Search size={48} color={tealColors[400]} />
                            <Typography
                              variant="body1"
                              sx={{ mt: 2, fontWeight: 500 }}
                            >
                              No employees found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: tealColors[600] }}
                            >
                              Try adjusting your search or filter
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEmployees.map((employee, index) => (
                        <Zoom
                          key={employee.id}
                          in={!loading}
                          style={{ transitionDelay: `${index * 100}ms` }}
                        >
                          <TableRow
                            sx={{
                              "&:hover": {
                                bgcolor: tealColors[50],
                                transform: "scale(1.01)",
                                boxShadow: `0 4px 8px ${tealColors[100]}`,
                              },
                              transition: "all 0.3s ease",
                              position: "relative",
                              "&:after": {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: 0,
                                height: "100%",
                                width: 4,
                                bgcolor: tealColors[500],
                                transform: "scaleY(0)",
                                transformOrigin: "top",
                                transition: "transform 0.4s ease",
                                borderRadius: "0 4px 4px 0",
                              },
                              "&:hover:after": {
                                transform: "scaleY(1)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{ fontWeight: 600, color: tealColors[900] }}
                            >
                              {employee.id}
                            </TableCell>
                            <TableCell sx={{ color: tealColors[800] }}>
                              {employee.name}
                            </TableCell>
                            <TableCell sx={{ color: tealColors[700] }}>
                              {employee.email}
                            </TableCell>
                            <TableCell sx={{ color: tealColors[700] }}>
                              {employee.phone}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={employee.status} />
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 1.5,
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Eye size={16} />}
                                  onClick={() =>
                                    // navigate(`/admin/employee/${employee.id}`)
                                    navigate("/admin/details")
                                  }
                                  sx={{
                                    color: tealColors[700],
                                    borderColor: tealColors[300],
                                    "&:hover": {
                                      bgcolor: tealColors[50],
                                      borderColor: tealColors[500],
                                    },
                                  }}
                                >
                                  View
                                </Button>
                                <select
                                  value={employee.status}
                                  disabled={employee.status !== "Pending"}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    if (newStatus === "Verified") {
                                      handleVerify(employee.id, employee.name);
                                    } else if (newStatus === "Rejected") {
                                      handleReject(employee.id, employee.name);
                                    }
                                  }}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "4px",
                                    borderColor: "#ccc",
                                    color:
                                      employee.status !== "Pending"
                                        ? "#999"
                                        : "#000",
                                    backgroundColor:
                                      employee.status !== "Pending"
                                        ? "#f2f2f2"
                                        : "#fff",
                                    cursor:
                                      employee.status !== "Pending"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                >
                                  <option value="Pending">Select</option>
                                  <option value="Verified">Verify</option>
                                  <option value="Rejected">Reject</option>
                                </select>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 3,
                  bgcolor: tealColors[50],
                  borderTop: `1px solid ${tealColors[100]}`,
                }}
              >
                <Typography variant="body2" sx={{ color: tealColors[700] }}>
                  Showing{" "}
                  {paginatedEmployees.length
                    ? (page - 1) * itemsPerPage + 1
                    : 0}{" "}
                  to {Math.min(page * itemsPerPage, filteredEmployees.length)}{" "}
                  of {filteredEmployees.length} results
                </Typography>

                <Pagination
                  count={Math.ceil(filteredEmployees.length / itemsPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: tealColors[700],
                      fontWeight: 500,
                      borderRadius: 1.5,
                      "&:hover": {
                        bgcolor: tealColors[100],
                      },
                    },
                    "& .MuiPaginationItem-page.Mui-selected": {
                      bgcolor: tealColors[500],
                      color: "white",
                      boxShadow: `0 2px 4px ${tealColors[200]}`,
                      "&:hover": {
                        bgcolor: tealColors[600],
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Fade>
    </Box>
  );
};

export default EmployeeManagement;
