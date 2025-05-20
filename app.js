require('dotenv').config();
const express = require('express');
const userService = require('./service/userService');
const userRoutes = require('./router/userRoutes');
const app = express();
// const randomRouter = require('./router/random.js');
const port = 8000;

(async () => {
    try {
        await userService.connectToDatabase();
        console.log('MongoDB connected successfully.');
        // const mongoClient = await userService.getMongoClient();
        app.use(express.urlencoded({ extended: true })); // 解析表单数据
        app.use(express.json()); // 解析JSON数据
        // API路由
        app.use('/api/users', userRoutes);

        app.get('/', (req, res) => {
            res.send(`
            <h1>用户登录</h1>
            <form id="loginForm">
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
            <script>
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    event.preventDefault(); // 阻止默认表单提交行为
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    try {
                        const response = await fetch('/api/users/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                            localStorage.setItem('token', data.token);
                            alert('登录成功!');
                            window.location.href = '/dashboard';
                        } else {
                            alert(data.message || '登录失败!');
                        }
                    } catch (error) {
                        console.error('登录发生错误:', error);
                        alert('登录发生错误!');
                    }
                });
            </script>
            `);
        })

        app.get('/register', (req, res) => {
            res.send(`
            <h1>用户注册</h1>
            <form id="registerForm">
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
            <script>
                document.getElementById('registerForm').addEventListener('submit', async (e) => {
                    event.preventDefault(); // 阻止默认表单提交行为
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    try {
                        const response = await fetch('/api/users/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password }),
                        })
                        const data = await response.json();
                        if (response.ok) {
                            localStorage.setItem('token', data.token);
                            alert('注册成功!');
                            window.location.href = '/';
                        } else {
                            alert(data.message || '注册失败!');
                        }
                    } catch (error) {
                        console.error('注册发生错误:', error);
                        alert('注册发生错误!');
                    }
                });
                </script>
            `);
        })

        app.get('/dashboard', (req, res) => {
            res.send(`
                <h1>欢迎登录！</h1>
                <p><button id="userBtn">获取用户信息</button></p>
                <p>用户信息:</p>
                <div id="userInfo"></div>
                <script>
                    document.querySelector('#userBtn').addEventListener('click', async () => {
                        try {
                            const response = await fetch('/api/users/profile', {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                },
                            });
                            const data = await response.json();
                            if (response.ok) {
                                document.querySelector('#userInfo').textContent = JSON.stringify(data, null, 2);
                            } else {
                                alert(data.message || '获取用户信息失败!');
                                window.location.href = '/'; // 重定向到登录页面
                                localStorage.removeItem('token'); // 清除无效的token
                            }
                        } catch (error) {
                            console.error('获取用户信息发生错误:', error);
                            alert('获取用户信息发生错误!');
                        }
                    })
                </script>
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
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // 退出进程
    }
})();