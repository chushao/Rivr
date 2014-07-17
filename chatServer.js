module.exports = function(server) {
  var io = require('socket.io').listen(server);
  
  io.on('connection', function(socket){
    console.log('a user connected');
  });
};
