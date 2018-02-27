var express = require('express');
var router = express.Router();
require('../util/util');
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//检查是否已登录
router.post('/checkLogin',function(req, res, next) {
  let userId = req.session.userId;
  if(req.session.userId) {  //已登录
    User.findOne({userId:userId},function(err,doc) {
      if(err) {
        res.json({
          status:"1",
          msg:"未找到该用户:" +err.message
        });
      }
      if(doc) {
        res.json({
          status:"0",
          msg:"已登录",
          result:doc
        })
      }
    })
  }else {  //未登录
    res.json({
      status: "1",
      msg: "未登录"
    });
  }
})

//登录
router.post('/login', function(req,res,next) {
  var param = {
    userName: req.body.userName,
    userPwd:req.body.userPwd
  }
  User.findOne(param,function(err,doc) {
    if(err) {
      res.json({
        status:'1',
        msg:err.message
      });
    }else {
      if(doc) {
        req.session.userId = doc.userId;
        res.json({
          status:'0',
          msg:'',
          result: doc
        })
      }else {
        res.json({
          status: '1',
          msg: '账号或密码错误'
        })
      }
    }
  })
});

//登出
router.post('/logout', function(req,res,next) {
  req.session.destroy(function (err) {
    if(err) {
      res.json({
        status:"1",
        msg:"登出失败："+ err.message
      })
    }else {
      res.json({
        status: "0",
        msg: "登出成功"
      })
    }
  })
});

//获取用户购物车数据
router.get('/cartList', function(req, res, next) {
  let userId = req.session.userId;
  User.findOne({userId:userId}, function(err, doc) {
    if(err) {
      res.json({
        status:"1",
        msg:"未找到该用户",
        result:""
      })
    }else {
      if(doc) {
        res.json({
          status: "0",
          msg: "",
          result: doc.cartList
        })
      }
    }
  })
});

//购物车删除
router.post('/cart/del', function(req,res,next) {
  let userId = req.session.userId;
  let productId = req.body.productId;
  //通过update $pull匹配条件删除
  User.update({userId:userId},{$pull:{cartList:{productId:productId}}},function(err,doc) {
    if(err) {
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      if(doc) {
        res.json({
          status:"0",
          msg:"success"
        })
      }
    }
  })
});

//修改商品数量
router.post('/cartEdit', function(req, res, next) {
  let userId = req.session.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({'userId':userId,'cartList.productId':productId},{
    'cartList.$.productNum':productNum,
    'cartList.$.checked': checked
  },function(err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      })
    } else {
      if (doc) {
        res.json({
          status: "0",
          msg: "success"
        })
      }
    }
  })
})

//全选
router.post('/editCheckAll',function(req, res, next) {
  let userId = req.session.userId,
      checkAll = req.body.checkAll?1:0;
  User.findOne({userId:userId}, function(err,user) {
    if(err) {
      res.json({
        status:'1',
        msg:err.message
      })
    }else {
      if(user) {
        user.cartList.forEach(item=>{
          item.checked = checkAll;
        });

        user.save(function(saveErr,newUser) {
          if(saveErr) {
            res.json({
              status:"1",
              msg:saveErr.message
            });
          }else {
            if(newUser) {
              res.json({
                status:"0",
                msg:"success",
              })
            }
          }
        })
      }
    }
  })

})

//获取用户收货地址列表
router.get('/addressList', function(req, res, next) {
  let userId = req.session.userId;
  User.findOne({userId:userId},function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json({
        status:"0",
        msg:"success",
        result:doc.addressList
      })
    }
  })
})

//设置默认地址
router.post('/setDefault', function(req, res, next) {
  let userId = req.session.userId,
    addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1',
      msg: '地址不得为空'
    });
    return;
  }
  User.findOne({userId:userId},function(err,doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      var addressList = doc.addressList;
      addressList.forEach(item=>{
        if(item.addressId == addressId) {
          item.isDefault = true;
        }else {
          item.isDefault = false;
        }
      })

      doc.save(function(saveErr, newDoc) {
        if (err) {
          res.json({
            status: '1',
            msg: err.message
          });
        } else {
          res.json({
            status: '0',
            msg: 'success'
          });
        }
      })
    }
  })
})

//删除地址
router.post("/delAddress", function (req, res, next) {
  let userId = req.session.userId, 
      addressId = req.body.addressId;
  User.update({
    userId: userId
  },{
    $pull:{
      addressList:{
        addressId:addressId
      }
    }
  },function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      res.json({
        status: '0',
        msg: 'success'
      });
    }
  });
})

//生成订单
router.post('/payMent', function(req, res, next) {
  let userId = req.session.userId;
  let orderTotal = 0; //这个从数据库获取，不能从前端传，危险
  let addressId = req.body.addressId; //这个可以直接传过来
  let address = null;
  let goodsList = [];
  //let orderTotal = req.body.orderTotal; //传值很危险，可能被用户串改
  User.findOne({ userId: userId }, function (err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: "获取支付金额失败"
      })
    } else {
      if (doc) {
        //获取订单金额，和购买的商品
        doc.cartList.forEach(item=>{
          if(item.checked == 1) {
            goodsList.push(item);
            orderTotal += (parseFloat(item.salePrice) + item.shipping + item.tax - item.discount) * item.productNum;
          }
        });

        if (!addressId || typeof addressId !== 'string') {
          res.json({
            status: '0',
            msg: '收货地址错误'
          });
          return;
        }

        //获取发货地址
        doc.addressList.every(item=>{
          if(addressId == item.addressId) {
            address = item;
            return false;
          }
          return true;
        });

        if (!address) {
          res.json({
            status: '0',
            msg: '收货地址不存在'
          });
          return;
        }

        //支付平台
        let platform = "622"

        //1-9随机数
        let r1 = Math.floor(Math.random() * 10);
        let r2 = Math.floor(Math.random() * 10);

        let sysDate  = new Date().Format('yyyyMMddhhmmss');
        let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
        //订单号
        let orderId = platform + r1 + sysDate + r2;

        //生成订单对象
        let order = {
          orderId: orderId,
          orderTotal: orderTotal,
          addressInfo: address,
          goodsList: goodsList,
          orderStatus: 1,
          createDate: createDate
        }
        //插入订单信息
        doc.orderList.push(order);
        doc.save((saveErr,newDoc)=>{
          if (err) {
            res.json({
              status: '1',
              msg: err.message
            });
          } else {
            res.json({
              status: '0',
              msg: 'success',
              result:order
            });
          }
        })
      }
    }
  })
});

//根据订单id查询订单信息
router.get('/orderDetail', function(req, res, next) {
  let userId = req.session.userId,
      orderId = req.param("orderId"),
      orderTotal;
  User.findOne({userId:userId},function(err, user) {
    if(err) {
      res.json({
        status:"1",
        msg:err.message
      });
    }else {
      if (user && user.orderList.length>0) {
        user.orderList.forEach(item=>{
          if(item.orderId === orderId) {
            orderTotal = item.orderTotal;
          }
        });

        res.json({
          status:0,
          msg:'success',
          result:{
            orderId:orderId,
            orderTotal:orderTotal
          }
        })
      }else {
        res.json({
          status:'1',
          msg:'无此订单'
        })
      }
    }
  })
})

module.exports = router;
