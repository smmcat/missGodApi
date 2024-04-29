const path = require('path')
const fs = require('fs/promises')
const baseUserPath = path.join(__dirname, '../data/userInfo')
const bcrypt = require('bcryptjs')

const token = {
    UserList: {}, // 临时缓存用户数据
    isOver: false, // 是否加载完成
    // 初始化用户数据
    async initUserInfo() {
        const dirList = (await fs.readdir(baseUserPath)).map(item => path.join(baseUserPath, item));
        const userNameList = dirList.map(item => getFileNameWithoutExtension(item));
        const temp = {};
        try {
            for (let index = 0; index < dirList.length; index++) {
                const item = dirList[index];
                temp[userNameList[index]] = JSON.parse(await fs.readFile(item, 'utf-8'));
            }
            this.UserList = temp
            this.isOver = true
            return { code: true, msg: '完成用户初始化加载' }
        } catch (error) {
            console.log(error);
            return { code: false, msg: '初始化用户加载失败' }
        }
    },
    // 是否存在用户名
    userIsReuse(username) {
        if (this.UserList[username]) {
            return { code: false, msg: '用户名已存在' }
        } else {
            return { code: true, msg: '用户名不存在' }
        }
    },
    // 添加新用户数据
    async addUserInfo(userInfo) {
        if (!this.isOver) {
            return { code: false, msg: '未完成初始化用户加载' }
        }
        if (!this.userIsReuse(userInfo.username).code) {
            return { code: false, msg: '用户名已存在' }
        }
        const len = Object.keys(this.UserList).length
        userInfo.password = bcrypt.hashSync(userInfo.password, 10) // 密码加密
        this.UserList[userInfo.username] = { ...userInfo, uid: len, discard: false, pic: '' }
        const msg = await this.setUserInfoStore(this.UserList[userInfo.username])
        return msg;
    },
    // 本地存储新用户数据
    async setUserInfoStore(userInfo) {
        try {
            await fs.writeFile(path.join(baseUserPath, `${userInfo.username}.json`), JSON.stringify(userInfo))
            return { code: true, msg: '本地存储用户信息完成' }
        } catch (error) {
            console.log(error);
            return { code: false, msg: '本地存储用户信息失败' }
        }
    },
    // 验证加密密码是否通过
    authenticationPassword(userInfo) {
        // 判断是否存在该用户信息
        if (!this.UserList[userInfo.username]) {
            return { code: false, msg: '不存在该用户' }
        }
        // 提取加密密码
        const key = this.UserList[userInfo.username].password
        // 验证加密密码
        if (!bcrypt.compareSync(userInfo.password, key)) {
            return { code: false, msg: '密码错误' }
        }
        return { code: true, msg: '验证成功' }
    }
}

function getFileNameWithoutExtension(filePath) {
    const fileNameWithExtension = path.basename(filePath); // 获取包含扩展名的文件名
    const fileNameWithoutExtension = path.parse(fileNameWithExtension).name; // 获取不包含扩展名的文件名
    return fileNameWithoutExtension;
}

module.exports = token