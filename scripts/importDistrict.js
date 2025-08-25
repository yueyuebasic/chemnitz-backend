const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const District = require('../models/District');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  importDistricts();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const filePath = path.join(__dirname, '../data/Stadtteile.geojson'); // 根据你的实际路径调整

async function importDistricts() {
  try {
    await District.deleteMany({});
    const rawData = fs.readFileSync(filePath);
    const geojson = JSON.parse(rawData);

    //console.log('Feature example:', JSON.stringify(geojson.features[0], null, 2));
    //process.exit();


    let inserted = 0;

    for (const feature of geojson.features) {
      const props = feature.properties;
      const geometry = feature.geometry;

      const districtData = {
        id: props.ID,
        name: props.STADTTNAME,
        geometry: geometry,
        rawProperties: { ...props },
      };

      console.log('Inserting districtData:', districtData);

      const result = await District.updateOne(
        { id: districtData.id },
        { $set: districtData },
        { upsert: true }
      );

      console.log('Update result:', result);

      if (result.upsertedCount > 0) {
        inserted++;
      }
    }

    console.log(`✅ District import complete: ${inserted} inserted/updated.`);
    process.exit();
  } catch (err) {
    console.error('❌ Import error:', err);
    process.exit(1);
  }
}
