var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var sessionParser  =require('express-session');
var MongoStore = require("connect-mongo")(sessionParser);
var bodyParser = require('body-parser');
var ejs = require('ejs');

var index = require('./routes/index');
var users = require('./routes/users');
var goods = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionParser({   //session控制
  secret: 'lijunxian',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({
    url: 'mongodb://localhost:27017/store_session'
  }),
  name:"userInfo",
  cookie:{
    maxAge:2*60*60*1000
  }
}))
app.use(express.static(path.join(__dirname, 'public')));


//判断用户是否访问了需要登录的页面
app.use(function(req,res,next) {
  if(req.session.userId) {
    //已经登录了
    next();
  }else if (req.path == "/" || req.path == "/users/checkLogin"  || req.path == '/users/login' || req.path == '/users/logout' || req.path == '/goods/list'){
    //访问的非必须登录的页面
    next();
  } else if (req.path == "/favicon.ico"){
    res.end();
  }else{
    //访问了需要登录的页面
     res.json({
      status:"2",
      msg:"您尚未登录，无法执行此操作"
    });
  }
})

app.use('/', index);
app.use('/users', users);
app.use('/goods', goods);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
