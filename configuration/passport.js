const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Adjust the path based on your project structure
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, // Use email instead of username
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: 'Невалиден имейл или парола.' });
        }

        // Check if the account is activated
        if (!user.isActivated) {
          return done(null, false, { message: 'Вашият акаунт не е активиран.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Невалиден имейл или парола.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
