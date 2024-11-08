const express = require('express');
const mysql = require('mysql2');
const app = express();
const crypto = require('crypto'); // Pour générer le token
const port = 3000;
const bcrypt = require('bcrypt');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const server = http.createServer(app);
const session = require('express-session');
const jwt = require('jsonwebtoken');
const io = new Server(server, {
  cors: {
      origin: 'http://localhost:8888', // Port du client
      methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json());

// Fix les problèmes de CORS
app.use(cors({
    origin: 'http://localhost:8888',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(session({
  secret: crypto.randomBytes(32).toString('hex'), // secret généré pour la sécurité
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // Cookie valide 24 heures
}));
const secretKey = 'votre_clé_secrète';

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: 'root',
    database: 'equipagro',
    port: 8889
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});


// ROUTES

// ROUTE CREATE IMPAYE
app.post('/impayes', (req, res) => {
  const { client_name, montant, date_creation, date_echeance, statut } = req.body;
  const query = 'INSERT INTO impayes (client_name, montant, date_creation, date_echeance, statut) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [client_name, montant, date_creation, date_echeance, statut], (err, results) => {
    if (err) {
      return res.status(500).send('Erreur lors de l\'ajout de l\'impayé');
    }
    res.status(201).send('Impayé ajouté avec succès');
  });
});

// ROUTE ENTREPRISE
app.get('/impayes', (req, res) => {
  const query = 'SELECT * FROM impayes';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erreur lors de la récupération des impayés');
    }
    res.json(results);
  });
});

app.get('/impayes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM impayes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Erreur lors de la récupération de l\'impayé');
    }
    res.json(result[0]);
  });
});

app.put('/impayes/:id', (req, res) => {
  const { id } = req.params;
  const { client_name, montant, date_creation, date_echeance, statut } = req.body;
  const query = 'UPDATE impayes SET client_name = ?, montant = ?, date_creation = ?, date_echeance = ?, statut = ? WHERE id = ?';
  db.query(query, [client_name, montant, date_creation, date_echeance, statut, id], (err, results) => {
    if (err) {
      return res.status(500).send('Erreur lors de la mise à jour de l\'impayé');
    }
    res.send('Impayé mis à jour avec succès');
  });
});

app.delete('/impayes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM impayes WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).send('Erreur lors de la suppression de l\'impayé');
    }
    res.send('Impayé supprimé avec succès');
  });
});

app.get('/search-enterprises', (req, res) => {
  const searchQuery = req.query.name; // Utilisez 'name' pour obtenir la valeur de la requête
  db.query(
      'SELECT * FROM entreprises WHERE nom LIKE ? LIMIT 5',
      [`%${searchQuery}%`],
      (err, results) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Erreur lors de la recherche' });
          }
          res.json(results); // Retourne les résultats complets
      }
  );
});

app.post('/entreprises', (req, res) => {
  const { nom, adresse, telephone, email, site_web, description } = req.body;

  // Générer un token aléatoire
  const token = crypto.randomBytes(16).toString('hex');

  const sql = 'INSERT INTO entreprises (nom, adresse, telephone, email, site_web, description, token) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nom, adresse, telephone, email, site_web, description, token], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Retourner l'entreprise créée avec le token
      res.status(201).json({ 
          id: result.insertId, 
          token, // Le token généré
          nom, 
          adresse, 
          telephone, 
          email, 
          site_web, 
          description 
      });
  });
});


app.post('/api/impaye', (req, res) => {
  const { token, montant, description } = req.body;

  // Récupérer l'entreprise à partir du token
  const sqlGetEntreprise = 'SELECT * FROM entreprises WHERE token = ?';
  db.query(sqlGetEntreprise, [token], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Entreprise non trouvée' });

      const entreprise = results[0];

      // Enregistrer l'impayé
      const sqlCreateImpayé = 'INSERT INTO impayes_entreprise (entreprise_id, montant_impaye, description_entreprise) VALUES (?, ?, ?)';
      db.query(sqlCreateImpayé, [entreprise.id, montant, description], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Impayé créé avec succès', id: result.insertId });
      });
  });
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Remplacez par votre chemin de fichier HTML
});

// io.on('connection', (socket) => {
//   console.log('Utilisateur connecté');

//   // Écoute des messages
//   socket.on('chat message', (msg) => {
//       const { sender_id, receiver_id, content } = msg;

//       // Enregistrer le message dans la base de données
//       db.query(
//           'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
//           [sender_id, receiver_id, content],
//           (error, results) => {
//               if (error) {
//                   console.error('Erreur lors de l\'insertion du message:', error);
//                   return;
//               }
//               // Émettre le message à tous les clients
//               io.emit('chat message', {
//                   sender_id,
//                   receiver_id,
//                   content,
//                   timestamp: new Date().toISOString()
//               });
//           }
//       );
//   });

//   socket.on('disconnect', () => {
//       console.log('Utilisateur déconnecté:', socket.id);
//   });
// });

// // Route pour récupérer les messages d'un utilisateur
// // Route pour récupérer les messages entre deux utilisateurs
// app.get('/messages/:senderId/:receiverId', (req, res) => {
//   const { senderId, receiverId } = req.params;
//   db.query(
//       'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC',
//       [senderId, receiverId, receiverId, senderId],
//       (error, results) => {
//           if (error) {
//               return res.status(500).send(error);
//           }
//           res.json(results);
//       }
//   );
// });

