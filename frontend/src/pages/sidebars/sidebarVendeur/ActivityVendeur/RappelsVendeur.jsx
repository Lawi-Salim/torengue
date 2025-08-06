import React, { useState, useEffect } from 'react';
import api from '../../../../apiService';
import Spinner from '../../../../components/animation/Spinner';
import EmptyState from '../../../../components/animation/EmptyState';
import { FaBell } from 'react-icons/fa';
import './RappelsVendeur.css';

const RappelsVendeur = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/notifications/reminders');
                if (response.data.success) {
                    setReminders(response.data.data);
                } else {
                    setError('Erreur lors de la récupération des rappels.');
                }
            } catch (err) {
                setError('Impossible de contacter le serveur. Veuillez réessayer plus tard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <EmptyState message={error} icon="error" />;
    }

    return (
        <div className="reminders-container">
            <h3 className="reminders-title">Rappels de Commandes Non Livrées</h3>
            <p className="reminders-subtitle">Voici les commandes qui n'ont pas été marquées comme "livrées" depuis plus de 24 heures.</p>

            {reminders.length === 0 ? (
                <EmptyState message="Vous n'avez aucun rappel pour le moment." icon="success" />
            ) : (
                <ul className="reminders-list">
                    {reminders.map(reminder => (
                        <li key={reminder.id_notif} className="reminder-item">
                            <div className="reminder-icon">
                                <FaBell />
                            </div>
                            <div className="reminder-content">
                                <p className="reminder-message">{reminder.message}</p>
                                <span className="reminder-date">
                                    Rappel généré le {new Date(reminder.date_notif).toLocaleString('fr-FR')}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RappelsVendeur;
