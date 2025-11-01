const express = require('express');
const { createRating, getUserRatings } = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createRating);
router.get('/my-ratings', auth, getUserRatings);

module.exports = router;