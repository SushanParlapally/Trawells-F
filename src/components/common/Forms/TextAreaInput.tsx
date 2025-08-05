import { forwardRef } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import FormField from './FormField';

export interface TextAreaInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<TextFieldProps, 'name' | 'control' | 'multiline' | 'error'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  helperText?: string;
  showFormField?: boolean;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  error?: string | boolean;
  required?: boolean;
}

export const TextAreaInput = forwardRef<
  HTMLDivElement,
  TextAreaInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      helperText,
      showFormField = true,
      rows = 4,
      maxRows,
      minRows,
      maxLength,
      showCharacterCount = false,
      error,
      required,
      ...textFieldProps
    },
    ref
  ) => {
    const getCharacterCountText = (value: string = '') => {
      if (!showCharacterCount && !maxLength) return '';

      const currentLength = value.length;
      if (maxLength) {
        return `${currentLength}/${maxLength}`;
      }
      return `${currentLength} characters`;
    };

    const textAreaElement = (field?: unknown, fieldError?: string) => {
      const value = field?.value || textFieldProps.value || '';
      const characterCountText = getCharacterCountText(value);
      const displayHelperText = fieldError || helperText || characterCountText;

      return (
        <TextField
          {...(field || {})}
          {...textFieldProps}
          ref={ref}
          id={name}
          name={name}
          multiline
          rows={rows}
          maxRows={maxRows}
          minRows={minRows}
          error={!!fieldError}
          fullWidth
          variant='outlined'
          size='medium'
          inputProps={{
            maxLength,
            ...textFieldProps.inputProps,
          }}
          helperText={showFormField ? undefined : displayHelperText}
          label={label}
          required={required}
        />
      );
    };

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
                  helperText={helperText || getCharacterCountText(field.value)}
                  id={name}
                >
                  {textAreaElement(field, fieldError)}
                </FormField>
              );
            }

            return textAreaElement(field, fieldError);
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
          helperText={
            helperText ||
            getCharacterCountText(String(textFieldProps.value || ''))
          }
          id={name}
        >
          {textAreaElement(undefined, error ? String(error) : '')}
        </FormField>
      );
    }

    return textAreaElement(undefined, error ? String(error) : undefined);
  }
);

TextAreaInput.displayName = 'TextAreaInput';

export default TextAreaInput;
