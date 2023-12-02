const factory = require('./handleFactory');
const Coupon = require('../models/couponModel');


exports.creatCoupon = factory.CreateOne(Coupon);
exports.getAllCoupon = factory.getAll(Coupon);
exports.getACoupon = factory.getOne(Coupon);
exports.updateCoupon = factory.UpdateOne(Coupon);
exports.deleteCoupon = factory.DeleteOne(Coupon);