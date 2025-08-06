import './styles.css';
import { useAuth } from '../../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiPackage, FiShoppingCart, FiClipboard, FiCreditCard, FiBell, FiSettings, FiX } from 'react-icons/fi';
import { FaFileInvoiceDollar } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  let links = [];
  if (user?.role === 'admin') {
    links = [
      { to: '/dashboard/admin', label: 'Home', icon: FiHome, end: true },
      { to: '/dashboard/admin/produits', label: 'Produits', icon: FiPackage },
      { to: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: FiUsers },
      { to: '/dashboard/admin/notifications', label: 'Notifications', icon: FiBell },
      { to: '/dashboard/admin/commandes', label: 'Commandes', icon: FiClipboard },
      { to: '/dashboard/admin/paiements', label: 'Paiements', icon: FiCreditCard },
      { to: '/dashboard/admin/ventes', label: 'Ventes', icon: FiShoppingCart },
      { to: '/dashboard/admin/factures', label: 'Factures', icon: FaFileInvoiceDollar },
      { to: '/dashboard/admin/settings', label: 'Paramètres', icon: FiSettings }
    ];
  } else if (user?.role === 'vendeur') {
    links = [
      { to: '/dashboard/vendeur', label: 'Home', icon: FiHome, end: true },
      { to: '/dashboard/vendeur/produits', label: 'Mes produits', icon: FiPackage },
      { to: '/dashboard/vendeur/clients', label: 'Mes clients', icon: FiUsers},
      { to: '/dashboard/vendeur/notifications', label: 'Notifications', icon: FiBell },
      { to: '/dashboard/vendeur/paiements', label: 'Paiements', icon: FiCreditCard },
      { to: '/dashboard/vendeur/commandes', label: 'Commandes', icon: FiClipboard },
      { to: '/dashboard/vendeur/factures', label: 'Factures', icon: FaFileInvoiceDollar },
      { to: '/dashboard/vendeur/stock', label: 'Stock', icon: FiPackage },
      { to: '/dashboard/vendeur/livraisons', label: 'Livraisons', icon: FiShoppingCart },
      { to: '/dashboard/vendeur/settings', label: 'Paramètres', icon: FiSettings }
    ];
  } else if (user?.role === 'client') {
    links = [
      { to: '/dashboard/client', label: 'Home', icon: FiHome, end: true },
      { to: '/dashboard/client/produits', label: 'Produits', icon: FiPackage },
      { to: '/dashboard/client/vendeurs', label: 'Mes vendeurs', icon: FiUsers},
      { to: '/dashboard/client/notifications', label: 'Notifications', icon: FiBell },
      { to: '/dashboard/client/paiements', label: 'Paiements', icon: FiCreditCard },
      { to: '/dashboard/client/commandes', label: 'Commandes', icon: FiClipboard },
      { to: '/dashboard/client/factures', label: 'Factures', icon: FaFileInvoiceDollar },
      { to: '/dashboard/client/settings', label: 'Paramètres', icon: FiSettings }
    ];
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Biyashara</div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <FiX />
          </button>
        </div>
        <nav>
          <ul className="sidebar-list">
          {links.map((link, i) => (
            <li key={i}>
              <NavLink 
                to={link.to} 
                end={link.end}
                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
              >
                <link.icon className="mr-3" />
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
