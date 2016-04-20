var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs")

var UserSchema = new Schema({
    username: {
    	type: String,
    	unique: true,
    	required: true
    }, 
    email: {
    	type: String,
    	required: true,
        unique: true
    },
    role: {
    	type: String,
    	enum: ['student','admin','company','sponsor','teacher','needAccept'], // set available account types
    	default: 'needAccept' // default to needAccept
    },
    firstname: String,
    surename: String,
    class: String,
    school: String,
    city: String,
    skills: Array,
    password: String
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);