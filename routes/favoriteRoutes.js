const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/', authenticate, favoriteController.addFavorite);
router.post('/remove', authenticate, favoriteController.removeFavoriteByTarget);

router.delete('/:id', authenticate, favoriteController.removeFavorite);
router.get('/', authenticate, favoriteController.getUserFavorites);

module.exports = router;
