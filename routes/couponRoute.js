const express = require('express');
const couponController = require('../controllers/couponController');
const authController = require('../controllers/authController')

const Route = express.Router();

Route.route('/')
  .get(couponController.getAllCoupon)
  .post(authController.protect,authController.restrictTo('admin'),couponController.creatCoupon);

Route.route('/:id')
  .get(couponController.getACoupon)
  .patch(authController.protect,authController.restrictTo('admin'),couponController.updateCoupon)
  .delete(authController.protect,authController.restrictTo('admin'),couponController.deleteCoupon);

module.exports = Route;