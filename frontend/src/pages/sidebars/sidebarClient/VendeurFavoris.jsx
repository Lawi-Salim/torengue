import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';

const VendeurFavoris = () => {
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
        <h2 className="card-title">Mes Vendeurs</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : (
          <EmptyState 
            title="Mes Vendeurs"
            message="Vous n'avez ajouté aucun vendeur pour le favoris."
          />
        )}
      </div>
    </div>
  );
};

export default VendeurFavoris;
