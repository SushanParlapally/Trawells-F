import { forwardRef } from 'react';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectProps,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import FormField from './FormField';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<SelectProps, 'name' | 'control' | 'error'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  options: SelectOption[];
  helperText?: string;
  showFormField?: boolean;
  placeholder?: string;
  emptyOption?: boolean;
  emptyOptionLabel?: string;
  error?: string | boolean;
  required?: boolean;
  multiple?: boolean;
}

export const SelectInput = forwardRef<
  HTMLSelectElement,
  SelectInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      options,
      helperText,
      showFormField = true,
      placeholder,
      emptyOption = true,
      emptyOptionLabel = 'Select an option',
      error,
      required,
      multiple,
      ...selectProps
    },
    ref
  ) => {
    const renderValue = (selected: unknown) => {
      if (multiple && Array.isArray(selected)) {
        if (selected.length === 0) {
          return (
            <em style={{ color: '#999' }}>{placeholder || emptyOptionLabel}</em>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map(value => {
              const option = options.find(opt => opt.value === value);
              return (
                <Chip
                  key={value}
                  label={option?.label || String(value)}
                  size='small'
                  variant='outlined'
                />
              );
            })}
          </Box>
        );
      }

      if (!selected || selected === '') {
        return (
          <em style={{ color: '#999' }}>{placeholder || emptyOptionLabel}</em>
        );
      }

      const option = options.find(opt => opt.value === selected);
      return option?.label || String(selected);
    };

    const selectElement = (field?: unknown, fieldError?: string) => (
      <FormControl error={!!fieldError} fullWidth>
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <Select
          {...(field || {})}
          {...selectProps}
          ref={ref}
          labelId={`${name}-label`}
          id={name}
          name={name}
          label={label}
          required={required}
          multiple={multiple}
          renderValue={renderValue}
          displayEmpty
        >
          {emptyOption && (
            <MenuItem value=''>
              <em>{emptyOptionLabel}</em>
            </MenuItem>
          )}
          {options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
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
                  {selectElement(field, fieldError)}
                </FormField>
              );
            }

            return selectElement(field, fieldError);
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
          {selectElement(
            undefined,
            typeof error === 'string' ? error : undefined
          )}
        </FormField>
      );
    }

    return selectElement(
      undefined,
      typeof error === 'string' ? error : undefined
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
