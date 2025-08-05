import * as yup from 'yup';

// Common validation schemas
export const commonValidation = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),

  required: (fieldName: string) =>
    yup.string().required(`${fieldName} is required`),

  optionalString: yup.string().optional(),

  positiveNumber: (fieldName: string) =>
    yup
      .number()
      .positive(`${fieldName} must be a positive number`)
      .required(`${fieldName} is required`),

  date: (fieldName: string) =>
    yup
      .date()
      .required(`${fieldName} is required`)
      .typeError(`Please enter a valid ${fieldName.toLowerCase()}`),

  futureDate: (fieldName: string) =>
    yup
      .date()
      .min(new Date(), `${fieldName} cannot be in the past`)
      .required(`${fieldName} is required`)
      .typeError(`Please enter a valid ${fieldName.toLowerCase()}`),

  dateRange: (fromField: string, toField: string) => ({
    [fromField]: yup
      .date()
      .required(`${fromField} is required`)
      .typeError(`Please enter a valid ${fromField.toLowerCase()}`),
    [toField]: yup
      .date()
      .min(yup.ref(fromField), `${toField} must be after ${fromField}`)
      .required(`${toField} is required`)
      .typeError(`Please enter a valid ${toField.toLowerCase()}`),
  }),
};

// Travel Request validation schema
export const travelRequestSchema = yup.object({
  reasonForTravel: yup
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters')
    .required('Reason for travel is required'),

  projectId: yup
    .number()
    .positive('Please select a valid project')
    .required('Project selection is required'),

  departmentId: yup
    .number()
    .positive('Please select a valid department')
    .required('Department selection is required'),

  fromDate: yup
    .date()
    .min(new Date(), 'From date cannot be in the past')
    .required('From date is required')
    .typeError('Please enter a valid from date'),

  toDate: yup
    .date()
    .min(yup.ref('fromDate'), 'To date must be after from date')
    .required('To date is required')
    .typeError('Please enter a valid to date'),

  fromLocation: yup
    .string()
    .min(2, 'From location must be at least 2 characters')
    .required('From location is required'),

  toLocation: yup
    .string()
    .min(2, 'To location must be at least 2 characters')
    .required('To location is required'),

  // Removed bookingType and bookingRequirements - not supported by backend
});

// User management validation schemas
export const userSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .required('First name is required'),

  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),

  email: commonValidation.email,

  mobileNum: commonValidation.phone,

  address: yup
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .required('Address is required'),

  roleId: yup
    .number()
    .positive('Please select a valid role')
    .required('Role selection is required'),

  departmentId: yup
    .number()
    .positive('Please select a valid department')
    .required('Department selection is required'),

  managerId: yup.number().positive('Please select a valid manager').optional(),
});

// Login validation schema
export const loginSchema = yup.object({
  email: commonValidation.email,
  password: commonValidation.password,
});

// File validation utilities
export const fileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],

  validateFile: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check file size
    if (file.size > fileValidation.maxSize) {
      errors.push(
        `File size must be less than ${fileValidation.maxSize / (1024 * 1024)}MB`
      );
    }

    // Check file type
    if (!fileValidation.allowedTypes.includes(file.type)) {
      errors.push(
        'File type not supported. Please upload JPG, PNG, or PDF files only.'
      );
    }

    // Check file extension
    const extension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));
    if (!fileValidation.allowedExtensions.includes(extension)) {
      errors.push(
        'Invalid file extension. Please upload JPG, PNG, or PDF files only.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateFiles: (files: File[]): { isValid: boolean; errors: string[] } => {
    const allErrors: string[] = [];

    files.forEach((file, index) => {
      const validation = fileValidation.validateFile(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          allErrors.push(`File ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  },
};

// Form validation helper functions
export const getFieldError = (
  errors: Record<string, unknown>,
  fieldName: string
): string | undefined => {
  const fieldPath = fieldName.split('.');
  let error: unknown = errors;

  for (const path of fieldPath) {
    if (error && typeof error === 'object' && path in error) {
      error = (error as Record<string, unknown>)[path];
    } else {
      return undefined;
    }
  }

  return typeof error === 'string'
    ? error
    : (error as { message?: string })?.message;
};

export const hasFieldError = (errors: unknown, fieldName: string): boolean => {
  return !!getFieldError(errors as Record<string, unknown>, fieldName);
};
