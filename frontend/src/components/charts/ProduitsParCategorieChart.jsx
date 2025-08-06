import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import apiService from '../../apiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../Spinner';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';

const ProduitsParCategorieChart = () => {
  const [periode, setPeriode] = useState('semaine'); // 'semaine', 'trimestre'
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Produits vendus',
      data: []
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        fontFamily: 'Poppins, sans-serif'
      },
      plotOptions: {
        bar: {
          distributed: true,
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [],
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " produits"
          }
        }
      },
      title: {
        text: 'Produits par catégorie',
        align: 'left'
      }
    }
  });

  const getAbbreviation = (name) => {
    const abbreviations = {
      'Électricité': 'Elec.',
      'Plomberie': 'Plom.',
      'Isolation': 'Isol.',
      'Peinture': 'Pein.',
      'Sécurité': 'Sécu.',
      'Bois': 'Bois'
    };
    return abbreviations[name] || name;
  };

  const getCategoryColor = (name) => {
    const colors = {
      'Électricité': '#4F46E5',
      'Plomberie': '#0891B2',
      'Isolation': '#D97706',
      'Peinture': '#059669',
      'Sécurité': '#DB2777',
      'Bois': '#78350F'
    };
    return colors[name] || '#64748B';
  };

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(`/api/v1/dashboard/produits-par-categorie?periode=${periode}`);
        const data = response.data;

        const abbreviatedCategories = data.map(item => getAbbreviation(item.name));
        const seriesData = data.map(item => item.data);
        const categoryColors = data.map(item => getCategoryColor(item.name));

        console.log('Data from API:', data);
        console.log('Generated Colors:', categoryColors);

        const newOptions = {
          ...chartData.options,
          colors: categoryColors,
          xaxis: {
            categories: abbreviatedCategories
          }
        };

        console.log('Final Chart Options:', newOptions);

        setChartData({
          series: [{
            name: 'Produits vendus',
            data: seriesData
          }],
          options: newOptions
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des données du graphique:', err);
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProductsByCategory();
    }
  }, [isAuthenticated, user, periode]);

  const isDataEmpty = !chartData.series[0] || chartData.series[0].data.reduce((a, b) => a + b, 0) === 0;

  return (
    <div className="card">
      <div style={{ padding: '16px', display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className={periode === 'semaine' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('semaine')}>Semaine</button>
        <button className={periode === 'trimestre' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('trimestre')}>Trimestre</button>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState title="Erreur" message={error} />
        ) : isDataEmpty ? (
          <EmptyState title="Aucune donnée" message="Aucun produit vendu pour cette période." />
        ) : (
          <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
        )}
      </div>
    </div>
  );
};

export default ProduitsParCategorieChart;
