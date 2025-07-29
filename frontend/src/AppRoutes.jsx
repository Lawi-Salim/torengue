import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Produits from './pages/Produits';
import Ventes from './pages/Ventes';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import FactureView from './pages/FactureView';

// Admin
import Admin from './pages/dashboards/Admin';
import DashboardHome from './pages/dashboards/DashboardHome';
import HomeAdmin from './pages/sidebars/sidebarAdmin/HomeAdmin';
import ListeUtilisateur from './pages/sidebars/sidebarAdmin/ListeUtilisateur';
import ProduitAdmin from './pages/sidebars/sidebarAdmin/ProduitAdmin';
import CommandeAdmin from './pages/sidebars/sidebarAdmin/CommandeAdmin';
import PaiementAdmin from './pages/sidebars/sidebarAdmin/PaiementAdmin';
import VenteAdmin from './pages/sidebars/sidebarAdmin/VenteAdmin';
import DemandesVendeurs from './pages/sidebars/sidebarAdmin/DemandesVendeurs';
import NotificationsPage from './pages/sidebars/sidebarAdmin/NotificationsPage';

// Vendeur
import VendeurDashboard from './pages/dashboards/Vendeur';
import HomeVendeur from './pages/sidebars/sidebarVendeur/HomeVendeur';
import ProduitVendeur from './pages/sidebars/sidebarVendeur/ProduitVendeur';
import ClientFavoris from './pages/sidebars/sidebarVendeur/ClientFavoris';
import NotificationsVendeur from './pages/sidebars/sidebarVendeur/NotificationsVendeur';
import PaiementVendeur from './pages/sidebars/sidebarVendeur/PaiementVendeur';
import CommandeVendeur from './pages/sidebars/sidebarVendeur/CommandeVendeur';
import FactureVendeur from './pages/sidebars/sidebarVendeur/FactureVendeur';
import StockVendeur from './pages/sidebars/sidebarVendeur/StockVendeur';
import LivraisonVendeur from './pages/sidebars/sidebarVendeur/LivraisonVendeur';

// Client
import ClientDashboard from './pages/dashboards/Client';
import HomeClient from './pages/sidebars/sidebarClient/HomeClient';
import ProduitClient from './pages/sidebars/sidebarClient/ProduitClient';
import PaiementClient from './pages/sidebars/sidebarClient/PaiementClient';
import CommandeClient from './pages/sidebars/sidebarClient/CommandeClient';
import FactureClient from './pages/sidebars/sidebarClient/FactureClient';
import VendeurFavoris from './pages/sidebars/sidebarClient/VendeurFavoris';
import NotificationsClient from './pages/sidebars/sidebarClient/NotificationsClient';

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Routes de l'admin */}
        <Route path="/dashboard/admin" element={<Admin />}>
          <Route index element={<DashboardHome />} />
          <Route path="home" element={<HomeAdmin />} />
          <Route path="utilisateurs" element={<ListeUtilisateur />} />
          <Route path="demandes" element={<DemandesVendeurs />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="produits" element={<ProduitAdmin />} />
          <Route path="commandes" element={<CommandeAdmin />} />
          <Route path="paiements" element={<PaiementAdmin />} />
          <Route path="ventes" element={<VenteAdmin />} />
          <Route path="demandes-vendeurs" element={<DemandesVendeurs />} />
        </Route>

        {/* Routes du vendeur */}
        <Route path="/dashboard/vendeur" element={<VendeurDashboard />}>
          <Route index element={<HomeVendeur />} />
          <Route path="home" element={<HomeVendeur />} />
          <Route path="produits" element={<ProduitVendeur />} />
          <Route path="clients" element={<ClientFavoris />} />
          <Route path="notifications" element={<NotificationsVendeur />} />
          <Route path="paiements" element={<PaiementVendeur />} />
          <Route path="commandes" element={<CommandeVendeur />} />
          <Route path="factures" element={<FactureVendeur />} />
          <Route path="stock" element={<StockVendeur />} />
          <Route path="livraisons" element={<LivraisonVendeur />} />
        </Route>

        {/* Routes du client */}
        <Route path="/dashboard/client" element={<ClientDashboard />}>
          <Route index element={<HomeClient />} />
          <Route path="home" element={<HomeClient />} />
          <Route path="produits" element={<ProduitClient />} />
          <Route path="notifications" element={<NotificationsClient />} />
          <Route path="paiements" element={<PaiementClient />} />
          <Route path="commandes" element={<CommandeClient />} />
          <Route path="factures" element={<FactureClient />} />
          <Route path="vendeurs" element={<VendeurFavoris />} />
        </Route>

        {/* Accès direct aux pages principales */}
        <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
        <Route path="/produits" element={<ProtectedRoute><Produits /></ProtectedRoute>} />
        <Route path="/facture/:id" element={<FactureView />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;