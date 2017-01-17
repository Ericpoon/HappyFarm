var Cleverbot = require("cleverbot.io");
var bot = new Cleverbot("sNg5XdRx3NMzRqKj", "8n1ek1ZixKmzIZx4QAe3eL6kUPBVXv6J");

function respond(user, input, completion) {
    bot.setNick(user);
    bot.create(function (err, session) {

    });
    bot.ask(input, function (err, response) {
        completion(response);
    });

}

module.exports = {'respond': respond};