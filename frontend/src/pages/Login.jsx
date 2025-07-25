import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result) {
        // Redirection selon le rôle
        const role = localStorage.getItem('userRole');
        if (role) {
          // Redirection vers le dashboard approprié
          if (role === 'admin') {
            navigate('/dashboard/admin');
          } else if (role === 'vendeur') {
            navigate('/dashboard/vendeur');
          } else if (role === 'client') {
            navigate('/dashboard/client');
          }
        } else {
          // fallback si pas de rôle dans la réponse
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="container-sm">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title">Connexion</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <span className="input-icon">
                  <FiMail size={16} />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <span className="input-icon">
                  <FiLock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-eye"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              
            </div>
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-primary-600 text-sm hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Ajout du dropdown-menu pour l'inscription */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <DropdownInscriptionLink />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant DropdownInscription (identique à Home.jsx)
function DropdownInscription() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="nav-dropdown" style={{ display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        type="button"
      >
        Créer un compte
      </button>
      {isOpen && (
        <div className="dropdown-menu" style={{ position: 'absolute', right: 0, zIndex: 10 }}>
          <Link
            to="/register?role=vendeur"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            En tant que vendeur
          </Link>
          <Link
            to="/register?role=client"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            En tant que client
          </Link>
        </div>
      )}
    </div>
  );
}

// Nouveau composant DropdownInscriptionLink
function DropdownInscriptionLink() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        onClick={() => setIsOpen((v) => !v)}
        tabIndex={0}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        style={{ cursor: 'pointer' }}
      >
        Créer un compte
      </span>
      {isOpen && (
        <div className="dropdown-menu" style={{ position: 'absolute', right: 0, zIndex: 10, minWidth: 180 }}>
          <Link
            to="/register?role=vendeur"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            En tant que vendeur
          </Link>
          <Link
            to="/register?role=client"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            En tant que client
          </Link>
        </div>
      )}
    </span>
  );
}

export default Login; 