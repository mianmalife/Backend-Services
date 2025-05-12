require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
// const randomRouter = require('./router/random.js');
const port = 8000;
app.use(express.urlencoded({ extended: true })); // 解析表单数据
app.use(express.json()); // 解析JSON数据

app.use(session({
    secret: process.env.SESSION_SECRET, // 用于对session id相关的cookie进行签名
    resave: false, // 是否每次请求都重新设置session cookie，建议false
    saveUninitialized: false, // 是否保存未初始化的session，建议false
    cookie: {
        maxAge: 1000 * 60 * 30 // 设置session的有效时间，单位是毫秒
    }
}));
app.get('/', (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user) {
        next(); // 继续执行下一个中间件
    } else {
        next('route'); // 跳过当前中间件，直接执行下一个路由
    }
}, (req, res) => {
    res.send(`Hello  ${req.session.user}! <a href="/logout">退出</a>`);
})

app.get('/', (req, res) => {
    res.send(`
    <form action="/login" method="post">
        <input type="text" name="username"><br><br>
        <input type="password" name="password"><br><br>
        <input type="submit" value="login">
    </form>`);
})

app.get('/login', (req, res) => {
    res.send(`
    <form action="/login" method="post">
        <input type="text" name="username"><br><br>
        <input type="password" name="password"><br><br>
        <input type="submit" value="login">
    </form>`);
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    if (username === process.env.MOCK_USER && password === process.env.MOCK_PASSWORD) {
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = username;
            req.session.save((err) => {
                if (err) return next(err);
                res.redirect('/');
            })
        })
    } else {
        res.status(401).send('用户名或密码错误')
    }
})

app.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.save((err) => {
        if (err) return next(err); // 处理错误
        req.session.regenerate((err) => {
            if (err) return next(err);
            res.redirect('/')
        })
    })
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