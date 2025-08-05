import { forwardRef } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import FormField from './FormField';

export interface TextInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<TextFieldProps, 'name' | 'control' | 'error'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  helperText?: string;
  showFormField?: boolean;
  error?: string | boolean;
  required?: boolean;
}

// Generic TextInput component that can work with or without react-hook-form
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      helperText,
      showFormField = true,
      error,
      required,
      ...textFieldProps
    },
    ref
  ) => {
    // If control is provided, use Controller for react-hook-form integration
    if (control) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => {
            const fieldError = fieldState.error?.message;

            if (showFormField) {
              return (
                <FormField
                  label={label}
                  error={fieldError}
                  required={required}
                  helperText={helperText}
                  id={name}
                >
                  <TextField
                    {...field}
                    {...textFieldProps}
                    ref={ref}
                    id={name}
                    error={!!fieldError}
                    fullWidth
                    variant='outlined'
                    size='medium'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: fieldError
                            ? 'error.main'
                            : 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: fieldError
                            ? 'error.main'
                            : 'primary.main',
                        },
                      },
                    }}
                  />
                </FormField>
              );
            }

            return (
              <TextField
                {...field}
                {...textFieldProps}
                ref={ref}
                id={name}
                label={label}
                error={!!fieldError}
                helperText={fieldError || helperText}
                required={required}
                fullWidth
                variant='outlined'
                size='medium'
              />
            );
          }}
        />
      );
    }

    // Standalone usage without react-hook-form
    if (showFormField) {
      return (
        <FormField
          label={label}
          error={error ? String(error) : undefined}
          required={required}
          helperText={helperText}
          id={name}
        >
          <TextField
            {...textFieldProps}
            ref={ref}
            id={name}
            name={name}
            error={!!error}
            fullWidth
            variant='outlined'
            size='medium'
          />
        </FormField>
      );
    }

    return (
      <TextField
        {...textFieldProps}
        ref={ref}
        id={name}
        name={name}
        label={label}
        error={!!error}
        helperText={error ? String(error) : helperText}
        required={required}
        fullWidth
        variant='outlined'
        size='medium'
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
