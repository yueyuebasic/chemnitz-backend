const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 设置当前位置（需登录）
router.patch('/location', authenticate, authController.updateLocation);

// 更新用户信息（需登录）
router.put('/update', authenticate, authController.updateUser);

// 删除用户账号（需登录）
router.delete('/delete', authenticate, authController.deleteUser);

module.exports = router;
