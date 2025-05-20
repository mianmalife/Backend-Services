require('dotenv').config();
const { expressjwt } = require('express-jwt');

// 定义一个中间件，用于验证JWT令牌
const jwtAuth = expressjwt({
    secret: process.env.JWT_SECRET, // 用于签名和验证JWT令牌的密钥
    algorithms: ['HS256'], // 使用的加密算法
    requestProperty: 'auth', // 将解析后的JWT令牌存储在请求对象的auth属性中
})

exports.isAuthenticated = (req, res, next) => {
    // 使用express-jwt中间件进行认证
    jwtAuth(req, res, (err) => {
        if (err) {
            if (err.name === 'UnauthorizedError') {
                return res.status(401).json({ message: '未登录或认证已过期' });
            }
            return res.status(401).json({ message: '认证服务错误' });
        } else {
            next();
        }
    })
}