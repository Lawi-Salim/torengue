import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Notif from './Notif';
import AppRoutes from './AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VenteAdmin from './pages/sidebars/sidebarAdmin/VenteAdmin';
import DemandesVendeurs from './pages/sidebars/sidebarAdmin/DemandesVendeurs';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Notif />
        <AppRoutes />
      </CartProvider>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;