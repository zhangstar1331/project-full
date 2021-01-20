//处理成功响应
exports.success = ({ctx, res=null}) => {
    ctx.body = {
        code: 0,
        data: res
    }
    ctx.status = 200
}
//处理失败响应
exports.error = ({ctx,message,errors={}}) => {
    ctx.body = {
        code: -1,
        message,
        errors
    }
    ctx.status = 200
}