/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path')
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610770035715_2863';

  //获取formData数据
  config.multipart = {
    mode: 'file',
    whitelist: () => true
  }

  //文件存储目录
  config.UPLOAD_DIR = path.resolve(__dirname,'..','app/public')

  //接口规范
  config.swaggerdoc = {
    dirScanner: './app/controller',
    apiInfo: {
      title: 'XX项目接口',
      description: 'XX项目接口 swagger-ui for egg',
      version: '1.0.0'
    },
    schemes: ['http','https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    enableSecurity: false,
    routerMap: true,
    enable: true
  }

  //mongoDB数据库连接
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/project-full',
    options: {}
  }

  //token秘钥配置
  config.jwt = {
    secret: 'DFS$-S34A-@ASD',
    enable: true,
    // match: /^\/api/
  }

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  //解决post请求csrf问题
  config.security = {
    csrf: {
      enable: false
    }
  }

  return {
    ...config,
    ...userConfig,
  };
};
