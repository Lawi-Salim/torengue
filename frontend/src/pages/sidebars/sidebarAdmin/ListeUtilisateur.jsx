import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Spinner from '../../../components/Spinner';
import { FiPlus, FiCheckCircle, FiXCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { 
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import './styleAdmin.css';

const ListeUtilisateur = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/users/details', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.dismiss();
      toast.error('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleApprove = async (vendeurId) => {
    try {
      await axios.put(`http://localhost:5000/api/vendeurs/${vendeurId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Vendeur approuvé avec succès !');
      fetchData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors de l'approbation du vendeur:", error);
      toast.error("L'approbation a échoué.");
    }
  };

  const handleReject = async (vendeurId) => {
    try {
      await axios.put(`http://localhost:5000/api/vendeurs/${vendeurId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.warn('Vendeur rejeté.');
      fetchData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors du rejet du vendeur:", error);
      toast.error('Le rejet a échoué.');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'User ID',
      accessorKey: 'id_user',
      cell: ({ row }) => (<strong>{`N°${row.original.id_user}`}</strong>)
    },
    { header: 'Nom', accessorKey: 'nom' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Téléphone', accessorKey: 'telephone' },
    {
      header: 'Adresse',
      accessorKey: 'adresse',
      cell: ({ row }) => {
        const { role, vendeur, client } = row.original;
        if (role === 'vendeur' && vendeur) {
          return vendeur.adresse;
        }
        if (role === 'client' && client) {
          return client.adresse_facturation;
        }
        return 'N/A';
      }
    },
    {
      header: 'Date de création',
      accessorKey: 'date_inscription',
      cell: ({ row }) => {
        const { date_inscription } = row.original;
        return date_inscription ? new Date(date_inscription).toLocaleDateString() : '-';
      }
    }
  ], []);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });



  return (
    <div className="card-user">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Liste des Utilisateurs</h2>
          <button className="btn btn-primary">
            <FiPlus />
            Ajouter un utilisateur
          </button>
        </div>
        <div className='card-body'>
          {loading ? (
            <Spinner />
          ) : (
          <>
          <table className="user-table">
            <thead className="user-thead">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
          <div className="pagination-controls pagination-center">
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{ <FiArrowLeft/> }</button>
              <span>Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{ <FiArrowRight/> }</button>
          </div>
          </>
          )}
      </div>  
    </div>
  );
};

export default ListeUtilisateur;
