const District = require('../models/District');

// 获取所有districts（支持分页）
const getAllDistricts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const districts = await District.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 根据id获取单个district
const getDistrictById = async (req, res) => {
  try {
    const district = await District.findOne({ id: parseInt(req.params.id) });
    if (!district) return res.status(404).json({ error: 'District not found' });
    res.json(district);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 根据name获取单个district
const getDistrictByName = async (req, res) => {
  try {
    const district = await District.findOne({ name: req.params.name });
    if (!district) return res.status(404).json({ error: 'District not found' });
    res.json(district);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 按地理范围查询districts（点是否在多边形内）
const getDistrictsByGeo = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const districts = await District.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
        },
      },
    });
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllDistricts,
  getDistrictById,
  getDistrictByName,
  getDistrictsByGeo,
};
