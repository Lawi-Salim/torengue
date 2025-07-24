import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBriefcase, FiGlobe, FiFileText, FiHome } from 'react-icons/fi';
import apiService from '../apiService';
import { toast } from 'react-hot-toast';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, loading, isAuthenticated } = useAuth();

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
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        navigate('/'); // Redirige vers la page d'accueil par exemple
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <span className="input-icon"><FiMail size={16} /></span>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="input w-full" placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="relative">
                      <span className="input-icon"><FiPhone size={16} /></span>
                      <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} className="input w-full" placeholder="+33 6 12 34 56 78" />
                    </div>
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

                  {/* Champs spécifiques au rôle */}
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

              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6">
                {loading ? 'Inscription en cours...' : 'Créer mon compte'}
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