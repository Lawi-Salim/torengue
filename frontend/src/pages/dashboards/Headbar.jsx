import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiService from '../../apiService';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { FiMail, FiPhone, FiUser, FiMap, FiShoppingCart, FiBell, FiTrash2 } from 'react-icons/fi';
import ProfilUser from './ProfilUser';
import toast from 'react-hot-toast';

const Headbar = () => {
  const { user, logout, notifications, unreadCount, markNotificationAsRead } = useAuth();
  const { cartItems, removeFromCart, updateCartQuantity, openCartModal, showCartModal, closeCartModal, clearCart } = useCart();
  const navigate = useNavigate();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handlePaiement = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }
    setLoading(true);
    try {
      const commandeData = {
        produits: cartItems.map(item => ({
          id_produit: item.id_produit,
          quantite: item.quantity,
          prix_unitaire: item.prix_unitaire
        })),
        id_client: user.id_user,
      };

      await apiService.post('/api/v1/commandes', commandeData);
      
      toast.success('Commande passée avec succès !');
      clearCart();

    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors du paiement.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin/notifications');
    } else if (user?.role === 'vendeur') {
      navigate('/dashboard/vendeur/notifications');
    } else if (user?.role === 'client') {
      navigate('/dashboard/client/notifications');
    }
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
          try {
            const { data } = await apiService.get('/api/v1/demandes-vendeur/pending-count');
            setPendingCount(data.count);
          } catch (error) {
            console.error('Erreur lors de la récupération du nombre de demandes en attente:', error);
          }
        }
      } catch (error) {
        toast.error('Erreur de connexion')
      } finally {
        setLoading(false);
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
          {(user?.role === 'client') && (
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

    {/* Modal Panier */}
    {showCartModal && (
      <Modal open={showCartModal} onClose={closeCartModal} title="Récapitulatif du Panier" contentClassName="custom-cart-modal-width">
        <div className="cart-modal-content">
          {cartItems.length > 0 ? (
            <>
              <div className='command' style={{ maxHeight: 320, overflowY: 'auto', padding: '0' }}>
                {cartItems.map((item, idx) => (
                  <div key={item.id_produit + '-' + idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderBottom: idx < cartItems.length-1 ? '1px solid #f0f0f0' : 'none', background: idx%2===0 ? '#fafbfc' : '#fff' }}>
                    <img
                      src={item.image ? (item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/produits/images/${item.image}`) : '/default.jpg'}
                      alt={item.nom}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}
                    />
                    <span style={{ flex: 1, fontWeight: 500 }}>{item.nom}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: '2px 8px' }}>
                      <button onClick={() => updateCartQuantity(item.id_produit, item.quantity - 1)} disabled={item.quantity <= 1} style={{ border: 'none', background: '#e5e7eb', borderRadius: '50%', width: 28, height: 28, fontSize: 18, cursor: 'pointer', color: '#374151' }}>-</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id_produit, item.quantity + 1)} style={{ border: 'none', background: '#e5e7eb', borderRadius: '50%', width: 28, height: 28, fontSize: 18, cursor: 'pointer', color: '#374151' }}>+</button>
                    </div>
                    <span style={{ minWidth: 90, textAlign: 'right', fontWeight: 500 }}>{(item.prix_unitaire * item.quantity).toLocaleString()} KMF</span>
                    <button onClick={() => removeFromCart(item.id_produit)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <div className="cart-total" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18, padding: '16px 0', fontSize: '1.15rem' }}>
                <strong style={{ marginRight: 16, fontSize: '1.1rem', color: '#374151' }}>Total :</strong>
                <strong style={{ fontSize: '1.35rem', color: '#2563eb' }}>{cartItems.reduce((acc, item) => acc + item.prix_unitaire * item.quantity, 0).toLocaleString()} KMF</strong>
              </div>
              <div className="btn-order" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  className='btn btn-primary btn-validate-order'
                  style={{ width: '13rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '38px' }}
                  onClick={handlePaiement}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size={15} inline={true} />
                      <span style={{ marginLeft: '8px' }}>Paiement en cours...</span>
                    </>
                  ) : (
                    'Payer la commande'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: '#64748b', fontWeight: 500, fontSize: '1.1rem' }}>
              <span style={{ fontSize: 32, marginBottom: 8 }}>🛒</span>
              Votre panier est vide.
            </div>
          )}
        </div>
      </Modal>
    )}
    </>
  );
};

export default Headbar;
