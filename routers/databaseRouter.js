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
        res.send(data);
    }
    database.getSensorData('Eric', completion);
});

// receive data from sensor
router.post('/postdata/:key/:value', function (req, res) {
    var date = new Date();
    var time = date.getFullYear() + '.' + date.getMonth() +'.' + date.getmi;
    res.send('Successful - Data received from sensor:\n' + req.params.key + ': ' + req.params.value + '\n' + time);
});

module.exports = router;