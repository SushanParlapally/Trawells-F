import { forwardRef } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import FormField from './FormField';

export interface DateInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<TextFieldProps, 'name' | 'control' | 'type' | 'error'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  helperText?: string;
  showFormField?: boolean;
  minDate?: string;
  maxDate?: string;
  dateType?: 'date' | 'datetime-local' | 'time';
  error?: string | boolean;
  required?: boolean;
}

export const DateInput = forwardRef<
  HTMLInputElement,
  DateInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      helperText,
      showFormField = true,
      minDate,
      maxDate,
      dateType = 'date',
      error,
      required,
      ...textFieldProps
    },
    ref
  ) => {
    // Format date value for input
    const formatDateValue = (value: unknown): string => {
      if (!value) return '';

      const date = value instanceof Date ? value : new Date(String(value));
      if (isNaN(date.getTime())) return '';

      switch (dateType) {
        case 'datetime-local':
          return date.toISOString().slice(0, 16);
        case 'time':
          return date.toTimeString().slice(0, 5);
        case 'date':
        default:
          return date.toISOString().slice(0, 10);
      }
    };

    // Parse input value to Date
    const parseInputValue = (value: string): Date | null => {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    };

    const dateInputElement = (
      field?: { value?: unknown; onChange?: (value: unknown) => void },
      fieldError?: string
    ) => (
      <TextField
        {...(field
          ? {
              ...field,
              value: formatDateValue(field.value),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const parsedDate = parseInputValue(e.target.value);
                if (field.onChange) {
                  field.onChange(parsedDate);
                }
              },
            }
          : {})}
        {...textFieldProps}
        ref={ref}
        id={name}
        name={name}
        type={dateType}
        error={!!fieldError}
        fullWidth
        variant='outlined'
        size='medium'
        inputProps={{
          min: minDate,
          max: maxDate,
          ...textFieldProps.inputProps,
        }}
        label={label}
        helperText={fieldError || helperText}
        required={required}
      />
    );

    // If using react-hook-form
    if (control) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => {
            const fieldError =
              fieldState.error?.message ||
              (typeof error === 'string' ? error : undefined);

            if (showFormField) {
              return (
                <FormField
                  label={label}
                  error={fieldError}
                  required={required}
                  helperText={helperText}
                  id={name}
                >
                  {dateInputElement(field, fieldError)}
                </FormField>
              );
            }

            return dateInputElement(field, fieldError);
          }}
        />
      );
    }

    // Standalone usage without react-hook-form
    if (showFormField) {
      return (
        <FormField
          label={label}
          error={typeof error === 'string' ? error : undefined}
          required={required}
          helperText={helperText}
          id={name}
        >
          {dateInputElement(
            undefined,
            typeof error === 'string' ? error : undefined
          )}
        </FormField>
      );
    }

    return dateInputElement(
      undefined,
      typeof error === 'string' ? error : undefined
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
