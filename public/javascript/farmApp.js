var app = angular.module('farmApp', []);

app.controller('farmController', function ($scope, $http) {

    $scope.showWelcome = true;

    function initialize() {
        $http.get('/db/getuserinfo').then(function (res) {
            $scope.userInfo = res.data;
        });
        $http.get('/db/getsensordata').then(function (res) {
            $scope.sensorData = res.data;
        })
    }

    initialize();
    
    $scope.show = function () {
        $scope.showWelcome = false;
    };

    $scope.show();

});