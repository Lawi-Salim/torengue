import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCarousel from '../components/Caroussel';
import './Home.css';
import adminDashboardImage from '../images/admin-dashboard.png';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-brand">Biyashara</div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
          <div className="nav-dropdown">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-secondary"
            >
              Créer un compte
            </button>
            {isOpen && (
              <div className="dropdown-menu">
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
        </div>
      </nav>

      <div className="home-content-container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content animate-fade-in">
            <h1>La meilleure plateforme pour la gestion des ventes</h1>
            <p className="hero-subtitle">
              Gérez vos produits, vos ventes et vos clients en toute simplicité.
            </p>
            <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Commencer gratuitement
                </Link>
            </div>
          </div>
          <div className="hero-image animate-slide-up">
            <img
              src={adminDashboardImage}
              alt="Gestion de vente"
              className="rounded-lg shadow-lg"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
          </div>
        </section>

        {/* Section du carrousel de produits */}
        <section className="home-product-showcase">
            <div className="container">
                <h2 className="section-title">Nos derniers produits</h2>
                <ProductCarousel />
            </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="section-header">
            <h2>Pourquoi choisir notre plateforme?</h2>
            <p>Des fonctionnalités conçues pour les vendeurs et les clients</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Sécurité avancée</h3>
              <p>
                Vos données sont protégées par un système d'authentification robuste.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Accessible partout</h3>
              <p>Consultez et gérez vos informations depuis n'importe quel appareil.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Interface intuitive</h3>
              <p>Une expérience utilisateur fluide et moderne pour une gestion facile.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <h3>Organisation simplifiée</h3>
              <p>Ajoutez et gérez vos produits et ventes en quelques clics.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>Comment ça fonctionne</h2>
            <p>Trois étapes simples pour commencer</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Créez votre compte</h3>
                <p>Inscrivez-vous gratuitement en tant que vendeur ou client.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Ajoutez vos produits</h3>
                <p>En tant que vendeur, ajoutez facilement vos produits à la plateforme.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Commencez à vendre</h3>
                <p>Gérez vos ventes et interagissez avec vos clients simplement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Prêt à commencer?</h2>
            <p>Rejoignez notre plateforme et simplifiez votre gestion des ventes dès aujourd'hui.</p>
              <Link to="" className="btn btn-primary btn-lg">
                Commencer maintenant
              </Link>
          </div>
        </section>
      </div>

      <footer className="home-footer">
        © {new Date().getFullYear()} Biyashara. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Home;