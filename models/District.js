const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON 格式的坐标数组
      required: true,
    },
  },
  rawProperties: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
});

districtSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('District', districtSchema);
