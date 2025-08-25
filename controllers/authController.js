const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const newUser = await User.create({ username, email, password });

    // 生成 token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// 登录用户
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// 更新当前位置
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user.id; // 从认证中间件提取
    const { lng, lat } = req.body;

    if (!lng || !lat) return res.status(400).json({ error: 'Missing longitude or latitude' });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { location: { type: 'Point', coordinates: [lng, lat] } },
      { new: true }
    );

    res.json({
      message: 'Location updated',
      location: updatedUser.location
    });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Server error during location update' });
  }
};

// user update
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // 从 token 中解析出来的用户 ID
    const { username, email } = req.body;

    const updatedData = {};
    if (username) updatedData.username = username;
    if (email) updatedData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

// user delete
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};


