require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const proj4 = require('proj4');
const Parking = require('../models/Parking');

// 设置坐标转换（UTM Zone 33N → WGS84）
proj4.defs([
  ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'],
]);

const fromProj = 'EPSG:32633';
const toProj = 'WGS84';

// 修正路径
const reisebusPath = path.join(__dirname, '..', 'data', 'Parkplätze_Reisebus.csv');
const wohnmobilPath = path.join(__dirname, '..', 'data', 'Parkplätze_Wohnmobil.csv');

async function importCSV(filePath, category) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => {
        const xRaw = row['X'] || row['\uFEFFX'];  // 防止 BOM 问题
        const yRaw = row['Y'];
        
        //if (!X || !Y || !OBJECTID || !NUMMER) return;
        const xNum = parseFloat(xRaw);
        const yNum = parseFloat(yRaw);
  
        if (!isFinite(xNum) || !isFinite(yNum)) {
            console.warn('Invalid coordinates, skipping row:', row);
            return;
        }

        const {OBJECTID, NUMMER, LAGE, KAPAZITAET, KOSTEN, BEMERKUNG } = row;
        
        if (!OBJECTID || !NUMMER) {
            console.warn('Missing OBJECTID or NUMMER, skipping row:', row);
            return;
        }

        //const [lng, lat] = proj4(fromProj, toProj, [xNum, yNum]);
         try {
          const [lng, lat] = proj4(fromProj, toProj, [xNum, yNum]);
          console.log(`Converted: [${xNum}, ${yNum}] → [${lng}, ${lat}]`);

        const uniqueKey = `${category}_${NUMMER}_${OBJECTID}`;

        results.push({
          objectId: OBJECTID,
          nummer: NUMMER,
          category,
          uniqueKey,
          locationText: LAGE,
          capacity: KAPAZITAET,
          cost: KOSTEN,
          remark: BEMERKUNG,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      } catch (err) {
          console.error(`❌ Failed to convert coordinates: [${xNum}, ${yNum}] →`, err.message);
        }
      })
      .on('end', async () => {
        try {
          for (const parking of results) {
            await Parking.updateOne(
              { uniqueKey: parking.uniqueKey },
              { $set: parking },
              { upsert: true }
            );
          }
          console.log(`✅ Inserted ${results.length} ${category} parkings`);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await importCSV(reisebusPath, 'reisebus');
    await importCSV(wohnmobilPath, 'wohnmobil');

    console.log('🚀 All parkings imported.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

main();
