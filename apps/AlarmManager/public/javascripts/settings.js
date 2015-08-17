var app = angular.module('House', []);
var system_status = {}; // stores system status

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
    function( $scope, $http, mySharedService ) {
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

        $scope.get_system = function(){
          $http.get('api/system').then(function(result) {
            system_status = result.data;
            // Notify controllers of update
            mySharedService.prepForBroadcast('updated');
          });
        }

        // broadcast received
        $scope.$on("handleBroadcast", function (event, args) {
          switch(mySharedService.message){
            case 'update':
              $scope.get_system();
              break;
          }
        });

        $scope.get_system()
    }
);





app.controller('Proximity', function($scope, $http, mySharedService) {
  $scope.state = 0;
  $scope.users = [];
  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/set',{"key":"proximity","value":val}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  };

  // broadcast received
  $scope.$on("handleBroadcast", function (event, args) {
    switch(mySharedService.message){
      case 'updated':
        $scope.state = (system_status.proximity_arm == 1) ? 1 : 0;

        $scope.users = [];
        for ( i=0; i<(system_status.users).length;i++){
          if (system_status.users[i].ip != null){
            $scope.users.push(system_status.users[i])
          }
        };
        break;
    }
  });
});

app.controller('Time', function($scope, $http, mySharedService) {
  $scope.state = 0;
  $scope.arm = {
    "name" : "arm_time",
    "db" : "",
    "value" : ""
  };
  $scope.disarm = {
    "name" : "disarm_time",
    "db" : "",
    "value" : ""
  };

  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/set',{"key":"time","value":val}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  };

  // broadcast received
  $scope.$on("handleBroadcast", function (event, args) {
    switch(mySharedService.message){
      case 'updated':
        if (system_status.time_arm == 1){
          $scope.state = 1;
        }else{
          $scope.state = 0;
        }
        if (system_status.time_arm_start == null){
          $scope.arm.db = "";
          $scope.arm.value = $scope.arm.db;
        }else{
          $scope.arm.db = new Date(system_status.time_arm_start);
          $scope.arm.value = $scope.arm.db;
        }
        if (system_status.time_arm_end == null){
          $scope.disarm.db = "";
          $scope.disarm.value = $scope.disarm.db;
        }else{
          $scope.disarm.db = new Date(system_status.time_arm_end);
          $scope.disarm.value = $scope.disarm.db;
        }
        break;
    }
  });

  $scope.send_time = function(mdl){
    $http.post('api/system/set',{"key":mdl.name,"value":mdl.value}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  }
});



app.controller('Buzzer', function($scope, $http, mySharedService) {
  $scope.state = 0;
  $scope.pin = {
    "name" : "buzzer_pin",
    "value" : "",
    "db" : ""
  };
  $scope.length = {
    "name" : "buzzer_length",
    "value" : "",
    "db" : ""
  };



  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/set',{"key":"buzzer","value":val}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  };

  // broadcast received
  $scope.$on("handleBroadcast", function (event, args) {
    switch(mySharedService.message){
      case 'updated':

        // Get the module status
        $scope.state = (system_status.buzzer == 1) ? 1 : 0;

        // Get buzzer pin
        $scope.pin.value  = (system_status.buzzer_pin == null) ? 0 : system_status.buzzer_pin;
        $scope.pin.db     = $scope.pin.value;

        // get buzzer length
        $scope.length.value  = (system_status.buzzer_length == null) ? 0 : system_status.buzzer_length;
        $scope.length.db     = $scope.length.value;

        // Done
        break;
    }
  });

  $scope.send_buzzer = function(mdl){
    $http.post('api/system/set',{"key":mdl.name,"value":mdl.value}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  }
});


app.controller('Lights', function($scope, $http, mySharedService) {
  $scope.armed = {
    "name" : "armed",
    "db" : 0,
    "value" : 0
  };
  $scope.disarmed = {
    "name" : "disarmed",
    "db" : 0,
    "value" : 0
  };
  $scope.state = 0;

  // sets state
  $scope.setActive = function(val) {
    $http.post('api/system/set',{"key":"lights","value":val}).then(function(result) {
        mySharedService.prepForBroadcast('update');
    });
  };

  // broadcast received
  $scope.$on("handleBroadcast", function (event, args) {
    switch(mySharedService.message){
      case 'updated':
        // Get status
        if (system_status.status_light == 1){
          $scope.state = 1;
        }else{
          $scope.state = 0;
        }
        // get armed pin
        if (system_status.status_light_armed_pin == null){
          $scope.armed.db = 0;
          $scope.armed.value = $scope.armed.db;
        }else{
          $scope.armed.db = system_status.status_light_armed_pin;
          $scope.armed.value = $scope.armed.db;
        }
        // get disarmed pin
        if (system_status.status_light_disarmed_pin == null){
          $scope.disarmed.db = 0;
          $scope.disarmed.value = $scope.disarmed.db;
        }else{
          $scope.disarmed.db = system_status.status_light_disarmed_pin;
          $scope.disarmed.value = $scope.disarmed.db;
        }
        break;
    }
  });


    // update armed pin
    $scope.send_armed = function(val){
      $http.post('api/system/set',{"key":"armed_pin","value":val}).then(function(result) {
          mySharedService.prepForBroadcast('update');
      });
    };
    // update disarmed pin
    $scope.send_disarmed = function(val){
      $http.post('api/system/set',{"key":"disarmed_pin","value":val}).then(function(result) {
          mySharedService.prepForBroadcast('update');
      });
    };


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
