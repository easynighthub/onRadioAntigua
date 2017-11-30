'use strict';
angular.module('main')
.service('StreamServ', function (
  LoadingUiServ,
  $http
) {

  var self = this;

  var contentRegex = /<body>(.*)<\/body>/;
  var itunesSearchUrl = 'https://itunes.apple.com/search?term=';
  var resolutionRegex = /100x100/;

  self.media;
  self.state = {
    playing: false,
    volume: 100,
    isRadio: false,
    url: null
  };

  var stream = {
    success: function (success) {
      console.log('playAudio():Audio Success', success);
    },
    error: function (err) {
      console.log('playAudio():Audio Error: ', err.code);
    },
    status: function (status) {
      self.mediaStatusCallback(status);
    }
  };

  self.init = function (path) {
    if (ionic.Platform.isIOS()) {
      self.initIOS(path);
    } else {
      self.initAndroid(path);
    }
  };

  self.initIOS = function (path) {
    if (path) {
      self.state.url = path;
      self.media = new window.Media(path, stream.success, stream.error, stream.status);
    } else {
      self.media = new window.Media(self.state.url, stream.success, stream.error, stream.status);
    }
  };

  self.initAndroid = function (path) {
    if (path) {
      self.state.url = path;
      self.media = new window.Mediaac(path, stream.success, stream.error, stream.status);
    } else {
      self.media = new window.Mediaac(self.state.url, stream.success, stream.error, stream.status);
    }
  };

  self.play = function (isRadio) {
    if (self.media) {
      self.media.play({ playAudioWhenScreenIsLocked: true });
      self.state.playing = true;
      self.state.isRadio = isRadio;
    }
  };

  self.release = function () {
    if (self.media) {
      self.media.release();
    }
  };

  self.stop = function () {
    if (self.media) {
      self.media.stop();
    }
  };

  self.pause = function () {
    self.state.playing = false;
    if (self.media) {
      self.media.pause();
    }
  };

  self.setVolume = function (volume) {
    if (self.media) {
      self.media.setVolume(volume);
    }
  };

  self.mediaStatusCallback = function (status) {
    if (status === (window.Media.MEDIA_STARTING || window.Mediaac.MEDIA_STARTING)) {
      //$scope.state.status = "Loading audio...";
      console.log('starting');
      LoadingUiServ.showLoadingStreaming('Cargando...');
      self.loading = true;
    }
    if (status === (window.Media.MEDIA_RUNNING || window.Mediaac.MEDIA_RUNNING)) {
      //$scope.state.status = "Playing...";
      console.log('running');
      LoadingUiServ.hideLoadingStreaming();
      self.loading = false;
    }
    else if (status === (window.Media.MEDIA_STOPPED || window.Mediaac.MEDIA_STOPPED)) {
      //$scope.state.status = "Stopped.";
      console.log('stopped');
      self.loading = false;
    }
  };

  self.getCover = function (title) {
    return $http.get(itunesSearchUrl + title).then(function (response) {
      var item = response.data.results[0];
      if (!item || !item.artworkUrl100) {
        return null;
      }
      return item.artworkUrl100.replace(resolutionRegex, '500x500');
    });
  };

  self.parseShoutcastResponse = function (html) {
    var content = html.match(contentRegex)[1];
    var parts = content.split(',');
    if (parts.length < 7 || !parts[6]) {
      return null;
    }
    return parts[6];
  };

  self.getStreamInfo = function (metadataUrl) {
    return $http.get(metadataUrl + '/7.html').then(function (response) {
      var title = self.parseShoutcastResponse(response.data);
      if (!title) {
        return {};
      }
      return self.getCover(title).then(function (coverUrl) {
        return {
          title: title,
          coverUrl: coverUrl
        };
      });
    });
  };

  return self;
});
