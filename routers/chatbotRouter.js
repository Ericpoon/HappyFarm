var router = require('express').Router();
var path = require('path');
var __modeldir = path.resolve(__dirname + '/../models');
var bot = require(__modeldir + '/cleverbot.js');

// 127.0.0.1/chat/test
router.get('/test', function (req, res) {
    res.send('Cleverbot connected.');
});

router.get('/:user/:input', function (req, res) {
    function completion(data) {
        res.send(data);
    }

    bot.respond(req.params.user, req.params.input, completion);
});

module.exports = router;