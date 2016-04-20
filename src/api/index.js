var express	= require('express');
var moment	= require('moment');
var User 		= require('../models/user');
var jwt    	= require('jsonwebtoken');
var config 	= require('../../config');

var router = express.Router();


router.post('/authenticate', function(req, res) {
  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, config.secret, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, message: 'Authentication success.', token: token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

router.post('/register', function(req,res){
	// check db for username
  User.findOne({ $or: [ { username: req.body.username },{ email: req.body.email } ] }, function(err, user) {
    if (err) throw err;
    if (!user) { // if user doesn't exist, register
    	User.create(req.body ,function(err){
    		if (err) {
    			throw err;
    		} else {
    			res.json({ success: true, message: 'Successfully created new user.' });
    		}
    	})
    } else if (user) { // if user already exists, abort
    	res.json({ success: false, message: 'Username or E-mail is already registered.'});
    }
  });
})

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.get('/users', function(req, res) {
  console.log(req.decoded);
  User.find({}, function(err, users) {
    res.json(users);
  });
});

router.get('/profile/:username', function(req,res,next){
	User.findOne({ username: req.params.username }, 'username firstname surename email class school city skills role' , function(err, data){
			if(err) {
				return console.error('Error: ' + err);
			} else {
				console.log(data);
				res.json(data);
			}
		});
})

module.exports = router;