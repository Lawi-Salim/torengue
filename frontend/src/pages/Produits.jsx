import { useState } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiPackage } from 'react-icons/fi';

const Produits = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Données de démonstration
  const produits = [
    {
      id: 1,
      nom: 'Ciment Portland',
      description: 'Ciment de construction standard',
      prix: 12.50,
      stock: 150,
      categorie: 'Ciment et Mortier',
      unite: 'Sac',
      seuil_alerte: 20,
      image: 'default.jpg'
    },
    {
      id: 2,
      nom: 'Briques Standard',
      description: 'Briques de construction 20x10x5cm',
      prix: 0.85,
      stock: 5000,
      categorie: 'Briques et Blocs',
      unite: 'Pièce',
      seuil_alerte: 500,
      image: 'default.jpg'
    },
    {
      id: 3,
      nom: 'Sable de Construction',
      description: 'Sable fin pour mortier et béton',
      prix: 8.20,
      stock: 15,
      categorie: 'Ciment et Mortier',
      unite: 'Tonne',
      seuil_alerte: 5,
      image: 'default.jpg'
    }
  ];

  const filteredProduits = produits.filter(produit =>
    produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre catalogue de produits de construction
          </p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select className="input w-48">
            <option value="">Toutes les catégories</option>
            <option value="ciment">Ciment et Mortier</option>
            <option value="briques">Briques et Blocs</option>
            <option value="acier">Acier et Fer</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProduits.map((produit) => (
          <div key={produit.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-primary-600 rounded">
                  <FiEdit />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 rounded">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {produit.nom}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {produit.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prix:</span>
                  <span className="font-medium">kmf{produit.prix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stock:</span>
                  <span className={`font-medium ${
                    produit.stock <= produit.seuil_alerte ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {produit.stock} {produit.unite}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Catégorie:</span>
                  <span className="text-gray-700">{produit.categorie}</span>
                </div>
              </div>

              {produit.stock <= produit.seuil_alerte && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ⚠️ Stock faible
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProduits.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter votre premier produit.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Produits; 