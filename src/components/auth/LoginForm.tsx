import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import type { LoginCredentials } from '../../types';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<LoginCredentials>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(credentials);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Container maxWidth='xs'>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          bgcolor: 'background.paper',
          width: '100%',
        }}
      >
        <Typography
          variant='h4'
          gutterBottom
          textAlign='center'
          fontWeight={600}
        >
          Welcome Back
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          textAlign='center'
          gutterBottom
        >
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: '100%' }}
        >
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            autoComplete='email'
            autoFocus
            value={credentials.email}
            onChange={e => handleInputChange('email', e.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type={showPassword ? 'text' : 'password'}
            id='password'
            autoComplete='current-password'
            value={credentials.password}
            onChange={e => handleInputChange('password', e.target.value)}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword(!showPassword)}
                    edge='end'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            size='large'
          >
            {loading ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;
