const multer = require("multer");
const sharp = require("sharp");
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('no an image uploaded ,please aupload only images', 400),
      false,
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadProductImages = upload.array('images',10)

exports.resizeProdcutsImages = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.map(async (el, i) => {
      const fileName = `product-${req.params.id}-${Date.now()}-${i + 1}.jpg`;
      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg()
        .toFile(`public/img/products/${fileName}`);
      req.body.images.push(fileName);
    }),
  );
  next();
}

exports.creatProduct = factory.CreateOne(Product);
exports.getAllProduct = factory.getAll(Product);
exports.getAProduct = factory.getOne(Product);
exports.updateProduct = factory.UpdateOne(Product);
exports.deleteProduct = factory.DeleteOne(Product);




exports.addToWishList = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;
  const user = await User.findById(userId);
  const addedToWishList = user.wishlist.find(
    (id) => id.toString() === productId.toString(),
  );
  if (addedToWishList) {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: productId },
      },
      {
        new: true,
      },
    );
    res.status(201).json({
      status: 'success',
      data: updateUser,
    });
  } else {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { wishlist: productId },
      },
      {
        new: true,
      },
    );
    res.status(201).json({
      status: 'success',
      data: updateUser,
    });
  }
});

exports.rating = catchAsync(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  const product = await Product.findById(prodId);
  let alreadyRated = product.ratings.find(
    (userId) => userId.postedby.toString() === _id.toString(),
  );
  if (alreadyRated) {
    const updateRating = await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRated },
      },
      {
        $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
      },
      {
        new: true,
      },
    );
  } else {
    const rateProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        $push: {
          ratings: {
            star: star,
            comment: comment,
            postedby: _id,
          },
        },
      },
      {
        new: true,
      },
    );
  }
  const getallratings = await Product.findById(prodId);
  let totalRating = getallratings.ratings.length;
  let ratingsum = getallratings.ratings
    .map((item) => item.star)
    .reduce((prev, curr) => prev + curr, 0);
  let actualRating = Math.round(ratingsum / totalRating);
  let finalproduct = await Product.findByIdAndUpdate(
    prodId,
    {
      totalrating: actualRating,
    },
    { new: true },
  );
  res.json(finalproduct);
});

// exports.uploadImages = catchAsync(async (req, res, next) => {

// });
