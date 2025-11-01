const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mettre à jour le profil
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.updateProfile(req.user.id, req.body);
    res.json({
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;