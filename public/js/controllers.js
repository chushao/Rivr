var spotifyApp = angular.module('spotifyApp', []);
spotifyApp.config(function($interpolateProvider) { $interpolateProvider.startSymbol('(('); $interpolateProvider.endSymbol('))'); });

spotifyApp.controller('SongListCtrl', function ($scope, $http, $timeout) {
  //populate songs from ajax call, which gets triggered no whenever they search
  //need to use spotify api to grab from existing list of songs?
  //or just grab the json with an ajax call

  $scope.query = "Summer";
  $scope.skipCounter = 1;
  $scope.added = 0;
  $scope.skip = false;

  $scope.songName = "Not playing";
  $scope.songDuration = "N/A";
  $scope.songArtist = "N/A";
  $scope.songAlbum = "N/A";

    (function tick() {
        $http.get('/metadata').success(function (data) {

            //console.log(data);
            $scope.data = data;

            $scope.songName = data.name;
            $scope.songDuration = data.duration;
            $scope.songArtist = data.artist;
            $scope.songAlbum = data.album;
            $timeout(tick, 15000);
        });
        $http.get('/artwork').success(function (data) {
            //console.log(data);
            document.getElementById("albumCover").src="/artwork";
            //$scope.artwork = data;
        });

        $http.get('/getNextSong').success(function (data) {
            console.log(data);
            if (data == ""){
            $scope.upcomingSongs = [
        {
            "name": "Eyes FAKE",
            "artist": " Kaskade Mindy Gledhill"
        },
        {
            "name": "Clarity",
            "artist": " Zedd Foxes"
        },
        {
            "name": "Make It Wit Chu - Edit Version",
            "artist": " Queens Of The Stone Age"
        },
        {
            "name": "English Love Affair",
            "artist": " 5 Seconds Of Summer"
        },
        {
            "name": "End Up Here",
            "artist": " 5 Seconds Of Summer"
        },
        {
            "name": "Sweet Disposition",
            "artist": " The Temper Trap"
        },
        {
            "name": "Summer - R3hab & Ummet Ozcan Remix",
            "artist": " Calvin Harris"
        },
        {
            "name": "Summer",
            "artist": " Calvin Harris"
        }
        ];
      } else{
            $scope.upcomingSongs = data;
            }
        });
    })();

  $scope.searchSongs = function(){
    $http({method: 'GET', url: 'http://ws.spotify.com/search/1/track.json?q=' + $scope.query}).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
      //  

      $scope.songs = data.tracks;
      $scope.artists = data.tracks.artists;
      // console.log("tracks: " + data.tracks);
      // console.log("track href: " + data.tracks[0].href);
      // console.log("artists: " + data.tracks.artists);
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      console.log("error retrieving data from Spotify");
    });
  }

  $scope.selectSong = function(trackId){
    console.log("track ID recieved: " + trackId);
    var trackData = {"id": trackId};
    // $http({
    //     method: 'POST',
    //     url: '/sendTrack',
    //     data: trackId,
    //     headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    // });
    // 
    // 
    $http({method: 'POST',
            url: '/sendTrack',
            data: trackData,
            headers: {'contentType': 'application/json'}
        }).success(function() {
            $scope.sucess = "Success";

        }).error(function() {
            $scope.errorMessage = "Failure";
        });
    $scope.added = 1;
    $scope.query = "";
    $scope.songs = [];
    $scope.artists = [];
  }

  $scope.skipSong = function(){
    console.log("skipping song");
    if (($scope.skipCounter % 5) == 0) {
        console.log("HIT");
        $scope.skipCounter = 1;
    } else {
      $scope.skipCounter++;
    }
    var socket = io();
    socket.emit('skip');
    $scope.skip = true;
  }

  $scope.playSong = function(){
    console.log("playing or muting song");
    var audioElm = document.getElementById('audioPlayer'); audioElm.muted = !audioElm.muted;
  }
});