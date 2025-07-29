import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import { 
  FiBell, 
  FiShoppingCart, 
  FiCreditCard, 
  FiUserPlus, 
  FiUserCheck, 
  FiUserX, 
  FiPackage,
  FiAlertTriangle
} from 'react-icons/fi';
import '../sidebarAdmin/NotificationsPage.css';

const getNotificationDetails = (notification) => {
  switch (notification.type_notif) {
    case 'demande_vendeur':
      return { icon: <FiUserPlus />, title: 'Demande Vendeur' };
    case 'approbation_vendeur':
      return { icon: <FiUserCheck />, title: 'Vendeur Approuvé' };
    case 'rejet_vendeur':
      return { icon: <FiUserX />, title: 'Vendeur Rejeté' };
    case 'new_order':
      return { icon: <FiShoppingCart />, title: 'Nouvelle Commande' };
    case 'payment_received':
      return { icon: <FiCreditCard />, title: 'Paiement Reçu' };
    case 'new_product':
      return { icon: <FiPackage />, title: 'Nouveau Produit' };
    case 'alert':
      return { icon: <FiAlertTriangle />, title: 'Alerte' };
    case 'info':
    case 'confirmation':
    default:
      return { icon: <FiBell />, title: 'Notification' };
  }
};

const NotificationItem = ({ notification, onClick }) => {
  const { icon, title } = getNotificationDetails(notification);
  return (
    <div 
      className={`notification-item-page ${notification.notif_lu ? 'read' : ''}`}
      onClick={() => onClick(notification.id_notif)}
    >
      <div className="notification-icon-page">{icon}</div>
      <div className="notification-content-page">
        <p className="notification-title-page">{title}</p>
        <p className="notification-message-page">{notification.message}</p>
        <span className="notification-date-page">
          {new Date(notification.date_notif).toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  );
};

const NotificationsClient = () => {
  const { notifications, markNotificationAsRead, loading } = useAuth();

  const handleNotificationClick = (id) => {
    markNotificationAsRead(id);
  };

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date_notif) - new Date(a.date_notif));

  return (
    <div className="card-user">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="card-title">Notifications</h2>
      </div>
      <div className='card-body'>
        {loading ? (
          <Spinner />
        ) : sortedNotifications.length > 0 ? (
        <div className="notifications-list-page">
          {sortedNotifications.map((notif) => (
            <NotificationItem 
              key={notif.id_notif} 
              notification={notif} 
              onClick={handleNotificationClick} 
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="Aucune notification"
          message="Vous n'avez aucune notification pour le moment."
        />
      )}
      </div>
    </div>
  );
};

export default NotificationsClient; 