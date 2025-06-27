import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  LinearProgress,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grow,
  Slide,
  Fade
} from '@mui/material';
import {
  PersonAdd,
  Description,
  History,
  Notifications,
  Security,
  Work,
  Payment,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { fetchDashboard, fetchProfile } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Teal color definitions
const tealPalette = {
  light: '#e0f2f1',
  main: '#009688',
  dark: '#00695c',
  contrastText: '#ffffff',
};

const StatCard = ({ title, value, icon, color }) => (
  <Grow in={true} timeout={800}>
    <Card sx={{ 
      height: '100%', 
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0px 6px 15px rgba(0, 150, 136, 0.2)'
      }
    }}>
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        backgroundColor: tealPalette.light,
        borderRadius: 2
      }}>
        <Avatar sx={{ 
          bgcolor: tealPalette.main, 
          color: 'white',
          width: 48,
          height: 48
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 28 } })}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4" color={tealPalette.main}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Grow>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const [dashboard, profile] = await Promise.all([
        fetchDashboard(),
        fetchProfile()
      ]);
      setDashboardData(dashboard);
      setProfile(profile);
    };
    loadData();
  }, []);

  if (!dashboardData || !profile) return <LinearProgress color="secondary" />;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Slide in={true} direction="right" timeout={500}>
            <Card sx={{ 
              mb: 3, 
              borderRadius: 4,
              boxShadow: '0px 4px 20px rgba(0, 150, 136, 0.1)'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56,
                    bgcolor: tealPalette.main,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    boxShadow: '0px 4px 15px rgba(0, 150, 136, 0.3)'
                  }}>
                    {user?.fullName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" color={tealPalette.main}>
                      Welcome, {user?.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      StaffProof ID: {profile.staffProofId}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color={tealPalette.main}>
                    Verification Status
                  </Typography>
                  <Chip
                    label={profile.verificationStatus || 'Pending'}
                    color={
                      profile.verificationStatus === 'Verified' ? 'success' :
                      profile.verificationStatus === 'Pending' ? 'warning' : 'error'
                    }
                    icon={<CheckCircle fontSize="small" />}
                    sx={{ 
                      px: 2,
                      fontSize: '0.9rem',
                      '& .MuiChip-icon': { color: 'white !important' }
                    }}
                  />
                </Box>

                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<Description />}
                    sx={{
                      bgcolor: tealPalette.main,
                      '&:hover': { bgcolor: tealPalette.dark },
                      px: 3,
                      borderRadius: 2
                    }}
                  >
                    Upload Documents
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: tealPalette.main,
                      color: tealPalette.main,
                      px: 3,
                      borderRadius: 2,
                      '&:hover': { bgcolor: tealPalette.light }
                    }}
                    startIcon={<Work />}
                  >
                    Add Job Record
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Payment />}
                    sx={{
                      px: 3,
                      borderRadius: 2
                    }}
                  >
                    Buy Add-ons
                  </Button>
                </Box>

                <Divider sx={{ 
                  my: 3, 
                  borderColor: tealPalette.light,
                  borderWidth: 1 
                }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Total Employees"
                      value={dashboardData.totalEmployees}
                      icon={<PersonAdd />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Pending Approvals"
                      value={dashboardData.pendingApprovals}
                      icon={<Warning />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Messages"
                      value={dashboardData.messages}
                      icon={<Notifications />}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>

          <Fade in={true} timeout={1000}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color={tealPalette.main}>
                  Recent Activity
                </Typography>
                <List dense>
                  {dashboardData.recentActivities?.map((activity) => (
                    <ListItem 
                      key={activity.id}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: tealPalette.light,
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <History color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.date}
                        primaryTypographyProps={{ color: 'textPrimary' }}
                        secondaryTypographyProps={{ color: 'textSecondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Slide in={true} direction="left" timeout={700}>
            <Card sx={{ 
              mb: 3, 
              borderRadius: 4,
              bgcolor: tealPalette.light
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color={tealPalette.dark}>
                  Security Status
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Security sx={{ color: tealPalette.dark, fontSize: 32 }} />
                  <Typography variant="body1" color={tealPalette.dark}>
                    {profile.securityLevel || 'Basic Security'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Slide>

          <Fade in={true} timeout={1200}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color={tealPalette.main}>
                  System Alerts
                </Typography>
                <List dense>
                  {dashboardData.notifications?.map((alert) => (
                    <ListItem 
                      key={alert.id}
                      sx={{
                        borderLeft: `4px solid ${alert.type === 'warning' ? '#ff9800' : '#f44336'}`,
                        mb: 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <ListItemIcon>
                        {alert.type === 'warning' ? (
                          <Warning color="warning" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.message}
                        secondary={alert.date}
                        primaryTypographyProps={{ color: 'textPrimary' }}
                        secondaryTypographyProps={{ color: 'textSecondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}