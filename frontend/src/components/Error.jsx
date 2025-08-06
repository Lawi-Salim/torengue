import React, { useEffect, useState } from 'react';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Error = ({ 
  title = "Erreur de connexion", 
  message = "Le serveur ne répond pas actuellement. Veuillez réessayer plus tard.",
  showRetry = true,
  showHome = true,
  onRetry = null // Callback pour vérifier le serveur
}) => {
  const navigate = useNavigate();

  const handleRetry = async () => {
    try {
      // Vérifier si le serveur répond
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/ping`);

      if (response.ok) {
        // Le serveur répond, rediriger vers la page de connexion
        // La logique de redirection post-connexion est gérée dans AuthContext
        navigate('/login');
      } else {
        // Le serveur ne répond toujours pas
        toast.error('Le serveur ne répond toujours pas. Veuillez réessayer plus tard.');
      }
    } catch (error) {
      // Erreur de connexion
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
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
