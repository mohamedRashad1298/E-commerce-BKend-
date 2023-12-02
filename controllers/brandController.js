const factory = require('./handleFactory');
const Brand = require('../models/brandModel');


exports.creatBrand = factory.CreateOne(Brand);
exports.getAllBrand = factory.getAll(Brand);
exports.getABrand = factory.getOne(Brand);
exports.updateBrand = factory.UpdateOne(Brand);
exports.deleteBrand = factory.DeleteOne(Brand);