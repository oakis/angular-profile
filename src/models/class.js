var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
    name: {
    	type: String,
    	unique: true,
    	required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    skills: {
        type: Array
    },
    link: {
        type: String
    }
});

module.exports = mongoose.model('Class', ClassSchema);