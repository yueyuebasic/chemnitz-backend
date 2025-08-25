const Parking = require('../models/Parking');
const District = require('../models/District');

// 1. 获取所有停车位（可分页）
const getAllParkings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const parkings = await Parking.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(parkings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. 按类型查询（reisebus 或 wohnmobil）
const getParkingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!['reisebus', 'wohnmobil'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const parkings = await Parking.find({ category });
    res.json(parkings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. 按地理范围查询（$near）
const getNearbyParkings = async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;

    if (!lng || !lat || !radius) {
      return res.status(400).json({ error: 'lng, lat, and radius are required' });
    }

    const parkings = await Parking.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius),
        },
      },
    });

    res.json(parkings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const filterParkings = async (req, res) => {
  try {
    const { category, minCapacity, page = 1, limit = 20 } = req.query;

    const matchStage = {};

    // 类别过滤
    if (category && ['reisebus', 'wohnmobil'].includes(category)) {
      matchStage.category = category;
    }

     // 聚合管道
    const pipeline = [];

    // 先匹配类别和城区
    pipeline.push({ $match: matchStage });

    // 添加字段：尝试将 capacity 转为整数
    pipeline.push({
      $addFields: {
        capacityInt: {
          $convert: {
            input: "$capacity",
            to: "int",
            onError: null, // 转换失败返回 null
            onNull: null,
          }
        }
      }
    });

    // 最小容量筛选：包含数值 >= minCapacity 或无法转换的文字（如 'nach Absprache'）
    if (minCapacity) {
      pipeline.push({
        $match: {
          $or: [
            { capacityInt: { $gte: parseInt(minCapacity) } },
            { capacityInt: null }
          ]
        }
      });
    }


    // 分页
    pipeline.push(
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const parkings = await Parking.aggregate(pipeline);
    res.json(parkings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllParkings,
  getParkingsByCategory,
  getNearbyParkings,
  filterParkings,
};
