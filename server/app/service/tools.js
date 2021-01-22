const {Service} = require('egg')
const path = require('path')
const fse = require('fs-extra')
const nodemailer = require('nodemailer')
const userEmail = 'derSterne@126.com'
const transporter = nodemailer.createTransport({
    service: '126',
    secureConnection: true,
    auth: {
        user: userEmail,
        pass: 'UQKCPRUJJHAPCFPC'
    }
})
class ToolService extends Service{
    async sendEmail(email, subject, text, html){
        const mailOptions = {
            from: userEmail,
            cc: userEmail,
            to: email,
            subject,
            text,
            html
        }
        try{
            await transporter.sendMail(mailOptions)
            return true
        }catch(err){
            console.log('email error', err)
            return false
        }
    }
    async mergeFile(filePath,fileHash,size){
        const chunkDir = path.resolve(this.config.UPLOAD_DIR,fileHash)
        let chunks = await fse.readdir(chunkDir)
        chunks.sort((a,b)=>a.split('-')[1] - b.split('-')[1])
        chunks = chunks.map(cp => path.resolve(chunkDir, cp))
        await this.mergeChunks(chunks, filePath, size)
    }
    async mergeChunks(files, dest, size){
        const pipStream = (filePath, writeStream) => new Promise(resolve => {
            const readStream = fse.createReadStream(filePath)
            readStream.on('end', () => {
                fse.unlinkSync(filePath)
                resolve()
            })
            readStream.pipe(writeStream)
        })
        await Promise.all(
            files.forEach((file,index) => {
                pipStream(file, fse.createWriteStream(dest, {
                    start: index * size,
                    end: (index + 1) * size
                }))
            })
        )
    }
}
module.exports = ToolService