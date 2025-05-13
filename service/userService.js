require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb'); // 导入MongoDB驱动
const bcrypt = require('bcrypt'); // 导入bcrypt模块

let db;
let usersCollection;

// 连接MongoDB数据库
async function connectToDatabase() {
    if (db) return db;
    const client = new MongoClient(process.env.MONGO_URL); // 连接MongoDB数据库
    await client.connect(); // 连接数据库
    db = client.db(process.env.DB_NAME); // 获取数据库实例
    usersCollection = db.collection('users'); // 获取集合实例
    await usersCollection.createIndex({ username: 1 }, { unique: true }); // 创建唯一索引
    return db;
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
    return { ...newUser, _id: result.insertedId, password: undefined }; // 返回新用户信息，不包括密码
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

async function updateLastLogin(userId) {
    await connectToDatabase();
    return usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { lastLogin: new Date() } }
    );
}
// 根据用户ID获取用户信息，不包括密码
async function getUserWithoutPassword(userId) {
    await connectToDatabase();
    return usersCollection.findOne({ _id: userId }, { projection: { password: 0 } });
}

module.exports = {
    connectToDatabase,
    createUser,
    findUserByUsername,
    findUserById,
    verifyPassword,
    updateLastLogin,
    getUserWithoutPassword,
}