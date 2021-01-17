//处理成功响应
exports.success = ({ctx, res=null, msg='请求成功'}) => {
    console.log(ctx)
    ctx.body = {
        code: 0,
        data: res,
        msg
    }
    ctx.status = 200
}