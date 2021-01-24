'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app })
  router.post('/init', jwt, controller.home.index);
  //文件上传
  router.post('/uploadFile', controller.utils.uploadFile);
  //切片整合
  router.post('/mergeFile', controller.utils.mergeFile);
  //判断切片是否已存在
  router.post('/checkFile', controller.utils.checkFile);
  //验证码
  router.get('/captcha', controller.utils.captcha);
  //邮箱验证码
  router.get('/sendCode', controller.utils.sendCode);
  //用户相关
  router.group({ name: 'user', prefix: '/user' }, router => {
    const { register, login, verify, detail, isfollow, follow, cancelFollow, likeArticle, cancelLikeArticle, articleStatus } = controller.user
    router.post('/register', register)
    router.post('/login', login)
    router.post('/verify', verify)
    router.get('/detail', jwt, detail)
    //文章关注
    router.get('/follow/:id', jwt, isfollow)
    router.put('/follow/:id', jwt, follow)
    router.delete('/follow/:id', jwt, cancelFollow)
    //文章点赞
    router.put('/likeArticle/:id', jwt, likeArticle)
    router.delete('/likeArticle/:id', jwt, cancelLikeArticle)
    router.get('/article/:id', jwt, articleStatus)
  })
  //文章相关
  router.group({ name: 'article', prefix: '/article' }, router => {
    const { create, index, detail } = controller.article
    router.get('/', index)
    router.get('/:id', detail)
    router.post('/create', jwt, create)
  })
};
