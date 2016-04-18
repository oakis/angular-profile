var express = require('express');
var parser = require('body-parser');
var router = require('./api');
var morgan = require('morgan');

var app = express();

var index = './index.html';
var profil = './profile.html';
var admin = './admin.html';
var options = {
	root: './public'
};

// Load database
require('./db');

app.use('/', express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/api', router);

app.get('/', function (req, res, next) {
	res.sendFile(index, options);
});

app.get('/profile/:username', function (req, res, next) {
	res.sendFile(profil, options);
});

app.get('/admin', function (req, res, next) {
	res.sendFile(admin, options);
});

app.listen(3000, function() {
    console.log("The server is running on port 3000!");
});