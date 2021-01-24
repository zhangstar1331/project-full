const { Controller } = require('egg')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
//用于密码加严加密
const HashSalt = ':ahdf12@asd!345'
/**
 * @Controller 用户管理
 */
class UserController extends Controller {
    /**
     * @summary 注册用户
     * @description 注册用户，记录用户邮箱/昵称/密码
     * @router post /user/register
     * @request body createUserRequest *body
     * @response 200 baseResponse 创建成功
     */
    async register() {
        const { ctx, app } = this
        //参数校验
        ctx.validate(ctx.rule.createUserRequest)
        const { email, captcha, nickname, passwd } = ctx.request.body
        //验证码校验
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            ctx.helper.error({ ctx, message: "验证码错误" })
        }
        //邮箱重复校验
        if (await this.checkEmail(email)) {
            ctx.helper.error({ ctx, message: "邮箱重复啦" })
        } else {
            const ret = await ctx.model.User.create({
                email,
                nickname,
                passwd: md5(passwd + HashSalt)
            })
            if (ret._id) {
                ctx.helper.success({ ctx, res: "注册成功" })
            }
        }
    }
    //邮箱重复校验
    async checkEmail(email) {
        const user = await this.ctx.model.User.findOne({ email })
        return user
    }
    //登录
    async login() {
        const { ctx, app } = this
        const { email, captcha, emailcode, passwd } = ctx.request.body
        //验证码校验
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            return ctx.helper.error({ ctx, message: "验证码错误" })
        }
        //邮箱验证码校验
        if (emailcode !== ctx.session.emailcode) {
            return ctx.helper.error({ ctx, message: "邮箱验证码错误" })
        }
        //邮箱密码校验
        let user = await this.ctx.model.User.findOne({
            email,
            passwd: md5(passwd + HashSalt)
        })
        if (!user) {
            return ctx.helper.error({ ctx, message: "邮箱/密码错误" })
        }
        //用户的信息加密成token返回
        const token = jwt.sign({
            _id: user._id,
            email
        }, app.config.jwt.secret, {
            expiresIn: "100h" //过期时间
        })
        ctx.helper.success({
            ctx, res: {
                token,
                email,
                nickname: user.nickname
            }
        })
    }
    //查询用户信息
    async detail() {
        const { ctx } = this
        const user = await this.checkEmail(ctx.state.email)
        ctx.helper.success({ ctx, res: user })
    }
    //验证
    async verify() { }
    //文章关注
    async follow() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
        if (!isFollow) {
            me.following.push(ctx.params.id)
            me.save()
            ctx.helper.success({ ctx, res: "关注成功" })
        }
    }
    //检测该用户是否关注该文章
    async isfollow() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
        ctx.helper.success({ ctx, res: isFollow })
    }
    //取消关注
    async cancelFollow() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
            ctx.helper.success({ ctx, res: "取消成功" })
        }
    }
    //点赞
    async likeArticle() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        if (!me.likeArticle.find(id => id.toString() === ctx.params.id)) {
            me.likeArticle.push(ctx.params.id)
            me.save()
            await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: 1 } })
            ctx.helper.success({ ctx, res: "点赞成功" })
        }
    }
    //取消点赞
    async cancelLikeArticle() {
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const index = me.likeArticle.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.likeArticle.splice(index, 1)
            me.save()
            await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: -1 } })
            ctx.helper.success({ ctx, res: "取消成功" })
        }
    }
    async articleStatus(){
        const { ctx } = this
        const me = await ctx.model.User.findById(ctx.state.userid)
        const like = !!me.likeArticle.find(id => id.toString()===ctx.params.id)
        const dislike = !!me.disLikeArticle.find(id => id.toString()===ctx.params.id)
        ctx.helper.success({ ctx, res: {
            like,dislike
        } })
    }
}
module.exports = UserController