var app = angular.module('farmApp', []);

app.controller('farmController', function ($scope, $http, $rootScope, $document) {
    $rootScope.keyCount = 0;
    $document.bind('keypress', function (event) {
        // console.log(event.keyCode);
        if ($rootScope.keyCount == 0) {
            if (event.keyCode == '27') { // esc
                $rootScope.keyCount++;
                console.log('keyc: ' + $rootScope.keyCount);
            } else {
                $rootScope.keyCount = 0;
            }
            return;
        }
        if ($rootScope.keyCount == 1) {
            if (event.keyCode == '27') { // esc
                $rootScope.keyCount++;
                console.log('keyc: ' + $rootScope.keyCount);
            } else {
                $rootScope.keyCount = 0;
            }
            return;
        }
        if ($rootScope.keyCount == 2) {
            if (event.keyCode == '27') { // esc
                $rootScope.keyCount++;
                console.log('keyc: ' + $rootScope.keyCount);
                $rootScope.keyCount = 0; // reset
                var temp = $rootScope.sensorData[$rootScope.sensorData.length - 1].temperature;
                var humidity = $rootScope.sensorData[$rootScope.sensorData.length - 1].humidity;
                var sun = $rootScope.sensorData[$rootScope.sensorData.length - 1].sunlight;
                var soil = 70;
                var acidity = $rootScope.sensorData[$rootScope.sensorData.length - 1].acidity;
                setTimeout(function () {
                    $http.post('/db/postdata/' + temp + '/' + humidity + '/' + sun + '/' + soil + '/' + acidity);
                }, 5000);
                return;
            } else {
                $rootScope.keyCount = 0;
            }
            return;
        }
    });

    function initialize() {
        $rootScope.viewToShow = 'welcome';
        $rootScope.chatMessages = [];
        $rootScope.currentChartIndex = 0; // by default, show temperature
        // temp 20
        // water 2 -3 , 70
        // humidity 50 - 60
        // light 10 - 20 // larger range
        // ph 6- 8 // rand

        //     temperature: 17 + Math.random() * 6,     // 17 - 23
        //     humidity: 40 + Math.random() * 40,        // 40 - 80
        //     sunlight: 10 + Math.random() * 50,        // 10  - 60
        //     acidity: 6 + Math.random() * 2,           // 6  - 8
        //     soilQuality: 5 + Math.random() * 30,      // 5  - 35 // water content

        $rootScope.max = {
            temperature: 27.4,
            humidity: 75,
            sunlight: 40,
            soilQuality: 90,
            acidity: 8.1
        };
        $rootScope.min = {
            temperature: 16.7,
            humidity: 35,
            sunlight: 10,
            soilQuality: 30,
            acidity: 6.1
        };
        $http.get('/db/getuserinfo').then(function (res) {
            $scope.userInfo = res.data;
            $rootScope.userInfo = $scope.userInfo;
        });
        $http.get('/db/getsensordata').then(function (res) {
            $scope.sensorData = res.data;
            $rootScope.sensorData = $scope.sensorData;
            startNotificationLoop();
        });
    }

    function startNotificationLoop() {
        setInterval(function () {
            $http.get('/db/getlatestdata').then(function (res) {
                if (res.data._id != 'NULL') {
                    // update chart
                    var temp = $scope.sensorData;
                    temp.push(res.data);
                    var updatedSensorData = temp.slice(1);
                    $scope.sensorData = updatedSensorData;
                    $rootScope.sensorData = updatedSensorData;
                    //
                    $rootScope.currentCondition = 'New update!';
                    var elem = angular.element(document.getElementById('notificationText'));
                    elem.removeClass('hideNotification');
                    elem.addClass('showNotification');
                    setTimeout(function () {
                        elem.removeClass('showNotification');
                        elem.addClass('hideNotification');
                    }, 3000);
                }
            });
        }, 100);
    }

    initialize();

    $scope.enter = function () {
        $http.get('/db/reset').then(function (res) {
            setTimeout(function () {
                $rootScope.viewToShow = 'data';
            }, 400);
        });
    };

    $scope.showData = function () {
        $rootScope.viewToShow = 'data';
    };

    $scope.showChat = function () {
        $rootScope.viewToShow = 'chatbot';
        $scope.$root.$broadcast('refreshChat');
    };

    $scope.showRecommendation = function () {
        $rootScope.viewToShow = 'recommendation';
    };

    $scope.showWelcome = function () {
        $rootScope.viewToShow = 'welcome';
    }

});

