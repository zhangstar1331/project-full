'use strict'
module.exports = (option, app) => {
    return async function (ctx, next) {
        try {
            await next()
        } catch(err) {
            console.log('错误收集-------------------------------------')
            //所有的异常都在app上触发一个error事件，框架会记录一条错误日志
            app.emit('error',err,this)
            const status = err.status || 500
            //生产环境时 500 错误的详细内容不会返回给客户端，因为可能包含敏感信息
            const error = status === 500 && app.config.env === 'prod' ? 'Internal Server Error' : err.message
            //从error对象上读出各个属性，设置到响应中
            ctx.body = {
                code: status, //服务器端自身的处理逻辑错误（包含框架错误500及自定义业务逻辑错误533开始）客户端请求参数导致的错误（4xx开始），设置不同的状态码
                error: error
            }
            if(status === 422){
                ctx.body.detail = err.errors
            }
            ctx.status = 200
        }
    }
}