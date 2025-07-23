import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
  <div className="flex flex-col min-h-screen bg-gray-50">
    {/* Navbar */}
    <nav className="w-full bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <div className="text-2xl font-bold text-blue-700">Gestion Vente</div>
      <div className="space-x-4">
        <Link to="/login" className="btn btn-primary">Se connecter</Link>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-secondary"
          >
            Créer un compte
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                to="/register?role=vendeur"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                En tant que vendeur
              </Link>
              <Link
                to="/register?role=client"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                En tant que client
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Footer */}
    <footer className="w-full bg-white text-gray-400 text-center py-4 border-t mt-auto">
      © {new Date().getFullYear()} Gestion Vente. Tous droits réservés.
    </footer>
  </div>
  );
};

export default Home; 