import React, { useEffect, useState } from 'react';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Error = ({ 
  title = "Erreur de connexion", 
  message = "Le serveur ne répond pas actuellement. Veuillez réessayer plus tard.",
  showRetry = true,
  showHome = true,
  onRetry = null // Callback pour vérifier le serveur
}) => {
  const navigate = useNavigate();
  const [lastPath, setLastPath] = useState('');

  // Rediriger vers /erreur pour avoir la bonne URL et sauvegarder le chemin précédent
  useEffect(() => {
    if (window.location.pathname !== '/erreur') {
      // Sauvegarder le chemin précédent
      const previousPath = sessionStorage.getItem('lastPathBeforeError') || '/';
      setLastPath(previousPath);
      navigate('/erreur', { replace: true });
    } else {
      // Si on est déjà sur /erreur, récupérer le chemin sauvegardé
      const savedPath = sessionStorage.getItem('lastPathBeforeError') || '/';
      setLastPath(savedPath);
    }
  }, [navigate]);

  const handleRetry = async () => {
    try {
      // Vérifier si le serveur répond
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        // Le serveur répond, vérifier l'authentification
        const token = localStorage.getItem('token');
        
        if (token) {
          // Si connecté, aller au dashboard approprié
          const userRole = localStorage.getItem('userRole');
          if (userRole) {
            navigate(`/dashboard/${userRole}`);
          } else {
            navigate('/dashboard/admin');
          }
        } else {
          // Si pas connecté, rediriger vers la page de connexion
          // Sauvegarder le chemin de destination pour rediriger après connexion
          if (lastPath && lastPath.startsWith('/dashboard/')) {
            sessionStorage.setItem('redirectAfterLogin', lastPath);
          }
          navigate('/login');
        }
      } else {
        // Le serveur ne répond toujours pas
        alert('Le serveur ne répond toujours pas. Veuillez réessayer plus tard.');
      }
    } catch (error) {
      // Erreur de connexion
      alert('Impossible de contacter le serveur. Vérifiez votre connexion.');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="container-empty">
      <div className="error-content">
        {/* Icône d'erreur */}
        <div className="error-icon">
          <FiWifiOff className="icon" />
        </div>

        {/* Titre */}
        <h1 className="error-title">
          {title}
        </h1>

        {/* Message */}
        <p className="error-message">
          {message}
        </p>

        {/* Actions */}
        <div className="error-actions">
          {showRetry && (
            <button
              onClick={handleRetry}
              className="btn btn-primary"
            >
              <FiRefreshCw className="icon" />
              <span>Réessayer</span>
            </button>
          )}

          {showHome && (
            <button
              onClick={handleGoHome}
              className="btn btn-secondary"
            >
              <FiHome className="icon" />
              <span>Retour à l'accueil</span>
            </button>
          )}
        </div>

        {/* Informations techniques */}
        <div className="error-footer">
          <p className="error-footer-text">
            Si le problème persiste, contactez l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
