import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Paper, Typography } from '@mui/material';
import { TextInput, SelectInput, DateInput } from './index';

interface SimpleFormData {
  name: string;
  email: string;
  department: string;
  startDate: Date;
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  department: yup.string().required('Department is required'),
  startDate: yup.date().required('Start date is required'),
});

const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
];

export const SimpleFormExample = () => {
  const { control, handleSubmit } = useForm<SimpleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      startDate: new Date(),
    },
  });

  const onSubmit = () => {
    // Form submission logic would go here
    // console.log('Form submitted: ', data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h5' gutterBottom>
        Simple Form Example
      </Typography>

      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <TextInput
          name='name'
          control={control}
          label='Full Name'
          required
          placeholder='Enter your full name'
        />
        <TextInput
          name='email'
          control={control}
          label='Email Address'
          type='email'
          required
          placeholder='Enter your email'
        />
        <SelectInput
          name='department'
          control={control}
          label='Department'
          options={departmentOptions}
          required
          placeholder='Select your department'
        />
        <DateInput
          name='startDate'
          control={control}
          label='Start Date'
          required
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type='submit' variant='contained'>
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SimpleFormExample;
