import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import apiService from '../../../apiService';
import './styleAdmin.css'; 
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const DemandesVendeurs = () => {
  const { user, token, logout } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDemandes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const { data } = await apiService.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur`, {
        headers: { Authorization: `Bearer ${token}` }
      });
                  setDemandes(data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
        if (error.response && error.response.status === 401) {
          toast.dismiss();
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          logout();
        } else {
          toast.dismiss();
          toast.error('Impossible de charger les demandes.');
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendeur approuvé avec succès !');
      fetchDemandes(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de l'approbation du vendeur:", error);
      toast.error('Erreur lors de l\'approbation.');
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/demandes-vendeur/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.warn('Demande rejetée.');
      fetchDemandes(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast.error('Le rejet a échoué.');
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'nom', header: 'Nom du demandeur' },
      { accessorKey: 'email_pro', header: 'Email' },
      { accessorKey: 'nom_boutique', header: 'Nom de la boutique' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="action-buttons">
            <button 
              onClick={() => handleApprove(row.original.id_devenirvendeur)}
              className="btn-approve"
            >
              <FiCheckCircle size={14.9} />
            </button>
            <button 
              onClick={() => handleReject(row.original.id_devenirvendeur)}
              className="btn-reject"
            >
              <FiXCircle size={14.9} />
            </button>
          </div>
        ),
      },
    ],
    [handleApprove, handleReject]
  );

  const table = useReactTable({
    data: demandes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });



  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Liste des demandes vendeurs</h2>
      </div>
      <div className='card-body'>
        {loading ? (
          <Spinner />
        ) : demandes.length === 0 ? (
        <EmptyState 
          title="Liste des demandes vendeurs"
          message="Aucune demande n'a été envoyée pour le moment."
        />
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default DemandesVendeurs;
