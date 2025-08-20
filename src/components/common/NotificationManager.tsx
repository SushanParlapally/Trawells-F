import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import notificationService from '../../services/notificationService';

const NotificationManager = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.start();
    } else {
      notificationService.stop();
    }

    return () => {
      notificationService.stop();
    };
  }, [isAuthenticated]);

  return null; // This component doesn't render anything visible
};

export default NotificationManager;
