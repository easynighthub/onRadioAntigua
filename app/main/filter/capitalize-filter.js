/*eslint no-extra-boolean-cast: "error"*/
'use strict';
angular.module('main')
.filter('capitalize', function () {
  return function (str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
});
