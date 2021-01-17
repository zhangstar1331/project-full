<template>
  <div class="login-container">
    <el-form class="login-form" label-width="100px" :model="form">
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
          <el-button type="primary">发送邮件</el-button>
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
        <el-button type="primary">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  layout: "login",
  data() {
    return {
      form: {
        email: "",
        captcha: "",
        emailcode: "",
        passwd: ""
      },
      code:{
        captcha:'/api/captcha'
      }
    }
  },
  methods:{
    resetCaptcha(){
      this.code.captcha = '/api/captcha?_t'+new Date().getTime()
    }
  }
};
</script>

<style lang="stylus" scoped>
.login-container
  width 100%
  min-height 100%
  .login-form
    width 520px
    padding 160px 35px 0
    margin 0 auto
    overflow hidden
  .title-container
    text-align center
    margin-bottom 20px
    img
      width 200px
  .captcha-container
    width 340px 
    position relative
    .el-button
      width 90px
      padding 0
      line-height 40px
    .captcha
      position absolute
      right -110px
      img
        width 90px
        height 50px
        cursor pointer
</style>