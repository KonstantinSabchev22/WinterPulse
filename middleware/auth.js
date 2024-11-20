const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/login');
  };
  
  const ensureRole = (role) => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      }
      res.status(403).send('Forbidden');
    };
  };
  
  module.exports = {
    ensureAuthenticated,
    ensureRole
  };