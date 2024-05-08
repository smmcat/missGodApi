/**
  * 内容区域工具
*/

const path = require('path')
const fs = require('fs/promises')
const date = require('./dateFn')
const baseContentPath = path.join(__dirname, '../data/contentInfo')
const pidUpPath = path.join(__dirname, '../data/lastInfo/pidIndex')

const content = {
    contentInfo: {},
    computeKey: {},
    isOver: false,
    pidUp: 0,
    // 初始化数据
    async initContent(computeKey) {
        const dirList = (await fs.readdir(baseContentPath)).map(item => path.join(baseContentPath, item));
        this.pidUp = Number(await fs.readFile(pidUpPath))
        this.computeKey = computeKey ? computeKey : {}
        const dict = { success: 0, err: 0 }
        // 遍历文件夹数据 拼接缓存对象
        const getContentEventList = dirList.map((item) => {
            return new Promise(async (reject, resolve) => {
                try {
                    const data = JSON.parse(await fs.readFile(item))
                    this.contentInfo[getFileNameWithoutExtension(item)] = data
                    dict.success++
                    reject(true)
                } catch (error) {
                    dict.err++
                    reject(false)
                }
            })
        })
        await Promise.all(getContentEventList)
        this.isOver = true;
        console.log(`加载内容区域完成，成功 ${dict.success} 次，失败 ${dict.err} 次`);
        console.log(this.contentInfo);
    },
    // 获取对应文章评论
    getContentByArticleId(id) {
        // 基础验证
        if (!this.isOver) return { code: false, msg: '未初始化完成评论内容区域' }
        if (!id || !this.computeKey[id]) return { code: false, msg: '不存在对应的文章信息索引' }

        // 若无数据，创建初始化内容
        if (!this.contentInfo[this.computeKey[id]]) {
            this.contentInfo[this.computeKey[id]] = []
        }

        // 筛选未删除评论
        const data = this.contentInfo[this.computeKey[id]].filter(item => !item.isdel)
        return { code: true, data, key: this.computeKey[id] }
    },
    // 写入文章评论
    async setContentByAryicleId(username, content, articleId) {
        // 验证参数完整性
        if (!username || !content || !articleId) return { code: false, msg: '缺少指定必填参数' }

        // 获取对应下标文章
        const articleInfo = this.getContentByArticleId(articleId)
        if (!articleInfo.code) {
            return articleInfo
        }

        // 获取当前用户最后发帖时间
        const myContent = articleInfo.data.filter(item => item.user == username).map(i => i.time)
        const lastTime = myContent.length ? myContent[myContent.length - 1] : null

        // 判断是否在一小时后发帖
        if (!date.decideTimeOfNextHour(date.makeFormData().time, lastTime, 1)) {
            return { code: false, msg: '连续发帖时间短于1小时' }
        }

        // 拼接数据 写入
        articleInfo.data.push({
            pid: ++this.pidUp,
            user: username,
            isdel: false,
            time: date.makeFormData().time,
            content
        })

        // 本地更新
        await this.setStorePidUpdata()
        await this.setStoreContentData(articleInfo.key, articleInfo.data)

        return { code: true, msg: '写入完成' }
    },
    // 本地存储评论数据
    async setStoreContentData(key, data) {
        try {
            await fs.writeFile(path.join(baseContentPath, `${key}.json`), JSON.stringify(data))
            return { code: true, msg: '写入完成' }
        } catch (error) {
            return { code: false, msg: '写入失败' }
        }
    },
    // 评论下标本地存储更新
    async setStorePidUpdata() {
        const pid = this.pidUp
        try {
            await fs.writeFile(pidUpPath, JSON.stringify(pid))
            return { code: true, msg: '写入完成' }
        } catch (error) {
            return { code: false, msg: '写入失败' }
        }
    }
}

function getFileNameWithoutExtension(filePath) {
    const fileNameWithExtension = path.basename(filePath); // 获取包含扩展名的文件名
    const fileNameWithoutExtension = path.parse(fileNameWithExtension).name; // 获取不包含扩展名的文件名
    return fileNameWithoutExtension;
}

module.exports = content 