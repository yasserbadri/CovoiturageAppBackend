const express = require('express');
const {
  createRide,
  getAvailableRides,
  getMyRides,
  acceptRide,
  updateRideStatus,
  getActiveRide
} = require('../controllers/rideController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createRide);
router.get('/available', auth, getAvailableRides);
router.get('/my-rides', auth, getMyRides);
router.get('/active', auth, getActiveRide);
router.post('/:rideId/accept', auth, acceptRide);
router.patch('/:rideId/status', auth, updateRideStatus);

module.exports = router;