const { body, query, validationResult } = require('express-validator');


// 当检查不符合规定时 使用 throw new Error() 抛出异常提示
const examine = {
    'login': [
        body('username').notEmpty().custom((value) => {
            if (!/^[a-zA-Z0-9]{5,10}$/.test(value)) {
                throw new Error('账号格式有误，正确格式为长度为5-10，字母和数字组成');
            }
            return true;
        }),
        body('password').notEmpty().custom((value) => {
            if (!/^[a-zA-Z0-9!@#$%^&*()_+]{3,20}$/.test(value)) {
                throw new Error('密码格式有误，正确格式为长度为3-20，字母和数字组成');
            }
            return true;
        })
    ],
    'sigin': [
        body('username').notEmpty().custom((value) => {
            if (!/^[a-zA-Z0-9]{5,10}$/.test(value)) {
                throw new Error('账号格式有误，正确格式为长度为5-10，字母和数字组成');
            }
            return true;
        }),
        body('password').notEmpty().custom((value) => {
            if (!/^[a-zA-Z0-9!@#$%^&*()_+]{3,20}$/.test(value)) {
                throw new Error('密码格式有误，正确格式为长度为3-20，字母和数字组成');
            }
            return true;
        })
    ]
}

module.exports = { examine, validationResult }