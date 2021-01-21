const {Service} = require('egg')
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
}
module.exports = ToolService