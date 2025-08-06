import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Settings from '../../dashboards/Settings';
import ConfirmationModal from '../../../components/ConfirmationModal'; // Le composant de formulaire réutilisable
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';

import '../../dashboards/styles.css';

const SettingsClient = () => {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
    });
    const [initialFormData, setInitialFormData] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [isEmailEditing, setIsEmailEditing] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        const fetchUser = async () => {
            try {
                const res = await apiService.get('/api/v1/auth/profile');
                const userData = res.data.data.user;
                setUser(userData);
                const initialData = {
                    nom: userData.nom || '',
                    email: userData.email || '',
                    telephone: userData.telephone || '',
                    adresse: userData.adresse || ''
                };
                setFormData(initialData);
                setInitialFormData(initialData);
            } catch (err) {
                setError('Erreur lors de la récupération des données utilisateur.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [authLoading, isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            setIsDirty(JSON.stringify(newData) !== JSON.stringify(initialFormData));
            return newData;
        });
    };

    const handleOpenConfirm = (e) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const handleEnableEmailEdit = (e) => {
        e.preventDefault();
        setIsEmailEditing(true);
    };

    const handleCancel = () => {
        setFormData(initialFormData);
        setIsDirty(false);
        setIsEmailEditing(false); // Réinitialiser l'état d'édition de l'email
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);

        let dataToSubmit = { ...formData };
        if (formData.email !== initialFormData.email) {
            dataToSubmit.current_password = currentPassword;
        }

        try {
            const res = await apiService.put('/api/v1/users/me/profile', dataToSubmit);
            const updatedUserData = res.data.data;
            setUser(updatedUserData);
            toast.success('Profil mis à jour avec succès !');
            setInitialFormData({
                nom: updatedUserData.nom,
                email: updatedUserData.email,
                telephone: updatedUserData.telephone,
                adresse: updatedUserData.adresse_facturation || ''
            });
            setIsDirty(false);
            setCurrentPassword(''); // Vider le mot de passe après la soumission
            setIsEmailEditing(false); // Réinitialiser l'état d'édition de l'email
        } catch (err) {
            toast.error(err.response?.data?.message || 'Une erreur est survenue.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return <Spinner title="Chargement des paramètres..." />;
    }

    if (!isAuthenticated) {
        return <EmptyState title="Accès non autorisé" message="Vous devez être connecté pour voir cette page." />;
    }

    if (error) {
        return <EmptyState title="Erreur" message={error} />;
    }

    return (
        <div className="card-user settings-page">
            <div className="card-header">
                <h2 className="card-title">Paramètres du Compte Client</h2>
            </div>
            <div className="card-body">
                <Settings 
                    user={user}
                    formData={formData}
                    isSubmitting={isSubmitting}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleOpenConfirm}
                    isDirty={isDirty}
                    onCancel={handleCancel}
                    isEmailEditing={isEmailEditing}
                    onEnableEmailEdit={handleEnableEmailEdit}
                >
                    {/* Champs spécifiques au client */}
                    <h4>Adresse de Livraison</h4>
                    <div className="form-group">
                        <label htmlFor="adresse">Adresse complète</label>
                        <input 
                            type="text" 
                            id="adresse" 
                            name="adresse" 
                            value={formData.adresse}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Ex: 123 Rue de l'exemple, Moroni"
                            disabled={isSubmitting}
                        />
                    </div>

                </Settings>

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmSubmit}
                    title="Confirmer les modifications"
                >
                    <div>
                        <p>Êtes-vous sûr de vouloir enregistrer ces modifications ?</p>
                        {formData.email !== initialFormData.email && (
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label htmlFor="current_password">Pour des raisons de sécurité, veuillez entrer votre mot de passe actuel :</label>
                                <input
                                    type="password"
                                    id="current_password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="form-control"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </ConfirmationModal>
            </div>
        </div>
    );
};

export default SettingsClient;
