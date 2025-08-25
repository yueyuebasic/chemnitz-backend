const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');

// 路由：获取所有 POIs（支持分页）
router.get('/', poiController.getAllPois);

// 路由：按类别和类型筛选
router.get('/filter', poiController.getPoisByCategoryAndType);

// 路由：获取附近 POIs（根据经纬度和距离）
router.get('/nearby', poiController.getNearbyPois);

// 路由：按名称关键字搜索
router.get('/search', poiController.searchPoisByKeyword);

router.get('/:id', poiController.getPoiById);



module.exports = router;
