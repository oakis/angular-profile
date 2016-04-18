var express = require('express');
var moment = require('moment');
var profile = require('../models/profile.js');

var router = express.Router();

router.all('*', function(req,res,next){
	console.log('zup');
	next();
});

router.get('/profile/:username', function(req,res,next){
	console.log(req.params.username);
	profile.find({ username: [req.params.username] }, function(err, data){
			if(err) {
				return console.error('Error: ' + err);
			} else {
				console.log(data);
				res.json(data);
			}
		});
})

module.exports = router;