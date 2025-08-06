import axios from 'axios';

// Crée une instance d'Axios avec une configuration de base
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales, notamment les pannes serveur
apiService.interceptors.response.use(
  (response) => response, // Ne fait rien pour les réponses réussies
  (error) => {
    const token = localStorage.getItem('token');
    // Si l'erreur est une erreur réseau et qu'un utilisateur est connecté
    if (error.code === 'ERR_NETWORK' && token) {
      // Sauvegarder l'URL actuelle pour une redirection future
      localStorage.setItem('redirectPath', window.location.pathname);
      // Rediriger vers la page d'erreur
      window.location.href = '/erreur'; 
    }
    return Promise.reject(error);
  }
);

export default apiService;
