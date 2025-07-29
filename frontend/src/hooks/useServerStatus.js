import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useServerStatus = () => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const checkServerStatus = async () => {
    // Ne pas vérifier si on est déjà en train de charger
    if (isLoading) return;
    
    // Ne pas vérifier si l'utilisateur a été actif récemment (dans les 30 dernières secondes)
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    if (timeSinceLastActivity < 30000) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 3 secondes (réduit)
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        // Si le serveur était hors ligne et qu'il revient
        if (!isServerOnline) {
          setIsServerOnline(true);
          setWasOffline(true);
          
          // Rediriger automatiquement vers Login ou Home
          const token = localStorage.getItem('token');
          if (token) {
            // Si l'utilisateur était connecté, aller vers le dashboard
            const userRole = localStorage.getItem('userRole');
            if (userRole) {
              navigate(`/dashboard/${userRole}`);
            } else {
              navigate('/dashboard/admin'); // fallback
            }
          } else {
            // Si pas connecté, aller vers la page d'accueil
            navigate('/');
          }
        } else {
          setIsServerOnline(true);
        }
      } else {
        // Le serveur ne répond pas
        if (isServerOnline) {
          // Sauvegarder le chemin actuel avant que le serveur soit hors ligne
          sessionStorage.setItem('lastPathBeforeError', location.pathname);
        }
        setIsServerOnline(false);
        setWasOffline(true);
      }
    } catch (error) {
      console.error('Erreur de connexion au serveur:', error);
      if (isServerOnline) {
        // Sauvegarder le chemin actuel avant que le serveur soit hors ligne
        sessionStorage.setItem('lastPathBeforeError', location.pathname);
      }
      setIsServerOnline(false);
      setWasOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour enregistrer l'activité utilisateur
  const updateUserActivity = () => {
    lastActivityRef.current = Date.now();
  };

  useEffect(() => {
    // Vérification initiale
    checkServerStatus();
    
    // Écouter l'activité utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateUserActivity, true);
    });
    
    // Vérifier le statut toutes les 30 minutes (au lieu de 5 minutes)
    intervalRef.current = setInterval(checkServerStatus, 1800000);
    
    return () => {
      // Nettoyer les event listeners
      events.forEach(event => {
        document.removeEventListener(event, updateUserActivity, true);
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { isServerOnline, isLoading, checkServerStatus, wasOffline };
};

export default useServerStatus; 