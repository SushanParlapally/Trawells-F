import { forwardRef } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  type CheckboxProps,
} from '@mui/material';
import { type Control, type FieldPath, Controller } from 'react-hook-form';

export interface CheckboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface CheckboxInputProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<CheckboxProps, 'name' | 'control'> {
  name: FieldPath<T>;
  control?: Control<T, unknown>;
  label?: string;
  helperText?: string;
  showFormField?: boolean;
  options?: CheckboxOption[]; // For checkbox groups
  row?: boolean; // For checkbox groups
  error?: string | boolean;
  required?: boolean;
}

export const CheckboxInput = forwardRef<
  HTMLButtonElement,
  CheckboxInputProps<Record<string, unknown>>
>(
  (
    {
      name,
      control,
      label,
      helperText,
      showFormField = true,
      options,
      row = false,
      error,
      ...checkboxProps
    },
    ref
  ) => {
    // Single checkbox
    const singleCheckboxElement = (
      field?: { value?: boolean; onChange?: (value: boolean) => void },
      fieldError?: string
    ) => (
      <FormControl error={!!fieldError} fullWidth>
        <FormControlLabel
          control={
            <Checkbox
              {...(field || {})}
              {...checkboxProps}
              ref={ref}
              name={name}
              checked={field?.value || checkboxProps.checked || false}
              onChange={(_e, checked) => {
                if (field?.onChange) {
                  field.onChange(checked);
                }
              }}
            />
          }
          label={label}
          sx={{ alignItems: 'flex-start' }}
        />
        {!showFormField && (fieldError || helperText) && (
          <FormHelperText sx={{ ml: 0 }}>
            {fieldError || helperText}
          </FormHelperText>
        )}
      </FormControl>
    );

    // Checkbox group
    const checkboxGroupElement = (
      field?: {
        value?: (string | number)[];
        onChange?: (value: (string | number)[]) => void;
      },
      fieldError?: string
    ) => {
      const selectedValues = field?.value || [];

      const handleChange = (optionValue: string | number, checked: boolean) => {
        if (!field?.onChange) return;

        let newValues;
        if (checked) {
          newValues = [...selectedValues, optionValue];
        } else {
          newValues = selectedValues.filter(
            (value: unknown) => value !== optionValue
          );
        }
        field.onChange(newValues);
      };

      return (
        <FormControl component='fieldset' error={!!fieldError} fullWidth>
          <FormGroup row={row}>
            {options?.map(option => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    {...checkboxProps}
                    ref={ref}
                    name={name}
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={(_e, checked) =>
                      handleChange(option.value, checked)
                    }
                    disabled={option.disabled || checkboxProps.disabled}
                  />
                }
                label={option.label}
                sx={{ alignItems: 'flex-start' }}
              />
            ))}
          </FormGroup>
          {fieldError && (
            <FormHelperText sx={{ ml: 0 }}>{fieldError}</FormHelperText>
          )}
        </FormControl>
      );
    };

    // If using react-hook-form
    if (control) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => {
            const fieldError = fieldState.error?.message || error;

            if (options && options.length > 0) {
              return checkboxGroupElement(
                field as {
                  value?: (string | number)[];
                  onChange?: (value: (string | number)[]) => void;
                },
                fieldError as string
              );
            }

            return singleCheckboxElement(
              field as { value?: boolean; onChange?: (value: boolean) => void },
              fieldError as string
            );
          }}
        />
      );
    }

    // Standalone checkbox
    if (options && options.length > 0) {
      return checkboxGroupElement();
    }

    return singleCheckboxElement();
  }
);

CheckboxInput.displayName = 'CheckboxInput';
