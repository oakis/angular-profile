var mongoose = require('mongoose');

var profileSchema = new mongoose.Schema({
	username: String,
	firstname: String,
	surename: String,
	class: String,
	school: String,
	city: String,
	skills: Array
});

var profile = mongoose.model('users', profileSchema);

module.exports = profile;