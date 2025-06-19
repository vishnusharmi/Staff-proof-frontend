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
  useTheme,
} from "@mui/material";
import { Users, CreditCard, FileCheck, AlertTriangle } from "lucide-react";
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

const AdminDashBoard = () => {
  const [loaded, setLoaded] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tealColors[50]} 0%, ${tealColors[100]} 100%)`,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Employers", value: 245, icon: <Users /> },
          { title: "Total Employees", value: 1568, icon: <Users /> },
          {
            title: "Verifications Pending",
            value: 42,
            icon: <AlertTriangle />,
          },
          {
            title: "Verifications Completed",
            value: 1235,
            icon: <FileCheck />,
          },
          {
            title: "Employee Revenue",
            value: "₹156,800",
            icon: <CreditCard />,
          },
          {
            title: "Employer Revenue",
            value: "₹245,000",
            icon: <CreditCard />,
          },
          {
            title: "Blacklisted Employees",
            value: 23,
            icon: <AlertTriangle />,
          },
          {
            title: "Total Revenue",
            value: "₹401,800",
            icon: <CreditCard />,
            highlight: true,
          },
        ].map((stat, index) => (
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
                  color: tealColors[600],
                  opacity: 0.2,
                  transform: "scale(1.8)",
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  color: tealColors[700],
                  mb: 1,
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                {stat.title}
              </Typography>
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
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${tealColors[100]} 0%, transparent 60%)`,
            opacity: 0.15,
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            p: 3,
            color: tealColors[900],
            fontWeight: 700,
            background: `linear-gradient(90deg, ${tealColors[50]}, ${tealColors[100]})`,
            borderBottom: `1px solid ${tealColors[100]}`,
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

        <List disablePadding>
          {[
            {
              id: 1,
              type: "registration",
              user: "Rahul Sharma",
              userType: "Employee",
              time: "2 minutes ago",
            },
            {
              id: 2,
              type: "payment",
              user: "TechCorp Solutions",
              userType: "Employer",
              amount: "₹12,000",
              time: "15 minutes ago",
            },
            {
              id: 3,
              type: "verification",
              user: "Priya Patel",
              userType: "Employee",
              time: "45 minutes ago",
            },
            {
              id: 4,
              type: "flag",
              user: "Divya Mehta",
              userType: "Employee",
              reason: "Document discrepancy",
              time: "1 hour ago",
            },
            {
              id: 5,
              type: "registration",
              user: "GlobalServe Inc.",
              userType: "Employer",
              time: "3 hours ago",
            },
          ].map((activity, index) => (
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
                  background: tealColors[500],
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
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: tealColors[100],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: tealColors[700],
                  }}
                >
                  {activity.type === "registration" && <Users />}
                  {activity.type === "payment" && <CreditCard />}
                  {activity.type === "verification" && <FileCheck />}
                  {activity.type === "flag" && <AlertTriangle />}
                </Box>
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
                    }}
                  >
                    {activity.user}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        color: tealColors[600],
                        ml: 1.5,
                        fontWeight: 500,
                        background: tealColors[100],
                        px: 1.2,
                        py: 0.2,
                        borderRadius: "4px",
                      }}
                    >
                      {activity.userType}
                    </Typography>
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
                        background: tealColors[500],
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
              <Typography
                variant="caption"
                sx={{
                  color: tealColors[600],
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  minWidth: "max-content",
                  ml: 2,
                }}
              >
                {activity.time}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AdminDashBoard;
