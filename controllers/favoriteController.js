const Favorite = require('../models/Favorite');
const POI = require('../models/Poi');
const Parking = require('../models/Parking');

// 添加收藏
const addFavorite = async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.user.id;

    // 检查是否已存在
    const exists = await Favorite.findOne({ userId, targetId, targetType });
    if (exists) {
      return res.status(400).json({ message: 'Item is already in favorites.' });
    }

    const favorite = new Favorite({ userId, targetId, targetType });
    await favorite.save();
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 取消收藏（通过 targetId 和 targetType）
const removeFavoriteByTarget = async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.user.id;

    const result = await Favorite.findOneAndDelete({ userId, targetId, targetType });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    res.status(200).json({ message: 'Favorite removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 取消收藏
const removeFavorite = async (req, res) => {
  try {
    const favoriteId = req.params.id;
    const userId = req.user.id;

    // 只允许删除当前用户自己的收藏
    const result = await Favorite.findOneAndDelete({ _id: favoriteId, userId });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found or not owned by user.' });
    }

    res.status(200).json({ message: 'Favorite deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 获取用户的所有收藏（含 POI / Parking 数据）
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId });

    const detailedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let item;
        if (fav.targetType === 'poi') {
          item = await POI.findById(fav.targetId);
        } else if (fav.targetType === 'parking') {
          item = await Parking.findById(fav.targetId);
        }
        return {
          ...fav.toObject(),
          item,
        };
      })
    );

    res.json(detailedFavorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addFavorite,
  removeFavoriteByTarget,
  removeFavorite,
  getUserFavorites,
};
