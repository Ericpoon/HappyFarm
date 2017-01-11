var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config/config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.databse, function (err) {
        if (err) {
            console.log('database.js - Error occurred when trying to connect database - ' + err);
        } else {
            console.log('database.js - Database connected.')
        }
    }
);

var farmSchema = mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    location: String
});