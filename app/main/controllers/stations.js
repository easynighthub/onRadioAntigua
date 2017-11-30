'use strict';
angular.module('main')
.controller('StationsCtrl', function (
  Config,
  $log,
  $scope,
  $state,
  $ionicLoading,
  $ionicPopup,
  RadioServ
) {
  $log.log('Hello from your Controller: StationsCtrl in module main:. This is your controller:', this);

  var self = this;

  self.main = {
    icon: Config.ENV.APP_ICON,
    background: Config.ENV.APP_BACKGROUND
  };

  self.loadStations = function () {
    $ionicLoading.show();
    return RadioServ.getRadioData()
      .then(function (station) {
        self.stations = station;
      })
      .finally($ionicLoading.hide);
  };

  self.navigate = function (radio) {
    if (radio.enabled) {
      $state.go('radio', { code: radio.code });
    } else {
      $ionicPopup.alert({
        title: '¡Muy Pronto Radio 8090 estará disponible para tí!',
        template: '<img class="height-20vh" src="main/assets/images/app/icon-8090.png" />',
        cssClass: 'alertRadioUnavailable'
      });
    }
  };

  self.init = function () {
    self.loadStations();
  };

  self.unbindHandler = $scope.$on('$ionicView.beforeEnter', function () {
    self.init();
  });

  $scope.$on('$destroy', function () {
    self.unbindHandler();
  });

  return self;
});
