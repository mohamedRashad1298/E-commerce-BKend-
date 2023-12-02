const express = require('express');
const categController = require('../controllers/catehoryController');
const authController = require('../controllers/authController')

const Route = express.Router();

Route.route('/')
  .get(categController.getAllCategory)
  .post(authController.protect,authController.restrictTo('admin'),categController.creatCategory);

Route.route('/:id')
  .get(categController.getACategory)
  .patch(authController.protect,authController.restrictTo('admin'),categController.updateCategory)
  .delete(authController.protect,authController.restrictTo('admin'),categController.deleteCategory);

module.exports = Route;
