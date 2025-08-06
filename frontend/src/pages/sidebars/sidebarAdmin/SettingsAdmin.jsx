import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Spinner from '../../../components/Spinner';
import EmptyState from '../../../components/EmptyState';
import Settings from '../../dashboards/Settings'; // Le composant de formulaire réutilisable
import apiService from '../../../apiService';
import { useAuth } from '../../../context/AuthContext';

import '../../dashboards/styles.css';

const SettingsAdmin = () => {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setFormData({
                    nom: userData.nom || '',
                    email: userData.email || '',
                    telephone: userData.telephone || ''
                });
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await apiService.put('/api/v1/users/me/profile', formData);
            setUser(res.data.data);
            toast.success('Profil mis à jour avec succès !');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Une erreur est survenue.');
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
                <h2 className="card-title">Paramètres du Compte Administrateur</h2>
            </div>
            <div className="card-body">
                <Settings 
                    user={user}
                    formData={formData}
                    isSubmitting={isSubmitting}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                />
                {/* Bientôt : Ajoutez ici les sections de paramètres spécifiques à l'admin */}
            </div>
        </div>
    );
};

export default SettingsAdmin;
