const mongoose = require('mongoose');

// 地理位置子结构
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

// POI 模型
const poiSchema = new mongoose.Schema({
  osmId: {
    type: String,
    required: true,
    unique: true, // 如 "way/23757830"
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['amenity', 'tourism'],
    required: true,
  },
  type: {
    type: String,
    enum: ['restaurant', 'theatre', 'museum', 'artwork'],
    required: true,
  },
  coordinates: {
    type: pointSchema,
    required: true,
  },
  rawProperties: {
    type: mongoose.Schema.Types.Mixed, // 保存原始字段，如 website, wheelchair 等
    default: {},
  },
}, { timestamps: true });

// 2dsphere 索引支持地理查询
poiSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('POI', poiSchema);
