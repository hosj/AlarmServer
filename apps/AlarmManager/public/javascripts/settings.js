var app = angular.module('House', []);
var system_status = {};

/*======================================================================================================================================================
  Used to notify each controller to check status
*/
app.factory('mySharedService', function($rootScope) {
    var sharedService = {};
    sharedService.message = '';
    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };
    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };
    return sharedService;
});

/*======================================================================================================================================================
  Define the root-level controller for the application.
*/
app.controller(
    "AppController",
    function( $scope, $http, $interval ) {
        $scope.objects = [];
        $scope.obj2 = [];
        $scope.obj3 = [];
        // Get the gpio
        $http.get('api/gpio').then(function(result) {
          $scope.objects = result.data;
          for ( i=0;i<$scope.objects.length;i++){
            $scope.objects[i].pin = pad($scope.objects[i].pin);
            if ( isEven($scope.objects[i].pin) ){
              $scope.obj3.push($scope.objects[i]);
            }else{
              $scope.obj2.push($scope.objects[i]);
            }
          }
        });




    }
);





app.controller('Proximity', function($scope, $http) {
  $scope.state = 0;
  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/proximity',{"data":val}).then(function(result) {
        $scope.state = val;
    });
  };
  $scope.getState = function() {
    $http.get('api/system').then(function(result) {
      if (result.data.proximity_arm == 1){
        $scope.state = 1;
      }else{
        $scope.state = 0;
      }

    });
  };
  $scope.getState();
});

app.controller('Time', function($scope, $http) {
  $scope.state = 0;
  $scope.arm = '';
  $scope.disarm = '';

  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/time',{"data":val}).then(function(result) {
        $scope.state = val;
    });
  };
  $scope.getState = function() {
    $http.get('api/system').then(function(result) {
      if (result.data.time_arm == 1){
        $scope.state = 1;
      }else{
        $scope.state = 0;
      }

    });
  };
  $scope.getState();
});



app.controller('Buzzer', function($scope, $http) {
  $scope.pin = 0;
  $scope.state = 0;

  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/time',{"data":val}).then(function(result) {
        $scope.state = val;
    });
  };
  $scope.getState = function() {
    $http.get('api/system').then(function(result) {
      if (result.data.buzzer == 1){
        $scope.state = 1;
      }else{
        $scope.state = 0;
      }

    });
  };
  $scope.getState();
});











function isNumber(n)
{
   return n == parseFloat(n);
}
function isEven(n)
{
   return isNumber(n) && (n % 2 == 0);
}

function isOdd(n)
{
   return isNumber(n) && (Math.abs(n) % 2 == 1);
}
function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}
