var express = require('express');
const passport = require('../configuration/passport');
const User = require('../models/User');
const middleware = require('../middleware/auth');
var router = express.Router();

// GET register form
router.get('/register', (req, res) => {
  res.render('users/register', { title: 'Register' });
});

// User registration route
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User already exists. Please use a different email address or log in instead.');
      error.status = 400; // Set the status code to 400 (Bad Request)
      return next(error); // Pass the error to the universal handler
    }

    // Create the new user
    await User.create({ firstName, lastName, email, password });

    // Redirect to login page on successful registration
    res.redirect('/users/login');
  } catch (error) {
    // Pass server-related errors to the universal handler
    error.status = 500; // Set the status code to 500 (Internal Server Error)
    next(error);
  }
});

// GET login form
router.get('/login', (req, res) => {
  const message = req.flash('error'); // Fetch flash error message if exists
  res.render('users/login', { title: 'Login', message }); // Send the message to the view
});

// POST login form
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

router.get('/logout', function(req, res, next) {
  console.log('Test1');
  req.logout(function(err) {
    console.log('Test2');
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


module.exports = router;
