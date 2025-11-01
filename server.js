const cors = require('cors');

// Configurer CORS pour accepter les requêtes du frontend Flutter
app.use(cors({
  origin: [
    'http://localhost:3000',  // Pour le web
    'http://10.0.2.2:3000',   // Pour Android emulator
    'http://127.0.0.1:3000'   // Pour iOS simulator
  ],
  credentials: true
}));