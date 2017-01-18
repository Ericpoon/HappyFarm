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

router.get('/getlatestdata', function (req, res) {
    function completion(data) {
        res.send(data);
    }

    database.getLatestData('Eric', completion);
});

router.get('/gettodolist', function (req, res) {
    function completion(data) {
        res.send(data);
    }

    database.getTodoList('Eric', completion);
});

// receive data from sensor
router.post('/postdata/:temperature/:humidity/:sunlight/:soilQuality/:acidity', function (req, res) {
    database.saveNewData('Eric', req.params, function (newData) {
        res.send(newData);
    });
});
router.post('/addtodo/:todo', function (req, res) {
    function completion(data) {
        res.send(data);
    }

    database.addTodo('Eric', req.params.todo, completion);
});

router.delete('/removetodo/:id', function (req, res) {
    function completion(data) {
        res.send(data);
    }

    database.removeTodo(req.params.id, completion);
});
module.exports = router;