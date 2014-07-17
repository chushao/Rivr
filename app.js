//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var fs = require('fs');
var app = express();
var spotify = require('spotify-node-applescript');


//route files to load
var index = require('./routes/index');

//global variable, don't judge
var skipButton = 0;

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

//Return metadata
app.get('/metadata', function(req, res) {
  spotify.getTrack(function (err, track) {
    if (err) {
        return console.error(err);
    }
        console.log(track);
        res.json(track);
    });
});

//Return image artwork
app.get('/artwork', function(req, res) {
    spotify.getArtwork(function(err, artwork) {
            if (err) {
                return console.error(err);
            }
            fs.readFile(artwork, function(error, data) {
                if (error) {
                    throw error;
                }
                res.writeHead(200, {'Content-Type': 'image/jpeg' });
                res.end(data);
            });
    });
});

//Skip button
app.get('/skip', function(req, res) {
    skipButton++;
    console.log(skipButton);
    if ((skipButton % 5) == 0) {
        console.log("HIT");
        skipButton = 0;
        spotify.next(function(err) { 
            if (err) {
                console.log(err);
            }
        });
    }
    res.redirect('/');
});

//move files to node directory
function copyFile(source, target, callback) {
    var cbCalled = false;
    var read = fs.createReadStream(source);
    read.on("error", function(err) {
            done(err);
            });
    var write = fs.createWriteStream(target);
    write.on("error", function(err) {
            done(err);
            })
    read.pipe(write);
    //sets error message
    function done(err) {
        if (!cbCalled) {
            callback(err);
            cbCalled = true;
        }
    }
}

