const factory = require('./handleFactory');
const BCategory = require('../models/blogCatModel');

exports.creatBCategory = factory.CreateOne(BCategory);
exports.getAllBCategory = factory.getAll(BCategory);
exports.getABCategory = factory.getOne(BCategory);
exports.updateBCategory = factory.UpdateOne(BCategory);
exports.deleteBCategory = factory.DeleteOne(BCategory);
