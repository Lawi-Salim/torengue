import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../apiService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
        // Vérifie que savedUser n'est ni null, ni la chaîne 'undefined'
    return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000';

  // Vérifier le token au démarrage
  const fetchNotifications = async () => {
    try {
      const { data } = await apiService.get('/api/v1/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.notif_lu).length);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      // Ne pas déconnecter l'utilisateur pour une erreur de notif
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await apiService.get('/api/v1/auth/profile');
          setUser(response.data.data.user);
          await fetchNotifications(); // Charger les notifications après avoir confirmé l'utilisateur
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('[AUTH CONTEXT] Tentative de connexion pour :', email);
      const response = await apiService.post('/api/v1/auth/login', { email, password });
      console.log('[AUTH CONTEXT] Réponse login API:', response);
      const { token: newToken, data } = response.data;
      const { user } = data;
      
      // Stocker uniquement les informations essentielles de l'utilisateur
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', user.id_user);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
      
      setUser({
        id_user: user.id_user,
        email: user.email,
        role: user.role
      });
      setToken(newToken);
      
      // Charger les notifications
      await fetchNotifications();
      
      toast.success('Connexion réussie !');
      return { success: true, data: { user, token: newToken } };
    } catch (error) {
      console.error('[AUTH CONTEXT] Erreur login API:', error, error.response);
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  };

  const register = async (userData) => {
    console.log('[AUTH CONTEXT] Tentative d\'inscription pour :', userData.email, 'avec le rôle', userData.role);
    try {
            const response = await apiService.post('/api/v1/auth/register', userData);
      console.log('[AUTH CONTEXT] Réponse register API:', response);
      // Après l'inscription, l'utilisateur doit se connecter manuellement.
      // Nous n'automatisons pas la connexion ici.
      toast.success(response.data.message || 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return { success: true };
    } catch (error) {
      console.error('[AUTH CONTEXT] Erreur register API:', error.response || error);
      toast.error(error.response?.data?.message || "Erreur d'inscription");
      return {
        success: false,
        message: error.response?.data?.message || "Erreur d'inscription"
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUser(null);
    setToken(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const markNotificationAsRead = async (notificationId, url) => {
    const notification = notifications.find(n => n.id_notif === notificationId);
    // Ne pas bloquer la navigation si la notif est déjà lue
    if (notification && !notification.notif_lu) {
      try {
        await apiService.put(`/api/v1/notifications/${notificationId}/read`);
        setNotifications(prev =>
          prev.map(n => (n.id_notif === notificationId ? { ...n, notif_lu: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
      }
    }
    // Naviguer même si la mise à jour échoue ou si la notif est déjà lue
    if (url) {
      navigate(url);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    notifications,
    unreadCount,
    markNotificationAsRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 