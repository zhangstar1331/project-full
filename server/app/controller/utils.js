const {Controller} = require('egg')
const SvgCaptcha = require('svg-captcha')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const pump = require('mz-modules/pump')
/**
 * @Controller 常用方法
 */
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
    /**
     * @summary 文件上传
     * @description 文件上传
     * @router post /uploadFile
     * @resuest body 
     * @response 200
     */
    async uploadFile(){
        if(Math.random()>0.9){
            return this.ctx.status = 500
        }
        const {ctx} = this
        //切片上传
        const file = ctx.request.files[0]
        const {hash,name} = ctx.request.body
        const chunkPath = path.resolve(this.config.UPLOAD_DIR,hash)
        if(!fse.existsSync(chunkPath)){
            //创建目录
            await fse.mkdir(chunkPath)
        }
        //将文件移入目录
        await fse.move(file.filepath,`${chunkPath}/${name}`)
        ctx.helper.success({ctx,res:"切片上传成功"})
        //整体上传
        // const stream = await this.ctx.getFileStream();
        // const filename = encodeURIComponent(stream.fields.name) + path.extname(stream.filename).toLowerCase();
        // const target = path.join(this.config.baseDir, 'app/public', filename);
        // const writeStream = fs.createWriteStream(target);
        // await pump(stream,writeStream)
        // ctx.helper.success({ctx,res:"上传成功"})
    }
    /**
     * @summary 切片整合
     * @description 切片整合
     * @router post /mergeFile
     * @resuest body 
     * @response 200
     */
    async mergeFile(){
        const {ext,size,hash} = this.ctx.request.body
        const filePath = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`)
        await this.ctx.service.tools.mergeFile(filePath,hash,size)
        ctx.helper.success({ctx,res:{
            url:`/public/${hash}.${ext}`
        }})
    }
    /**
     * @summary 判断切片是否存在
     * @description 判断切片是否存在
     * @router post /checkFile
     * @resuest body 
     * @response 200
     */
    async checkFile(){
        const {ctx} = this
        const {ext,hash} = this.ctx.request.body
        const filePath = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`)
        let uploaded = false
        let uploadedList = []
        if(fse.existsSync(filePath)){
            //文件存在
            uploaded = true
        }else{
            uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR,hash))
        }
        ctx.helper.success({ctx,res:{
            uploaded,
            uploadedList
        }})
    }
    async getUploadedList(dirPath){
        return fse.existsSync(dirPath)
            ?(await fse.readdir(dirPath)).filter(name=>name[0]!=='.')
            :[]
    }
}
module.exports = UtilController