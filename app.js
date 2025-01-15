var createError = require('http-errors');
var express = require('express');
var path = require('path');
const sequelize = require('./database/database');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
const models = require('./models');
const passport = require('./configuration/passport');
const flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var snowboardsRouter = require('./routes/snowboards');
var cartRouter = require('./routes/cart');
var adminIndexRouter = require('./routes/admin/index');
var adminSnowboardsRouter = require('./routes/admin/snowboards');
var adminOrderManagementRouter = require('./routes/admin/orderManagement');
var adminProfileRouter = require('./routes/admin/adminProfile');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// Ensure you have pug installed instead of jade, as it has been renamed
app.set('view engine', 'pug'); // Use 'pug' instead of 'jade'

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/fontawesome/css', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')));
app.use('/fontawesome/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts')));

// Session middleware
app.use(session({
  secret: 'h4@d%e<.9J0l!?.jkL30#gW2%oq!sA32)Vd*P5eW#q', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Flash middleware
app.use(flash());

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make `user` available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Sync models with the database
sequelize.sync({ alter: true }) // This will alter the tables to match the models
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to synchronize models:', err);
  });

// Define routes after session and flash middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/snowboards', snowboardsRouter);
app.use('/cart', cartRouter);
app.use('/admin/index', adminIndexRouter);
app.use('/admin/snowboards', adminSnowboardsRouter);
app.use('/admin/orders', adminOrderManagementRouter);
app.use('/admin/profile', adminProfileRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Universal error handler for all 4xx and 5xx series errors
app.use(function (err, req, res, next) {
  const statusCode = err.status || 500;

  // Detect if you're in development mode
  const isDevelopment = req.app.get('env') === 'development';

  // Set user-friendly error messages based on status code
  const statusMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Page Not Found',
    500: 'Internal Server Error',
  };

  const statusText = statusMessages[statusCode] || 'An Error Occurred';

  // Render the universal error page with stack trace in development mode
  res.status(statusCode).render('error', {
    title: 'Error Page',
    message: statusCode === 500 ? 'Internal Server Error' : err.message,  // Friendly message
    status: statusCode,
    showStack: isDevelopment ? err.stack : null,  // Show stack trace in development only
  });
});

module.exports = app;