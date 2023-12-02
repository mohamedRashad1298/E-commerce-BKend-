const express = require('express');
const authController = require('../controllers/authController');
const brandtController = require('../controllers/brandController');

const Route = express.Router();

Route.route('/')
  .get(brandtController.getAllBrand)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    brandtController.creatBrand,
  );

Route.route('/:id')
  .get(brandtController.getABrand)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    brandtController.updateBrand,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    brandtController.deleteBrand,
  );

module.exports = Route;
