import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';

const ClientFavoris = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Mes Clients</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : (
          <EmptyState 
            title="Mes Clients"
            message="Aucun client ne vous a ajouté pour le momemt"
          />
        )}
      </div>
    </div>
  );
};

export default ClientFavoris;
