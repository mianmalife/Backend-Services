const userService = require('../service/userService.js');

exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }
        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        const user = await userService.createUser({ username, password });

        const token = userService.generateToken(user);

        res.status(200).json({ message: '注册成功', username, token });
    } catch (error) {
        console.error('注册错误：', error);
        if (error.code === 11000) { // mongodb 唯一索引冲突
            return res.status(400).json({ message: '用户名已存在' });
        }
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // 验证用户
        const user = await userService.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        const isMatch = await userService.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 更新最后登录时间
        await userService.updateLastLoginTime(user._id);
        // 生成token
        const token = await userService.generateToken(user);
        res.status(200).json({ message: '登录成功', username: user.username, token });
    } catch (error) {
        console.error('登录错误：', error);
        next(error);
    }
}

// 退出登录 jwt方式 不需要做任何处理 客户端只需要清除token即可
exports.logout = (req, res, next) => {
    res.status(200).json({ message: '退出成功' });
}

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await userService.getUserWithoutPassword(req.auth.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(user); // 返回用户信息，不包括密码和敏感信息
    } catch (error) {
        console.error('获取当前用户信息错误：', error);
        res.status(500).json({ message: '服务器错误' });
    }
}