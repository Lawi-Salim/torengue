import React, { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiPlus, FiCreditCard } from 'react-icons/fi';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import apiService from '../../../apiService';
import '../../dashboards/styles.css';
import './styleVendeur.css';

const statsTemplate = [
  { title: 'Mes produits', value: 0, icon: FiPackage, color: 'blue' },
  { title: 'Ventes ce mois', value: 0, icon: FiShoppingCart, color: 'green' },
  { title: 'Revenus', value: 0, icon: FiTrendingUp, color: 'purple' },
  { title: 'Paiements', value: 0, icon: FiCreditCard, color: 'gray' }
];

const produits = [
  { nom: 'Ciment Portland', stock: 50, alert: false },
  { nom: 'Briques Standard', stock: 12, alert: true },
  { nom: 'Sable de Construction', stock: 3, alert: true }
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
            { ...statsTemplate[0], value: res.data.produitsCount },
            { ...statsTemplate[1], value: res.data.ventesCount },
            { ...statsTemplate[2], value: res.data.revenus },
            { ...statsTemplate[3], value: res.data.paiementsCount }
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
    {/* Actions rapides */}
    <div className="flex space-x-4">
      <button className="btn btn-primary flex items-center space-x-2"><FiPlus /> <span>Ajouter un produit</span></button>
      <button className="btn btn-secondary flex items-center space-x-2"><FiShoppingCart /> <span>Nouvelle vente</span></button>
    </div>
    {/* Liste des produits */}
    <div className="card mt-6">
      <h2 className="card-title mb-2">Mes produits</h2>
      <ul>
        {produits.map((p, i) => (
          <li key={i} className="flex justify-between py-2 border-b last:border-b-0">
            <span>{p.nom}</span>
            <span className={`text-sm ${p.alert ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{p.stock} en stock{p.alert ? ' (Alerte!)' : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  </main>
);
};

export default HomeVendeur;
