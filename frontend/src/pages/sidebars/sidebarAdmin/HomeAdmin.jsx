import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FiUsers, FiPackage, FiShoppingCart, FiAlertTriangle, FiPlus, FiDollarSign } from 'react-icons/fi';
import ReactApexChart from 'react-apexcharts';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import Spinner from '../../../components/Spinner';
import apiService from '../../../apiService';
import '../../dashboards/styles.css';

const staticStats = [
  { title: 'Utilisateurs', value: 0, icon: FiUsers, cssClass: 'blue' },
  { title: 'Produits', value: 0, icon: FiPackage, cssClass: 'green' },
  { title: 'Ventes', value: 0, icon: FiShoppingCart, cssClass: 'gray' },
  { title: 'Revenus', value: 0, icon: FiDollarSign, cssClass: 'purple' }
];

const utilisateurs = [
  { nom: 'Fatima Ibrahim', email: 'fatima@gmail.com', role: 'client', date: '2024-07-01' },
  { nom: 'Salim Ibrahim', email: 'salim@gmail.com', role: 'vendeur', date: '2024-07-02' },
  { nom: 'Nada Lawi', email: 'nadalawi@gmail.com', role: 'admin', date: '2024-07-03' },
  { nom: 'Hadji Bamse', email: 'hadji@gmail.com', role: 'client', date: '2024-07-04' }
];

const HomeAdmin = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(staticStats);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState('semaine'); // 'annee', 'trimestre', 'semaine'
  const [ventesData, setVentesData] = useState({
    series: [{ name: 'Revenus', data: Array(12).fill(0) }],
    options: {
      chart: { type: 'line', height: 250, toolbar: { show: false }, fontFamily: 'Poppins, sans-serif' },
      xaxis: { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'] },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      title: { text: 'Ventes par mois', align: 'left' }
    }
  });
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
            { ...staticStats[3], value: statsResponse.data.revenus },
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

  // Ajouter ce useEffect pour charger les ventes dynamiquement
  useEffect(() => {
    const fetchVentes = async () => {
      try {
        const res = await apiService.get('/api/v1/ventes');
        const ventes = res.data.data || [];
        const now = new Date();
        if (periode === 'annee') {
          // Total des revenus par mois sur 12 mois
          const revenusParMois = Array(12).fill(0);
          ventes.forEach(v => {
            const dateVente = new Date(v.date);
            const mois = dateVente.getMonth();
            revenusParMois[mois] += Number(v.montant_total);
          });
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: revenusParMois }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'] },
              title: { text: 'Ventes par mois', align: 'left' }
            }
          }));
        } else if (periode === 'trimestre') {
          // Total des revenus par mois sur les 3 derniers mois
          const moisActuel = now.getMonth();
          const moisLabels = [];
          const revenusParMois = [0, 0, 0];
          for (let i = 2; i >= 0; i--) {
            const mois = (moisActuel - i + 12) % 12;
            moisLabels.push(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][mois]);
          }
          ventes.forEach(v => {
            const dateVente = new Date(v.date);
            const mois = dateVente.getMonth();
            const annee = dateVente.getFullYear();
            const anneeActuelle = now.getFullYear();
            // On ne prend que les ventes de l'année en cours et des 3 derniers mois
            for (let i = 0; i < 3; i++) {
              const moisCible = (moisActuel - 2 + i + 12) % 12;
              if (mois === moisCible && annee === anneeActuelle) {
                revenusParMois[i] += Number(v.montant_total);
              }
            }
          });
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: revenusParMois }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: moisLabels },
              title: { text: 'Ventes par mois (trimestre)', align: 'left' }
            }
          }));
        } else if (periode === 'semaine') {
          // Total des revenus par jour sur les 7 derniers jours
          const joursLabels = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
          const revenusParJour = Array(7).fill(0);
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            joursLabels.push(d);
          }
          ventes.forEach(v => {
            const dateVente = new Date(v.date);
            for (let i = 0; i < 7; i++) {
              const d = new Date(now);
              d.setDate(now.getDate() - (6 - i));
              if (dateVente.toDateString() === d.toDateString()) {
                revenusParJour[i] += Number(v.montant_total);
              }
            }
          });
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: revenusParJour }],
            options: {
              ...prev.options,
              xaxis: { ...prev.options.xaxis, categories: joursLabels },
              title: { text: 'Ventes par jour (semaine)', align: 'left' }
            }
          }));
        }
      } catch (e) {
        // En cas d'erreur, on affiche des zéros
        if (periode === 'annee') {
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: Array(12).fill(0) }]
          }));
        } else if (periode === 'trimestre') {
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: Array(3).fill(0) }]
          }));
        } else if (periode === 'semaine') {
          setVentesData(prev => ({
            ...prev,
            series: [{ name: 'Revenus', data: Array(7).fill(0) }]
          }));
        }
      }
    };
    fetchVentes();
  }, [periode]);

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

  const columns = useMemo(() => [
    { header: 'Nom', accessorKey: 'nom' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Rôle', accessorKey: 'role' },
    { header: 'Date d\'inscription', accessorKey: 'date' }
  ], []);

  const table = useReactTable({
    data: utilisateurs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  });

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

      {/* Sélecteur de période */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className={periode === 'semaine' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('semaine')}>Semaine</button>
        <button className={periode === 'trimestre' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('trimestre')}>Trimestre</button>
        <button className={periode === 'annee' ? 'btn btn-primary' : 'btn'} onClick={() => setPeriode('annee')}>Année</button>
      </div>
      {/* Les deux graphiques côte à côte */}
      <div className="dashboard-grid">
        {/* Graphique des ventes */}
        <div className="card">
          <ReactApexChart options={ventesData.options} series={ventesData.series} type="line" height={250} />
        </div>
        {/* Graphique des produits par catégorie */}
        <div className="card">
          <ReactApexChart options={productsByCategoryData.options} series={productsByCategoryData.series} type="bar" height={250} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2>Utilisateurs récents</h2>
          <button className="btn btn-primary">
            <FiPlus />
            Ajouter
          </button>
        </div>
        <div className="table-container">
          <table className="user-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Précédent</button>
            <span>Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Suivant</button>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;

