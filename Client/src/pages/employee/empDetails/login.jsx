import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Box, Typography, FormControlLabel, Checkbox, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required()
});

const otpSchema = yup.object().shape({
  otp: yup.string().required().length(6, 'Must be 6 digits')
});

export default function Login() {
  const { login, verifyOtp, requiresOTP, otpCooldown, startOtpCountdown } = useAuth();
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState:{errors: loginErrors} } = useForm({
    resolver: yupResolver(schema)
  });
  
  const { register: otpRegister, handleSubmit: handleOtpSubmit, formState:{errors: otpErrors} } = useForm({
    resolver: yupResolver(otpSchema)
  });

  const handleLogin = async data => {
    try {
      setError('');
      const result = await login(data);
      if (!result?.requiresOTP) {
        nav('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleOtpSubmit = async ({ otp }) => {
    try {
      setError('');
      await verifyOtp(otp);
      nav('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={3}>
        <Typography variant="h5" mb={3} textAlign="center">
          StaffProof Login
        </Typography>

        {requiresOTP ? (
          <Box component="form" onSubmit={handleOtpSubmit(handleOtpSubmit)}>
            <TextField
              fullWidth
              label="OTP Code"
              margin="normal"
              {...otpRegister('otp')}
              error={!!otpErrors.otp}
              helperText={otpErrors.otp?.message}
              inputProps={{ maxLength: 6 }}
            />

            <Button 
              type="button"
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={startOtpCountdown}
              disabled={otpCooldown > 0}
            >
              Resend OTP {otpCooldown > 0 && `(${otpCooldown}s)`}
            </Button>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Verify OTP
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleLoginSubmit(handleLogin)}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...loginRegister('email')}
              error={!!loginErrors.email}
              helperText={loginErrors.email?.message}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              margin="normal"
              {...loginRegister('password')}
              error={!!loginErrors.password}
              helperText={loginErrors.password?.message}
            />

            <Grid container sx={{ mt: 1 }}>
              <Grid item xs>
                <FormControlLabel
                  control={<Checkbox checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />}
                  label="Show password"
                />
              </Grid>
              <Grid item>
                <Button 
                  component={Link}
                  to="#"
                  variant="text"
                  size="small"
                  onClick={() => login({ email: '', password: 'otp' })}
                >
                  Login with OTP
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Sign In
            </Button>
          </Box>
        )}

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Button component={Link} to="/register" variant="text" size="small">
            Create account
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
}