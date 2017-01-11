var app = angular.module('farmApp', []);

app.controller('farmController', function ($scope, $http) {
    function initialize() {
        $http.get('/db/getuserinfo').then(function (res) {
            $scope.userInfo = res.data;
        });
        $http.get('/db/getsensordata').then(function (res) {
            $scope.sensorData = res.data;
        })
    }

    initialize();

});