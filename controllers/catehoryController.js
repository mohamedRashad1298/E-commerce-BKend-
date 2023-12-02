const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/ApiFeatures');
const factory = require('./handleFactory');
const Category = require('../models/categoryModel');

exports.creatCategory = factory.CreateOne(Category);
exports.getAllCategory= factory.getAll(Category);
exports.getACategory= factory.getOne(Category);
exports.updateCategory= factory.UpdateOne(Category);
exports.deleteCategory= factory.DeleteOne(Category);