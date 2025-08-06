import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Headbar from './Headbar';

import { FiMenu } from 'react-icons/fi';

const Client = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-family-karla">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Headbar>
                    <button onClick={toggleSidebar} className="sidebar-toggle-open">
            <FiMenu size={24} />
          </button>
        </Headbar>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Client;