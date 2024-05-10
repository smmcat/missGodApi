const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const articleSQL = require('../tool/articleTool')
const reviewSQL = require('../tool/contentTool')

articleSQL.initArticleSystem((computeKey) => {
    reviewSQL.initContent(computeKey)
})

setInterval(() => {
    console.log('检查章节更新...');
    articleSQL.checkTimeToUpdateArtiche()
}, 60000);

// 获取当前更新的经文 - 检查是否存在更新
router.get('/today', async (req, res) => {

    if (!articleSQL.isOver) {
        return res.status(400).send({ code: 400, msg: '等待初始化完成' })
    }

    //检查是否存在更新
    const result = await articleSQL.checkTimeToUpdateArtiche()

    if (!result.code) {
        return res.status(400).send({ code: 400, msg: result.msg })
    }
    res.status(200).send({ code: 200, msg: result.data })
})

// 获取文章列表 - 截取末尾 10 个
router.get('/list', async (req, res) => {

    if (!articleSQL.isOver) {
        return res.status(400).send({ code: 400, msg: '等待初始化完成' })
    }

    // 处理并筛选数据
    const result = Object.keys(articleSQL.ArticleList).map(item => {
        return {
            title: articleSQL.ArticleList[item].title,
            pic: articleSQL.ArticleList[item].pic ? articleSQL.ArticleList[item].pic : null,
            sortId: articleSQL.ArticleList[item].id,
            time: articleSQL.ArticleList[item].time
        }
    }).sort((a, b) => b.sortId - a.sortId).slice(0, 12).filter(item => item !== undefined)

    res.status(200).send({ code: 200, data: result })
})

// 获取文章详情
router.get('/detail/:id', async (req, res) => {
    if (!articleSQL.isOver) {
        res.status(400).send({ code: 400, msg: '等待初始化完成' })
        return
    }

    const id = req.params.id

    if (!id) {
        res.status(400).send({ code: 400, msg: '请输入id值' })
        return
    }

    const result = articleSQL.userSortIdFindArticeInfo(id)
    if (!result.code) {
        return res.status(400).send({ code: 400, msg: result.msg })
    }
    console.log(id);
    res.status(200).send({ code: 200, data: result.data })
})

router.get('/getmsg', (req, res) => {
    const id = Number(req.query.id)
    console.log(id);
    if (!id) {
        res.status(400).send({ code: 400, msg: '缺少查询的文章id' });
        return
    }
    const result = reviewSQL.getContentByArticleId(id)

    // 判断状态
    if (!result.code) {
        res.status(400).send({ code: 400, msg: result.msg })
        return
    }

    // 返回结果
    res.send({ code: 200, data: result.data })
})

module.exports = router