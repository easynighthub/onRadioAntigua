'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'ionic.cloud'
])

.constant('_', window._)

.config(function () {
  var body = angular.element(document.getElementsByTagName('body'));

  var ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/FBAN|FBAV/gi.test(ua)) {
    body.addClass('platform-facebook');
  }

  var windowHeight = window.innerHeight;
  if (windowHeight <= 480) {
    // iPhone 4
    body.addClass('platform-iphone-4');
  } else if (windowHeight <= 568) {
    // iPhone 5
    body.addClass('platform-iphone-5');
  } else {
    // iPhone 6
    body.addClass('platform-iphone-6');
  }
})


.config(function ($ionicCloudProvider) {
  $ionicCloudProvider.init({
    core: {
      'app_id': '22b977bb'
    }
  });
})

.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/stations');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('stations', {
      url: '/stations',
      templateUrl: 'main/templates/stations.html',
      controller: 'StationsCtrl as ctrl'
    })
    .state('radio', {
      url: '/stations/:code/',
      templateUrl: 'main/templates/radio.html',
      controller: 'RadioCtrl as ctrl'
    });
})
.run(function ($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function () {

    $ionicPlatform.registerBackButtonAction(function () {
      $ionicPopup.confirm({
        template: '¿Estas seguro de querer salir de la aplicación?',
        buttons: [
        { text: 'No' },
          {
            text: '<b>Si</b>',
            type: 'button-assertive',
            onTap: function () {
              if (window.MusicControls) {
                window.MusicControls.destroy(function (success) {
                  console.log(success);
                }, function (error) {
                  console.log(error);
                });
              }
              navigator.app.exitApp();
            }
          }, ]
      });
    }, 101);
  });
});
