const multer = require("multer");
const sharp = require("sharp");
const factory = require('./handleFactory');
const Blog = require('../models/blogModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');



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
exports.uploadBlogsImages = upload.array('images',10)

exports.resizeProdcutsImages = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];
  await Promise.all(
    req.files.map(async (el, i) => {
      const fileName = `blog-${req.params.id}-${Date.now()}-${i + 1}.jpg`;
      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg()
        .toFile(`public/img/blogs/${fileName}`);
      req.body.images.push(fileName);
    }),
  );
  next();
}


exports.creatBlog = factory.CreateOne(Blog);
exports.getAllBlog = factory.getAll(Blog);
exports.getABlog = factory.getOne(Blog);
exports.updateBlog = factory.UpdateOne(Blog);
exports.deleteBlog = factory.DeleteOne(Blog);


exports.likeBlog = catchAsync(async (req, res, next) => {
  const { blogId } = req.body;
  const blog = await Blog.findById(blogId);
  const loginUserId = req.user._id;
  const isLiked = blog.isLiked;

  const alreadyLiked = blog.likes.find(
   (userId) => userId.toString() === loginUserId.toString(),
 );

 if(alreadyLiked ){
  return next(new AppError(`this user already liked`))
 }

  const alreadyDisliked = blog.dislikes.find(
   (userId) => userId.toString() === loginUserId.toString()
 )
 if (alreadyDisliked) {
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $pull: { dislikes: loginUserId },
      isDisliked: false,
    },
    { new: true }
  );
  res.status(200).json(blog);
}
if (isLiked) {
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $pull: { likes: loginUserId },
      isLiked: false,
    },
    { new: true }
  );
  res.status(200).json(blog);
} else {
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $push: { likes: loginUserId },
      isLiked: true,
    },
    { new: true }
  );
  res.status(200).json(blog);
}
});

exports.disliketheBlog = catchAsync(async (req, res,next) => {
  const { blogId } = req.body;
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req.user._id;

  const alreadyDisliked = blog.dislikes.find(
   (userId) => userId.toString() === loginUserId.toString()
 )

 if(alreadyDisliked ){
  return next(new AppError(`this user already disliked`))
 }

  // find if the user has liked the blog
  const isDisLiked = blog.isDisliked;
  // find if the user has disliked the blog
  const alreadyLiked = blog.likes.find(
    (userId) => userId.toString() === loginUserId.toString(),
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true },
    );
    res.status(200).json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true },
    );
    res.status(200).json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true },
    );
    res.status(200).json(blog);
  }
});


