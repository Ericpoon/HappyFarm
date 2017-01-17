var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config/config.js');
var mainRouter = require('./routers/mainRouter');
var databaseRouter = require('./routers/databaseRouter');
var chatRouter = require('./routers/chatbotRouter');

var app = express();

app.use('/public', express.static(__dirname + '/public')); // to allow access to static files which are in public folder
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));
app.use(bodyParser.json({limit: '5mb'}));
app.use('/', mainRouter);
app.use('/db', databaseRouter);
app.use('/chat', chatRouter);

// start listening
app.listen(config.port, function (err) {
    if (err) {
        console.error('server.js - Error occurred when trying to listen to port #' + config.port);

    } else {
        console.log('server.js - Listening to port #' + config.port);
    }
});
