-- Script complet pour la suppression et la recréation de la base de données

-- Désactivation temporaire de la vérification des clés étrangères
SET FOREIGN_KEY_CHECKS=0;

-- Suppression des tables si elles existent
DROP TABLE IF EXISTS Paiements;
DROP TABLE IF EXISTS Livraisons;
DROP TABLE IF EXISTS Factures;
DROP TABLE IF EXISTS DetailVentes;
DROP TABLE IF EXISTS Ventes;
DROP TABLE IF EXISTS DetailCommandes;
DROP TABLE IF EXISTS Commandes;
DROP TABLE IF EXISTS Produits;
DROP TABLE IF EXISTS ClientVendeurs;
DROP TABLE IF EXISTS Clients;
DROP TABLE IF EXISTS Vendeurs;
DROP TABLE IF EXISTS DevenirVendeurs;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Unites;
DROP TABLE IF EXISTS Utilisateurs;

-- Schéma de base de données pour l'application de Gestion-Vente

-- Table Utilisateurs
CREATE TABLE Utilisateurs (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NULL UNIQUE,
    role ENUM('admin', 'vendeur', 'client') NOT NULL DEFAULT 'admin',
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rappels_actives BOOLEAN NOT NULL DEFAULT FALSE,
    rappel_horaire ENUM('matin', 'soir', 'nuit') NOT NULL DEFAULT 'soir'
) ENGINE=InnoDB;

-- Table Vendeurs
CREATE TABLE Vendeurs (
    id_vendeur INT PRIMARY KEY AUTO_INCREMENT,
    nom_boutique VARCHAR(255) NOT NULL,
    nationalite VARCHAR(100) NULL,
    description TEXT,
    adresse VARCHAR(255),
    id_user INT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Clients
CREATE TABLE Clients (
    id_client INT PRIMARY KEY AUTO_INCREMENT,
    adresse_facturation TEXT,
    solde DECIMAL(10, 2) NOT NULL DEFAULT 250000.00,
    id_user INT,
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table de jointure ClientVendeurs
CREATE TABLE ClientVendeurs (
    id_client INT,
    id_vendeur INT,
    PRIMARY KEY (id_client, id_vendeur),
    FOREIGN KEY (id_client) REFERENCES Clients(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_vendeur) REFERENCES Vendeurs(id_vendeur) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Categories
CREATE TABLE Categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Table Unites
CREATE TABLE Unites (
    id_unite INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(20),
    symbole VARCHAR(10)
) ENGINE=InnoDB;

-- Table Produits
CREATE TABLE Produits (
    id_produit INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(20),
    description TEXT,
    prix_unitaire DECIMAL(10, 2),
    stock_actuel INT NOT NULL DEFAULT 0,
    image VARCHAR(255) DEFAULT 'default.jpg',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_categorie INT,
    id_unite INT,
    id_vendeur INT NOT NULL,
    seuil_alerte INT NOT NULL DEFAULT 10,
    seuil_critique INT NOT NULL DEFAULT 3,
    date_maj_stock DATETIME DEFAULT NULL,
    FOREIGN KEY (id_categorie) REFERENCES Categories(id_categorie),
    FOREIGN KEY (id_unite) REFERENCES Unites(id_unite),
    FOREIGN KEY (id_vendeur) REFERENCES Vendeurs(id_vendeur)
) ENGINE=InnoDB;

-- Table Commandes
CREATE TABLE Commandes (
    id_commande INT AUTO_INCREMENT PRIMARY KEY,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en attente', 'payée', 'validée', 'en préparation', 'expédiée', 'livrée', 'annulée') DEFAULT 'en attente',
    id_client INT,
    nbr_article INT DEFAULT 0,
    id_vendeur INT,
    FOREIGN KEY (id_client) REFERENCES Clients(id_client)
) ENGINE=InnoDB;

-- Table DetailCommandes
CREATE TABLE DetailCommandes (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    quantite DECIMAL(10,2),
    prix_unitaire DECIMAL(10,2),
    id_commande INT,
    id_produit INT,
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande) ON DELETE CASCADE,
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit)
) ENGINE=InnoDB;

-- Table Ventes
CREATE TABLE Ventes (
    id_vente INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10,2),
    etat_vente ENUM('en cours', 'livrée', 'annulée') DEFAULT 'en cours',
    id_commande INT,
    id_vendeur INT,
    id_client INT,
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande),
    FOREIGN KEY (id_vendeur) REFERENCES Vendeurs(id_vendeur),
    FOREIGN KEY (id_client) REFERENCES Clients(id_client)
) ENGINE=InnoDB;

-- Table DetailVentes
CREATE TABLE DetailVentes (
    id_detail_vente INT AUTO_INCREMENT PRIMARY KEY,
    quantite_vendue INT,
    prix_unitaire DECIMAL(10,2),
    id_vente INT,
    id_produit INT,
    FOREIGN KEY (id_vente) REFERENCES Ventes(id_vente) ON DELETE CASCADE,
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit)
) ENGINE=InnoDB;

-- Table Factures
CREATE TABLE Factures (
    id_facture INT AUTO_INCREMENT PRIMARY KEY,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_HT DECIMAL(10,2),
    montant_TTC DECIMAL(10,2),
    montant_total DECIMAL(10,2),
    statut_paiement ENUM('payé', 'en attente', 'annulé') DEFAULT 'en attente',
    id_vente INT,
    id_commande INT,
    FOREIGN KEY (id_vente) REFERENCES Ventes(id_vente),
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande)
) ENGINE=InnoDB;

-- Table Paiements
CREATE TABLE Paiements (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    date_paiement TIMESTAMP,
    montant_paye DECIMAL(10,2),
    mode_paiement ENUM('carte', 'virement', 'espèces') DEFAULT 'espèces',
    id_facture INT,
    id_commande INT,
    FOREIGN KEY (id_facture) REFERENCES Factures(id_facture) ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Livraisons
CREATE TABLE Livraisons (
    id_livraison INT AUTO_INCREMENT PRIMARY KEY,
    adresse TEXT,
    date_livraison TIMESTAMP,
    statut_livraison ENUM('en préparation', 'en cours', 'livrée') DEFAULT 'en préparation',
    id_vente INT,
    id_commande INT,
    FOREIGN KEY (id_vente) REFERENCES Ventes(id_vente),
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande)
) ENGINE=InnoDB;

-- Table Notifications
CREATE TABLE Notifications (
    id_notif INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    notif_lu BOOLEAN DEFAULT FALSE,
    type_notif ENUM('alert', 'info', 'confirmation', 'demande_vendeur', 'approbation_vendeur', 'rejet_vendeur', 'new_order', 'payment_received', 'new_product') DEFAULT 'info',
    date_notif TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_user INT,
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Devenirvendeurs
CREATE TABLE DevenirVendeurs (
    id_devenirvendeur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    id_user INT NULL,
    nom_boutique VARCHAR(255) NOT NULL,
    email_pro VARCHAR(255) NOT NULL,
    nationalite VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    description TEXT,
    password VARCHAR(255) DEFAULT 'temporary_password',
    statut ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
    motif_rejet TEXT,
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    traite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_user) REFERENCES Utilisateurs(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Réactivation de la vérification des clés étrangères
SET FOREIGN_KEY_CHECKS=1;
