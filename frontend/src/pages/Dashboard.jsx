import { useAuth } from '../context/AuthContext';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Produits',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: FiPackage,
      color: 'bg-blue-500'
    },
    {
      title: 'Ventes',
      value: '2,847',
      change: '+8%',
      changeType: 'positive',
      icon: FiShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Revenus',
      value: 'kmf45,231',
      change: '+23%',
      changeType: 'positive',
      icon: FiTrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Alertes Stock',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: FiAlertTriangle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.nom} !
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de votre activité aujourd'hui
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} ce mois
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Activité Récente</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nouvelle vente</p>
                <p className="text-xs text-gray-500">Ciment Portland - 50 sacs</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 2h</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Produit ajouté</p>
                <p className="text-xs text-gray-500">Briques réfractaires</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 4h</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Alerte stock</p>
                <p className="text-xs text-gray-500">Sable de construction</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 6h</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Produits Populaires</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ciment Portland</p>
                <p className="text-xs text-gray-500">Vendu 234 fois</p>
              </div>
              <span className="text-sm font-medium text-green-600">kmf12.50</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Briques Standard</p>
                <p className="text-xs text-gray-500">Vendu 189 fois</p>
              </div>
              <span className="text-sm font-medium text-green-600">kmf0.85</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Sable de Construction</p>
                <p className="text-xs text-gray-500">Vendu 156 fois</p>
              </div>
              <span className="text-sm font-medium text-green-600">kmf8.20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 