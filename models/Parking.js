const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
  },
});

const parkingSchema = new mongoose.Schema({
  objectId: {
    type: String,
    required: true,
  },
  nummer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['reisebus', 'wohnmobil'],
    required: true,
  },
  uniqueKey: {
    type: String,
    required: true,
    unique: true,
  },
  locationText: String,
  capacity: String,
  cost: String,
  remark: String,
  location: {
    type: pointSchema,
    required: true,
  },
}, { timestamps: true });

// 地理空间索引
parkingSchema.index({location: '2dsphere' });

module.exports = mongoose.model('Parking', parkingSchema);
