# Reusable Form Components

This directory contains a comprehensive set of reusable form components built with React Hook Form,
Material-UI, and Yup validation.

## Components Implemented

### 1. FormField

Base wrapper component that provides consistent styling and error handling for all form fields.

**Features:**

- Consistent label styling with required indicators
- Error message display
- Helper text support
- Accessibility compliance

### 2. TextInput

Text input component with validation support.

**Features:**

- React Hook Form integration
- Yup validation support
- Placeholder text
- Various input types (text, email, password, etc.)
- Consistent styling

### 3. TextAreaInput

Multi-line text input component.

**Features:**

- Configurable rows and character limits
- Character count display
- Auto-resize support
- Validation integration

### 4. SelectInput

Dropdown selection component.

**Features:**

- Single and multi-select support
- Option groups
- Search functionality
- Chip display for multi-select
- Empty option handling

### 5. DateInput

Date picker component.

**Features:**

- Date, datetime-local, and time input types
- Min/max date validation
- Proper date formatting
- React Hook Form integration

### 6. FileUpload

File upload component with drag-and-drop functionality.

**Features:**

- Drag and drop interface
- Multiple file support
- File type and size validation
- Upload progress tracking
- File preview and removal
- Document management

### 7. RadioGroupInput

Radio button group component.

**Features:**

- Horizontal and vertical layouts
- Option groups
- Validation support
- Accessibility compliance

### 8. CheckboxInput

Checkbox component supporting single checkboxes and checkbox groups.

**Features:**

- Single checkbox support
- Checkbox group support
- Multiple selection handling
- Validation integration

## Validation Utilities

### validation.ts

Comprehensive validation utilities using Yup schemas.

**Includes:**

- Common validation patterns (email, phone, required fields)
- Travel request specific validation
- User management validation
- File validation utilities
- Form error handling helpers

**Key Schemas:**

- `travelRequestSchema` - Complete travel request validation
- `userSchema` - User management validation
- `loginSchema` - Authentication validation
- `fileValidation` - File upload validation

## Usage Examples

### Basic Text Input

```tsx
import { TextInput } from './components/common/Forms';
import { useForm } from 'react-hook-form';

const { control } = useForm();

<TextInput
  name='firstName'
  control={control}
  label='First Name'
  required
  placeholder='Enter your first name'
/>;
```

### Select with Options

```tsx
import { SelectInput } from './components/common/Forms';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

<SelectInput name='department' control={control} label='Department' options={options} required />;
```

### File Upload

```tsx
import { FileUpload } from './components/common/Forms';

<FileUpload
  name='documents'
  control={control}
  label='Upload Documents'
  maxFiles={5}
  acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
  onPreview={document => console.log('Preview:', document)}
/>;
```

### Form with Validation

```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { travelRequestSchema } from './utils/validation';

const { control, handleSubmit } = useForm({
  resolver: yupResolver(travelRequestSchema),
});

const onSubmit = data => {
  console.log('Valid form data:', data);
};
```

## Features Implemented

✅ **Form field components with consistent styling and validation**

- FormField wrapper component
- TextInput with various types
- TextAreaInput with character counting
- All components follow Material-UI design system

✅ **File upload component with drag-and-drop functionality**

- Drag and drop interface
- Multiple file support
- File validation (type, size)
- Upload progress tracking
- File preview and removal capabilities

✅ **Date picker and dropdown components**

- DateInput with multiple date types
- SelectInput with single/multi-select
- RadioGroupInput for radio selections
- CheckboxInput for checkbox selections

✅ **Form validation utilities using Yup schemas**

- Comprehensive validation schemas
- Travel request validation
- User management validation
- File validation utilities
- Error handling helpers

## Requirements Satisfied

- **Requirement 7.5**: Consistent styling and user-friendly form validation ✅
- **Requirement 2.12**: Document upload functionality with validation ✅
- **Requirement 8.4**: Client-side validation with clear error messages ✅

## Integration

All components are designed to work seamlessly with:

- React Hook Form for form state management
- Yup for validation schemas
- Material-UI for consistent styling
- TypeScript for type safety

The components can be used standalone or with React Hook Form integration, providing flexibility for
different use cases throughout the application.
