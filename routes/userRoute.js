const express = require('express');

const Route = express.Router();
const userController = require('../controllers/userController');
const AuthController = require('../controllers/authController');

Route.post('/signup', AuthController.signUp);
Route.post('/login', AuthController.logIn);

Route.post('/forgotpassword', AuthController.forgotPassword);
Route.patch('/resetpassword/:token', AuthController.resetPassword);
Route.patch('/update-password',AuthController.protect, AuthController.updatePassword);

Route.use(AuthController.protect);

Route.get('/getcart',userController.getUserCart);
Route.post('/apply-coupon',userController.Applycoupon);
Route.post('/cart', userController.userCart);
Route.get('/order/user-order',userController.getOrder);
Route.patch('/order/update-order/:id',userController.updateOrderStatus);
Route.post('/cart/cash-order', userController.createOrder);
Route.delete('/empty-cart', userController.emptyUserCart);

Route.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizePhoto,
  userController.updateMe,
);
Route.delete('/delete-me', userController.deleteMe);

Route.get('/me', userController.setMyId, userController.getMe);
// Route.post('/', userController.createUser);
Route.use(
  AuthController.protect,
  AuthController.restrictTo('admin', 'lead-guide'),
);

Route.get('/', userController.getAllUsers);
Route.get('/:id', userController.findUser);
Route.patch('/:id', userController.updateUser);
Route.delete('/:id', userController.deleteUser);

module.exports = Route;
