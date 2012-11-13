
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io');

var grid    = [],
    dimSize = 30;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    locals: {
      title: 'Welcome to the Grid',
      dimSize: dimSize
    }
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(8080);
  console.log("Express server listening on port %d", app.address().port)
}

// Init grid.
var initGrid = function() {
  for (var i=0; i<dimSize; ++i) {
    grid[i] = [];
    for (var j=0; j<dimSize; ++j) {
      grid[i][j] = 0;
    }
  }
};

initGrid();

io = io.listen(app);

io.on('connection', function(client) {
  client.send({ grid: grid });

  client.on('message', function(message) {
    if ('type' in message) {
      switch (message.type) {
        case 'toggle':
          var x = message.x,
              y = message.y;

          if (grid[x][y]) { grid[x][y] = 0; }
          else { grid[x][y] = 1; }

          break;
        case 'toggleOn':
          grid[message.x][message.y] = 1;
          break;
        case 'clear':
          initGrid();
          break;
      }
      client.broadcast(message);
    }
  });

  client.on('disconnect', function(message) { });

});
