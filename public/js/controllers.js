var spotifyApp = angular.module('spotifyApp', []);
spotifyApp.config(function($interpolateProvider) { $interpolateProvider.startSymbol('(('); $interpolateProvider.endSymbol('))'); });

spotifyApp.controller('SongListCtrl', function ($scope, $http) {
  //populate songs from ajax call, which gets triggered no whenever they search
  //need to use spotify api to grab from existing list of songs?
  //or just grab the json with an ajax call

  $scope.query = "chu";

  $scope.searchSongs = function(){
    $http({method: 'GET', url: 'http://ws.spotify.com/search/1/track.json?q=' + $scope.query}).
    success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
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
  }



});