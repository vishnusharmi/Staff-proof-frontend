import React, { useState, useEffect } from 'react';
import {
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Zoom
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  CreditCard,
  Receipt,
  Star
} from '@mui/icons-material';
import { fetchAddOns, purchaseAddOn } from "../../../components/api/api";

export default function AddOns() {
  const [addons, setAddons] = useState([
    {
      id: 'edit-profile',
      name: 'Edit Profile',
      description: 'Unlock the ability to edit your personal information (name, phone, DOB, etc.) after initial submission.',
      price: 499,
      features: ['Edit personal details', 'Admin review for changes', 'One-time purchase'],
      billingCycle: null
    },
    {
      id: 'verification-badge',
      name: 'Verification Badge',
      description: 'Stand out with a verified green badge on your StaffProof profile, showcasing your thoroughly verified documents and job records.',
      price: 999,
      features: ['Green verified badge', 'Enhanced profile visibility', 'Trusted by employers', 'One-time purchase'],
      billingCycle: null,
      featured: true
    }
  ]);
  const [selectedAddOn, setSelectedAddOn] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchasedAddOns, setPurchasedAddOns] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAddOns();
        const filteredData = data.filter(addOn => 
          addOn.id === 'edit-profile' || addOn.id === 'verification-badge'
        );
        setAddons(filteredData.length > 0 ? filteredData : addons);
      } catch (err) {
        setError('Failed to load add-ons');
      }
    };
    loadData();
  }, []);

  const handlePurchase = async (addOn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await purchaseAddOn(addOn.id);
      setInvoice(result.invoice);
      setPurchasedAddOns(prev => [...prev, addOn.id]);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      position: 'relative',
      borderRadius: 4,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      background: '#1a1a2e',
      overflow: 'hidden'
    }}>
      {loading && <LinearProgress sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        '& .MuiLinearProgress-bar': { backgroundColor: '#00d4aa' }
      }} />}
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          color: '#ffffff',
          fontWeight: 700,
          mb: 1
        }}>
          Unlock Premium Features
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#ffffff',
          maxWidth: 500,
          mx: 'auto',
          opacity: 0.8
        }}>
          Elevate your StaffProof profile with exclusive add-ons designed to boost your visibility and credibility.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 3,
          border: '1px solid #ff4d4f',
          bgcolor: '#16213e',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          {error}
        </Alert>
      )}

      <Grid 
        container 
        spacing={2} 
        sx={{ 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          justifyContent: addons.length <= 2 ? 'center' : 'flex-start',
          '&::-webkit-scrollbar': {
            height: 6
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#00d4aa',
            borderRadius: 3
          }
        }}
      >
        {addons.map((addOn) => (
          <Grid item xs={6} key={addOn.id} sx={{ minWidth: 250 }}>
            <Zoom in timeout={300}>
              <Card sx={{ 
                height: '100%',
                border: purchasedAddOns.includes(addOn.id) ? `2px solid #00d4aa` : 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                },
                borderRadius: 3,
                background: '#16213e'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1.5}>
                    {addOn.featured && (
                      <Chip
                        label="Featured"
                        icon={<Star fontSize="small" />}
                        sx={{ 
                          mr: 1,
                          bgcolor: '#00d4aa',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          '& .MuiChip-icon': { color: '#ffffff' }
                        }}
                        size="small"
                      />
                    )}
                    <Typography variant="h6" sx={{ 
                      flexGrow: 1,
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {addOn.name}
                    </Typography>
                    {purchasedAddOns.includes(addOn.id) && (
                      <CheckCircle sx={{ color: '#00d4aa' }} />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ 
                    mb: 2,
                    color: '#ffffff',
                    lineHeight: 1.5,
                    fontSize: '0.85rem',
                    opacity: 0.9
                  }}>
                    {addOn.description}
                  </Typography>

                  <List dense sx={{ mb: 2 }}>
                    {addOn.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle fontSize="small" sx={{ color: '#00d4aa', fontSize: '1rem' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ color: '#ffffff', fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>
                      ₹{addOn.price}
                      {addOn.billingCycle && (
                        <Typography component="span" variant="body2" sx={{ color: '#ffffff', fontSize: '0.75rem' }}>
                          /{addOn.billingCycle}
                        </Typography>
                      )}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={purchasedAddOns.includes(addOn.id) ? 
                        <CheckCircle /> : 
                        <AttachMoney sx={{ color: '#ffffff' }} />}
                      onClick={() => purchasedAddOns.includes(addOn.id) ? null : setSelectedAddOn(addOn)}
                      disabled={purchasedAddOns.includes(addOn.id)}
                      sx={{
                        bgcolor: purchasedAddOns.includes(addOn.id) ? '#16213e' : '#00d4aa',
                        color: '#ffffff',
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        fontSize: '0.8rem',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: purchasedAddOns.includes(addOn.id) ? '#16213e' : '#00b594',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {purchasedAddOns.includes(addOn.id) ? 'Purchased' : 'Buy Now'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={!!selectedAddOn} 
        onClose={() => setSelectedAddOn(null)}
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', bgcolor: '#16213e' } }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#1a1a2e',
          color: '#ffffff',
          fontWeight: 700
        }}>
          Confirm Purchase
        </DialogTitle>
        <DialogContent sx={{ p: 2, color: '#ffffff' }}>
          {selectedAddOn && (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
                  {selectedAddOn.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff', mt: 1, fontSize: '0.85rem', opacity: 0.9 }}>
                  {selectedAddOn.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                  Price:
                </Typography>
                <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
                  ₹{selectedAddOn.price}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                  Billing Cycle:
                </Typography>
                <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedAddOn.billingCycle || 'One-time'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ 
                  my: 1,
                  borderColor: '#2a2a3e'
                }} />
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                  Payment Method
                </Typography>
                <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                  <CreditCard sx={{ color: '#00d4aa' }} />
                  <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '0.85rem' }}>
                    Credit/Debit Card
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            onClick={() => setSelectedAddOn(null)}
            sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<AttachMoney />}
            onClick={() => handlePurchase(selectedAddOn)}
            sx={{
              bgcolor: '#00d4aa',
              color: '#ffffff',
              fontWeight: 600,
              px: 2,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#00b594', transform: 'scale(1.05)' },
              transition: 'all 0.2s ease'
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={!!invoice} 
        onClose={() => setInvoice(null)} 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', bgcolor: '#16213e' } }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#1a1a2e',
          color: '#ffffff',
          fontWeight: 700
        }}>
          Purchase Invoice
        </DialogTitle>
        <DialogContent sx={{ p: 2, color: '#ffffff' }}>
          {invoice && (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
                  Thank you for your purchase!
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                  Invoice Number:
                </Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '0.85rem' }}>{invoice.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                  Date:
                </Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '0.85rem' }}>
                  {new Date(invoice.date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ 
                  my: 1,
                  borderColor: '#2a2a3e'
                }} />
              </Grid>
              <Grid item xs={12}>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary={invoice.item} 
                      secondary={`Purchase Date: ${new Date(invoice.date).toLocaleString()}`}
                      primaryTypographyProps={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ color: '#ffffff', fontSize: '0.75rem', opacity: 0.8 }}
                    />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
                      ₹{invoice.amount}
                    </Typography>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#1a1a2e', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  <Typography variant="body2">
                    {invoice.features.map((feature, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                        <CheckCircle fontSize="small" sx={{ color: '#00d4aa', fontSize: '1rem' }} />
                        <span style={{ color: '#ffffff', fontSize: '0.8rem' }}>{feature}</span>
                      </Box>
                    ))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button 
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => {/* Implement PDF download */}}
            sx={{
              bgcolor: '#00d4aa',
              color: '#ffffff',
              fontWeight: 600,
              px: 2,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#00b594' }
            }}
          >
            Download Invoice
          </Button>
          <Button 
            onClick={() => setInvoice(null)}
            sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}