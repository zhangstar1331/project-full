<template>
  <div class="login-container">
    <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="loginForm">
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha">
          <img :src="code.captcha" @click="resetCaptcha" />
        </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item prop="emailcode" label="验证码" class="captcha-container">
        <div class="captcha">
          <el-button type="primary" :disabled="send.timer>0" @click="sendEmailCode">{{sendText}}</el-button>
        </div>
        <el-input
          v-model="form.emailcode"
          placeholder="请输入邮件验证码"
        ></el-input>
      </el-form-item>
      <el-form-item prop="passwd" label="密码">
        <el-input
          type="password"
          v-model="form.passwd"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item label=" ">
        <el-button type="primary" @click.native.prevent="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
export default {
  layout: "login",
  data() {
    return {
      form: {
        email: "2084857599@qq.com",
        captcha: "",
        emailcode: "",
        passwd: "z123456"
      },
      rules: {
        email:[
          {required: true, message: "请输入邮箱"},
          {type: 'email', message: "请输入正确的邮箱格式"}
        ],
        captcha:[
          {required: true, message: "请输入验证码"}
        ],
        emailcode:[
          {required: true, message: "请输入邮箱验证码"}
        ],
        passwd:[
          {required: true, pattern:/^[\w_-]{6,12}$/g, message:"请输入密码"}
        ]
      },
      code:{
        captcha:'/api/captcha'
      },
      send:{
        timer:0
      }
    }
  },
  computed:{
    sendText(){
      if(this.send.timer<=0){
        return '发送'
      }
      return `${this.send.timer}秒后发送`
    }
  },
  methods:{
    resetCaptcha(){
      this.code.captcha = '/api/captcha?_t'+new Date().getTime()
    },
    async sendEmailCode(){
      this.send.timer = 60
      await this.$http.get('/sendCode?email='+this.form.email)
      let timer = setInterval(() => {
        this.send.timer -= 1
        if(this.send.timer == 0){
          clearInterval(timer)
        }
      }, 1000);
    },
    login(){
      this.$refs.loginForm.validate(async valid => {
        if(valid){
          let reqInfo = {
            email: this.form.email,
            captcha: this.form.captcha,
            emailcode: this.form.emailcode,
            passwd: md5(this.form.passwd)
          }
          let ret = await this.$http.post('/user/login', reqInfo)
          if(ret.code == 0){
              this.$router.push("/")
          }else{
            this.$message.error(ret.message)
          }
        }else{
          console.log("校验失败")
        }
      })
    }
  }
};
</script>

<style lang="stylus" scoped>

</style>