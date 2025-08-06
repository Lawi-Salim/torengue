import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import apiService from '../../apiService';
import Spinner from '../Spinner';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';

const ProduitsVenteChart = ({ dataType = 'ventes' }) => {
  const [periode, setPeriode] = useState('semaine'); // 'annee', 'trimestre', 'semaine'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventesData, setVentesData] = useState({
    series: [{ name: 'Revenus', data: [] }],
    options: {
      chart: { type: 'line', height: 250, toolbar: { show: false }, fontFamily: 'Poppins, sans-serif' },
      xaxis: { categories: [] },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      title: { text: 'Ventes', align: 'left' }
    }
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const url = dataType === 'ventes' ? '/api/v1/ventes' : '/api/v1/commandes/mes-commandes';
        const res = await apiService.get(url);
        const items = res.data.data || [];
        const aujourdhui = new Date();
        const dataName = dataType === 'ventes' ? 'Revenus' : 'Dépenses';
        const dateField = dataType === 'ventes' ? 'date' : 'date_commande';

        if (periode === 'annee') {
          const moisLabels = [];
          const revenusParMois = Array(12).fill(0);
          const dateFin = new Date();
          const dateDebut = new Date();
          dateDebut.setMonth(dateDebut.getMonth() - 11);
          dateDebut.setDate(1);
          dateDebut.setHours(0, 0, 0, 0);

          for (let i = 0; i < 12; i++) {
            const mois = new Date(dateDebut);
            mois.setMonth(dateDebut.getMonth() + i);
            const options = { month: 'short', year: '2-digit' };
            moisLabels.push(new Intl.DateTimeFormat('fr-FR', options).format(mois));
          }

          items.forEach(item => {
            const dateItem = new Date(item[dateField]);
            if (dateItem >= dateDebut && dateItem <= dateFin) {
              const anneeItem = dateItem.getFullYear();
              const moisItem = dateItem.getMonth();
              const anneeDebut = dateDebut.getFullYear();
              const moisDebut = dateDebut.getMonth();
              const index = (anneeItem - anneeDebut) * 12 + (moisItem - moisDebut);
              if (index >= 0 && index < 12) {
                revenusParMois[index] += Number(item.montant_total);
              }
            }
          });

          setVentesData(prev => ({
            ...prev,
            series: [{ name: dataName, data: revenusParMois }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: moisLabels },
              title: { text: `${dataName} des 12 derniers mois`, align: 'left' }
            }
          }));
        } else if (periode === 'trimestre') {
          const moisLabels = [];
          const revenusParMois = Array(3).fill(0);
          const dateFin = new Date();
          const dateDebut = new Date();
          dateDebut.setMonth(dateDebut.getMonth() - 2);
          dateDebut.setDate(1);
          dateDebut.setHours(0, 0, 0, 0);

          for (let i = 0; i < 3; i++) {
            const mois = new Date(dateDebut);
            mois.setMonth(dateDebut.getMonth() + i);
            const options = { month: 'long' };
            moisLabels.push(new Intl.DateTimeFormat('fr-FR', options).format(mois));
          }

          items.forEach(item => {
            const dateItem = new Date(item[dateField]);
            if (dateItem >= dateDebut && dateItem <= dateFin) {
              const anneeItem = dateItem.getFullYear();
              const moisItem = dateItem.getMonth();
              const anneeDebut = dateDebut.getFullYear();
              const moisDebut = dateDebut.getMonth();
              const index = (anneeItem - anneeDebut) * 12 + (moisItem - moisDebut);
              if (index >= 0 && index < 3) {
                revenusParMois[index] += Number(item.montant_total);
              }
            }
          });
          setVentesData(prev => ({
            ...prev,
            series: [{ name: dataName, data: revenusParMois }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: moisLabels },
              title: { text: `${dataName} par mois (trimestre)`, align: 'left' }
            }
          }));
        } else if (periode === 'semaine') {
          const joursLabels = [];
          const revenusParJour = Array(7).fill(0);
          const dateDebut = new Date();
          dateDebut.setDate(aujourdhui.getDate() - 6);
          dateDebut.setHours(0, 0, 0, 0);

          for (let i = 0; i < 7; i++) {
            const jour = new Date(dateDebut);
            jour.setDate(dateDebut.getDate() + i);
            const options = { weekday: 'short', day: '2-digit', month: '2-digit' };
            joursLabels.push(new Intl.DateTimeFormat('fr-FR', options).format(jour));
          }

          items.forEach(item => {
            const dateItem = new Date(item[dateField]);
            if (dateItem >= dateDebut && dateItem <= aujourdhui) {
              const diffTime = dateItem.setHours(0,0,0,0) - dateDebut.getTime();
              const index = Math.round(diffTime / (1000 * 60 * 60 * 24));
              if (index >= 0 && index < 7) {
                revenusParJour[index] += Number(item.montant_total);
              }
            }
          });

          setVentesData(prev => ({
            ...prev,
            series: [{ name: dataName, data: revenusParJour }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: joursLabels },
              title: { text: `${dataName} des 7 derniers jours`, align: 'left' }
            }
          }));
        }
      } catch (e) {
        console.error(`Erreur lors de la récupération des ${dataType}:`, e);
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [periode, dataType]);

  return (
    <div className="card">
      <div style={{ padding: '16px', display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className={periode === 'semaine' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('semaine')}>Semaine</button>
        <button className={periode === 'trimestre' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('trimestre')}>Trimestre</button>
        <button className={periode === 'annee' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('annee')}>Année</button>
      </div>
      <div className="card-body">
        {loading ? (
          <Spinner /> 
        ) : error ? (
          <ErrorState title="Erreur" message={error} />
        ) : ventesData.length === 0 ? (
          <EmptyState title="Aucune vente" message="Aucune vente n'a été trouvée." />
        ) : (
          <ReactApexChart options={ventesData.options} series={ventesData.series} type="line" height={350} />
        )}
      </div>
    </div>
  );
};

export default ProduitsVenteChart;
