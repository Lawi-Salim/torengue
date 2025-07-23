import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Headbar from './Headbar';
import VenteAdmin from '../sidebars/sidebarAdmin/VenteAdmin';
import DemandesVendeurs from '../sidebars/sidebarAdmin/DemandesVendeurs';
import HomeAdmin from '../sidebars/sidebarAdmin/HomeAdmin';

const Admin = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-family-karla">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Headbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
