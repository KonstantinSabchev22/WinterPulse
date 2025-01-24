var express = require('express');
const passport = require('../configuration/passport');
const User = require('../models/User');
const middleware = require('../middleware/auth');
var router = express.Router();
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { generateActivationToken, sendActivationEmail } = require('../utils/emailUtils');

// Set the SendGrid API key from the .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// GET register form
router.get('/register', (req, res) => {
  res.render('users/register', { title: 'Register' });
});

// User registration route
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User already exists. Please use a different email address or log in instead.');
      error.status = 400;
      return next(error);
    }

    const activationToken = generateActivationToken();
    const newUser = await User.create({ firstName, lastName, email, password, activationToken });

    const activationLink = `${req.protocol}://${req.get('host')}/users/activate/${activationToken}`;
    await sendActivationEmail(email, firstName, activationLink);

    res.redirect('/users/login');
  } catch (error) {
    console.log(error);
    error.status = 500;
    next(error);
  }
});

router.get('/activate/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { activationToken: token } });
    if (!user) {
      const error = new Error('Invalid or expired activation token.');
      error.status = 400;
      return next(error);
    }

    user.isActivated = true;
    user.activationToken = null; // Clear the token after activation
    await user.save();

    res.render('users/activated', { title: 'Account Activated' });
  } catch (error) {
    error.status = 500;
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
