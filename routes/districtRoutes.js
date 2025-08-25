const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

// 获取所有districts，支持分页
router.get('/', districtController.getAllDistricts);

// 根据id获取单个district
router.get('/id/:id', districtController.getDistrictById);

// 根据name获取单个district
router.get('/name/:name', districtController.getDistrictByName);

// 根据点查询包含该点的district
// 查询参数通过 ?lng=经度&lat=纬度 传入
router.get('/contains-point', districtController.getDistrictsByGeo);

module.exports = router;
