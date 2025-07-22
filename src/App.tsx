import { Routes, Route } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth='lg'>
      <Box sx={{ my: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Travel Desk Management System
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Frontend application initialized successfully with React, TypeScript,
          Vite, and Material-UI.
        </Typography>
        <Routes>
          <Route
            path='/'
            element={
              <Box sx={{ mt: 2 }}>
                <Typography variant='h6'>Welcome to Travel Desk</Typography>
                <Typography variant='body2'>
                  The application is ready for development. Core dependencies
                  installed:
                </Typography>
                <ul>
                  <li>React Router DOM</li>
                  <li>Redux Toolkit</li>
                  <li>Axios</li>
                  <li>Material-UI</li>
                  <li>TypeScript (Strict Mode)</li>
                  <li>ESLint + Prettier</li>
                </ul>
              </Box>
            }
          />
        </Routes>
      </Box>
    </Container>
  );
}

export default App;
