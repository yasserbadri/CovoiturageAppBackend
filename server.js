const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const rideRoutes = require('./routes/rides');
const ratingRoutes = require('./routes/ratings');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API Covoiturage en ligne', 
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/ratings', ratingRoutes);

// Gestion des sockets pour le suivi en temps réel
io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.IO:', socket.id);

  socket.on('join-ride', (rideId) => {
    socket.join(`ride-${rideId}`);
    console.log(`Socket ${socket.id} a rejoint le trajet ${rideId}`);
  });

  socket.on('leave-ride', (rideId) => {
    socket.leave(`ride-${rideId}`);
    console.log(`Socket ${socket.id} a quitté le trajet ${rideId}`);
  });

  socket.on('update-location', (data) => {
    const { rideId, position } = data;
    socket.to(`ride-${rideId}`).emit('location-updated', {
      userId: socket.id,
      position
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket déconnecté:', socket.id);
  });
});

// Gestion des erreurs 404 - DOIT ÊTRE APRÈS TOUTES LES ROUTES
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚗 Serveur Covoiturage démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

module.exports = { app, io };