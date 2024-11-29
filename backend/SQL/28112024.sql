-- Base de données : equipagro
CREATE DATABASE IF NOT EXISTS equipagro;
USE equipagro;

-- Table utilisateurs (users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table entreprises
CREATE TABLE entreprises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    site_web VARCHAR(255),
    description TEXT,
    token VARCHAR(32) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table impayés
CREATE TABLE impayes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    date_creation DATE NOT NULL,
    date_echeance DATE NOT NULL,
    statut ENUM('En attente', 'Payé', 'Annulé') DEFAULT 'En attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour relier entreprises et impayés
CREATE TABLE impayes_entreprise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id INT NOT NULL,
    montant_impaye DECIMAL(10, 2) NOT NULL,
    description_entreprise TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
);

-- Table messages (messagerie instantanée)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index et contraintes supplémentaires
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_entreprises_token ON entreprises(token);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);