module.exports = {
    createUserRequest: {
        email: { type: 'string', required: true, description: '邮箱', example: '2356742@qq.com' },
        captcha: { type: 'string', required: true, description: '验证码', example: 'a432' },
        nickname: { type: 'string', required: true, description: '昵称', example: 'Star' },
        passwd: { type: 'string', required: true, description: '密码', example: '123456' }
    }
}