var express = require('express');
var router = express.Router();
const activePage = 'home';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/index', { title: 'Express' , activePage: activePage, currentUser: req.user });
});

module.exports = router;