app.directive('myngRadarChart', function ($window, $rootScope) {
    function link(scope, element, attrs) {

        var max = $rootScope.max;
        var min = $rootScope.min;

        var optimal = {
            temperature: (max.temperature + min.temperature) / 2,
            humidity: (max.humidity + min.humidity) / 2,
            sunlight: (max.sunlight + min.sunlight) / 2,
            soilQuality: (max.soilQuality + min.soilQuality) / 2,
            acidity: (max.acidity + min.acidity) / 2
        };
        var minimalRequirement = {
            temperatureRatio: 1 - (max.temperature - optimal.temperature) / optimal.temperature,
            humidityRatio: 1 - (max.humidity - optimal.humidity) / optimal.humidity,
            sunlightRatio: 1 - (max.sunlight - optimal.sunlight) / optimal.sunlight,
            soilQualityRatio: 1 - (max.soilQuality - optimal.soilQuality) / optimal.soilQuality,
            acidityRatio: 1 - (max.acidity - optimal.acidity) / optimal.acidity
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
                        axis: "Air Humidity",
                        value: 1 - (max.humidity - optimal.humidity) / optimal.humidity
                    },
                    {
                        axis: "Sunlight",
                        value: 1 - (max.sunlight - optimal.sunlight) / optimal.sunlight
                    },
                    {
                        axis: "Water Content",
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
                        value: Math.max(1 - Math.abs(latestData.temperature - optimal.temperature) / optimal.temperature, 0.1)
                    },
                    {
                        axis: "Air Humidity",
                        value: Math.max(1 - Math.abs(latestData.humidity - optimal.humidity) / optimal.humidity, 0.1)
                    },
                    {
                        axis: "Sunlight",
                        value: Math.max(1 - Math.abs(latestData.sunlight - optimal.sunlight) / optimal.sunlight, 0.1)
                    },
                    {
                        axis: "Water Content",
                        value: Math.max(1 - Math.abs(latestData.soilQuality - optimal.soilQuality) / optimal.soilQuality, 0.1)
                    },
                    {
                        axis: "Acidity",
                        value: Math.max(1 - Math.abs(latestData.acidity - optimal.acidity) / optimal.acidity, 0.1)
                    }
                ]

            ];
            // draw the chart
            var color = d3.scale.ordinal()
                .range(["#b7b7b7", "rgb(146,184,58)"]); // minimal, data

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
                $rootScope.viewToShow = 'data';
                $rootScope.currentChartIndex = index;
                scope.$root.$broadcast('chartChange', index);
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

app.directive('myngLineChart', function ($rootScope) {
    function link(scope, element, attrs) {
        var data = null;
        var chartData = null;

        function removeCurrentChart() {
            d3.selectAll("#lineChart > *").remove(); // remove the current chart
        }

        scope.$watch('data', function (newValue) {
                if (newValue !== undefined) {
                    data = newValue;
                    changeToChartIndex($rootScope.currentChartIndex);
                }
            }
        );

        function changeToChartIndex(msg) {
            console.log('Change to chart #' + msg);
            function setLabelAndImg(msg) {
                $rootScope.currentChartIndex = msg;
                switch (parseInt(msg)) {
                    case 0:
                        d3.select("#chartName").text('Temperature');
                        d3.select('#paramIcon').attr('src', '/public/images/temperature.png');
                        d3.select("#realTimeDataValue").text(' ' + data[data.length - 1].temperature.toFixed(2));
                        break;
                    case 1:
                        d3.select("#chartName").text('Air Humidity');
                        d3.select('#paramIcon').attr('src', '/public/images/humidity.png');
                        d3.select("#realTimeDataValue").text(' ' + data[data.length - 1].humidity.toFixed(2));
                        break;
                    case 2:
                        d3.select("#chartName").text('Sunlight');
                        d3.select('#paramIcon').attr('src', '/public/images/sunlight.png');
                        d3.select("#realTimeDataValue").text(' ' + data[data.length - 1].sunlight.toFixed(2));
                        break;
                    case 3:
                        d3.select("#chartName").text('Water Content');
                        d3.select('#paramIcon').attr('src', '/public/images/soil.png');
                        d3.select("#realTimeDataValue").text(' ' + data[data.length - 1].soilQuality.toFixed(2));
                        break;
                    case 4:
                        d3.select("#chartName").text('Acidity');
                        d3.select('#paramIcon').attr('src', '/public/images/acidity.png');
                        d3.select("#realTimeDataValue").text(' ' + data[data.length - 1].acidity.toFixed(2));
                        break;
                }
            }

            setLabelAndImg(msg);
            removeCurrentChart();
            switch (parseInt(msg)) {
                case 0:
                    chartData = data.map(function (a) {
                        return {
                            name: 'Temperature',
                            x: a.time,
                            y: a.temperature
                        }
                    });
                    break;
                case 1:
                    chartData = data.map(function (a) {
                        return {
                            name: 'Air Humidity',
                            x: a.time,
                            y: a.humidity
                        }
                    });
                    break;
                case 2:
                    chartData = data.map(function (a) {
                        return {
                            name: 'Sunlight',
                            x: a.time,
                            y: a.sunlight
                        }
                    });
                    break;
                case 3:
                    chartData = data.map(function (a) {
                        return {
                            name: 'Water Content',
                            x: a.time,
                            y: a.soilQuality
                        }
                    });
                    break;
                case 4:
                    chartData = data.map(function (a) {
                        return {
                            name: 'Acidity',
                            x: a.time,
                            y: a.acidity
                        }
                    });
                    break;
            }
            makeChart(chartData);
        }

        scope.$on('chartChange', function (event, msg) {
            console.log(msg);
            $rootScope.viewToShow = 'data';
            changeToChartIndex(msg);
        });

        function makeChart(data) {
            // Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required
            var chart;
            nv.addGraph(function () {
                chart = nv.models.lineChart()
                    .options({
                        duration: 300,
                        useInteractiveGuideline: true
                    });
                // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
                chart.xAxis
                    .axisLabel("Time")
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d')(new Date(d));
                    })
                    .staggerLabels(true);
                chart.yAxis
                    .axisLabel(data[0].name)
                    .tickFormat(function (d) {
                        if (d == null) {
                            return 'N/A';
                        }
                        return d3.format(',.2f')(d);
                    });
                data = normalizeData(data);
                d3.select('#lineChart').append('svg')
                    .datum(data)
                    .call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
            });

            function normalizeData(data) {
                var history = [],
                    max = [],
                    min = [];
                var avg = 0;
                var maxValue = -9999;
                var minValue = +9999;
                var diff;
                data.map(function (a) {
                    avg += a.y;
                    if (a.y > maxValue) {
                        maxValue = a.y;
                    }
                    if (a.y < minValue) {
                        minValue = a.y;
                    }
                });
                avg = avg / data.length;
                diff = maxValue - minValue;
                var name = data[0].name;
                if (name == 'Temperature') {
                    name = 'temperature';
                } else if (name == 'Air Humidity') {
                    name = 'humidity';
                } else if (name == 'Sunlight') {
                    name = 'sunlight';
                } else if (name == 'Water Content') {
                    name = 'soilQuality';
                } else if (name == 'Acidity') {
                    name = 'acidity';
                }
                data.map(function (a) {
                    history.push({x: a.x, y: a.y});
                    // max.push({x: a.x, y: avg * 1.25 + (Math.random() - 0.5) * diff * 0});
                    // min.push({x: a.x, y: avg * 0.75 + (Math.random() - 0.5) * diff * 0});
                    max.push({x: a.x, y: $rootScope.max[name]});
                    min.push({x: a.x, y: $rootScope.min[name]});
                });

                return [
                    {
                        area: false,
                        values: max,
                        key: 'Max',
                        color: "rgba(192,23,51,0.9)",
                        strokeWidth: 4,
                        classed: 'dashed',
                        fillOpacity: .1
                    },
                    {
                        area: false,
                        values: min,
                        key: 'Min',
                        color: "rgba(254,196,45,0.9)",
                        strokeWidth: 4,
                        classed: 'dashed',
                        fillOpacity: .1
                    },
                    {
                        area: false,
                        values: history,
                        key: data[0].name,
                        color: 'rgba(156,204,78,0.9)',
                        strokeWidth: 4,
                        classed: 'dashed',
                        fillOpacity: .1
                    }
                ];
            }
        }
    }

    return {
        restrict: 'E',
        scope: {
            'data': '=',
            'index': '='
        },
        link: link
    }
});

