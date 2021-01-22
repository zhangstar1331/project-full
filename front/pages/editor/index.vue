<template>
    <div>
        <h2>markdown编辑器</h2>
        <div class="write-btn">
            <el-button type="primary" @click="submit">提交</el-button>
        </div>
        <el-row>
            <el-col :span="12">
                <textarea ref="editor" class="md-editor" :value="content" @input="update"></textarea>
            </el-col>
            <el-col :span="12">
                <div class="md-body" v-html="compiledContent"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
export default {
    layout:'default',
    data(){
        return {
            content:`
# 哈哈一
这是一篇搞笑文章
\`\`\`javascript
let a = 1
console.log(a)
\`\`\`
`
        }
    },
    mounted(){
        this.timer = null
        this.bindEvents()
        marked.setOptions({
            rendered: new marked.Renderer(),
            highlight(code){
                return hljs.highlightAuto(code).value
            }
        })
    },
    computed:{
        compiledContent(){
            return marked(this.content, {})
        }
    },
    methods:{
        bindEvents(){
            //将文件拷贝进去
            this.$refs.editor.addEventListener('paste',async e=>{
                const files = e.clipboardData.files
                console.log(files)
                //直接上传
            })
            //将文件拖拽进去
            this.$refs.editor.addEventListener('drop', async e=>{
                const files = e.dataTransfer.files
                console.log(files)
                //直接上传
                e.preventDefault()
            })
        },
        update(e){
            clearTimeout(this.timer)
            this.timer = setTimeout(()=>{
                this.content = e.target.value
            },300)
        },
        async submit(){
            let ret = await this.$http.post('/article/create',{
                content: this.content
            })
            if(ret.code==0){
                this.$notify({
                    title: '创建成功',
                    type: 'success',
                    message: `文章《${ret.data.title}》创建成功`
                })
                setTimeout(() => {
                    this.$router.push({path: '/article/'+ret.data.id})
                })
            }
        }
    }
}
</script>

<style scoped>
.md-body pre{
  background:#23241f;
  color:#f92672;
}
.md-editor{
    width: 100%;
    height: 100vh;
    outline: none;
}
.write-btn{
    position: fixed;
    z-index: 100;
    right: 30px;
    top: 10px;
}
</style>