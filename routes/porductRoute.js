const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const uploadMiddleWare = require('../middlewares/uploadImageMiddleware')

const Route = express.Router();
Route.route('/wishlist').post(
  authController.protect,
  productController.addToWishList,
  );
Route.route('/rating').post(authController.protect, productController.rating);

Route.route('/')
  .get(productController.getAllProduct)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    productController.creatProduct,
  );

Route.route('/:id')
  .get(productController.getAProduct)
  .patch(
    authController.protect,
  authController.restrictTo('admin'),
productController.uploadProductImages,
  productController.resizeProdcutsImages,
  productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct,
  );

module.exports = Route;
