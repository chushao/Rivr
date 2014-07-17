//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();
var nswh = require('node-spotify-webhelper');
var spotify = new nswh.SpotifyWebHelper();


//route files to load
var index = require('./routes/index');

//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1);

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//routes
app.get('/', index.view);
//set environment ports and start application
app.set('port', process.env.PORT || 2014);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
app.get('/metadata', function(req, res) {
  spotify.getStatus(function (err, res) {
    if (err) {
        return console.error(err);
    }
    console.info('currently playing:', 
        res.track.artist_resource.name, '-',  
        res.track.track_resource.name);
    });
});


