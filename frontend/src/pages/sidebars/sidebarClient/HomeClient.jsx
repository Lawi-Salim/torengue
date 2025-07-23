import { FiShoppingCart, FiFileText, FiPlus, FiTrendingUp, FiPackage, FiChevronRight } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';

const HomeClient = () => {
  const [stats, setStats] = useState([
    { title: 'Commandes', value: 0, icon: FiShoppingCart, color: 'blue' },
    { title: 'Mes dépenses', value: 0, icon: FiTrendingUp, color: 'green' },
    { title: 'Factures', value: 0, icon: FiFileText, color: 'purple' }
  ]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.get('/api/v1/dashboard/stats-client');
        if (res.data) {
          setStats([
            { title: 'Commandes', value: res.data.commandesCount, icon: FiShoppingCart, color: 'blue' },
            { title: 'Mes dépenses', value: res.data.depenses, icon: FiTrendingUp, color: 'green' },
            { title: 'Factures', value: res.data.facturesCount, icon: FiFileText, color: 'purple' }
          ]);
        }
      } catch (err) {
        // Optionnel : gérer l'erreur
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const res = await apiService.get('/api/v1/commandes/mes-commandes');
        setCommandes(res.data.data || []);
      } catch (err) {
        // Optionnel : gérer l'erreur
      }
    };
    fetchCommandes();
  }, []);

  return (
    <main className="p-6 space-y-8">
      {/* Stats */}
      <div className="stats-grid">
        {loading ? (
          <Spinner />
        ) : stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${stat.color}`}><Icon className="icon-white" /></div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Actions rapides */}
      <div className="flex space-x-4">
        <button className="btn btn-primary flex items-center space-x-2"><FiPlus /> <span>Nouvelle commande</span></button>
        <button className="btn btn-secondary flex items-center space-x-2"><FiFileText /> <span>Voir mes factures</span></button>
      </div>
      {/* Commandes récentes */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Commandes récentes</h2>
          <a href="#" className="text-sm font-medium text-primary-600 hover:underline">Voir tout</a>
        </div>
        <ul className="space-y-3">
          {commandes.slice(0, 5).map((c, i) => (
            <li key={i} className="recent-order-item">
              <div className="order-item-icon">
                <FiPackage />
              </div>
              <div className="order-item-details">
                <span className="order-item-ref">{c.reference || c.id_commande}</span>
                <span className="order-item-date">{c.date_commande ? new Date(c.date_commande).toLocaleDateString() : ''}</span>
              </div>
              <span className={`status-badge status-${c.statut?.toLowerCase().replace('é', 'e').replace(/ /g, '-')}`}>{c.statut}</span>
              <button className="btn-view-order">
                <FiChevronRight />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default HomeClient;
