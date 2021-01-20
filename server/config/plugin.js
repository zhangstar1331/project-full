'use strict';
/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  swaggerdoc: {
    enable:true,
    package:'egg-swagger-doc-feat'
  },
  //mongo数据库连接
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  //路由分组
  routerGroup: {
    enable: true,
    package: 'egg-router-group'
  },
  //接口校验
  validate: {
    enable: true,
    package: 'egg-validate'
  }
}