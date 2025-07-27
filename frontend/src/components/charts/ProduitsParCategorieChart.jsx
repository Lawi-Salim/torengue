import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import apiService from '../../apiService';
import { useAuth } from '../../context/AuthContext';

const ProduitsParCategorieChart = () => {
  const { user, isAuthenticated } = useAuth();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Produits vendus',
      data: []
    }],
    options: {
      chart: {
        type: 'bar',
        height: 250,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
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
        categories: ['Elec', 'Plom', 'Isol', 'Pein', 'Sécu', 'Bois'],
      },
      fill: {
        opacity: 1
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

  useEffect(() => {
    // Vérifier que l'utilisateur est authentifié et a le rôle admin
    if (!isAuthenticated || user?.role !== 'admin') {
      console.log('Utilisateur non authentifié ou non admin');
      return;
    }

    const fetchProductsByCategory = async () => {
      try {
        console.log('Tentative de récupération des données produits par catégorie...');
        const response = await apiService.get('/api/v1/dashboard/produits-par-categorie');
        console.log('Réponse API:', response);
        const data = response.data;

        const abbreviatedCategories = data.map(item => getAbbreviation(item.name));
        const seriesData = data.map(item => item.data);
        const categoryColors = data.map(item => item.color);

        setChartData(prevState => ({
          ...prevState,
          series: [{
            ...prevState.series[0],
            data: seriesData
          }],
          options: {
            ...prevState.options,
            colors: categoryColors,
            xaxis: {
              ...prevState.options.xaxis,
              categories: abbreviatedCategories
            }
          }
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des données du graphique:', error);
        console.error('Détails de l\'erreur:', error.response?.data);
      }
    };

    fetchProductsByCategory();
  }, [isAuthenticated, user]);

  return (
    <div className="card">
      <div className="card-body">
        <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={250} />
      </div>
    </div>
  );
};

export default ProduitsParCategorieChart;
