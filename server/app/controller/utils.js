const {Controller} = require('egg')
const SvgCaptcha = require('svg-captcha')
class UtilController extends Controller{
    //获取图片验证码
    async captcha(){
        const captcha = SvgCaptcha.create({
            size: 4,
            fontSize: 50,
            width: 100,
            height: 40,
            noise: 3
        })
        console.log(captcha.text)
        this.ctx.session.captcha = captcha.text
        this.ctx.response.type = 'image/svg+xml'
        this.ctx.body = captcha.data
    }
    //发送邮箱验证码
    async sendCode(){
        const {ctx} = this
        const email = ctx.query.email
        const code = Math.random().toString().slice(2,6)
        ctx.session.emailcode = code
        const subject = "XX网站登录验证码"
        const text = ''
        const html = `<h2>${code}</h2>`
        const hasSend = await this.service.tools.sendEmail(email,subject,text,html)
        if(hasSend){
            ctx.helper.success({ctx,res:"发送成功"})
        }else{
            ctx.helper.error({ctx,message:"发送失败"})
        }
    }
}
module.exports = UtilController