require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb'); // 导入MongoDB驱动
const bcrypt = require('bcrypt'); // 导入bcrypt模块

let client;
let db;
let usersCollection;

// 连接MongoDB数据库
async function connectToDatabase() {
    if (db) return { client, db };
    client = new MongoClient(process.env.MONGO_URL); // 连接MongoDB数据库
    await client.connect(); // 连接数据库
    db = client.db(process.env.DB_NAME); // 获取数据库实例
    usersCollection = db.collection('users'); // 获取集合实例
    await usersCollection.createIndex({ username: 1 }, { unique: true }); // 创建唯一索引
    return { client, db };
}

// 获取MongoDB客户端
async function getMongoClient() {
    if (!client) {
        await connectToDatabase();
    }
    return client;
}

// 创建新用户
async function createUser(userData) {
    await connectToDatabase();
    const salt = await bcrypt.genSalt(10); // 生成盐值
    const hashedPassword = await bcrypt.hash(userData.password, salt); // 对密码进行哈希
    const newUser = {
        username: userData.username,
        password: hashedPassword,
        salt: salt,
    };
    const result = await usersCollection.insertOne(newUser);
    return { username: newUser.username, _id: result.insertedId };
}

// 根据用户名查找用户
async function findUserByUsername(username) {
    await connectToDatabase();
    return usersCollection.findOne({ username });
}

// 根据用户ID查找用户
async function findUserById(userId) {
    await connectToDatabase();
    return usersCollection.findOne({ _id: new ObjectId(userId) });
}

// 验证用户密码
async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword); // 比较密码是否匹配
}

async function updateLastLoginTime(userId) {
    await connectToDatabase();
    return usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { lastLogin: new Date() } }
    );
}
// 根据用户ID获取用户信息，不包括密码
async function getUserWithoutPassword(userId) {
    await connectToDatabase();
    return usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0, salt: 0 } });
}

// 生成JWT令牌
async function generateToken(user) {
    return jwt.sign({ id: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: 30 })
}

module.exports = {
    getMongoClient,
    connectToDatabase,
    createUser,
    findUserByUsername,
    findUserById,
    verifyPassword,
    updateLastLoginTime,
    getUserWithoutPassword,
    generateToken,
}