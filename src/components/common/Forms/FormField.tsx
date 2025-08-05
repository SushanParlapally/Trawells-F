import React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  helperText,
  fullWidth = true,
  disabled = false,
  id,
  className,
}) => {
  const hasError = !!error;
  const displayHelperText = error || helperText;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={hasError}
      disabled={disabled}
      className={className}
      sx={{ mb: 2 }}
    >
      {label && (
        <FormLabel
          htmlFor={id}
          required={required}
          sx={{
            mb: 1,
            color: hasError ? 'error.main' : 'text.primary',
            fontWeight: 500,
            '&.Mui-focused': {
              color: hasError ? 'error.main' : 'primary.main',
            },
          }}
        >
          {label}
          {required && (
            <Typography
              component='span'
              color='error.main'
              sx={{ ml: 0.5 }}
              aria-label='required'
            >
              *
            </Typography>
          )}
        </FormLabel>
      )}
      <Box sx={{ position: 'relative' }}>{children}</Box>
      {displayHelperText && (
        <FormHelperText
          id={id ? `${id}-helper-text` : undefined}
          sx={{
            mt: 1,
            mx: 0,
            fontSize: '0.875rem',
            color: hasError ? 'error.main' : 'text.secondary',
          }}
        >
          {displayHelperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormField;