// // Fonction pour sauvegarder un message
// async function saveMessage(sender_id, receiver_id, content) {
//   // Exécuter une requête SQL pour sauvegarder le message en base de données
//   const query = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
//   await db.execute(query, [sender_id, receiver_id, content]);
// }

// // Fonction pour récupérer les messages
// async function getMessages(userId, otherUserId) {
//   const query = `
//       SELECT * FROM messages 
//       WHERE (sender_id = ? AND receiver_id = ?) 
//       OR (sender_id = ? AND receiver_id = ?)
//       ORDER BY timestamp ASC
//   `;
//   const [messages] = await db.execute(query, [userId, otherUserId, otherUserId, userId]);
//   return messages;
// }

// ROUTE MESSAGES 
app.post('/send-message', (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  const sql = 'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())';
  db.query(sql, [sender_id, receiver_id, content], (err, result) => {
      if (err) {
          console.error('Erreur lors de l\'envoi du message:', err);
          return res.status(500).send('Erreur lors de l\'envoi du message');
      }
      res.status(200).send('Message envoyé');
  });
});

app.get('/messages', (req, res) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;

  const sql = `
      SELECT m.*, u1.name AS sender_name, u2.name AS receiver_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.timestamp ASC
  `;
  db.query(sql, [user1, user2, user2, user1], (err, messages) => {
      if (err) {
          return res.status(500).send('Erreur lors de la récupération des messages');
      }
      res.json(messages);
  });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Récupérer le token depuis les en-têtes

  if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Token invalide' });
      }
      req.userId = decoded.userId; // Enregistrer l'ID utilisateur dans la requête
      next();
  });
}

// ROUTE USER
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Vérifiez si l'utilisateur existe déjà
  const sqlCheckUser = 'SELECT * FROM users WHERE email = ?';
  db.query(sqlCheckUser, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Enregistrement du nouvel utilisateur
    const sqlInsertUser = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sqlInsertUser, [name, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    });
  });
});

// Route pour accéder aux données de l'utilisateur
app.get('/myaccount', (req, res) => {
  if (req.session.user) {
      res.json({ message: `Bienvenue ${req.session.user.email}`, user: req.session.user });
  } else {
      res.status(401).json({ message: 'Veuillez vous connecter pour accéder à votre compte.' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur du serveur' });

      if (results.length > 0) {
          const match = await bcrypt.compare(password, results[0].password);
          if (match) {
              // Enregistrement de l'utilisateur dans la session
              req.session.user = {
                  id: results[0].id,
                  email: results[0].email,
                  name: results[0].name
              };
              // Inclure l'ID de l'utilisateur dans le token
              const token = jwt.sign({ userId: results[0].id }, secretKey, { expiresIn: '1h' });

              // Répondre avec le token
              res.json({ message: 'Connexion réussie', token });
          } else {
              res.status(401).json({ message: 'Email ou mot de passe incorrect' });
          }
      } else {
          res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  });
});
app.get('/user-session', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Utilisateur non connecté' });

  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Utilisateur non connecté' });

      // Rechercher l'utilisateur dans la base de données
      db.query('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, results) => {
          if (err) return res.status(500).json({ error: 'Erreur du serveur' });

          if (results.length > 0) {
              const user = results[0];
              res.json({
                  id: user.id,
                  email: user.email,
                  nom: user.name,
                  created_at: user.created_at
              });
          } else {
              res.status(404).json({ message: 'Utilisateur non trouvé' });
          }
      });
  });
});
app.get('/users', (req, res) => {
  const sql = 'SELECT id, name FROM users'; // Assurez-vous que la colonne "nom" existe dans votre table "users"
  db.query(sql, (err, users) => {
      if (err) {
          return res.status(500).send('Erreur lors de la récupération des utilisateurs');
      }
      res.json(users);
  });
});
// ROUTE DE DÉCONNEXION
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    res.clearCookie('connect.sid'); // Supprime le cookie de session côté client
    res.json({ message: 'Déconnexion réussie' });
  });
});

app.get('/last-impaye', (req, res) => {
  const sql = `SELECT * FROM impayes ORDER BY date_creation DESC LIMIT 1`;
  db.query(sql, (err, result) => {
      if (err) {
          console.error('Erreur lors de la récupération du dernier impayé:', err);
          res.status(500).json({ error: 'Erreur serveur' });
      } else {
          res.json(result[0] || null);
      }
  });
});

// Endpoint pour obtenir le dernier message
app.get('/last-message', (req, res) => {
  const sql = `SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id ORDER BY timestamp DESC LIMIT 1`;
  db.query(sql, (err, result) => {
      if (err) {
          console.error('Erreur lors de la récupération du dernier message:', err);
          res.status(500).json({ error: 'Erreur serveur' });
      } else {
          res.json(result[0] || { content: 'Aucun nouveau message' });
      }
  });
});
// Endpoint pour obtenir les factures en attente
app.get('/impayes-wait', (req, res) => {
  const sql = `SELECT * FROM impayes WHERE statut = 'En attente'`;
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des factures en attente:', err);
          res.status(500).json({ error: 'Erreur serveur' });
      } else {
          res.json(results);
      }
  });
});

// Lancer le serveur
server.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});