app.directive('myngChat', function ($rootScope, $http) {
    function link(scope) {

        var refreshChat;

        scope.$on('refreshChat', function (event, msg) {
            refreshChat();
        });

        $jq = jQuery.noConflict();
        (function () {
            $jq('.message_input').focus();
            var Message;
            Message = function (arg) {
                this.text = arg.text;
                this.message_side = arg.message_side;
                this.draw = function (_this) {
                    return function () {
                        var $message;
                        $message = $jq($jq('.message_template').clone().html());
                        $message.addClass(_this.message_side).find('.text').html(_this.text);
                        $jq('.messages').append($message);
                        console.log(document.getElementsByClassName('messages')[0]);
                        return setTimeout(function () {
                            return $message.addClass('appeared');
                        }, 0);
                    };
                }(this);
                return this;
            };
            $jq(function () {
                var getMessageText, message_side, sendMessage, respondUser;
                message_side = 'left'; // plants or other users
                getMessageText = function () {
                    var $message_input;
                    $message_input = $jq('.message_input');
                    return $message_input.val();
                };
                sendMessage = function (text, sender, isNew, autoRespond, callback) {
                    var $messages, message;
                    if (text.trim === undefined) {
                        return;
                    }
                    if (text.trim() === '') {
                        return;
                    }
                    $jq('.message_input').val('');
                    $messages = $jq('.messages');
                    // sender
                    message_side = sender;
                    message = new Message({
                        text: text,
                        message_side: message_side
                    });
                    message.draw();
                    if (autoRespond) {
                        getResponsesAndRespond(text, respondUser);
                    }
                    if (isNew) {
                        $rootScope.chatMessages.push({'text': message.text, 'message_side': message.message_side});
                    }
                    if (callback) {
                        callback();
                    }
                    return $messages.animate({scrollTop: $messages.prop('scrollHeight')}, 1);
                };
                respondUser = function (text) {
                    sendMessage(text, 'left', true, false);
                };
                $jq('.send_message').click(function (e) {
                    $rootScope.viewToShow = 'chatbot';
                    return sendMessage(getMessageText(), 'right', true, true, reloadChatHistory); // user is the sender
                });
                $jq('.message_input').keyup(function (e) {
                    if (e.which === 13) {
                        $rootScope.viewToShow = 'chatbot';
                        return sendMessage(getMessageText(), 'right', true, true, reloadChatHistory); // user is the sender
                    }
                });
                reloadChatHistory();
                refreshChat = reloadChatHistory;
                function reloadChatHistory() {
                    if ($rootScope.chatMessages.length == 0) {
                        // sendMessage("Hey " + $rootScope.userInfo.name + ", what's up?", 'left', true, false);
                        return;
                    }
                    if ($jq('.messages').children().length == $rootScope.chatMessages.length) {
                        return;
                    } else {
                        for (var i = 0; i < $rootScope.chatMessages.length; i++) {
                            var msg = $rootScope.chatMessages[i];
                            displayWithDelay(msg); // avoid capturing the wrong value (functional programming)
                            function displayWithDelay(msg) {
                                sendMessage(msg.text, msg.message_side, false, false);
                                // no delay
                            }
                        }
                    }
                }

                // Algorithm goes here based on $rootScope.sensorData
                function getResponsesAndRespond(input, callback) {
                    /**
                     *
                     * @param str the input string
                     * @param required the required keywords, all the required keywords should be in the input string
                     * @param optionals several optional sets of keywords, for each set at least one keyword should be in the input string
                     * @returns {boolean} a flag indicating whether the str is related the topic or not
                     */
                    function contains(str, required, optionals) {
                        var flag = true;
                        for (var i = 0; i < required.length; i++) {
                            if (!str.toLowerCase().includes(required[i])) {
                                flag = false;
                            }
                        }
                        if (!flag) {
                            return false;
                        }
                        for (var i = 0; i < optionals.length; i++) {
                            flag = false;
                            for (var j = 0; j < optionals[i].length; j++) {
                                if (str.toLowerCase().includes(optionals[i][j])) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag) {
                                return false;
                            }
                        }
                        return flag;
                    }

                    function changeToGraph(idx) {
                        $rootScope.currentChartIndex = idx;
                        scope.$root.$broadcast('chartChange', $rootScope.currentChartIndex);
                        $rootScope.viewToShow = 'data';
                    }

                    var temperatureRelated = ['temperature', 'cold', 'hot', 'temp', 'tempreature'];
                    var humidityRelated = ['humidity', 'wet', 'dry'];
                    var sunlightRelated = ['sunlight', 'sunny', 'cloudy', 'sun', 'dark', 'light'];
                    var acidityRelated = ['acidity', 'ph', 'acid', 'alkaline'];
                    var waterRelated = ['water', 'thirsty', 'thristy'];

                    var graphRelated = ['chart', 'diagram', 'graph', 'history', 'historical', 'historic'];
                    var realtimeRelated = ['now', 'current', 'currently', 'realtime', 'real time', 'real-time', 'what', 'do', 'how'];

                    var greetingRelated = ['how', 'are', 'you'];

                    var jokeRelated = ['joke'];
                    var tellRelated = ['tell', 'give', 'make'];


                    if (contains(input, ['what', 'up'], [])) {
                        var responses = ["Not good :'("];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 700 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }
                    var why = ['happen', 'why'];
                    if (contains(input, [], [why])) {
                        var responses = ["Hmm... I'm thirsty.. My water content is lower than " + $rootScope.min.soilQuality + "%!!"];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 700 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }

                    if (contains(input, [], [['what', 'how'], ['can', 'could', 'should', 'shall', 'may', 'might', 'would']])) {
                        var responses = ["Water me..", "Please water me....I need half a cup of water.", 'Btw, as an African Violet, I need to be watered every day to grow well.'];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 800 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }

                    if (contains(input, [], [['done', 'watered', 'finished']])) {
                        var responses = ["THANK YOU, Eric! <3", "I'm feeling much better now!!"];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 700 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }


                    if (contains(input, greetingRelated, [])) {
                        setTimeout(function () {
                            // overall condition

                            var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1];
                            var max = $rootScope.max;
                            var min = $rootScope.min;

                            var temp = 0;
                            var humidity = 0;
                            var sunlight = 0;
                            var soil = 0;
                            var acidity = 0;

                            if (realtime.temperature >= max.temperature) {
                                temp = 1;
                            }
                            if (realtime.temperature <= min.temperature) {
                                temp = -1;
                            }
                            if (realtime.humidity >= max.humidity) {
                                humidity = 1;
                            }
                            if (realtime.humidity <= min.humidity) {
                                humidity = -1;
                            }
                            if (realtime.sunlight >= max.sunlight) {
                                sunlight = 1;
                            }
                            if (realtime.sunlight <= min.sunlight) {
                                sunlight = -1;
                            }
                            if (realtime.soilQuality >= max.soilQuality) {
                                soil = 1;
                            }
                            if (realtime.soilQuality <= min.soilQuality) {
                                soil = -1;
                            }
                            if (realtime.acidity >= max.acidity) {
                                acidity = 1;
                            }
                            if (realtime.acidity <= min.acidity) {
                                acidity = -1;
                            }

                            var overall = Math.abs(temp) + Math.abs(humidity) + Math.abs(sunlight) + Math.abs(soil) + Math.abs(acidity);
                            if (overall == 0) {
                                var responses = ["Great!! I'm growing up happliy and quickly <3"];
                                setTimeout(function () {
                                    var counter = 0;
                                    responses.map(function (r) {
                                        setTimeout(function () {
                                            callback(r);
                                        }, 700 * counter + 1);
                                        counter++;
                                    });
                                    reloadChatHistory();
                                }, 500);
                            } else if (overall == 1) {
                                var responses = ["Ahhh not good."];
                                if (temp == 1) {
                                    responses.push("It's " + realtime.temperature + " Celsius, " + "I'm feeling hot..");
                                }
                                if (temp == -1) {
                                    responses.push("It's " + realtime.temperature + " Celsius, " + "it's freezing..");
                                }
                                if (humidity == 1) {
                                    responses.push("It's " + realtime.humidity + "%, " + "it's way too humid to survive!");
                                }
                                if (humidity == -1) {
                                    responses.push("It's " + realtime.humidity + "%, " + "too dry :<");
                                }
                                if (sunlight == 1) {
                                    responses.push("I need a darker place...");
                                }
                                if (sunlight == -1) {
                                    responses.push("I need a place with more sunshine.");
                                }
                                if (soil == 1) {
                                    responses.push("My soil tastes bad...");
                                }
                                if (soil == -1) {
                                    responses.push("My soil tastes sooo bad...");
                                }
                                if (acidity == 1) {
                                    responses.push("I need a more acid fertilizer..");
                                }
                                if (acidity == -1) {
                                    responses.push("My soil now is too acid for me to live...");
                                }


                                setTimeout(function () {
                                    var counter = 0;
                                    responses.map(function (r) {
                                        setTimeout(function () {
                                            callback(r);
                                        }, 700 * counter + 1);
                                        counter++;
                                    });
                                    reloadChatHistory();
                                }, 500);
                            } else if (overall >= 2) {
                                var responses = ["So bad :'(", "I'm dying... did you see the graph on the left..?"];
                                setTimeout(function () {
                                    var counter = 0;
                                    responses.map(function (r) {
                                        setTimeout(function () {
                                            callback(r);
                                        }, 700 * counter + 1);
                                        counter++;
                                    });
                                    reloadChatHistory();
                                }, 500);
                            }

                        }, 1000);
                        return;
                    }

                    if (contains(input, jokeRelated, [tellRelated])) {
                        var responses = ["What do you get when you divide the circumference of an apple by its diameter?", "Apple Pie!"];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 6000 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }

                    if (contains(input, [], [['good', 'great'], ['joke', 'one', 'job']])) {
                        var responses = ["Thank you!"];
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 500 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 1000);
                        return;
                    }

                    if (contains(input, [], [temperatureRelated, graphRelated])) {
                        setTimeout(function () {
                            changeToGraph(0);
                        }, 600);
                        return;
                    } else if (contains(input, [], [humidityRelated, graphRelated])) {
                        setTimeout(function () {
                            changeToGraph(1);
                        }, 600);
                        return;
                    } else if (contains(input, [], [sunlightRelated, graphRelated])) {
                        setTimeout(function () {
                            changeToGraph(2);
                        }, 600);
                        return;
                    } else if (contains(input, [], [waterRelated, graphRelated])) {
                        setTimeout(function () {
                            changeToGraph(3);
                        }, 600);
                        return;
                    } else if (contains(input, [], [acidityRelated, graphRelated])) {
                        setTimeout(function () {
                            changeToGraph(4);
                        }, 600);
                        return;
                    } else if (contains(input, [], [temperatureRelated, realtimeRelated])) {
                        var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1].temperature.toFixed(0);
                        var max = $rootScope.max.temperature.toFixed(0);
                        var min = $rootScope.min.temperature.toFixed(0);
                        var responses = respondPlantRelated(0, realtime, max, min);
                        $rootScope.viewToShow = 'chatbot';
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 400 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 500);
                        return;
                    } else if (contains(input, [], [humidityRelated, realtimeRelated])) {
                        var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1].humidity.toFixed(0);
                        var max = $rootScope.max.humidity.toFixed(0);
                        var min = $rootScope.min.humidity.toFixed(0);
                        var responses = respondPlantRelated(1, realtime, max, min);
                        $rootScope.viewToShow = 'chatbot';
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 400 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 500);
                        return;
                    } else if (contains(input, [], [sunlightRelated, realtimeRelated])) {
                        var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1].sunlight.toFixed(0);
                        var max = $rootScope.max.sunlight.toFixed(0);
                        var min = $rootScope.min.sunlight.toFixed(0);
                        var responses = respondPlantRelated(2, realtime, max, min);
                        $rootScope.viewToShow = 'chatbot';
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 400 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 500);
                        return;
                    } else if (contains(input, [], [waterRelated, realtimeRelated])) {
                        var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1].soilQuality.toFixed(0);
                        var max = $rootScope.max.soilQuality.toFixed(0);
                        var min = $rootScope.min.soilQuality.toFixed(0);
                        var responses = respondPlantRelated(3, realtime, max, min);
                        $rootScope.viewToShow = 'chatbot';
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 400 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 500);
                        return;
                    } else if (contains(input, [], [acidityRelated, realtimeRelated])) {
                        var realtime = $rootScope.sensorData[$rootScope.sensorData.length - 1].acidity.toFixed(0);
                        var max = $rootScope.max.acidity.toFixed(0);
                        var min = $rootScope.min.acidity.toFixed(0);
                        var responses = respondPlantRelated(4, realtime, max, min);
                        $rootScope.viewToShow = 'chatbot';
                        setTimeout(function () {
                            var counter = 0;
                            responses.map(function (r) {
                                setTimeout(function () {
                                    callback(r);
                                }, 400 * counter + 1);
                                counter++;
                            });
                            reloadChatHistory();
                        }, 500);
                        return;
                    }


                    $http.get('/chat/' + $rootScope.userInfo.name + '/' + input).then(function (res) {
                        callback(res.data);
                    });

                }

            });
        }.call(this));
    }

    return {
        link: link,
        restrict: 'E',
        templateUrl: '/public/html/chat.html'
    }
});

