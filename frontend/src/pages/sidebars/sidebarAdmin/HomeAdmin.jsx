import React, { useMemo, useState, useEffect } from 'react';
import ProduitsParCategorieChart from '../../../components/charts/ProduitsParCategorieChart';
import { useAuth } from '../../../context/AuthContext';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import ProduitsVenteChart from '../../../components/charts/ProduitsVenteChart';
import Spinner from '../../../components/Spinner';
import apiService from '../../../apiService';
import { formatNumber } from '../../../utils/formatUtils';
import '../../dashboards/styles.css';
import { RecentUsersList, RecentProductsList, RecentOrdersList, BestClientsList, BestSellersList } from './activityAdmin/ActivityAdmin';

const staticStats = [
  { title: 'Utilisateurs', value: 0, icon: FiUsers, cssClass: 'blue' },
  { title: 'Produits', value: 0, icon: FiPackage, cssClass: 'green' },
  { title: 'Ventes', value: 0, icon: FiShoppingCart, cssClass: 'gray' },
  { title: 'Revenus', value: 0, icon: FiDollarSign, cssClass: 'purple' }
];


const HomeAdmin = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(staticStats);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const [productsByCategoryData, setProductsByCategoryData] = useState({
    series: [{ name: 'Produits vendus', data: [] }],
    options: {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Poppins, sans-serif'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          distributed: true,
          endingShape: 'rounded'
        },
      },
      colors: ['#4ade80', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6'],
      dataLabels: { enabled: false },
      stroke: { show: true, width: 3, colors: ['transparent'] },
      xaxis: { categories: [] },
      legend: { show: false },
      title: { text: 'Produits par catégorie', align: 'left' },
      tooltip: {
        x: { formatter: val => val }
      }
    }
  });

  useEffect(() => {
    if (authLoading) return; // Attendre la fin de la vérification de l'authentification
    if (!isAuthenticated) {
      // Si l'utilisateur n'est pas authentifié, ne rien faire ou rediriger
      setDataLoading(false);
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const statsResponse = await apiService.get('/api/v1/dashboard/stats');
        if (statsResponse.data) {
          const apiStats = [
            { ...staticStats[0], value: statsResponse.data.usersCount },
            { ...staticStats[1], value: statsResponse.data.productsCount },
            { ...staticStats[2], value: statsResponse.data.salesCount },
            { ...staticStats[3], value: formatNumber(statsResponse.data.revenus)},
          ];
          setStats(apiStats);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des données du tableau de bord.');
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiService.get('/api/v1/dashboard/produits-par-categorie', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data || [];
        setProductsByCategoryData(prev => ({
          ...prev,
          series: [{ name: 'Produits vendus', data: data.map(d => Number(d.total_vendus)) }],
          options: {
            ...prev.options,
            xaxis: { ...prev.options.xaxis, categories: data.map(d => d.categorie) }
          }
        }));
      } catch (e) {
        setProductsByCategoryData(prev => ({
          ...prev,
          series: [{ name: 'Produits vendus', data: [] }],
          options: { ...prev.options, xaxis: { ...prev.options.xaxis, categories: [] } }
        }));
      }
    };
    fetchProductsByCategory();
  }, []);

  if (authLoading || dataLoading) {
    return (
      <div className="p-6">
        <div className="card" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      </div>
    );
  }
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="p-6">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.cssClass}`}>
              <stat.icon className="icon-white" />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <ProduitsVenteChart />
        <ProduitsParCategorieChart />
      </div>

      {/* Section des activités récentes */}
      <div className="activity-grid" style={{ marginTop: '1.5rem' }}>
        <RecentUsersList />
        <RecentProductsList />
      </div>

      <div className="activity-grid" style={{ marginTop: '1.5rem' }}>
        <BestClientsList />
        <RecentOrdersList />
        <BestSellersList />
      </div>
    </div>
  );
};

export default HomeAdmin;

