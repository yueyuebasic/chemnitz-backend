const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// GET /api/parkings
router.get('/', parkingController.getAllParkings);

// GET /api/parkings/category/:category
router.get('/category/:category', parkingController.getParkingsByCategory);

// GET /api/parkings/nearby?lng=...&lat=...&radius=...
router.get('/nearby', parkingController.getNearbyParkings);

router.get('/filter', parkingController.filterParkings);

module.exports = router;
