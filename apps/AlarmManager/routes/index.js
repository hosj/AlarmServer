var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  models.House.find().then(function(house) {
    if ( house == undefined ){
      res.redirect('new');
    }else{
      res.render('index', { title: house.name });
    }
  })
});

module.exports = router;
