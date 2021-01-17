//处理成功响应
exports.success = ({ctx,res=null,msg='成功'}) => {
    ctx.body = {
        code: 0,
        data: res,
        msg
    }
    ctx.status = 200
}