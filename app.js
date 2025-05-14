require('dotenv').config();
const express = require('express');
const session = require('express-session');
const userService = require('./service/userService');
const userRoutes = require('./router/userRoutes');
const MongoStore = require('connect-mongo');
const app = express();
// const randomRouter = require('./router/random.js');
const port = 8000;

// 连接数据库
userService.connectToDatabase().catch(console.error);

app.use(express.urlencoded({ extended: true })); // 解析表单数据
app.use(express.json()); // 解析JSON数据

app.use(session({
    secret: process.env.SESSION_SECRET, // 用于对session id相关的cookie进行签名
    resave: false, // 是否每次请求都重新设置session cookie，建议false
    saveUninitialized: false, // 是否保存未初始化的session，建议false
    cookie: {
        maxAge: 1000 * 60 * 30 // 设置session的有效时间，单位是毫秒
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL, // 数据库连接地址
        dbName: process.env.DB_NAME, // 数据库名称
        stringify: false, // 不将session数据序列化为字符串
    })
}));

// API路由
app.use('/api/users', userRoutes);

app.get('/', (req, res, next) => {
    if (req.session.user) {
        next(); // 继续执行下一个中间件
    } else {
        next('route'); // 跳过当前中间件，直接执行下一个路由
    }
}, (req, res) => {
    res.send(`Hello  ${req.session.user.username}! <a href="/api/users/logout">退出</a>`);
})

app.get('/', (req, res) => {
    res.send(`
    <h1>用户登录</h1>
    <form action="/api/users/login" method="post">
        <div>
            <label for="username">用户名:</label>
            <input type="text" id="username" name="username">
        </div>
        <div style="margin-top: 10px;">
            <label for="password">密码:&ensp;&ensp;</label>
            <input type="password" id="password" name="password">
        </div>
        <div style="margin-top: 20px">
            <input type="submit" value="登录">
        </div>
    </form>
    <div style="margin-top: 20px;">
        <a href="/register">注册新账号</a>
    </div>
    `);
})

app.get('/register', (req, res) => {
    res.send(`
    <h1>用户注册</h1>
    <form action="/api/users/register" method="post">
        <div>
            <label for="username">用户名:</label>
            <input type="text" id="username" name="username">
        </div>
        <div style="margin-top: 10px;">
            <label for="password">密码:&ensp;&ensp;</label>
            <input type="password" id="password" name="password">
        </div>
        <div style="margin-top: 20px">
            <input type="submit" value="注册">
        </div>
    </form>
    <div style="margin-top: 20px;">
        <a href="/">返回登录</a>
    </div>
    `);
})

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('服务器错误!');
})

// app.use('/random/:extract', randomRouter);

// app.get('/username/:name/age/:age', (req, res, next) => {
//     console.log(req.params);
//     next();
// }, (req, res) => {
//     res.send('Hello ' + req.params.name + '! You are ' + req.params.age + ' years old.');
// })
app.listen(port, () => {
    console.log(`Express service listening on port:${port}`)
})