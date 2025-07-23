import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';

const PaiementAdmin = () => {
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
        <h2 className="card-title">Gestion des Paiements</h2>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : (
          <EmptyState 
            title="Gestion des Paiements"
            message="Aucun paiement n'a été effectué pour le moment."
          />
        )}
      </div>
    </div>
  );
};

export default PaiementAdmin;
