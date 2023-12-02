const mongoose = require('mongoose');
const slugify = require('slugify');
const AppError = require('../utils/AppError')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: String,
    description: String,
    images: [
      {
        type: String,
        required: [true, 'the product must have images'],
      },
    ],
    price:{
type:Number,
requied:true,
min:1
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    discount:{
type:Number,
default:0,
min:0,
max:90
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    tags: String,
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },

  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

productSchema.index({ slug: 1 });
productSchema.index({ price: 1 });

productSchema.virtual('discountPrice').get(function() {
  return this.price * (100 - this.discount) /100 ;
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.post(/^find/, function (error, doc, next) {
  if (error) {
    next(new AppError(error.message, 404));
  } else {
    next();
  }
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;
