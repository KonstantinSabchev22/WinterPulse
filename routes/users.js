var express = require('express');
const passport = require('../configuration/passport');
const User = require('../models/User');
const middleware = require('../middleware/auth');
var router = express.Router();
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { generateActivationToken, sendPasswordResetEmail ,generateForgotPasswordToken, sendActivationEmail, emailOptions } = require('../utils/emailUtils');
const PasswordResetToken = require('../models/PasswordResetToken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');


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

    const activationLink = `${emailOptions.protocol}://${emailOptions.address}:${emailOptions.port}/users/activate/${activationToken}`;
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

// GET forgot password form
router.get('/forgot-password', (req, res) => {
  res.render('users/forgot-password', { title: 'Forgot Password' });
});

// POST forgot password form
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error('No user found with that email address.');
      error.status = 404;
      return next(error);
    }

    // Generate token and save it
    const token = generateForgotPasswordToken();
    const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour
    await PasswordResetToken.create({ userId: user.id, token, expiresAt });

    // Send reset email
    const resetLink = `${emailOptions.protocol}://${emailOptions.address}:${emailOptions.port}/users/reset-password/${token}`;
    await sendPasswordResetEmail(email, user.firstName, resetLink);

    res.render('users/forgot-password-success', { title: 'Check Your Email' });
  } catch (error) {
    console.error(error);
    error.status = 500;
    next(error);
  }
});

// GET reset password form
router.get('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const resetToken = await PasswordResetToken.findOne({ where: { token, expiresAt: { [Op.gt]: new Date() } } });

    if (!resetToken) {
      const error = new Error('Invalid or expired password reset token.');
      error.status = 400;
      return next(error);
    }

    res.render('users/reset-password', { title: 'Reset Password', token });
  } catch (error) {
    console.log(error);
    error.status = 500;
    next(error);
  }
});

// POST reset password form
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await PasswordResetToken.findOne({ where: { token, expiresAt: { [Op.gt]: new Date() } } });

    if (!resetToken) {
      const error = new Error('Invalid or expired password reset token.');
      error.status = 400;
      return next(error);
    }

    const user = await User.findByPk(resetToken.userId);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Remove used token
    await resetToken.destroy();

    res.render('users/reset-password-success', { title: 'Password Reset Successful' });
  } catch (error) {
    console.log(error);
    error.status = 500;
    next(error);
  }
});


router.get('/', async (req, res) => {
  const snowboards = await Snowboard.findAll(); // Fetch data
  res.render('users/index', { page: 'index', snowboards }); // Pass 'page' variable
});



module.exports = router;
