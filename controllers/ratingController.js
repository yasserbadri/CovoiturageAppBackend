const Rating = require('../models/Rating');
const User = require('../models/User');
const Ride = require('../models/Ride');
const { ratingValidation } = require('../middleware/validation');

const createRating = async (req, res) => {
  try {
    // Validation des données
    const { error } = ratingValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { ride_id, rating, comment } = req.body;

    // Vérifier que le trajet existe et est complété
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ error: 'Impossible de noter un trajet non complété' });
    }

    // Déterminer qui note qui
    let to_user_id;
    if (req.user.id === ride.driver_id) {
      to_user_id = ride.passenger_id;
    } else if (req.user.id === ride.passenger_id) {
      to_user_id = ride.driver_id;
    } else {
      return res.status(403).json({ error: 'Accès non autorisé à ce trajet' });
    }

    // Vérifier si l'utilisateur a déjà noté ce trajet
    const existingRating = await Rating.findByRideId(ride_id);
    const alreadyRated = existingRating.find(r => r.from_user_id === req.user.id);
    
    if (alreadyRated) {
      return res.status(400).json({ error: 'Vous avez déjà noté ce trajet' });
    }

    // Créer la notation
    const ratingData = {
      ride_id,
      from_user_id: req.user.id,
      to_user_id,
      rating,
      comment
    };

    const newRating = await Rating.create(ratingData);

    // Mettre à jour la note moyenne de l'utilisateur
    const avgRating = await Rating.getAverageRating(to_user_id);
    await User.updateRating(to_user_id, parseFloat(avgRating.average_rating));

    res.status(201).json({
      message: 'Note ajoutée avec succès',
      rating: newRating
    });
  } catch (error) {
    console.error('Erreur création note:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la note' });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.findByUserId(req.user.id);
    res.json({ ratings });
  } catch (error) {
    console.error('Erreur récupération notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { createRating, getUserRatings };