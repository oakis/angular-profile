var uuid = require('node-uuid');

module.exports = {

    'secret': uuid.v4(), // Generate random secret
    'database': 'mongodb://localhost/projekt_webbramverk' // Link to DB

};