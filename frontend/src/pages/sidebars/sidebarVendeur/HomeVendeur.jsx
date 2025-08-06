import React, { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiPlus, FiCreditCard } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import ProduitsVenteChart from '../../../components/charts/ProduitsVenteChart';
import ProduitsParCategorieChart from '../../../components/charts/ProduitsParCategorieChart';
import { RecentSalesList, BestClientsListForVendor } from './ActivityVendeur/ActivityVendeur';
import apiService from '../../../apiService';
import '../../dashboards/styles.css';
import './styleVendeur.css';
import { formatNumber } from '../../../utils/formatUtils';

const statsTemplate = [
  { title: 'Mes produits', value: 0, icon: FiPackage, color: 'blue' },
  { title: 'Ventes ce mois', value: 0, icon: FiShoppingCart, color: 'green' },
  { title: 'Revenus', value: 0, icon: FiTrendingUp, color: 'purple' },
  { title: 'Paiements', value: 0, icon: FiCreditCard, color: 'gray' }
];

const HomeVendeur = () => {
  const [stats, setStats] = useState(statsTemplate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.get('/api/v1/dashboard/stats-vendeur');
        if (res.data) {
          setStats([
            { ...statsTemplate[0], value: formatNumber(res.data.produitsCount) },
            { ...statsTemplate[1], value: formatNumber(res.data.ventesCount) },
            { ...statsTemplate[2], value: formatNumber(res.data.revenus) },
            { ...statsTemplate[3], value: formatNumber(res.data.paiementsCount) }
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
            <div className={`stat-icon ${stat.color}`}>
              <Icon className="icon-white" />
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
          </div>
        );
      })}
    </div>

    <div className="dashboard-grid">
      <ProduitsVenteChart />
      <ProduitsParCategorieChart />
    </div>

    {/* Section des activités récentes */}
    <div className="activity-grid" style={{ marginTop: '1.5rem' }}>
      <RecentSalesList />
      <BestClientsListForVendor />
    </div>
  </main>
);
};

export default HomeVendeur;
