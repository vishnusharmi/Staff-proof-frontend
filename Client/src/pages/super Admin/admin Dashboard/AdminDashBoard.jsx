import { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Users,
  CreditCard,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { keyframes } from "@emotion/react";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 150, 136, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(0, 150, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 150, 136, 0); }
`;

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

// Mock data for activities with pagination
const mockActivities = [
  {
    id: 1,
    type: "registration",
    user: "Rahul Sharma",
    userType: "Employee",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "payment",
    user: "TechCorp Solutions",
    userType: "Employer",
    amount: "₹12,000",
    time: "15 minutes ago",
    status: "success",
  },
  {
    id: 3,
    type: "verification",
    user: "Priya Patel",
    userType: "Employee",
    time: "45 minutes ago",
    status: "success",
  },
  {
    id: 4,
    type: "flag",
    user: "Divya Mehta",
    userType: "Employee",
    reason: "Document discrepancy",
    time: "1 hour ago",
    status: "warning",
  },
  {
    id: 5,
    type: "registration",
    user: "GlobalServe Inc.",
    userType: "Employer",
    time: "3 hours ago",
    status: "success",
  },
  {
    id: 6,
    type: "payment",
    user: "InnovateTech",
    userType: "Employer",
    amount: "₹8,500",
    time: "4 hours ago",
    status: "success",
  },
  {
    id: 7,
    type: "verification",
    user: "Amit Kumar",
    userType: "Employee",
    time: "5 hours ago",
    status: "success",
  },
  {
    id: 8,
    type: "flag",
    user: "Sneha Reddy",
    userType: "Employee",
    reason: "Background check failed",
    time: "6 hours ago",
    status: "error",
  },
  {
    id: 9,
    type: "registration",
    user: "FutureWorks",
    userType: "Employer",
    time: "8 hours ago",
    status: "success",
  },
  {
    id: 10,
    type: "payment",
    user: "VisionCorp",
    userType: "Employer",
    amount: "₹15,000",
    time: "10 hours ago",
    status: "success",
  },
];

const AdminDashBoard = () => {
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const itemsPerPage = 5;

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Filter activities based on search and filter
  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Paginate activities
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "registration":
        return <Users size={20} />;
      case "payment":
        return <CreditCard size={20} />;
      case "verification":
        return <FileCheck size={20} />;
      case "flag":
        return <AlertTriangle size={20} />;
      default:
        return <Users size={20} />;
    }
  };

  const stats = [
    { 
      title: "Total Employers", 
      value: 245, 
      icon: <Users />, 
      trend: "+12%",
      trendDirection: "up",
      color: tealColors[500]
    },
    { 
      title: "Total Employees", 
      value: 1568, 
      icon: <Users />, 
      trend: "+8%",
      trendDirection: "up",
      color: tealColors[600]
    },
    {
      title: "Verifications Pending",
      value: 42,
      icon: <AlertTriangle />,
      trend: "-5%",
      trendDirection: "down",
      color: "#f59e0b"
    },
    {
      title: "Verifications Completed",
      value: 1235,
      icon: <FileCheck />,
      trend: "+15%",
      trendDirection: "up",
      color: "#10b981"
    },
    {
      title: "Employee Revenue",
      value: "₹156,800",
      icon: <CreditCard />,
      trend: "+18%",
      trendDirection: "up",
      color: "#8b5cf6"
    },
    {
      title: "Employer Revenue",
      value: "₹245,000",
      icon: <CreditCard />,
      trend: "+22%",
      trendDirection: "up",
      color: "#06b6d4"
    },
    {
      title: "Blacklisted Employees",
      value: 23,
      icon: <AlertTriangle />,
      trend: "-2%",
      trendDirection: "down",
      color: "#ef4444"
    },
    {
      title: "Total Revenue",
      value: "₹401,800",
      icon: <CreditCard />,
      trend: "+20%",
      trendDirection: "up",
      color: "#059669",
      highlight: true
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tealColors[50]} 0%, ${tealColors[100]} 100%)`,
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: tealColors[900],
              fontWeight: 800,
              letterSpacing: "-0.5px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: "80px",
                height: "4px",
                background: `linear-gradient(90deg, ${tealColors[500]}, ${tealColors[300]})`,
                borderRadius: "2px",
              },
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: tealColors[700], mt: 1 }}>
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }}>
              <RefreshCw size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Options">
            <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }}>
              <Filter size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Paper
              elevation={loaded ? 3 : 0}
              sx={{
                p: 3,
                borderRadius: 4,
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: `linear-gradient(145deg, ${tealColors[50]}, #ffffff)`,
                boxShadow: `0 6px 20px ${tealColors[100]}, inset 0 0 0 1px rgba(255,255,255,0.7)`,
                position: "relative",
                overflow: "hidden",
                transform: loaded ? "translateY(0)" : "translateY(20px)",
                opacity: loaded ? 1 : 0,
                transitionDelay: `${index * 70}ms`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 30px ${tealColors[300]}, inset 0 0 0 1px rgba(255,255,255,0.7)`,
                },
                "&:before": stat.highlight
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: `linear-gradient(90deg, ${tealColors[500]}, ${tealColors[300]})`,
                      animation: `${pulse} 2s infinite`,
                    }
                  : {},
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: stat.color,
                  opacity: 0.2,
                  transform: "scale(1.8)",
                }}
              >
                {stat.icon}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: tealColors[700],
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                    fontSize: '0.875rem',
                  }}
                >
                  {stat.title}
                </Typography>
                <Chip
                  label={stat.trend}
                  size="small"
                  icon={stat.trendDirection === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  sx={{
                    bgcolor: stat.trendDirection === "up" ? '#dcfce7' : '#fef3c7',
                    color: stat.trendDirection === "up" ? '#166534' : '#92400e',
                    fontSize: '0.75rem',
                    height: '20px',
                  }}
                />
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: tealColors[900],
                  letterSpacing: "-0.5px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Activity Section with Search and Filter */}
      <Paper
        elevation={loaded ? 6 : 0}
        sx={{
          borderRadius: 4,
          boxShadow: `0 12px 40px ${tealColors[200]}`,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${tealColors[50]}, #ffffff)`,
          position: "relative",
          transform: loaded ? "translateY(0)" : "translateY(30px)",
          opacity: loaded ? 1 : 0,
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transitionDelay: "300ms",
        }}
      >
        {/* Header with Search and Filter */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(90deg, ${tealColors[50]}, ${tealColors[100]})`,
            borderBottom: `1px solid ${tealColors[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h5"
              sx={{
                color: tealColors[900],
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                "&:before": {
                  content: '""',
                  display: "inline-block",
                  width: "8px",
                  height: "24px",
                  background: tealColors[500],
                  borderRadius: "4px",
                  marginRight: "12px",
                },
              }}
            >
              Recent Activity
            </Typography>
            <Chip 
              label={`${filteredActivities.length} activities`} 
              size="small" 
              sx={{ bgcolor: tealColors[100], color: tealColors[700] }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: tealColors[600] }} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  border: `1px solid ${tealColors[200]}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '200px',
                  outline: 'none',
                  '&:focus': {
                    borderColor: tealColors[500],
                    boxShadow: `0 0 0 2px ${tealColors[100]}`,
                  }
                }}
              />
            </Box>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${tealColors[200]}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Activities</option>
              <option value="registration">Registrations</option>
              <option value="payment">Payments</option>
              <option value="verification">Verifications</option>
              <option value="flag">Flags</option>
            </select>
          </Box>
        </Box>

        {/* Activity List */}
        <List disablePadding>
          {paginatedActivities.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                py: 2.5,
                px: 3,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: "transparent",
                position: "relative",
                transform: loaded ? "translateX(0)" : "translateX(-20px)",
                opacity: loaded ? 1 : 0,
                transitionDelay: `${300 + index * 100}ms`,
                "&:hover": {
                  background: `linear-gradient(90deg, rgba(128, 203, 196, 0.1), transparent)`,
                  transform: "scale(1.02)",
                },
                "&:not(:last-child)": {
                  borderBottom: `1px solid ${tealColors[100]}`,
                },
                "&:before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "4px",
                  background: getStatusColor(activity.status),
                  transform: "scaleY(0)",
                  transformOrigin: "top",
                  transition: "transform 0.4s ease",
                  borderRadius: "0 4px 4px 0",
                },
                "&:hover:before": {
                  transform: "scaleY(1)",
                },
              }}
            >
              <ListItemAvatar
                sx={{
                  minWidth: 48,
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: tealColors[100],
                    color: tealColors[700],
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: tealColors[900],
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {activity.user}
                    <Chip
                      label={activity.userType}
                      size="small"
                      sx={{
                        bgcolor: tealColors[100],
                        color: tealColors[700],
                        fontSize: '0.75rem',
                        height: '20px',
                      }}
                    />
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: tealColors[700],
                      mt: 0.8,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: getStatusColor(activity.status),
                        mr: 1.2,
                        flexShrink: 0,
                      }}
                    />
                    {activity.type === "payment"
                      ? `Payment of ${activity.amount}`
                      : activity.type === "flag"
                      ? `Flagged: ${activity.reason}`
                      : activity.type === "verification"
                      ? "Profile verified"
                      : "New registration"}
                  </Typography>
                }
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: tealColors[600],
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    minWidth: "max-content",
                  }}
                >
                  {activity.time}
                </Typography>
                <IconButton size="small">
                  <MoreVertical size={16} />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "center",
              borderTop: `1px solid ${tealColors[100]}`,
              background: tealColors[50],
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: tealColors[700],
                  '&.Mui-selected': {
                    bgcolor: tealColors[500],
                    color: 'white',
                    '&:hover': {
                      bgcolor: tealColors[600],
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashBoard;
