import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import useServerStatus from './hooks/useServerStatus';
import Error from './components/Error';
import Spinner from './components/Spinner';

import Notif from './Notif';
import AppRoutes from './AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VenteAdmin from './pages/sidebars/sidebarAdmin/VenteAdmin';
import DemandesVendeurs from './pages/sidebars/sidebarAdmin/DemandesVendeurs';

function AppContent() {
  const { isServerOnline, isLoading } = useServerStatus();

  // Afficher le spinner pendant la vérification
  if (isLoading) {
    return (
      <div className="container-empty">
        <Spinner text="Vérification de la connexion..." />
      </div>
    );
  }

  // Si le serveur est hors ligne, afficher la page d'erreur
  if (!isServerOnline) {
    return (
      <Error 
        title="Serveur indisponible"
        message="Le serveur backend n'est pas accessible actuellement. Veuillez vérifier votre connexion ou réessayer plus tard."
        showRetry={true}
        showHome={true}
      />
    );
  }

  return (
    <>
      <Notif />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
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