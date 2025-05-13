const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// 用户注册、登录、登出、获取当前用户信息
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/profile', isAuthenticated, userController.getCurrentUser);

module.exports = router;