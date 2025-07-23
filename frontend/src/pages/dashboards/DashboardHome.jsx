import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin/home', { replace: true });
      } else if (user.role === 'vendeur') {
        navigate('/dashboard/vendeur/home', { replace: true });
      } else if (user.role === 'client') {
        navigate('/dashboard/client/home', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

export default DashboardHome;
