var models  = require('../models');
var express = require('express');
var router = express.Router();


// models
var House     = require('../models/house');

/* GET home page. */
router.get('/', function(req, res, next) {
  House.findOne(function(err, house) {
    if (err)
      res.send(err);
    title = (house) ? house.name:'Logo'
    res.render('sensor', { title: title });

  });
});

module.exports = router;
