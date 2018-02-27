var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    "userId":String,
    "userName":String,
    "nickName":String,
    "userPwd":String,
    "orderList":Array,
    "cartList":[
        {
            'productId':String,
            'productName':String,
            'salePrice':Number,
            'discount':{type: Number, default: 0},   //默认无优惠
            'shipping':{type: Number, default: 0},   //默认包邮
            'tax':{type: Number,default: 0},         //默认不交税
            'productImage':String,
            'checked':{type: Number,default: 1},     //默认选中
            'productNum':{type: Number,default: 1},  //购买产品数量默认1个
            
        }
    ],
    "addressList":[
        {
            'addressId':String,
            'userName':String,
            'stressName':String,
            'postCode':Number,
            'tel':Number,
            'isDefault':Boolean
        }
    ]
})

module.exports = mongoose.model('User',userSchema,'users');