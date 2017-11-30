'use strict';
angular.module('main')
.service('LoadingUiServ', function (
  $ionicLoading
) {

  var self = this;

  self.showLoadingStreaming = function (text) {
    $ionicLoading.show({
      template: text,
      showBackdrop: false
    });
  };

  self.hideLoadingStreaming = function () {
    $ionicLoading.hide();
  };

  return self;
});
