const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 假设你的用户模型叫 User
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['poi', 'parking'],
    required: true,
  },
}, { timestamps: true });

// 确保同一用户不能重复收藏相同目标
favoriteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
