const userService = require('../service/userService.js');

exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        const user = await userService.createUser({ username, password });

        // 注册成功后，创建session
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = user;
            req.session.userId = user._id.toString();

            req.session.save((err) => {
                if (err) return next(err);
                res.status(200).json({ message: '注册成功', username });
            });
        });
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
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        const isMatch = await userService.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 登录成功后，创建session
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = user;
            req.session.userId = user._id.toString();

            req.session.save((err) => {
                if (err) return next(err);
                res.status(200).json({ message: '登录成功', username });
            })
        })
    } catch (error) {
        console.error('登录错误：', error);
        next(error);
    }
}

// 退出登录
exports.logout = (req, res, next) => {
    req.session.user = null;
    req.session.userId = null;

    req.session.save((err) => {
        if (err) return next(err);

        req.session.regenerate((err) => {
            if (err) return next(err);
            res.status(200).json({ message: '退出成功' });
        })
    })
}

exports.getCurrentUser = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: '未登录' });
    }

    try {
        const user = await userService.getUserWithoutPassword(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(user); // 返回用户信息，不包括密码和敏感信息
    } catch (error) {
        console.error('获取当前用户信息错误：', error);
        res.status(500).json({ message: '服务器错误' });
    }
}