'use strict';
angular.module('main')
.service('RadioServ', function (
  _,
  $q,
  $http
) {

  var self = this;

  self.getRadio = function (radioCode) {
    return self.getRadioData()
      .then(function (radios) {
        self.currentRadio = _.find(radios, ['code', radioCode]);
        return self.currentRadio;
      });
  };

  self.getRadioData = function () {
    var deferredRadio = $q.defer();
    $http.get('main/assets/data/radios.json')
      .then(function (result) {
        deferredRadio.resolve(result.data);
      })
      .then(function (error) {
        deferredRadio.reject(error);
      });

    return deferredRadio.promise;
  };

  return self;
});
