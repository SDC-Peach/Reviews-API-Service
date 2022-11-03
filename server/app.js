var express = require('express');
var db = require('./db');

// Router
//var router = require('./routes.js');

var app = express();
module.exports.app = app;

// Set what we are listening on.
app.set('port', 1234);

// Logging and parsing
app.use(express.json());

// Set up our routes
app.get('/', (request, response) => {
  response.send('Reviews API')
})

// Serve the client files
//app.use(express.static(__dirname + '/../client'));

// If we are being run directly, run the server.
if (!module.parent) {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
}

