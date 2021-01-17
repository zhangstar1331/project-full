//公共接口请求配置
import Vue from 'vue'
import axios from 'axios'
import {MessageBox} from 'element-ui'
let service = axios.create({
    timeout:5000,
    //前缀
    baseURL:'/api'
})
//拦截器设置
export default ({store,redirect})=>{
    //请求拦截
    service.interceptors.request.use(
        config=>{
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
            return data
        },
        err=>{
            Promise.reject(err)
        }
    )
}

Vue.prototype.$http = service
export const http = service