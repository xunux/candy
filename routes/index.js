/**
*
* Global Dependencies
*
**/
var path = require('path');
var Theme = require('theme');
var moment = require('moment');
var current = require('express-current');
var installer = require('express-installer');

/**
*
* Local Dependencies
*
**/
var routers = {};
routers.home = require('./home');
routers.sign = require('./sign');
routers.media = require('./media');
routers.board = require('./board');
routers.thread = require('./thread');
routers.member = require('./member');
routers.admin = require('./admin');

var pkg = require('../package.json');
var home = path.resolve(__dirname, '../');

moment.lang('zh-cn', require('../libs/zh-cn'));

module.exports = function(app, models, ctrlers, middlewares, express) {

  var routes = {};
  var locals = {};

  // locals
  locals.sys = pkg;
  locals.moment = moment;
  locals.url = app.locals.url;
  locals.site = app.locals.site;

  // init themeloader
  var theme = new Theme(home, locals, locals.site.theme || 'flat');

  // init routes
  Object.keys(routers).forEach(function(route){
    routes[route] = routers[route]({
      ctrlers: ctrlers,
      theme: theme,
      locals: app.locals,
      express: express,
      middlewares: middlewares
    });
  });

  // middlewares
  app.all('*', middlewares.passport.sign());
  app.all('*', theme.local('user'));
  // BUG：需要统一一下 app.locals 与 theme.locals
  // 现在 installer module 导致 res.render 与 theme.render 获得的 locals 不一致。导致 error 页面的信息不同。
  // error 页面获得 的site 是数据库中的，但是theme.locals是初始化时配置文件中的。
  app.get('*', installer(app, models.config));
  app.get('*', current);

  // home
  app.use('/', routes.home);
  // signin && signout
  app.use('/sign', routes.sign);
  // board
  app.use('/board', routes.board);
  // thread
  app.use('/thread', routes.thread);
  // media
  app.use('/media', routes.media);
  // member
  app.use('/member', routes.member);
  // admin
  app.use('/admin', routes.admin);

};