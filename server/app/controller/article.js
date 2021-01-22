const { Controller } = require('egg')
const marked = require('marked')
/**
 * Controller 文章管理
 */
class ArticleController extends Controller {
    /**
     * @summary 添加文章
     * @description 添加文章
     * @router post /article/create
     * @request body
     * @response 200
     */
    async create() {
        const { ctx } = this
        const { content } = ctx.request.body
        const {userid} = ctx.state
        const title = content.split('\n').find(v => {
            return v.indexOf('# ') === 0
        })
        const obj = {
            title: title.replace('# ',''),
            article: content,
            article_html: marked(content),
            author: userid
        }
        const ret = await ctx.model.Article.create(obj)
        if(ret._id){
            ctx.helper.success({ctx,res:{
                id: ret._id,
                title: ret.title
            }})
        }else{
            ctx.helper.error({ctx,message:"创建失败"})
        }
    }
}
module.exports = ArticleController