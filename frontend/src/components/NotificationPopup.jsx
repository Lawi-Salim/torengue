import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const getNotificationDetails = (notification) => {
  switch (notification.type_notif) {
    case 'demande_vendeur':
      return {
        icon: <FiUserPlus />,
        title: 'Demande Vendeur',
      };
    case 'approbation_vendeur':
      return {
        icon: <FiUserCheck />,
        title: 'Vendeur Approuvé',
      };
    case 'rejet_vendeur':
      return {
        icon: <FiUserX />,
        title: 'Vendeur Rejeté',
      };
    case 'new_order':
      return {
        icon: <FiShoppingCart />,
        title: 'Nouvelle Commande',
      };
    case 'payment_received':
      return {
        icon: <FiCreditCard />,
        title: 'Paiement Reçu',
      };
    case 'new_product':
      return {
        icon: <FiPackage />,
        title: 'Nouveau Produit',
      };
    case 'alert':
        return {
          icon: <FiAlertTriangle />,
          title: 'Alerte',
        };
    case 'info':
    case 'confirmation':
    default:
      return {
        icon: <FiBell />,
        title: 'Notification',
      };
  }
};

const NotificationPopup = ({ notifications, onClose, onNotificationClick }) => {
  const navigate = useNavigate();
  return (
    <div className="notification-popup">
      <div className="notification-popup-header">
        <h3>Notifications</h3>
      </div>
      <div className="notification-popup-body">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const { icon, title } = getNotificationDetails(notif);
            return (
              <div 
                key={notif.id_notif} 
                className={`notification-item ${notif.notif_lu ? 'read' : ''}`}
                onClick={() => {
                  if (onNotificationClick) {
                    onNotificationClick(notif.id_notif);
                  }
                  // Redirection personnalisée pour les commandes vendeur
                  if (notif.type_notif === 'new_order') {
                    navigate('/dashboard/vendeur/commandes');
                  } else {
                  navigate('/dashboard/admin/notifications');
                  }
                  onClose();
                }}
              >
                <div className="notification-icon">{icon}</div>
                <div className="notification-content">
                  <p><strong>{title}</strong></p>
                  <span>{notif.message}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-notifications">Aucune nouvelle notification.</p>
        )}
      </div>
      <div className="notification-popup-footer">
        <Link to="/dashboard/admin/notifications" onClick={onClose}>
          Voir toutes les notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationPopup;
