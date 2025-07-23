import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, tu pourrais appeler une API pour envoyer le mail de réinitialisation
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="container-sm">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title">Réinitialiser le mot de passe</h1>
          </div>
          {sent ? (
            <div className="text-center p-4">
              <p className="text-green-600 mb-4">Si cet email existe, un lien de réinitialisation a été envoyé.</p>
              <Link to="/login" className="text-primary-600 hover:underline">Retour à la connexion</Link>
            </div>
          ) : (
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
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input w-full"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full">Envoyer</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 