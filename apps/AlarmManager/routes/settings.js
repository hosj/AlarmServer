var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  models.House.find().then(function(house) {
    title = (house) ? house.name:'Logo'
    res.render('settings', { title: title });

  });
});

module.exports = router;
