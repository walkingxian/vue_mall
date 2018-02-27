var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Goods = require('../models/good');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/db_demo');

mongoose.connection.on("connected", function() {
    console.log("MongoDB conneted success.");
});

mongoose.connection.on('error', function() {
    console.log('MongoDB connected fail.');
});

mongoose.connection.on('disconnected', function() {
    console.log('MongoDB connected disconnected.');
});

//查询商品列表数据
router.get('/list', function(req, res, next) {
    let page = parseInt(req.param("page"));
    let pageSize = parseInt(req.param("pageSize"));
    let priceLevel = req.param('priceLevel');
    let priceGt = req.param('priceGt');
    let priceLte = req.param('priceLte');
    let sort = req.param("sort");
    let skip = (page-1) * pageSize;
    let params = {};
    if(priceLevel != 'all') {
        params = {
            salePrice:{
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }

    let goodsModel = Goods.find(params).sort({'salePrice': sort});
    goodsModel = goodsModel.skip(skip).limit(pageSize);
    goodsModel.exec(function(err, doc) {
        if(err) {
            res.json({
                status: '1',
                msg: err.message
            });
        }else {
            res.json({
                status:'0',
                msg:'',
                result:{
                    count: doc.length,
                    list:doc
                }
            })
        }
    })
});

//加入购物车
router.post("/addCart", function(req, res ,next) {
    let userId = req.session.userId;
    if (!userId) { //用户已登录
        res.json({
            status:"2",
            msg:"请先登录"
        });
    }
    let productId = req.body.productId;
    var User = require('../models/user');
    User.findOne({userId: userId},function(err, userDoc) {
        if(err) {
            res.json({
                'status':'1',
                'msg':err.message
            })
        }else {
            if(userDoc) {
                var goodsItem = '';
                //判断购物车中是否已有该商品
                userDoc.cartList.forEach(function(item) {
                    if(item.productId == productId) {
                        goodsItem = item;
                        item.productNum ++;
                    }
                });
                //购物车中有该商品时，直接增加数量
                if(goodsItem) {
                    userDoc.save(function(err2, doc2) {
                        if(err2) {
                            res.json({
                                status:"1",
                                msg:err2.message
                            })
                        }else {
                            let cartCount = 0;
                            res.json({
                                status:"0",
                                msg:"success",
                                result: doc2.cartList.length
                            })
                        }
                    })
                }else {
                    //没有该商品则在cartlist中增加一条
                    Goods.findOne({productId:productId},function(error,goodsDoc) {
                        if(err) {
                            res.json({
                                status:"1",
                                msg:error.message
                            });
                        }else {
                            if(goodsDoc){
                                goodsDoc.productNum = 1;
                                goodsDoc.checked = 1;
                                userDoc.cartList.push(goodsDoc);
                                userDoc.save(function(saveErr, newUserDoc) {
                                    if(saveErr) {
                                        res.json({
                                            status:"1",
                                            msg:saveErr.message
                                        });
                                    }else {
                                        res.json({
                                            status:"0",
                                            msg:"success",
                                            result: newUserDoc.cartList.length
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
})

router.all('/*',function(req,res) {
    res.json({
        status:"1",
        msg:"错误的访问"
    });
})

module.exports = router;