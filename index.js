const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const config = require('./system/serve')
const bibleRouter = require('./router/bible')
const userRouter = require('./router/user')
const expressJWT = require('express-jwt'); // 用于解析 token

const app = express()

// 依赖
app.use('/user', expressJWT({ secret: config.secreKey }).unless({ path: ['/user/sigin', '/user/login'] }))
app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// 路由
app.use('/bible', bibleRouter);
app.use('/user', userRouter);

// 错误中间件
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // 错误是由 token 解析失败 或者 token失效 导致
        return res.status(401).send({ status: 401, message: '无效的 token' })
    }
    // 其他原因导致的错误
    console.log(err);
    res.send({ status: 500, message: '未知错误' })
})

// 挂载监听
app.listen(config.port, () => {
    console.log(`服务器部署在 http://127.0.0.1:${config.port} 上`);
})





