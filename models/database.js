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
    sunlight: 'Number',
    acidity: 'Number',
    soilQuality: 'Number',
    time: 'Number' // 20170109135639
});

var todoSchema = mongoose.Schema({
    user: 'String',
    text: 'String',
    time: 'Number'
});

// var plantSchema;

var User = mongoose.model('users', userSchema);
var Data = mongoose.model('data', dataSchema);
var Todo = mongoose.model('todo', todoSchema);

function initialize(needNewData) {
    console.log('database.js - Initializing database');
    if (needNewData) {
        User.find({'name': 'Eric'}, {}, function (err, docs) {
            if (docs.length == 0) {
                createNewUser();
            }
        });
        User.remove({}, function (err) {
            if (err) {
                console.log(err);
            }
        });
        function createNewUser() {
            var newUser = new User({
                name: 'Eric',
                age: '20',
                location: 'Hong Kong',
                level: '1',
                plant: 'Violet',
                startDate: Date.now() - 40 * 86400000
            });
            newUser.save(function (err, product) {
                if (err) {
                    console.log('Error - Fail to add new user');
                }
            });
        }

        Data.remove({}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Randomizing new data...');
            }
        });
        for (var i = 0; i < 100; i++) {
            var newData = new Data({
                user: 'Eric',
                temperature: 17 + Math.random() * 6,     // 17 - 23
                humidity: 40 + Math.random() * 40,        // 40 - 80
                sunlight: 10 + Math.random() * 50,        // 10  - 60
                acidity: 6 + Math.random() * 2,           // 6  - 8
                soilQuality: 35 + Math.random() * 20,      // 35  - 55 // water content
                time: Date.now() - (i + 2) * 86400000
            });
            newData.save(function (err, product) {
                if (err) {
                    console.log('Error - Fail to add new data');
                }
            })
        }
        // last data
        var newData = new Data({
            user: 'Eric',
            temperature: 19.28 + 2 * (Math.random() - 0.5),
            humidity: 50 + 3 * (Math.random() - 0.5),
            sunlight: 8.3 + 5 * (Math.random() - 0.5),
            acidity: 5.02 + 0.5 * (Math.random() - 0.5),
            soilQuality: 15.23 + 6 * (Math.random() - 0.5),
            time: Date.now() - 1 * 86400000 // yesterday
        });
        newData.save(function (err, product) {
            if (err) {
                console.log('Error - Fail to add new data');
            }
        })

    }
}

initialize(true);

// ************************************************ //


function getUserInfo(user, completion) {
    User.find({'name': user}, {}, function (err, docs) {
        completion(docs[0]);
    });
}
function getSensorData(user, completion) {
    Data.find({'user': user}, {}, {sort: {time: 1}}, function (err, docs) {
        if (docs.length > 30) {
            docs = docs.slice(docs.length - 30);
        }
        completion(docs);
    });
}

function saveNewData(user, data, completion) {
    var newData = new Data({
        user: user,
        temperature: data.temperature,
        humidity: data.humidity,
        sunlight: data.sunlight,
        acidity: data.acidity,
        soilQuality: data.soilQuality,
        time: Date.now()
    });
    newData.save(function (err, newDoc) {
        if (err) {
            console.log(err);
        } else {
            completion(newDoc);
        }
    });

}

function getLatestData(user, completion) {
    Data.find({'user': user}, {}, {sort: {time: 1}}, function (err, docs) {
        var lastDoc = docs[docs.length - 1];
        if (!lastDocID) {
            lastDocID = lastDoc._id;
            completion({_id: 'NULL'});
        } else if (!lastDocID.equals(lastDoc._id)) {
            lastDocID = lastDoc._id;
            completion(lastDoc);
            console.log('New data sending back to Frontend');
        } else {
            completion({_id: 'NULL'});
        }

        // completion({
        //     _id: a,
        //     user: 'Eric',
        //     temperature: Math.random() * 30,    // 0  - 30
        //     humidity: 20 + Math.random() * 70,  // 20 - 90
        //     sunlight: Math.random() * 100,      // 0  - 100
        //     acidity: 2 + Math.random() * 10,    // 2  - 12
        //     soilQuality: Math.random() * 100,    // 0  - 100
        //     time: a
        // });
        // a += 10000;
    });
}

function getTodoList(user, completion) {
    Todo.find({'user': user}, {}, {sort: {time: 1}}, function (err, docs) {
        if (!err) {
            completion(docs);
        } else {
            completion(null);
        }
    });

}

function addTodo(user, todo, completion) {
    var newTodo = new Todo({
        user: user,
        text: todo,
        time: Date.now()
    });
    newTodo.save(function (err, newDoc) {
        if (err) {
            console.log('database.js - Fail to add new todo - ' + err);
        } else {
            completion(newDoc);
        }
    });
}

function removeTodo(id, completion) {
    console.log("database.js - Removing todo by id: " + id);
    Todo.remove({'_id': id}, function (err, docs) {
        if (!err) {
            console.log('database.js - Successfully removed a todo.');
        } else {
            console.log(err);
            completion(err);
        }
    });
}

function reset() {
    initialize(true);
}

var lastDocID = null;

// var a = 20170110135639 + 10000;

module.exports = {
    'getUserInfo': getUserInfo,
    'getSensorData': getSensorData,
    'getLatestData': getLatestData,
    'saveNewData': saveNewData,
    'getTodoList': getTodoList,
    'addTodo': addTodo,
    'removeTodo': removeTodo,
    'reset': reset
};

// water 2 -3 , 70

// temp 20
// humidity 50 - 60

// light 10 - 20 // larger range

// ph 6- 8 // rand
