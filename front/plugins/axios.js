//公共接口请求配置
import Vue from 'vue'
import axios from 'axios'
import {MessageBox} from 'element-ui'
let service = axios.create({
    timeout:5000,
    //前缀
    baseURL:'/api'
})
const TOKEN_KEY = 'profull-token'
//拦截器设置
export default ({store,redirect})=>{
    //请求拦截
    service.interceptors.request.use(
        config=>{
            //请求添加token
            const token = localStorage.getItem(TOKEN_KEY)
            if(token){
                config.headers.common['Authorization'] = 'Bearer '+token
            }
            return config
        },
        err=>{
            return Promise.reject(err)
        }
    )
    //响应拦截
    service.interceptors.response.use(
        async response => {
            let {data,config} = response
            //token存储与过期判断
            if(data.code === 0){
                if(config.url === '/user/login'){
                    localStorage.setItem(TOKEN_KEY,data.data.token)
                }
            }else if(data.code === -666){
                //code为-666即未登录或token过期
                MessageBox.confirm('登录过期了','过期',{
                    confirmButtonText:'登录',
                    showCancelButton:false,
                    type:'warning'
                }).then(()=>{
                    localStorage.removeItem(TOKEN_KEY)
                    redirect({path:'/login'})
                })
            }
            return data
        },
        err=>{
            return Promise.reject(err)
        }
    )
}

Vue.prototype.$http = service
export const http = service