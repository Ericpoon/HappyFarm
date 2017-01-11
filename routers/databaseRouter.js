var router = require('express').Router();
var path = require('path');
var __modeldir = path.resolve(__dirname + '/../models');
var database = require(__modeldir + '/database.js');

// 127.0.0.1/db/test
router.get('/test', function (req, res) {
    console.log('Client connecting to database');
    res.send('Database connected.');
});

router.get('/getuserinfo', function (req, res) {
    function completion(data) {
        res.send(data)
    }

    database.getUserInfo('Eric', completion);
});

router.get('/getsensordata', function (req, res) {
    function completion(data) {
        var simplified = [];
        for (var i = 0; i < data.length; i++) {
            simplified[i] = {
                'temperature': data[i].temperature,
                'humidity': data[i].humidity,
                'time': data[i].time
            }
        }

        res.send(simplified);
    }

    database.getSensorData('Eric', completion);
});


module.exports = router;