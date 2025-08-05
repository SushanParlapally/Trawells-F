import { forwardRef } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  type RadioGroupProps,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import FormField from './FormField';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<RadioGroupProps, 'name' | 'control'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  options: RadioOption[];
  helperText?: string;
  showFormField?: boolean;
  row?: boolean;
  error?: string;
  required?: boolean;
}

export const RadioGroupInput = forwardRef<
  HTMLDivElement,
  RadioGroupInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      options,
      helperText,
      showFormField = true,
      row = false,
      error,
      required,
      ...radioGroupProps
    },
    ref
  ) => {
    const radioGroupElement = (field?: unknown, fieldError?: string) => (
      <FormControl component='fieldset' error={!!fieldError} fullWidth>
        {label && !showFormField && (
          <FormLabel component='legend' required={required}>
            {label}
          </FormLabel>
        )}
        <RadioGroup
          {...(field || {})}
          {...radioGroupProps}
          ref={ref}
          name={name}
          row={row}
          sx={{ mt: showFormField ? 0 : 1, ...radioGroupProps.sx }}
        >
          {options.map(option => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled}
            />
          ))}
        </RadioGroup>
        {!showFormField && (fieldError || helperText) && (
          <FormHelperText>{fieldError || helperText}</FormHelperText>
        )}
      </FormControl>
    );

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
                  {radioGroupElement(field, fieldError)}
                </FormField>
              );
            }

            return radioGroupElement(field, fieldError);
          }}
        />
      );
    }

    // Standalone usage without react-hook-form
    if (showFormField) {
      return (
        <FormField
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          id={name}
        >
          {radioGroupElement(undefined, error)}
        </FormField>
      );
    }

    return radioGroupElement(undefined, error);
  }
);

RadioGroupInput.displayName = 'RadioGroupInput';

export default RadioGroupInput;
