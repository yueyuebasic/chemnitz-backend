const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: undefined,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined, // 如果不提供，就为空
    }
  }
}, {
  timestamps: true,
});

// 建立地理空间索引（支持 10分钟城市定位）
userSchema.index({ location: '2dsphere' });

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 添加密码比对方法
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
