'use strict';
angular.module('main')
.controller('RadioCtrl', function (
  Config,
  $log,
  $http,
  $scope,
  $state,
  $rootScope,
  $stateParams,
  $interval,
  $ionicLoading,
  SocialSharingServ,
  StreamServ,
  LoadingUiServ,
  RadioServ
) {

  var self = this;

  var timer, message, link;

  self.radio = {};
  self.isPlaying = false;
  self.loading = false;
  self.isVolumeControl = false;
  self.track = 'Titulo';
  self.artist = 'ARTISTA';

  self.stream = angular.extend(this, {
    togglePlay: self.togglePlay,
    isPlaying: self.isPlaying,
    info: 'Offline',
    paused: false
  });

  self.loadRadio = function () {
    $ionicLoading.show();
    return RadioServ.getRadio($stateParams.code)
      .then(function (radio) {
        self.radio = radio;
      })
      .then(function () {
        StreamServ.init(self.radio.url);
      })
      .then(function () {
        self.stream.info = 'Señal Online';
        if (ionic.Platform.isIOS()) {
          self.isVolumeControl = true;
        }
      })
      .finally($ionicLoading.hide)
      .catch(function () {
        self.stream.info = 'Offline';
      });
  };

  self.togglePlay = function () {
    if (self.stream.isPlaying) {
      self.pauseRadio();
    } else {
      self.playRadio();
    }

    self.stream.isPlaying = self.isPlaying = !self.isPlaying;
  };

  self.playRadio = function () {
    StreamServ.init(self.radio.url);
    StreamServ.play(true);
    self.stream.paused = false;
    self.getStreamInfo();
    if (self.isVolumeControl) {
      StreamServ.setVolume(self.slider.volume);
    }
    timer = $interval(function () {
      self.getStreamInfo();
    }, 5000);
  };

  self.pauseRadio = function () {
    $ionicLoading.hide();
    $interval.cancel(timer);
    StreamServ.release();
    StreamServ.stop();
    self.stream.paused = true;
  };

  self.getStreamInfo = function () {
    return StreamServ.getStreamInfo(self.radio.url_metadata).then(function (info) {
      self.song = info;
      if (self.song.title) {
        var elem = document.createElement('textarea');
        elem.innerHTML = self.song.title;
        self.song.title = elem.value;

        var image, details = self.song.title.split('-'),
          track = details.length > 1 ? details[1] : '',
          artist = details.length > 1 ? details[0] : self.song.title;

        self.track = track;
        self.artist = artist;

        if (ionic.Platform.isIOS()) {
          image = self.song.coverUrl ? self.song.coverUrl : self.radio.icon_IOS_Background;
          window.NowPlaying.set({
            artwork: image,
            artist: artist,
            title: track
          });
        } else {
          image = self.song.coverUrl ? self.song.coverUrl : self.radio.icon;
          window.MusicControls.create({
            track: track,        // optional, default : ''
            artist: artist,                       // optional, default : ''
            cover: image,      // optional, default : nothing
            isPlaying: true,                         // optional, default : true
            dismissable: true,                         // optional, default : false

            // hide previous/next/close buttons:
            hasPrev: false,      // show previous button, optional, default: true
            hasNext: false,      // show next button, optional, default: true
            hasClose: true,       // show close button, optional, default: false

            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker: 'Now playing: ' + track
          }, function (success) {
            console.log('Now Playing...', success);

            function events (action) {
              switch (action) {
                case 'music-controls-next':
                  // Do something
                  break;
                case 'music-controls-previous':
                  // Do something
                  break;
                case 'music-controls-pause':
                  self.togglePlay();
                  window.MusicControls.updateIsPlaying(false);
                  break;
                case 'music-controls-play':
                  self.togglePlay();
                  window.MusicControls.updateIsPlaying(true);
                  break;
                case 'music-controls-destroy':
                  if (self.stream.isPlaying) {
                    self.togglePlay();
                  }
                  // Do something
                  break;
                // Headset events (Android only)
                case 'music-controls-media-button' :
                  // Do something
                  break;
                case 'music-controls-headset-unplugged':
                  // Do something
                  break;
                case 'music-controls-headset-plugged':
                  // Do something
                  break;
                default:
                  break;
              }
            }

            window.MusicControls.subscribe(events);
            window.MusicControls.listen();
          }, function (error) {
            console.log('Not Playing', error);
          });
        }
      }
    }, function () {
      self.song = null;
    });
  };

  //listen for the event
  if (ionic.Platform.isIOS()) {
    // Start listening to all the remote commands
    window.RemoteCommand.enabled('nextTrack', false);
    window.RemoteCommand.enabled('previousTrack', false);
    window.RemoteCommand.on('command', function (command) {
      switch (command) {
        case 'play' :
          self.togglePlay();
          break;
        case 'pause' :
          self.togglePlay();
          break;
      }
    });
  }

  self.setVolume = function () {
    self.volume = (self.slider.volume) / 100;
    StreamServ.setVolume(self.volume);
  };

  self.sharing = function () {
    if (ionic.Platform.isIOS()) {
      message = Config.ENV.IOS.MESSAGE;
      link = Config.ENV.IOS.LINK;
    } else {
      message = Config.ENV.ANDROID.MESSAGE;
      link = Config.ENV.ANDROID.LINK;
    }
    SocialSharingServ.shareAll(message, link);
  };

  self.requestSong = function () {
    SocialSharingServ.requestSong();
  };

  self.goBack = function () {
    StreamServ.stop();
    StreamServ.release();
    self.radio = {};
    self.song = null;
    $interval.cancel(timer);
    if (!ionic.Platform.isIOS()) {
      window.MusicControls.destroy();
    }
    $state.go('stations');
  };

  self.init = function () {
    self.loadRadio();
  };

  self.unbindHandler = $scope.$on('$ionicView.beforeEnter', function () {
    self.init();
  });

  $scope.$on('$destroy', function () {
    self.unbindHandler();
  });

  return self;
});
