import React, { useState, useEffect, useMemo } from 'react';

import toast from 'react-hot-toast';
import apiService from '../../../apiService';
import Spinner from '../../../components/Spinner';
import { FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import UserAvatar from '../../../components/UserAvatar';
import UserDetailsModal from './UserDetailsModal';

import './styleAdmin.css';

const ListeUtilisateur = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/users/details`, { 
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

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleApprove = async (vendeurId) => {
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendeurs/${vendeurId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Vendeur approuvé avec succès !');
      fetchData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors de l'approbation du vendeur:", error);
      toast.error("L'approbation a échoué.");
    }
  };

  const handleReject = async (vendeurId) => {
    try {
      await apiService.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/vendeurs/${vendeurId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.warn('Vendeur rejeté.');
      fetchData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors du rejet du vendeur:", error);
      toast.error('Le rejet a échoué.');
    }
  };

    // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / itemsPerPage);

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
          <table className="user-table">
            <thead className="user-thead">
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id_user}>
                  <td><UserAvatar name={user.nom} /></td>
                  <td>{user.nom}</td>
                  <td>{user.email}</td>
                  <td>{user.telephone}</td>
                  <td>
                    {(() => {
                      const { role, vendeur, client } = user;
                      if (role === 'vendeur' && vendeur) return vendeur.adresse;
                      if (role === 'client' && client) return client.adresse_facturation;
                      return 'N/A';
                    })()}
                  </td>
                  <td>{user.date_inscription ? new Date(user.date_inscription).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenModal(user)}>
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {users.length > itemsPerPage && (
            <div className="pagination-controls pagination-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-paginate"><FiArrowLeft/></button>
                <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-paginate"><FiArrowRight/></button>
            </div>
          )}
          <UserDetailsModal 
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
      </div>  
    </div>
  );
};

export default ListeUtilisateur;
