const mongoose = require('mongoose');
const POI = require('../models/Poi');
const District = require('../models/District');

// 1. 获取所有POI（分页）
const getAllPois = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pois = await POI.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    console.log('POIs found:', pois.length);
    res.json(pois);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. 按类别和类型查询
const getPoisByCategoryAndType = async (req, res) => { 
  try {
    const {
      category,
      type,
      page = 1,
      limit = 20,
      dietType,
      delivery,
      ...query
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (type === 'theatre') {
      if (query.wheelchair) {
        filter['rawProperties.wheelchair'] = query.wheelchair;
      }
    } else if (type === 'museum') {
      if (query.museum) {
        filter['rawProperties.museum'] = query.museum;
      }
      if (query.opening_hours) {
        filter['rawProperties.opening_hours'] = { $regex: query.opening_hours, $options: 'i' };
      }
      if (query.wheelchair) {
        filter['rawProperties.wheelchair'] = query.wheelchair;
      }
    } else if (type === 'artwork') {
      if (query.artwork_type) {
        filter['rawProperties.artwork_type'] = query.artwork_type;
      }
      
    } else if (type === 'restaurant') {
      if (query.cuisine) {
        filter['rawProperties.cuisine'] = query.cuisine;
      }
      if (dietType) {
        filter[`rawProperties.diet:${dietType}`] = 'yes';
      }
      if (query.opening_hours) {
        filter['rawProperties.opening_hours'] = { $regex: query.opening_hours, $options: 'i' };
      }
      if (delivery === 'yes' || delivery === 'no') {
        filter['rawProperties.delivery'] = delivery;
      }
      
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    console.log('Filter used for query:', filter);

    const pois = await POI.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);


    res.json(pois);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// 3. 按地理位置查找附近POI（默认半径800米）
// controllers/poiController.js
const getNearbyPois = async (req, res) => {
  const { lat, lng, radius } = req.query;

  try {
    const pois = await POI.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance", // ⬅️ 关键字段
          maxDistance: parseFloat(radius),
          spherical: true
        }
      }
    ]);
    const roundedPois = pois.map((poi) => ({
      ...poi,
      distance: Math.round(poi.distance),
    }));

    res.json(roundedPois);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch nearby POIs" });
  }
};


// 4. 按关键字搜索（模糊匹配 name 字段）
const searchPoisByKeyword = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Missing keyword parameter.' });
    }

    const regex = new RegExp(keyword, 'i'); // 不区分大小写
    const pois = await POI.find({ name: regex })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log(`Keyword search "${keyword}" found: ${pois.length}`);
    res.json(pois);
  } catch (err) {
    console.error('Error searching POIs by keyword:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getPoiById = async (req, res) => {
  try {
    const { id } = req.params;

    // 校验是否是合法的MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid POI ID' });
    }

    // 查询数据库
    const poi = await POI.findById(id);

    // 未找到返回404
    if (!poi) {
      return res.status(404).json({ error: 'POI not found' });
    }

    // 返回数据
    res.json(poi);
  } catch (err) {
    // 捕获异常，返回500
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  getAllPois,
  getPoisByCategoryAndType,
  getNearbyPois,
  searchPoisByKeyword,
  getPoiById
};
