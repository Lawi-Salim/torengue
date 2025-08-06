import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import NextReminderTimer from '../../../components/utils/NextReminderTimer';

import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Settings from '../../dashboards/Settings';
import ConfirmationModal from '../../../components/ConfirmationModal'; // Le composant de formulaire réutilisable
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';

import '../../dashboards/styles.css';

const SettingsVendeur = () => {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        nom_boutique: '',
        rappels_actives: false,
        rappel_horaire: 'soir'
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
                    // Charger les informations de la boutique depuis l'objet vendeur associé
                    adresse: userData.vendeur?.adresse || '', 
                    nom_boutique: userData.vendeur?.nom_boutique || '',
                    rappels_actives: userData.rappels_actives || false,
                    rappel_horaire: userData.rappel_horaire || 'soir'
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const val = type === 'checkbox' ? checked : value;
            const newData = { ...prev, [name]: val };
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
        setIsEmailEditing(false);
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
            const newInitialData = {
                ...initialFormData, // Conserve les autres champs au cas où

                nom: updatedUserData.nom || '',
                email: updatedUserData.email || '',
                telephone: updatedUserData.telephone || '',
                adresse: updatedUserData.vendeur?.adresse || '',
                nom_boutique: updatedUserData.vendeur?.nom_boutique || '',
                rappels_actives: updatedUserData.rappels_actives || false,
                rappel_horaire: updatedUserData.rappel_horaire || 'soir'

            };
            setInitialFormData(newInitialData);
            setIsDirty(false);
            setCurrentPassword('');
            setIsEmailEditing(false);
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
                <h2 className="card-title">Paramètres du Compte Vendeur</h2>
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
                    {/* Champs spécifiques au vendeur */}
                    <h4>Informations de la Boutique</h4>
                    <div className="form-group">
                        <label htmlFor="nom_boutique">Nom de la boutique</label>
                        <input 
                            type="text" 
                            id="nom_boutique" 
                            name="nom_boutique" 
                            value={formData.nom_boutique}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Ex: Ma Super Boutique"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="adresse">Adresse de la boutique</label>
                        <input 
                            type="text" 
                            id="adresse" 
                            name="adresse" 
                            value={formData.adresse}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Ex: 456 Avenue du Commerce, Mamoudzou"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Section pour les préférences de rappel */}
                    <h4 style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>Préférences de Rappel</h4>
                    <div className="form-group form-group-toggle">
                        <label htmlFor="rappels_actives">Activer les rappels de commande</label>
                        <div className="toggle-switch">
                            <input 
                                type="checkbox" 
                                id="rappels_actives" 
                                name="rappels_actives" 
                                checked={formData.rappels_actives}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            <label htmlFor="rappels_actives" className="slider"></label>
                        </div>
                    </div>
                    {formData.rappels_actives && (
                        <div className="form-group">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label htmlFor="rappel_horaire">Recevoir les rappels</label>
                                <NextReminderTimer schedule="0 8 * * *" />
                            </div>
                            <select 
                                id="rappel_horaire" 
                                name="rappel_horaire" 
                                value={formData.rappel_horaire}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled={isSubmitting}
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                <option value="matin">Le matin (entre 6h et 8h)</option>
                                <option value="soir">Le soir (entre 18h et 20h)</option>
                                <option value="nuit">La nuit (entre 22h et 00h)</option>
                            </select>
                        </div>
                    )}
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

export default SettingsVendeur;
