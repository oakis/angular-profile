var express	= require('express');
var parser = require('body-parser');
var router = require('./src/api/index.js');
var morgan = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');

var app = express();

var config = require('./config');
var port = process.env.PORT || 3000;

// Connect to db
mongoose.connect(config.database);

app.use('/', express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api', router);

// HTML-files
var index 		= './index.html',
	profile 	= './profile.html',
	register	= './register.html',
	login		= './login.html',
    logout      = './logout.html',
	admin		= './admin.html',
	adminPosts  = './admin.posts.html',
	adminUsers  = './admin.users.html';

// HTML-files options
var options 	= { root: './public' };

app.get('/', function(req, res) {
    res.sendFile(index,options);
});

app.get('/register', function(req, res) {
    res.sendFile(register,options);
});

app.get('/login', function(req, res) {
    res.sendFile(login,options);
});

app.get('/logout', function(req, res) {
    res.sendFile(logout,options);
});

app.get('/profile/:username', function(req, res) {
    res.sendFile(profile,options);
});

app.get('/admin', function(req, res) {
    res.sendFile(admin,options);
});

app.get('/admin/users', function(req, res) {
    res.sendFile(adminUsers,options);
});

app.get('/admin/posts', function(req, res) {
    res.sendFile(adminPosts,options);
});

app.listen(port, function() {
    console.log("The server is running on port "+port+"!");
});