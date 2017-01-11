var router = require('express').Router();
var path = require('path');

var __viewdir = path.resolve(__dirname + '/../views');


router.get('/', function(req, res) {
    res.sendFile(__viewdir + '/index.html');
});

module.exports = router;