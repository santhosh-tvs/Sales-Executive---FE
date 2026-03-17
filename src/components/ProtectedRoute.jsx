import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiservice';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      
      // No token = not authenticated
      if (!token) {
        console.log('No token found - redirecting to login');
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token with API
      try {
        await apiService.get('/profile/user-details');
        console.log('Token is valid');
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Token is invalid - clearing and redirecting');
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isPasswordExpired');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();

    // Re-validate every 5 seconds
    const interval = setInterval(validateToken, 5000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // Show loading or nothing while validating
  if (isValidating || isAuthenticated === null) {
    return <LoadingSpinner message="Verifying Authorization..." />;
  }

  // If not authenticated, redirect to login
  if (isAuthenticated === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
