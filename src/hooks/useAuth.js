import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login', { replace: true });
            }
        };

        // Check immediately
        checkAuth();

        // Check every second to catch any token removal
        const interval = setInterval(checkAuth, 1000);

        return () => clearInterval(interval);
    }, [navigate]);
};

export default useAuth;
