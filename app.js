//dependencies for each module used
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var handlebars = require('express3-handlebars');
var fs = require('fs');
var spotify = require('spotify-node-applescript');
var SpotifyWebApi = require('spotify-web-api-node');
var io = require('socket.io')(http);


var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;
var dotenv = require('dotenv');
dotenv.load();

//route files to load
var index = require('./routes/index');

//global variable, don't judge
var skipButton = 0;
var gbaccesstoken = "";

//passport, spotify login
//serialize and deserialize (for persistent sessions)
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne( { id: id }, function (err, user) {
        done(err, user);
    });
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFYCLIENTID,
    clientSecret: process.env.SPOTIFYCLIENTSECRET,
    redirectUri : 'http://10.16.189.76:2014'
});

spotifyApi.setAccessToken(process.env.SPOTIFYACCESSTOKEN);
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFYCLIENTID,
    clientSecret: process.env.SPOTIFYCLIENTSECRET,
    callbackURL: "http://10.16.189.76:2014/auth/spotify/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            gbaccesstoken = accessToken;
            console.log(gbaccesstoken);
            //spotifyApi.setAccessToken(accessToken);
            return done(null, profile);
        });
    }));


//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(passport.initialize());
app.use(express.session({ secret: 'feed me' }));
app.use(passport.session());
//testing main view
app.get('/main', index.main);
//login feature
app.get('/login', index.view);
//routes
app.get('/', index.view);
//set environment ports and start application
app.set('port', process.env.PORT || 2014);
http.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

app.get('/auth/spotify',
    passport.authenticate('spotify', {scope: ['playlist-modify', 'user-read-private', 'user-read-email', 'playlist-modify-private']}),
    function(req, res) {
        //YOU SHOULD NEVER GET HERE
        console.log("What the fuck?");
    });

app.get('/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get ('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
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

app.post('/sendTrack', function(req, res) {
    console.log("track id is: " + req.body.id);
    var playlistPath =  '/v1/users/1235132793/playlists/0ImTPrxa2wyQ0OFTsievA3/tracks?uris=' + req.body.id;
    console.log(playlistPath);
    spotifyApi.addTracksToPlaylist('1235132793', '0ImTPrxa2wyQ0OFTsievA3', [req.body.id])
        .then(function(data) {
            console.log(data);
        }, function(err) {
            console.log( "ERR: ", err);
    });
/**    var options = {
        host: 'api.spotify.com',
        port: 80,
        path: playlistPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            '
    };

    var req = http.request(options, function(res) {
        console.log **/
});

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  console.log("user connected");
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('skip', function (data) {
    // we tell the client to execute 'new message'

    skipButton++;
    console.log(skipButton + "--------------");
    if ((skipButton % 5) == 0) {
        console.log("HIT");
        skipButton = 0;
        spotify.next(function(err) { 
            if (err) {
                console.log(err);
            }
        });
    }
    //res.redirect('/');
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

