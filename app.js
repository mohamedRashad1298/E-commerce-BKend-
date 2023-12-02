const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Package
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
const cors = require('cors');
// Routes import
const userRoute = require('./routes/userRoute');
const categRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/porductRoute');
const globalHandeler = require('./controllers/errorController');
const blogRoute = require('./routes/blogRoute');
const bCatRoute = require('./routes/bCatRoute');
const brandRoute = require('./routes/brandRoute');
const couponRoute = require('./routes/couponRoute');
const AppError = require('./utils/AppError');

app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whiteList: ['price'],
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimiter({
  max: 2000,
  windowMs: 3600 * 1000,
  message: 'too many request from this IP ,please try again in an hour',
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));

// Routes API
app.use('/api/v1/users', userRoute);
app.use('/api/v1/categories', categRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/blogs', blogRoute);
app.use('/api/v1/blogCategory', bCatRoute);
app.use('/api/v1/brand', brandRoute);
app.use('/api/v1/coupon', couponRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalHandeler);

module.exports = app;
