import { useState } from 'react';
import { FiPlus, FiSearch, FiEye, FiEdit, FiShoppingCart } from 'react-icons/fi';

const Ventes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Données de démonstration
  const ventes = [
    {
      id: 1,
      numero: 'V-2024-001',
      client: 'Construction ABC',
      date: '2024-01-15',
      montant: 1250.00,
      statut: 'payée',
      produits: [
        { nom: 'Ciment Portland', quantite: 50, prix: 12.50 },
        { nom: 'Briques Standard', quantite: 1000, prix: 0.85 }
      ]
    },
    {
      id: 2,
      numero: 'V-2024-002',
      client: 'Entreprise XYZ',
      date: '2024-01-14',
      montant: 850.75,
      statut: 'en cours',
      produits: [
        { nom: 'Sable de Construction', quantite: 10, prix: 8.20 },
        { nom: 'Briques Standard', quantite: 500, prix: 0.85 }
      ]
    },
    {
      id: 3,
      numero: 'V-2024-003',
      client: 'Particulier',
      date: '2024-01-13',
      montant: 320.50,
      statut: 'livrée',
      produits: [
        { nom: 'Ciment Portland', quantite: 20, prix: 12.50 },
        { nom: 'Briques Standard', quantite: 200, prix: 0.85 }
      ]
    }
  ];

  const filteredVentes = ventes.filter(vente =>
    vente.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'payée':
        return 'bg-green-100 text-green-800';
      case 'en cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'livrée':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos ventes et commandes
          </p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Nouvelle vente</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select className="input w-48">
            <option value="">Tous les statuts</option>
            <option value="payée">Payée</option>
            <option value="en cours">En cours</option>
            <option value="livrée">Livrée</option>
          </select>
        </div>
      </div>

      {/* Sales list */}
      <div className="space-y-4">
        {filteredVentes.map((vente) => (
          <div key={vente.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiShoppingCart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vente.numero}
                  </h3>
                  <p className="text-sm text-gray-600">{vente.client}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vente.statut)}`}>
                  {vente.statut}
                </span>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 rounded">
                    <FiEye />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary-600 rounded">
                    <FiEdit />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(vente.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant total</p>
                <p className="font-medium text-lg text-green-600">kmf{vente.montant.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits</p>
                <p className="font-medium">{vente.produits.length} article(s)</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Produits commandés:</p>
              <div className="space-y-1">
                {vente.produits.map((produit, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{produit.nom} (x{produit.quantite})</span>
                    <span>kmf{(produit.prix * produit.quantite).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVentes.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune vente trouvée
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre première vente.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Ventes; 