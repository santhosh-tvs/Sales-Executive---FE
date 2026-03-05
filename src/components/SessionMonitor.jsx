import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiservice';

const SessionMonitor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;

    // Function to check if token is still valid
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // No token, redirect to login
        navigate('/login');
        return;
      }

      try {
        // Make a lightweight API call to check if token is still valid
        await apiService.get('/profile/user-details');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token is invalid or expired, clear storage and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('isPasswordExpired');
          navigate('/login');
        }
        console.error('Token validation error:', error);
      }
    };

    // Listen for storage changes (when another tab logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (!e.newValue) {
          // Token was removed, redirect to login
          navigate('/login');
        } else if (e.oldValue && e.newValue && e.oldValue !== e.newValue) {
          // Token was changed (new login), redirect to login
          navigate('/login');
        }
      }

      // Listen for force logout event
      if (e.key === 'forceLogout' && e.newValue === 'true') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isPasswordExpired');
        localStorage.removeItem('forceLogout');
        navigate('/login');
      }
    };

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    // Check token validity every 30 seconds
    intervalId = setInterval(checkTokenValidity, 30000);

    // Initial check
    checkTokenValidity();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default SessionMonitor;
