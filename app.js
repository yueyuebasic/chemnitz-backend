const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 数据库连接
connectDB();

// 路由模块
const authRoutes = require('./routes/auth');
const poiRoutes = require('./routes/poiRoutes');
const districtRoutes = require('./routes/districtRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/favorites', favoriteRoutes);

// 测试接口
app.get('/', (req, res) => res.send('API is running'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
