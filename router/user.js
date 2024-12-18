const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const verify = require('../examine/index')
const config = require('../system/serve')
const jwt = require('jsonwebtoken'); // 用于生成 token
const userSQL = require('../tool/tokenTool')
const articleSQL = require('../tool/articleTool')
const reviewSQL = require('../tool/contentTool')

userSQL.initUserInfo()

router.post('/login', verify.examine['login'], (req, res) => {
    // 导入验证函数
    const errors = verify.validationResult(req);

    // 判断是否参数完整
    if (!errors.isEmpty()) {
        return res.status(400).send({ code: 400, msg: errors.array().map(item => item.msg).join() });
    }

    // 拼合用户对象
    const temp = {
        username: req.body.username.replace(/\s/g, ''),
        password: req.body.password
    }

    // 验证密码是否通过
    const result = userSQL.authenticationPassword(temp)

    if (!result.code) {
        return res.status(400).send({ code: 400, msg: result.msg })
    }

    const token = jwt.sign(temp, config.secreKey)
    res.status(200).send({
        code: 200, msg: '登录成功!', data: {
            username: userSQL.UserList[username].username,
            pic: userSQL.UserList[username].pic,
            token: 'Bearer ' + token
        }
    })
})

router.post('/sigin', verify.examine['sigin'], async (req, res) => {
    // 导入验证函数
    const errors = verify.validationResult(req);

    // 判断是否参数完整
    if (!errors.isEmpty()) {
        return res.status(400).send({ code: 400, msg: errors.array().map(item => item.msg).join() });
    }

    const username = req.body.username.replace(/\s/g, '')
    const password = req.body.password

    // 拼合用户对象
    const temp = {
        username,
        password
    }

    const result = await userSQL.addUserInfo(temp)

    // 是否存在同名
    if (!result.code) {
        return res.status(400).send({ code: 400, msg: '用户名已存在，请更换名字！' });
    }

    const token = jwt.sign(temp, config.secreKey)
    res.status(200).send({
        code: 200, msg: '注册成功！', data: {
            username: userSQL.UserList[username].username,
            pic: userSQL.UserList[username].pic,
            token: 'Bearer ' + token
        }
    })
})

router.get('/info', (req, res) => {
    const discard = ['password']
    const info = userSQL.UserList[req.user.username]
    // 禁选信息
    discard.forEach(item => {
        if (info[item]) {
            delete info[item]
        }
    })
    res.send({ code: 200, data: info })
})

router.post('/setmsg', verify.examine['msg'], async (req, res) => {

    // 导入验证函数
    const errors = verify.validationResult(req);

    // 判断是否参数完整
    if (!errors.isEmpty()) {
        return res.status(400).send({ code: 400, msg: errors.array().map(item => item.msg).join() });
    }

    const articleId = req.body.id
    const content = req.body.content
    const user = req.user.username

    // 输入的 articleId 指向的文章不存在
    if (!articleSQL.computeKey[articleId]) {
        return res.status(400).send({ code: 400, msg: 'id 指向的文章内容不存在' });
    }

    // 写入数据
    const result = await reviewSQL.setContentByAryicleId(user, content, articleId)

    // 判断状态
    if (!result.code) {
        res.status(400).send({ code: 400, msg: result.msg })
        return
    }
    // 返回结果
    res.send({ code: 200, data: '写入完成' })
})

module.exports = router