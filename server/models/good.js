var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    'productId':String,
    'prodcutName':String,
    'salePrice':Number,
    'discount': { type: Number, default: 0 },   //默认无优惠
    'shipping': { type: Number, default: 0 },   //默认包邮
    'tax': { type: Number, default: 0 },         //默认不交税
    'productImage': String,
    'checked': { type: Number, default: 1 },
    'productNum': { type: Number, default: 1 }
});

module.exports = mongoose.model('Good',productSchema);