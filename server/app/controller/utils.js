const {Controller} = require('egg')
const SvgCaptcha = require('svg-captcha')
class UtilController extends Controller{
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
}
module.exports = UtilController