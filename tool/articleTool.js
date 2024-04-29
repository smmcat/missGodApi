const path = require('path')
const fs = require('fs/promises')
const axios = require('axios')
const date = require('./dateFn')

const baseArticlePath = path.join(__dirname, '../data/articleInfo')
const lastIndexPath = path.join(__dirname, '../data/lastInfo/article.json')
const staticArticlePath = path.join(__dirname, '../static/bibleInfo.json')
const computeKeyPath = path.join(__dirname, '../data/articleKey/articleKey.json')
const upIndexPath = path.join(__dirname, '../data/lastInfo/indexUp')


const article = {
    ArticleList: {},
    computeKey: {}, // 文章索引 - [计算属性]文章评论指向
    ArticleInfo: [], // 文章信息
    lastIndex: {},
    upId: null,
    isOver: false,
    // 初始化文章信息
    async initArticleSystem() {
        this.isOver = false
        try {
            this.ArticleInfo = JSON.parse(await fs.readFile(staticArticlePath) || '[]')
            this.lastIndex = JSON.parse(await fs.readFile(lastIndexPath) || '{}')
            this.computeKey = JSON.parse(await fs.readFile(computeKeyPath) || '{}')
            this.upId = Number(await fs.readFile(upIndexPath))
            const dirList = (await fs.readdir(baseArticlePath)).map(item => path.join(baseArticlePath, item))
            const ArticleName = dirList.map(item => getFileNameWithoutExtension(item))

            const temp = {};

            for (let index = 0; index < dirList.length; index++) {
                const item = dirList[index];
                const storeData = JSON.parse(await fs.readFile(item, 'utf-8'));
                temp[ArticleName[index]] = storeData
                if (storeData.id) {
                    this.computeKey[storeData.id] = getFileNameWithoutExtension(item)
                }
            }
            this.ArticleList = temp
            this.isOver = true
            console.log(this.computeKey);
            return { code: true, msg: '完成用户初始化加载' }
        } catch (error) {
            console.log(error);
            return { code: false, msg: '初始化用户加载失败' }
        }
    },
    // 判断是否存在更新
    async checkTimeToUpdateArtiche() {
        if (!this.isOver) {
            return { code: false, msg: '等待初始化完成' }
        }
        const nowTime = date.makeFormData().day
        const beforTime = this.lastIndex.now?.day
        // 如果需要更新
        if (date.decideTimeOfNextDay(nowTime, beforTime)) {
            this.isOver = false
            console.log('--存在章节更新，准备更新！--');
            this.lastIndex.now.day = nowTime
            this.updateArtice(this.lastIndex.now)
            this.updateArtice(this.lastIndex.after)
            await this.setLastArticeInfoStore() // 更新当前章节
            await this.addNewArtice() // 更新目录
            console.log('√ 更新完成！');
            this.isOver = true
            return { code: true, data: this.lastIndex }
        } else {
            return { code: true, data: this.lastIndex }
        }
    },
    // 更新章节
    updateArtice(item) {
        if (!this.isOver) {
            return { code: false, msg: '等待初始化完成' }
        }
        const chapterLen = this.ArticleInfo[item.index].chapter
        if (item.chapter < chapterLen) {
            item.chapter = item.chapter + 1
        } else {
            const maxLen = this.ArticleInfo.length
            const index = item.index < maxLen ? item.index + 1 : 0
            item.shortName = this.ArticleInfo[index].shortName
            item.lection = this.ArticleInfo[index].lection
            item.type = this.ArticleInfo[index].type
            item.pic = this.ArticleInfo[index].pic ? this.ArticleInfo[index].pic : null
            item.chapter = 1
        }
    },
    // 自动添加文章
    async addNewArtice() {
        if (!this.isOver) {
            return { code: false, msg: '等待初始化完成' }
        }
        const addQuery = this.lastIndex.now
        let result = null;
        try {
            result = await axios({
                url: 'http://1.15.99.237:85/bible',
                method: 'GET',
                params: {
                    shortName: addQuery.shortName,
                    chapter: addQuery.chapter
                }
            })

            if (result.data?.message == '获取经文成功') {
                const index = await this.upIndexAndStore()
                const dirName = `${addQuery.shortName}-${addQuery.chapter}`
                const articeContent = {
                    title: `${addQuery.lection} ${addQuery.chapter}章`,
                    content: result.data.data,
                    id: index,
                    pic: addQuery.pic ? addQuery.pic : null,
                    time: date.makeFormData().day
                }
                this.ArticleList[dirName] = articeContent
                this.computeKey[index] = `${addQuery.shortName}-${addQuery.chapter}`
                await this.setLastArticeContentStore(articeContent, dirName)
                await this.updateComputeInfo(this.computeKey)
                return { code: true, msg: '更新章节成功' }
            }
        } catch (error) {
            console.log(error);
            return { code: false, msg: '更新章节失败' }
        }

    },
    // 使用 sortid 获得文章内容
    userSortIdFindArticeInfo(sortId) {
        if (this.computeKey[sortId]) {
            if (this.ArticleList[this.computeKey[sortId]]) {
                return { code: true, data: this.ArticleList[this.computeKey[sortId]] }
            }
            return { code: false, msg: 'sortId 对应文章不存在' }
        }
        return { code: false, msg: '无效的 sortId' }
    },
    // 本地存储更新章节
    async setLastArticeInfoStore() {
        await fs.writeFile(lastIndexPath, JSON.stringify(this.lastIndex))
    },
    // 本地存储更新经文
    async setLastArticeContentStore(newArtice, dirName) {
        await fs.writeFile(path.join(baseArticlePath, `${dirName}.json`), JSON.stringify(newArtice))
    },
    // 本地存储更新下标
    async upIndexAndStore() {
        this.upId = this.upId + 1
        await fs.writeFile(path.join(upIndexPath), String(this.upId))
        return this.upId
    },
    // 本地存储id指向索引
    async updateComputeInfo(data) {
        fs.writeFile(path.join(computeKeyPath), JSON.stringify(data))
    }
}

function getFileNameWithoutExtension(filePath) {
    const fileNameWithExtension = path.basename(filePath); // 获取包含扩展名的文件名
    const fileNameWithoutExtension = path.parse(fileNameWithExtension).name; // 获取不包含扩展名的文件名
    return fileNameWithoutExtension;
}

module.exports = article