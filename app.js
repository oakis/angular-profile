var express				= require('express');
var parser  		  = require('body-parser');
var router				= require('./src/api/index.js');
var morgan				= require('morgan');
var mongoose			= require('mongoose');
var cookieParser 	= require('cookie-parser');

var app = express();

var config 	= require('./config');
var port 	 = process.env.PORT || 3000;

// Connect to db
mongoose.connect(config.database);

app.use('/', express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api', router);

// Files
var index 		= './index.html',
		profile 	= './profile.html',
		register	= './register.html',
		login			= './login.html';

// File options
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

app.get('/profile/:username', function(req, res) {
    res.sendFile(profile,options);
});

app.listen(port, function() {
    console.log("The server is running on port "+port+"!");
});