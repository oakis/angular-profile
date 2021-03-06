var express	= require('express');
var User 		= require('../models/user');
var jwt    	= require('jsonwebtoken');
var config 	= require('../../config');
var fileUpload = require('express-fileupload');

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
          if (user.role == 'needAccept') {
            res.json({ success: false, message: 'An administrator must activate your account.' });
          } else {
            res.json({ success: true, message: 'Authentication success.', token: token, role: user.role, loggedIn: true, userLogin: user.username });
          }
        } else {
          res.json({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

router.post('/register', function(req,res){
  // check if all fields are filled in
  if (req.body.username!=undefined || req.body.password!=undefined || req.body.email!=undefined) {
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
  } else {
    res.json({ success: false, message: 'All fields with a <span class="required">*</span> must be filled in.' });
  }
})

// Check if logged in
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        next();
        console.log('Logged in, running next()')
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

// ###################### //
// ### LOGGED IN USER ### //
// ###################### //

// Logout
router.post('/logout', function (req, res) {
  if (req.headers['x-access-token']) {
      return res.status(200).json({
          message: "User has been successfully logged out."
      });
  } else {
      return res.json({ message: "You are already logged out."});
  }
})

// Show user profile
router.get('/profile/:username', function(req,res,next){
  User.findOne({ username: req.params.username }, 'username firstname surename email class school city skills role', function(err, user){
      if(err) {
        return console.error('Error: ' + err);
      } else {
        res.json({ user: user });
      }
  });
})

// Get users class mates
router.get('/class/:class', function(req,res,next){
  User.find({ class: req.params.class }, 'username', function(err, users){
      if(err) {
        return console.error('Error: ' + err);
      } else {
        res.json({ classmates: users });
      }
  });
})

// Aggregate skills
router.get('/skill/:skill', function(req,res,next) {
  User.aggregate(
    {"$match": { skills: req.params.skill } },
    { $project: { 'username': 1, '_id': 0, 'hej': 1  } },
    function(err, sumUsers){
      if(err) {
        return console.error('Error: ' + err);
      } else {
        res.json({ sum: sumUsers });
      }
  });
})


// Upload profile picture
router.use(fileUpload());
router.post('/images', function(req, res) {
    var img;

    if (!req.files) {
        res.json({ message: 'No files were uploaded.' });
        return;
    }

    img = req.files.file;
    img.mv('./public/images/'+req.body.username+'.jpg', function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.json({ message: 'File uploaded!' });
        }
    });
});

// ###################### //
// ###  ADMIN  STUFF  ### //
// ###################### //

// Check if admin
router.use(function(req, res, next) {
  var role = req.headers['role'];

  if (role == 'admin') {
    next(); // allow access to admin-pages
  } else {
    res.json({ success: false, message: 'You need to be an administrator to access this page.' });
  }

});

// GET all users
router.get('/users', function(req, res, next) {
  User.find({}, 'username firstname surename email class school city skills role', function(err, users) {
    res.json(users);
  });
});

// Save user
router.put('/users/:username', function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (user) {
      User.update(
        { username: req.params.username },
        { $set: {
            email: req.body.email,
            firstname: req.body.firstname,
            surename: req.body.surename,
            class: req.body.class,
            school: req.body.school,
            city: req.body.city,
            skills: req.body.skills,
            role: req.body.role
          }
        }, function (err, updated) {
          if (err) {
            res.json({ success: false, message: 'E-mail is already in use.' });
            console.log(err);
          } else {
            res.json({ success: true, message: 'Successfully updated user with username: '+req.params.username })
          }
      });
    } else {
      res.json({ success: false, message: 'No such user with username: '+req.params.username });
    };
  });
})

router.get('/users/:search', function(req, res, next) {
  User.find({ username: new RegExp('^['+req.params.search+']', "i") }, function(err, users) {
    res.json(users);
  });
})

router.post('/users/:search', function(req, res, next) {
  User.find({ username: new RegExp('^'+req.params.search+'$', "i") }, function(err, users) {
    res.json(users);
  });
})

// Delete user
router.delete('/users/:id', function(req, res, next) {
  User.remove({ _id: req.params.id }, function (err, user) {
    if (err) return err;
    else res.json({ success: true, message: 'User with id '+req.params.id+' was successfully removed.'});
  });
})

// GET all posts
router.get('/posts', function(req, res, next){
  Posts.find({}, function(err, posts) {
    res.json(posts);
  });
})

module.exports = router;