app.directive('myngRecommendation', function ($http) {
    function link(scope, element, attrs) {
        $http.get('/db/gettodolist').then(function (res) {
            scope.list = res.data;
        });
        scope.check = function (n) {
            var text = angular.element(document.getElementById(n._id).childNodes[1]);
            var button = angular.element(document.getElementById(n._id).childNodes[3]);
            if (text.hasClass('checked')) {
                text.removeClass('checked');
                button.removeClass('checked');
            } else {
                text.addClass('checked');
                button.addClass('checked');
            }
        };
        scope.remove = function (n) {
            var text = angular.element(document.getElementById(n._id).childNodes[1]);
            var button = angular.element(document.getElementById(n._id).childNodes[3]);
            $http.delete('/db/removetodo/' + n._id).then(function (res) {
                console.log(res);
            });
            document.getElementById(n._id).childNodes[1].innerHTML = '';
            document.getElementById(n._id).childNodes[3].value = '';
            text.addClass('fadeoff');
            button.addClass('fadeoff');
            setTimeout(function () {
                document.getElementById(n._id).remove();
            }, 300)

        };
    }

    return {
        link: link,
        restrict: 'E',
        templateUrl: '/public/html/recommendation.html'
    }
});

function respondPlantRelated(type, realtime, max, min) {
    console.log(type, realtime, max, min);
    realtime = parseInt(realtime);
    max = parseInt(max);
    min = parseInt(min);
    switch (type) {
        case 0: // temperature
            if (realtime <= max && realtime >= min) {
                // feeling great
                return [
                    // two sentences will be sent in a row
                    "Ahhh It's like " + realtime + ", which is good! Thanks for asking <3",
                    "Have a good one <3"
                ];
            }
            if (realtime > max) {
                if ((realtime - max) / max > 0.15) {
                    // extremely hot
                    return [
                        // three sentences will be sent in a row
                        "OMG, I'm dying from the extremely hot weather!",
                        realtime + " Celsius, can you imagine?!",
                        "I urgently need a place less than " + max + " Celsius!"
                    ];
                }
                // just hot
                return [
                    // two sentences will be sent in a row
                    "It's kinda hot outside!",
                    "It's " + realtime + " Celsius, I prefer less than " + max
                ];
            }
            if (realtime < min) {
                if ((min - realtime) / min > 0.15) {
                    // extremely cold
                    return [
                        // three sentences will be sent in a row
                        "Do you know I'm dying from the coldness outside?!",
                        realtime + " Celsius, I need some warmth! *punch you in the face with pillow*",
                        "Would you mind spending more time on me, taking good care of me and putting me where's ABOVE " + min + " ?!!!"
                    ]
                }
                // just cold
                return [
                    // only one sentence will be sent out
                    "It's like " + realtime + " celsius outside... Would be great if it's above " + min + "."
                ];
            }
        case 1: // humidity
            if (realtime <= max && realtime >= min) {
                // feeling great
                return [
                    "Thx for asking, it's " + realtime + "%, I feel great!"
                ];
            }
            if (realtime > max) {
                if ((realtime - max) / max > 0.15) {
                    // extremely humid
                    return [
                        "Hey! I'm dying in your humid backyard (I guess..)",
                        "It's " + realtime + "%, please save me IMMEDIATELY! NEED TO BE BELOW " + max + "%"
                    ];
                }
                // just humid
                return [
                    realtime + "% rn, it's really wet! Is it raining outside? I prefer below " + max + "%",
                    "Maybe I need an umbrella..?"
                ];
            }
            if (realtime < min) {
                if ((min - realtime) / min > 0.15) {
                    // extremely dry
                    return [
                        realtime + "%... WATER... WATER... WATER...",
                        "Do you know I can only survive with humidity above " + min + "% ?!?!"
                    ]
                }
                // just dry
                return [
                    "Hmm, I'm kinda thirsty, it's " + realtime + "% now.",
                    "Water me like you last time did plz >.<"
                ];
            }

        case 2: // sunlight
            if (realtime <= max && realtime >= min) {
                // feeling great
                return [
                    "*Enjoying in the backyard* (Am I really in the backyard tho..?)"
                ];
            }
            if (realtime > max) {
                if ((realtime - max) / max > 0.15) {
                    // extremely light
                    return [
                        "Too light! I can't see anything!",
                        "Need a dark place, urgently!"
                    ];
                }
                // just light
                return [
                    "It's okay.. but I prefer to move to a shady place. Maybe under " + max + " of sunlight?"
                ];
            }
            if (realtime < min) {
                if ((min - realtime) / min > 0.15) {
                    // extremely dark
                    return [
                        realtime + " of light...",
                        "Can't see anything...",
                        "*dying in the dark*",
                        "I wish I could walk to a sunny place :'("
                    ]
                }
                // just dark
                return [
                    "A little bit more sunshine would be highly appreciated, my master."
                ];
            }
        case 3: // soil
            if (realtime <= max && realtime >= min) {
                // feeling great
                return [
                    "*saying with love* It's good. It's great. It's perfect!"
                ];
            }
            if (realtime > max) {
                console.log(realtime, max);
                if ((realtime - max) / max > 0.15) {
                    // extremely rich
                    return [
                        "Hmm, too much!!",
                        "Don't put this much fertilizer next time!! It tastes sooo bad!! *angrily*"
                    ];
                }
                // just rich
                return [
                    "Ahhhhhh, it's kinda too much for me, but im fine.",
                ];
            }
            if (realtime < min) {
                if ((min - realtime) / min > 0.15) {
                    // extremely poor
                    return [
                        "*dying* I need richer soil... You're killing me",
                        "I hate you.. hate you very much"
                    ]
                }
                // just poor
                return [
                    "Kinda poor for me, would you mind giving me more nutrition?"
                ];
            }

        case 4: // acidity
            if (realtime <= max && realtime >= min) {
                // feeling great
                return [
                    "*Enjoying the perfect soil*",
                    "*Growing up quickly*"
                ];
            }
            if (realtime > max) {
                if ((realtime - max) / max > 0.15) {
                    // extremely low ph
                    return [
                        "Hmmmmmm, not good, the soil tastes sour!!",
                        "I think you put the wrong fertilizer? Fix it immediately!!"

                    ];
                }
                // just low
                return [
                    "I guess the acid in the soil is too much for me to absorb... it's " + realtime,
                    "I prefer a pH between " + min + " and " + max + " :)"
                ];
            }
            if (realtime < min) {
                if ((min - realtime) / min > 0.15) {
                    // extremely high ph
                    return [
                        "Too bad.. Alkaline soil (" + realtime + ") is killing me *sadly*",
                        "Would you please fix it for me right now? Otherwise you may not see me again..."
                    ]
                }
                // just high
                return [
                    realtime + ", not very good but still fine..",
                    "Would be great if you can make it between " + min + " and " + max + "."
                ];
            }
    }
}