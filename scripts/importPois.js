const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Poi = require('../models/Poi');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  importData();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const filePath = path.join(__dirname, '../data/Chemnitz.geojson'); // 替换成你的数据路径

async function importData() {
  try {
    const rawData = fs.readFileSync(filePath);
    const geojson = JSON.parse(rawData);

    const supportedTypes = ['restaurant', 'theatre', 'museum', 'artwork'];
    let insertedCount = 0;
    let updatedCount = 0;

    for (const feature of geojson.features) {
      const props = feature.properties;
      const geometry = feature.geometry;
      const category = props.amenity ? 'amenity' : (props.tourism ? 'tourism' : null);
      const type = props.amenity || props.tourism;

      if (!category || !supportedTypes.includes(type)) {
        continue; // 跳过不支持类型
      }

      const poiData = {
        osmId: props['@id'] || feature.id,
        name: props.name || 'Unnamed',
        category,
        type,
        coordinates: {
          type: 'Point',
          coordinates: geometry.coordinates,
        },
        rawProperties: { ...props },
      };

      const result = await Poi.updateOne(
        { osmId: poiData.osmId },
        { $set: poiData },
        { upsert: true } // 若不存在则插入，存在则更新
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`✅ Import finished: ${insertedCount} inserted, ${updatedCount} updated.`);
    process.exit();
  } catch (err) {
    console.error('❌ Import error:', err);
    process.exit(1);
  }
}
