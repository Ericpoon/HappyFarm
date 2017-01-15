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

app.directive('myngRadarChart', function ($window, $http) {
    function link(scope, element, attrs) {

        var max = {
            temperature: 25,
            humidity: 40,
            sunlight: 70,
            soilQuality: 100,
            acidity: 8
        };
        var min = {
            temperature: 13,
            humidity: 18,
            sunlight: 25,
            soilQuality: 72,
            acidity: 5
        };
        var optimal = {
            temperature: (max.temperature + min.temperature) / 2,
            humidity: (max.humidity + min.humidity) / 2,
            sunlight: (max.sunlight + min.sunlight) / 2,
            soilQuality: (max.soilQuality + min.soilQuality) / 2,
            acidity: (max.acidity + min.acidity) / 2
        };
        var minimalRequirement = {
            temperatureRatio: (max.temperature - optimal.temperature) / optimal.temperature,
            humidityRatio: (max.humidity - optimal.humidity) / optimal.humidity,
            sunlightRatio: (max.sunlight - optimal.sunlight) / optimal.sunlight,
            soilQualityRatio: (max.soilQuality - optimal.soilQuality) / optimal.soilQuality,
            acidityRatio: (max.acidity - optimal.acidity) / optimal.acidity
        };

        // get data
        var latestData = [];
        scope.$watch('data', function (newValue) {
            if (newValue !== undefined) {
                latestData = newValue[newValue.length - 1];
                makeChart(latestData, optimal, minimalRequirement);
            }
        });

        function makeChart(latestData, optimal) {
            // set up
            var cssWidth = $window.getComputedStyle(element[0].parentElement)['width'].replace('px', '');
            var margin = {top: 100, right: 100, bottom: 100, left: 100},
                width = Math.min(cssWidth, window.innerWidth - 10) - margin.left - margin.right,
                height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
            // data
            var data = [
                [// Minimal
                    // on top of Data
                    {
                        axis: "Temperature",
                        value: 1 - (max.temperature - optimal.temperature) / optimal.temperature
                    },
                    {
                        axis: "Humidity",
                        value: 1 - (max.humidity - optimal.humidity) / optimal.humidity
                    },
                    {
                        axis: "Sunlight",
                        value: 1 - (max.sunlight - optimal.sunlight) / optimal.sunlight
                    },
                    {
                        axis: "Soil",
                        value: 1 - (max.soilQuality - optimal.soilQuality) / optimal.soilQuality
                    },
                    {
                        axis: "Acidity",
                        value: 1 - (max.acidity - optimal.acidity) / optimal.acidity
                    }
                ],
                [// Data
                    {
                        axis: "Temperature",
                        value: 1 - Math.abs(latestData.temperature - optimal.temperature) / optimal.temperature
                    },
                    {
                        axis: "Humidity",
                        value: 1 - Math.abs(latestData.humidity - optimal.humidity) / optimal.humidity
                    },
                    {
                        axis: "Sunlight",
                        value: 1 - Math.abs(latestData.sunlight - optimal.sunlight) / optimal.sunlight
                    },
                    {
                        axis: "Soil",
                        value: 1 - Math.abs(latestData.soilQuality - optimal.soilQuality) / optimal.soilQuality
                    },
                    {
                        axis: "Acidity",
                        value: 1 - Math.abs(latestData.acidity - optimal.acidity) / optimal.acidity
                    }
                ]

            ];
            // draw the chart

            var color = d3.scale.ordinal()
                .range(["#dbdbdb", "#057aff"]); // minimal, data

            var radarChartOptions = {
                w: width,
                h: height,
                margin: margin,
                maxValue: 1,
                levels: 3,
                roundStrokes: false,
                color: color
            };
            //Call function to draw the Radar chart
            RadarChart("#radarChart", data, radarChartOptions, showDetailedChart);
            function showDetailedChart(index) {
                alert('We are going to present data ' + index + '.');
            }
        }
    }

    return {
        restrict: 'E',
        scope: {
            'data': '='
        },
        link: link
    }
});