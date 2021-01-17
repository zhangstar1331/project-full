const {Controller} = require('egg')
class UserController extends Controller {
    /**
     * @summary 注册用户
     * @description 注册用户，记录用户邮箱/昵称/密码
     * @router post /user/register
     * @request body createUserRequest *body
     * @response 200 baseResponse 创建成功
     */
    async register(){
        const {ctx, app} = this
        const {email, captcha, nickname, passwd} = ctx.request.body
        ctx.helper.success({ctx,res:"注册成功"})
    }
    //登录
    async login(){}

    //验证
    async verify(){}
}
module.exports = UserController