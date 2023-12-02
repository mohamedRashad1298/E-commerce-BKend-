const express = require('express');
const authController = require('../controllers/authController');
const bCatController = require('../controllers/blogCatController');

const Route = express.Router();

Route.route('/')
  .get(bCatController.getAllBCategory)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    bCatController.creatBCategory,
  );

Route.route('/:id')
  .get(bCatController.getABCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    bCatController.updateBCategory,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bCatController.deleteBCategory,
  );

module.exports = Route;
