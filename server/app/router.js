'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app })
  router.post('/init', jwt, controller.home.index);
  //验证码
  router.get('/captcha', controller.utils.captcha);
  //邮箱验证码
  router.get('/sendCode', controller.utils.sendCode);
  //用户相关
  router.group({name:'user',prefix:'/user'},router => {
    const {register, login, verify} = controller.user
    router.post('/register', register)
    router.post('/login', login)
    router.post('/verify', verify)
  })
};
