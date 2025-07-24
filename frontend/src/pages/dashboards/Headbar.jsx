import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../apiService';
import NotificationPopup from '../../components/NotificationPopup';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { FiMail, FiPhone, FiUser, FiMap, FiShoppingCart, FiBell, FiTrash2 } from 'react-icons/fi';
import ProfilUser from './ProfilUser';

const Headbar = () => {
  const { user, logout, notifications, unreadCount, markNotificationAsRead } = useAuth();
  const { cartItems, removeFromCart, updateCartQuantity, openCartModal } = useCart();
  const navigate = useNavigate();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const notificationGroupRef = useRef(null);

    const openProfileModal = async () => {
    setIsProfileModalOpen(true);
    if (!profileData) { // Fetch only if data is not already loaded
      setLoadingProfile(true);
      try {
        const { data } = await apiService.get('/api/v1/users/me/profile');
        setProfileData(data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil', error);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
        return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'admin') {
        try {
          const { data } = await apiService.get('/api/v1/demandes-vendeur/pending-count');
          setPendingCount(data.count);
        } catch (error) {
          console.error('Erreur lors de la récupération du nombre de demandes en attente:', error);
        }
      }
    };

    fetchPendingCount();
  }, [user]);



  // Fermer le popup de notification si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
            if (notificationGroupRef.current && !notificationGroupRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="headbar">
      <div className="headbar-title">Biyashara</div>
      <div className="actions-user">
        {/* Notifications */}
        <div className="headbar-notification-group" ref={notificationGroupRef}>
          {(user?.role === 'client' || user?.role === 'vendeur') && (
            <button className='shop-cart' onClick={openCartModal}>
              <FiShoppingCart className="headbar-cart" title="Panier" />
              {cartItemCount > 0 && <span className='cart-badge'>{cartItemCount}</span>}
            </button>
          )}
          <button className="notification-btn" onClick={() => setIsNotificationOpen((o) => !o)}>
            <FiBell className="headbar-bell" title="Notifications" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {isNotificationOpen && 
            <NotificationPopup 
              notifications={notifications.slice(0, 5)} 
              onClose={() => setIsNotificationOpen(false)} 
              onNotificationClick={markNotificationAsRead} 
            />
          }
        </div>
        {/* Thème */}
        {/* <FiSun className="headbar-theme" title="Changer le thème" /> */}
        <div className="headbar-user-group" ref={dropdownRef}>
          <button
            className="headbar-user-dropdown-btn"
            onClick={() => setOpen((o) => !o)}
          >
            {user?.nom} <span className="headbar-user-role"></span>
            <svg className={`dropdown-arrow${open ? ' open' : ''}`} width="16" height="16" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" fill="currentColor"/></svg>
          </button>
          {open && (
            <div className="headbar-dropdown">
              <div className="headbar-dropdown-user">{user?.nom}</div>
              <div className="headbar-dropdown-role">{user?.role}</div>
              <div className="profil-user" onClick={setIsProfileModalOpen} style={{cursor: 'pointer'}} >
                Mon profil
              </div>
              {/* Lien demande vendeur si role=admin */}
              {user?.role === 'admin' && (
                <Link to="/dashboard/admin/demandes-vendeurs" className="headbar-dropdown-link">
                  Demandes vendeurs
                  {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
                </Link>
              )}
              <button className="headbar-logout headbar-dropdown-logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          )}

          {isProfileModalOpen && (
            <ProfilUser onClose={() => setIsProfileModalOpen(false)} />
          )}
        </div>
      </div>
    </header>

    </>
  );
};

export default Headbar;
