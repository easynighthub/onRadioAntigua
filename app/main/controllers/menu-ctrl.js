'use strict';
angular.module('main')
.controller('MenuCtrl', function (
  $log,
  $scope,
  $window,
  $state
) {

  $log.log('Hello from your Controller: MenuCtrl in module main:. This is your controller:', this);

  var self = this;

  self.siteUrl = 'http://femme.cl/';

  self.goSite = function () {
    $window.open(self.siteUrl, '_blank');
  };

  self.goStations = function () {
    $state.go('stations');
  };

  self.init = function () {
  };

  self.unbindHandler = $scope.$on('$ionicView.beforeEnter', function () {
    self.init();
  });

  $scope.$on('$destroy', function () {
    self.unbindHandler();
  });

  return self;

});
