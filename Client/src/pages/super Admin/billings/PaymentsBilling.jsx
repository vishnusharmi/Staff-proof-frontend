import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  X,
  FileText,
  Undo2,
  BadgePercent,
} from "lucide-react";
import StatusBadge from "../billings/StatusBadge.jsx";
import {
  fetchBilling,
  generateInvoice,
  refundBilling,
  adjustBilling,
} from "../../../components/api/api.js";

// MUI Components
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  Slide,
  Fade,
  Grow,
  Zoom,
  IconButton,
  Tooltip,
} from "@mui/material";
import { teal } from "@mui/material/colors";

const PaymentsBilling = () => {
  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    type: "", // 'success', 'error', 'info'
    title: "",
    description: "",
  });

  // Show toast notification
  const showToast = (type, title, description) => {
    setToast({
      show: true,
      type,
      title,
      description,
    });
  };

  // State management
  const [billingData, setBillingData] = useState({
    records: [],
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    userType: "",
    serviceType: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    itemsPerPage: 5,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchBilling({
        ...filters,
        page: pagination.page,
        limit: pagination.itemsPerPage,
      });

      setBillingData({
        records: result.data,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      showToast(
        "error",
        "Data Error",
        err.message || "Failed to load billing records"
      );
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced filter handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadData();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, loadData]);

  const handleAction = async (action, payment) => {
    setActionLoading(payment.id);

    try {
      switch (action) {
        case "invoice":
          const { url } = await generateInvoice(payment.id);
          // Trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = `invoice_${payment.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast(
            "success",
            "Invoice Generated",
            `Invoice for ${payment.user} has been downloaded`
          );
          break;

        case "refund":
          if (
            window.confirm(
              `Refund $${payment.amount.toFixed(2)} to ${payment.user}?`
            )
          ) {
            await refundBilling(payment.id);
            showToast(
              "success",
              "Refund Processed",
              `Refunded $${payment.amount.toFixed(2)} to ${payment.user}`
            );
          }
          break;

        case "adjust":
          const newAmount = prompt(
            `New amount for ${payment.user} (Current: $${payment.amount.toFixed(
              2
            )}):`
          );
          if (newAmount && !isNaN(newAmount)) {
            const amount = parseFloat(newAmount);
            if (amount > 0) {
              await adjustBilling(payment.id, amount);
              showToast(
                "success",
                "Amount Adjusted",
                `Updated to $${amount.toFixed(2)} for ${payment.user}`
              );
            } else {
              throw new Error("Amount must be positive");
            }
          }
          break;
      }
      await loadData();
    } catch (err) {
      showToast(
        "error",
        `Action Failed: ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        err.message || `Failed to ${action} billing record`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Pagination controls
  const handlePageChange = (e, newPage) => {
    if (newPage > 0 && newPage <= billingData.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Toast Notification */}
      <Snackbar
        open={toast.show}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
      >
        <Alert
          severity={toast.type}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          sx={{
            width: "100%",
            backgroundColor:
              toast.type === "success"
                ? teal[700]
                : toast.type === "error"
                ? "error.main"
                : "info.main",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {toast.title}
          </Typography>
          <Typography variant="body2">{toast.description}</Typography>
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color={teal[800]}>
          Payments & Billing
        </Typography>
        <Button
          variant="outlined"
          onClick={loadData}
          disabled={loading}
          startIcon={<RefreshCw size={20} />}
          sx={{
            color: teal[700],
            borderColor: teal[300],
            "&:hover": {
              backgroundColor: teal[50],
              borderColor: teal[500],
            },
            "&:disabled": {
              opacity: 0.7,
            },
          }}
        >
          Refresh
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                color: teal[500],
                ml: 1,
              }}
            />
          )}
        </Button>
      </Box>

      {/* Filter Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${teal[100]}`,
          background: `linear-gradient(to bottom, ${teal[50]}, white)`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(6, 1fr)" },
            gap: 2,
          }}
        >
          {/* Search Input */}
          <TextField
            variant="outlined"
            placeholder="Search by user or payment ID"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={teal[500]} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: "white",
              },
            }}
            sx={{ gridColumn: { xs: "1", md: "span 2" } }}
          />

          {/* Status Filter */}
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            disabled={loading}
            displayEmpty
            inputProps={{ "aria-label": "Status" }}
            sx={{
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>

          {/* User Type Filter */}
          <Select
            value={filters.userType}
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            disabled={loading}
            displayEmpty
            inputProps={{ "aria-label": "User Type" }}
            sx={{
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <MenuItem value="">All User Types</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Employer">Employer</MenuItem>
          </Select>

          {/* Service Type Filter */}
          <Select
            value={filters.serviceType}
            onChange={(e) => handleFilterChange("serviceType", e.target.value)}
            disabled={loading}
            displayEmpty
            inputProps={{ "aria-label": "Service Type" }}
            sx={{
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <MenuItem value="">All Services</MenuItem>
            <MenuItem value="badge">Badge</MenuItem>
            <MenuItem value="highlight">Highlight</MenuItem>
            <MenuItem value="subscription">Subscription</MenuItem>
          </Select>

          {/* Date Filters */}
          <TextField
            type="date"
            variant="outlined"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: "white",
              },
            }}
          />
          <TextField
            type="date"
            variant="outlined"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: "white",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Data Table */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${teal[100]}`,
          boxShadow: `0 10px 20px -5px ${teal[100]}`,
        }}
      >
        <TableContainer>
          <Table>
            {/* Table Header */}
            <TableHead sx={{ backgroundColor: teal[50] }}>
              <TableRow>
                {[
                  "ID",
                  "User",
                  "Type",
                  "Service",
                  "Amount",
                  "Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: "bold",
                      color: teal[800],
                      borderBottom: `2px solid ${teal[200]}`,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: teal[500] }} />
                  </TableCell>
                </TableRow>
              ) : billingData.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No billing records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                billingData.records.map((payment, index) => (
                  <Grow in key={payment.id} timeout={(index + 1) * 150}>
                    <TableRow
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: teal[50] + "!important",
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: teal[25],
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {payment.id}
                      </TableCell>
                      <TableCell>{payment.user}</TableCell>
                      <TableCell>{payment.user_type}</TableCell>
                      <TableCell>{payment.service}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Generate Invoice" arrow>
                          <IconButton
                            color="primary"
                            onClick={() => handleAction("invoice", payment)}
                            disabled={
                              actionLoading === payment.id ||
                              payment.status !== "Completed"
                            }
                            sx={{
                              backgroundColor: teal[50],
                              "&:hover": { backgroundColor: teal[100] },
                            }}
                          >
                            <FileText size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Refund Payment" arrow>
                          <IconButton
                            color="success"
                            onClick={() => handleAction("refund", payment)}
                            disabled={
                              actionLoading === payment.id ||
                              payment.status !== "Completed"
                            }
                            sx={{
                              backgroundColor: teal[50],
                              "&:hover": { backgroundColor: teal[100] },
                            }}
                          >
                            <Undo2 size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Adjust Amount" arrow>
                          <IconButton
                            color="warning"
                            onClick={() => handleAction("adjust", payment)}
                            disabled={
                              actionLoading === payment.id ||
                              payment.status !== "Completed"
                            }
                            sx={{
                              backgroundColor: teal[50],
                              "&:hover": { backgroundColor: teal[100] },
                            }}
                          >
                            <BadgePercent size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && billingData.records.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              borderTop: `1px solid ${teal[100]}`,
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Showing {(pagination.page - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                pagination.page * pagination.itemsPerPage,
                billingData.total
              )}{" "}
              of {billingData.total} results
            </Typography>

            <Pagination
              count={billingData.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              shape="rounded"
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: teal[700],
                  borderColor: teal[300],
                },
                "& .Mui-selected": {
                  backgroundColor: teal[500] + "!important",
                  color: "white",
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentsBilling;
