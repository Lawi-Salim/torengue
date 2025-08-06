import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBriefcase, FiGlobe, FiFileText, FiHome } from 'react-icons/fi';
import apiService from '../apiService';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, loading, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Vendeur specific
    nom_boutique: '',
    nationalite: '',
    description: '',
    adresse: '',
    // Client specific
    adresse_facturation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', telephone: '' });
  const [isChecking, setIsChecking] = useState({ email: false, telephone: false });
  const { useRef } = React;
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleFromUrl = params.get('role');
    if (roleFromUrl === 'client' || roleFromUrl === 'vendeur') {
      setFormData((prev) => ({ ...prev, role: roleFromUrl }));
    } else {
      toast.error("Rôle non spécifié ou invalide.");
      navigate('/home');
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dashboardPath = user.role === 'vendeur' ? '/dashboard/vendeur' : '/dashboard/client';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, loading, navigate, user]);

  const formatAndSetPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '+';
    if (digits.length > 0) formatted += digits.substring(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.substring(6, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    return formatted;
  };

  const checkExistence = async (field, value) => {
    if (!value) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    setIsChecking(prev => ({ ...prev, [field]: true }));
    try {
      const { data } = await apiService.post('/api/v1/auth/check-existence', { field, value });
      if (data.exists) {
        setValidationErrors(prev => ({ ...prev, [field]: `Ce ${field === 'email' ? 'email' : 'numéro de téléphone'} est déjà utilisé.` }));
      } else {
        setValidationErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification du champ ${field}:`, error);
      // Ne pas bloquer l'utilisateur si l'API de vérification échoue
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    } finally {
      setIsChecking(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telephone') {
      const formattedValue = formatAndSetPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedValue });

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        checkExistence(name, formattedValue);
      }, 500);
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'email') {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
          checkExistence(name, value);
        }, 500);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.role === 'vendeur') {
      try {
        const vendeurData = {
          nom: formData.nom,
          email: formData.email,
          mot_de_passe: formData.password,
          telephone: formData.telephone,
          nom_boutique: formData.nom_boutique,
          nationalite: formData.nationalite,
          description: formData.description,
          adresse: formData.adresse,
        };
        const response = await apiService.post('/api/v1/demandes-vendeur', vendeurData);
        toast.success('Votre demande a été envoyée et est en attente d\'approbation.');
        navigate('/login'); // Redirige vers la page de connexion
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la soumission.';
        toast.error(`Erreur: ${errorMessage}`);
      }
    } else {
      const registrationData = {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
        role: formData.role,
      };
      if (formData.role === 'client') {
        registrationData.adresse_facturation = formData.adresse_facturation;
      }
      await register(registrationData);
    }
  };

  if (!formData.role) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="container-sm">
        <div className="card form-register">
          <div className="card-header text-center">
            <h1 className="card-title">Créer un compte {formData.role === 'vendeur' ? 'Vendeur' : 'Client'}</h1>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Champs communs */}
              <div className="input-group">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <span className="input-icon"><FiUser size={16} /></span>
                  <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} required className="input w-full" placeholder="Votre nom complet" />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                <div className="relative">
                  <span className="input-icon"><FiMail size={16} /></span>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="input w-full" placeholder="exemple@domaine.com" />
                  {isChecking.email && <Spinner size={16} inline={true} style={{ position: 'absolute', right: '10px', top: '10px' }} />}
                </div>
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <span className="input-icon"><FiPhone size={16} /></span>
                  <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} required className="input w-full" placeholder="+269 123 45 67" maxLength="15" />
                  {isChecking.telephone && <Spinner size={16} inline={true} style={{ position: 'absolute', right: '10px', top: '10px' }} />}
                </div>
                {validationErrors.telephone && <p className="text-red-500 text-xs mt-1">{validationErrors.telephone}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <span className="input-icon"><FiLock size={16} /></span>
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required className="input w-full" placeholder="Votre mot de passe" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-eye" tabIndex={-1}>
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <span className="input-icon"><FiLock size={16} /></span>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input w-full" placeholder="Confirmez votre mot de passe" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="input-eye" tabIndex={-1}>
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {formData.role === 'vendeur' && (
                <>
                  <div className="input-group">
                    <label htmlFor="nom_boutique" className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
                    <div className="relative">
                      <span className="input-icon"><FiBriefcase size={16} /></span>
                      <input type="text" id="nom_boutique" name="nom_boutique" value={formData.nom_boutique} onChange={handleChange} required className="input w-full" placeholder="Ma Super Boutique" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                    <div className="relative">
                      <span className="input-icon"><FiGlobe size={16} /></span>
                      <input type="text" id="nationalite" name="nationalite" value={formData.nationalite} onChange={handleChange} className="input w-full" placeholder="Nationalité" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">Adresse de la boutique</label>
                    <div className="relative">
                      <span className="input-icon"><FiHome size={16} /></span>
                      <input type="text" id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} className="input w-full" placeholder="123 Rue du Commerce" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                      <span className="input-icon"><FiFileText size={16} /></span>
                      <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="input w-full" placeholder="Décrivez votre boutique..."></textarea>
                    </div>
                  </div>
                </>
              )}

              {formData.role === 'client' && (
                <>
                  <div className="input-group">
                    <label htmlFor="adresse_facturation" className="block text-sm font-medium text-gray-700 mb-1">Adresse de facturation</label>
                    <div className="relative">
                      <span className="input-icon"><FiHome size={16} /></span>
                      <textarea id="adresse_facturation" name="adresse_facturation" value={formData.adresse_facturation} onChange={handleChange} className="input w-full" placeholder="Votre adresse de facturation"></textarea>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading || validationErrors.email || validationErrors.telephone || isChecking.email || isChecking.telephone} className="btn btn-primary w-full mt-6">
                {loading ? (
                  <>
                    <Spinner size={20} inline={true} />
                    <span style={{ marginLeft: '8px' }}>Inscription en cours...</span>
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>
          </div>
          <div className="mt-6 text-center pb-6">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 