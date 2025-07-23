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

const ventesData = {
  series: [{ name: 'Ventes', data: [12, 20, 15, 30, 25, 40, 35, 42, 39, 50, 48, 60] }],
  options: {
    chart: { type: 'line', height: 250, toolbar: { show: false }, fontFamily: 'Poppins, sans-serif' },
    xaxis: { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'] },
    colors: ['#6366f1'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Ventes par mois', align: 'left' }
  }
};

const productsByCategoryData = {
  series: [{
    name: 'Produits vendus',
    data: [44, 55, 41, 17, 22, 43]
  }],
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
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 3,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Bois', 'Elec.', 'Plom.', 'Isol.', 'Pein.', 'Secu.'],
    },
    legend: { show: false },
    title: { text: 'Produits par catégorie', align: 'left' },
    tooltip: {
      x: {
        formatter: function (val) {
          const categoryMap = {
            'Bois': 'Bois et Panneaux',
            'Elec.': 'Électricité',
            'Plom.': 'Plomberie',
            'Isol.': 'Isolation',
            'Pein.': 'Peinture et Finition',
            'Secu.': 'Sécurité'
          };
          return categoryMap[val] || val;
        }
      }
    }
  }
};

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

    if (authLoading || dataLoading) return <div className="loading-container"><Spinner /></div>;
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
        <div className="card">
          <ReactApexChart options={ventesData.options} series={ventesData.series} type="line" height={250} />
        </div>
        <div className="card">
          <ReactApexChart options={productsByCategoryData.options} series={productsByCategoryData.series} type="bar" height={250} />
        </div>
      </div>

      <div className="card">
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

