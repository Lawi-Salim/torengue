import React from 'react';
import { FiUser, FiMail, FiPhone, FiSave } from 'react-icons/fi';
import Spinner from '../../components/Spinner';
import UserAvatar from '../../components/UserAvatar';

const Settings = ({ user, formData, handleInputChange, handleSubmit, isSubmitting, children, isDirty, onCancel, isEmailEditing, onEnableEmailEdit }) => {
    if (!user) return null; // Ne rien afficher si l'utilisateur n'est pas chargé

    return (
        <div className="settings-content">
            <div className="settings-avatar">
                <UserAvatar name={user.nom} size={120} style={{ border: '5px solid var(--primary-600)' }} />
                <h3>{user.nom}</h3>
                <p className={`badge-role role-${user.role}`}>{user.role}</p>
            </div>
            <div className="trait" style={{ border: '1px solid var(--gray-200)', height: '100vh' }}></div>
            <div className="settings-form">
                <form onSubmit={handleSubmit}>
                    <h4>Informations Personnelles</h4>
                    <div className="form-group">
                        <label htmlFor="nom"><FiUser /> Nom complet</label>
                        <input 
                            type="text" 
                            id="nom" 
                            name="nom" 
                            value={formData.nom}
                            onChange={handleInputChange}
                            className="form-control"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email"><FiMail /> Adresse Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-control"
                            disabled={!isEmailEditing || isSubmitting}
                        />
                        {!isEmailEditing && (
                            <button 
                                type="button" 
                                onClick={onEnableEmailEdit} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: '0',
                                    color: '#007bff',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    textAlign: 'right',
                                    width: '100%',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-family)'
                                }}
                            >
                                Changer l'email
                            </button>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="telephone"><FiPhone /> Téléphone</label>
                        <input 
                            type="text" 
                            id="telephone"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="+269 123 45 67"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Emplacement pour les champs spécifiques au rôle */}
                    {children}

                    <div className="form-actions" style={{ display: 'flex', gap: '15px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? (
                                <>
                                    <Spinner size={20} inline={true} />
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave /> Enregistrer les modifications
                                </> 
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
