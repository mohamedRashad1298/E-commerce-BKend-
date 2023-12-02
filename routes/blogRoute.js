const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const Route = express.Router();

Route.route('/')
  .get(blogController.getAllBlog)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    blogController.creatBlog,
  );

Route.route('/likes').post(authController.protect, blogController.likeBlog);
Route.route('/dislikes').post(
  authController.protect,
  blogController.disliketheBlog,
);

Route.route('/:id')
  .get(blogController.getABlog)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    blogController.uploadBlogsImages,
    blogController.resizeProdcutsImages,
    blogController.updateBlog,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    blogController.deleteBlog,
  );

module.exports = Route;
