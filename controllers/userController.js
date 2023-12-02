const multer = require('multer');
const sharp = require('sharp');
const uniqId = require('uniqid');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const handelFactory = require('./handleFactory');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/ordersModel');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(file)
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizePhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObject = (obj, ...fields) => {
  const newObjct = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newObjct[el] = obj[el];
  });
  return newObjct;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.body)
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this Route is not for update password go to restPassword route',
      ),
      400,
    );
  }
  const { id } = req.user;

  const filterbody = filterObject(req.body, 'name', 'email');
  if (req.file) filterbody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(id, filterbody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

// get All User
exports.getAllUsers = handelFactory.getAll(User);

// creat User
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    user,
  });
});

// find user
exports.findUser = handelFactory.getOne(User);
exports.updateUser = handelFactory.UpdateOne(User);
exports.deleteUser = handelFactory.DeleteOne(User);

exports.setMyId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getMe = handelFactory.getOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
  });
});

exports.userCart = catchAsync(async (req, res, next) => {
  const { cart } = req.body;
  const { _id } = req.user;
  let products = [];
  const user = await User.findById(_id);
  const alreadyExistCart = await Cart.findOne({ orderby: _id });
  if (alreadyExistCart) {
    delete alreadyExistCart;
  }
  for (let i = 0; i < cart.length; i++) {
    let object = {};
    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    let getPrice = await Product.findById(cart[i]._id).select('price').exec();
    object.price = getPrice.price;
    products.push(object);
  }
  let cartTotal = 0;

  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  const newCart = await Cart.create({
    products,
    cartTotal,
    orderby: user._id,
  });
  res.status(201).json({
    status: 'success',
    newCart,
  });
});

exports.getUserCart = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const userCart = await Cart.findOne({ orderby: _id });
  if (!userCart) {
    return next(new AppError('this user have cart yet 🤷‍♂️', 404));
  }
  res.status(200).json({
    status: 'success',
    data: userCart,
  });
});

// Empty Cart
exports.emptyUserCart = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const userCart = await Cart.findOneAndDelete({ orderby: _id });

  res.status(204).json({
    status: 'success',
    data: userCart,
  });
});

exports.Applycoupon = catchAsync(async (req, res, next) => {
  const { coupon } = req.body;
  const { _id } = req.user;

  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null || validCoupon.expiry < Date.now()) {
    return next(
      new AppError(`this coupon is not valid or has been expiried`, 401),
    );
  }
  const { cartTotal } = await Cart.findOne({ orderby: _id });
  const totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  const cartWithDiscount = await Cart.findOneAndUpdate(
    { orderby: _id },
    {
      totalAfterDiscount,
    },
    { new: true },
  );
  res.status(201).json({
    status: 'success',
    cartWithDiscount,
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  if (!COD) {
    return next(new AppError('create cash Order Fail', 401));
  }
  const userCart = await Cart.findOne({ orderby: _id });
  let finalAmount = 0;
  if (couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount;
  } else {
    finalAmount = userCart.cartTotal;
  }

  const newOrder = await Order.create({
    products: userCart.products,
    paymentIntent: {
      id: uniqId(),
      method: 'COD',
      amount: finalAmount,
      status: 'Cash on Delivery',
      created: Date.now(),
      currency: 'usd',
    },
    orderby: _id,
    orderStatus: 'Cash on Delivery',
  });
  const update = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });
  const updated = await Product.bulkWrite(update, {});
  res.status(201).json({
    status: 'success',
    updated,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const userOrders = await Order.findOne({ orderby: _id });
  if(userOrders === null){
    return next(new AppError('this User dose not have any order',400))
  }
  res.status(200).json({
    status: 'success',
    data: userOrders,
  });
});

 exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.status(200).json(updateOrderStatus);

});