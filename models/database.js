var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config/config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, function (err) {
        if (err) {
            console.log('database.js - Error occurred when trying to connect database - ' + err);
        } else {
            console.log('database.js - Database connected.')
        }
    }
);

var userSchema = mongoose.Schema({
    name: {type: 'String', unique: true},
    age: 'Number',
    location: 'String',
    level: 'Number',
    plant: 'String',
    startDate: 'String'
});

var dataSchema = mongoose.Schema({
    user: 'String',
    temperature: 'Number',
    humidity: 'Number',
    time: 'Number' // 20170109135639
});

var behaviourSchema = mongoose.Schema({
    user: 'String',
    behaviour: 'String',
    amount: 'Number',
    time: 'Number' // 20170109135639
});

var User = mongoose.model('users', userSchema);
var Data = mongoose.model('data', dataSchema);
var Behaviour = mongoose.model('behaviours', behaviourSchema);

function initialize(needNewData) {
    console.log('database.js - Initializing database');
    if (needNewData) {
        User.find({'name': 'Eric'}, {}, function (err, docs) {
            if (docs.length == 0) {
                createNewUser();
            }
        });

        function createNewUser() {
            var newUser = new User({
                name: 'Eric',
                age: '20',
                location: 'Hong Kong',
                level: '1',
                plant: 'Tomato',
                startDate: '20170111221405'
            });
            newUser.save(function (err, product) {
                if (err) {
                    console.log('Error - Fail to add new user');
                }
            });
        }

        for (var i = 0; i < 20; i++) {
            var newData = new Data({
                user: 'Eric',
                temperature: Math.random() * 30,   // 0  - 30
                humidity: 20 + Math.random() * 70, // 20 - 90
                time: 20170109135639 + i * 10000
            });
            newData.save(function (err, product) {
                if (err) {
                    console.log('Error - Fail to add new data');
                }
            })
        }

    }
}

initialize(false);

// ************************************************ //


function getUserInfo(user, completion) {
    User.find({'name': user}, {}, function (err, docs) {
        completion(docs[0]);
    });
}
function getData(user, completion) {
    Data.find({'user': user}, {}, function (err, docs) {
        completion(docs);
    });
}

module.exports = {};