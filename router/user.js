const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const verify = require('../examine/index')
const config = require('../system/serve')
const jwt = require('jsonwebtoken'); // 用于生成 token
const userSQL = require('../tool/tokenTool')

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
    res.status(200).send({ code: 200, msg: '登录成功!', token: 'Bearer ' + token })
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
    res.status(200).send({ code: 200, msg: '注册成功！', token: 'Bearer ' + token })
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

module.exports = router