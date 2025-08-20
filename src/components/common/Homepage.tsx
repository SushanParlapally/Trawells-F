import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
                    url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth='md'>
        <Box textAlign='center' color='white'>
          <Typography
            variant='h1'
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Streamlining Corporate Travel
          </Typography>
          <Typography
            variant='h5'
            paragraph
            sx={{
              mb: 4,
              opacity: 0.95,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Efficient travel request management for modern businesses. Simplify
            approvals, streamline bookings, and manage corporate travel with
            ease.
          </Typography>
          <Button
            variant='contained'
            color='secondary'
            size='large'
            onClick={handleNavigateToLogin}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(255, 179, 0, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(255, 179, 0, 0.4)',
              },
            }}
          >
            Access Travel Desk
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Homepage;
