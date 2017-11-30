'use strict';
angular.module('main')
.service('SocialSharingServ', function (
  $cordovaSocialSharing,
  $q
) {

  var self = this;

  self.shareAll = function (message, link) {
    var deferred = $q.defer();
    $cordovaSocialSharing.share(message, null, null, link) // Share via native share sheet
      .then(function (result) {
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  self.requestSong = function () {
    var deferred = $q.defer();
    window.plugins.socialsharing.shareViaWhatsAppToReceiver('+56991650553', 'Message via WhatsApp', null, null)
      .then(function (result) {
        deferred.resolve(result);
      }, function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  return self;
});
