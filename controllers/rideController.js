const Ride = require('../models/Ride');
const User = require('../models/User');
const { rideValidation } = require('../middleware/validation');

const createRide = async (req, res) => {
  try {
    // Validation des données
    const { error } = rideValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Vérifier que l'utilisateur est un chauffeur
    if (req.user.user_type !== 'chauffeur') {
      return res.status(403).json({ error: 'Seuls les chauffeurs peuvent créer des trajets' });
    }

    // Créer le trajet
    const rideData = {
      driver_id: req.user.id,
      ...req.body
    };

    const ride = await Ride.create(rideData);

    res.status(201).json({
      message: 'Trajet créé avec succès',
      ride
    });
  } catch (error) {
    console.error('Erreur création trajet:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du trajet' });
  }
};

const getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.findAvailable();
    res.json({ rides });
  } catch (error) {
    console.error('Erreur récupération trajets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.findByUserId(req.user.id, req.user.user_type);
    res.json({ rides });
  } catch (error) {
    console.error('Erreur récupération trajets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    // Vérifier que l'utilisateur est un client
    if (req.user.user_type !== 'client') {
      return res.status(403).json({ error: 'Seuls les clients peuvent accepter des trajets' });
    }

    const ride = await Ride.acceptRide(rideId, req.user.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé ou déjà accepté' });
    }

    res.json({
      message: 'Trajet accepté avec succès',
      ride
    });
  } catch (error) {
    console.error('Erreur acceptation trajet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const ride = await Ride.updateStatus(rideId, status);
    
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }

    // Vérifier que l'utilisateur a le droit de modifier ce trajet
    if (ride.driver_id !== req.user.id && ride.passenger_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé à ce trajet' });
    }

    res.json({
      message: 'Statut du trajet mis à jour',
      ride
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getActiveRide = async (req, res) => {
  try {
    const ride = await Ride.getActiveRide(req.user.id);
    res.json({ ride });
  } catch (error) {
    console.error('Erreur récupération trajet actif:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createRide,
  getAvailableRides,
  getMyRides,
  acceptRide,
  updateRideStatus,
  getActiveRide
};