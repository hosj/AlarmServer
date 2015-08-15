var app = angular.module('House', []);



/*======================================================================================================================================================
  Used to notify each controller to update itself
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
        // I am the model for new friends.
        $scope.newSensorName = "";
        //$interval(function(){ $scope.refreshSensors(); }, 60000);
        // --
        // PUBLIC METHODS.
        // --
        $scope.shutdown = function() {
            $http.post('api/system/shutdown');
        };
        $scope.restart = function() {
            $http.post('api/system/restart');
        };
        $scope.reloaddb = function() {
            $http.post('api/system/reloaddb');
        };
        // I add a new friend to the collection.
        $scope.addSensor = function() {
            if ( ! $scope.newSensorName ) {
                return;
            }
            $scope.sensors.push({
                id: ( new Date() ).getTime(),
                name: $scope.newSensorName
            });
            $scope.newSensorName = "";
        };

        // I remove the given friend from the collection.
        $scope.removeSensor = function( friend ) {
            var index = $scope.sensors.indexOf( friend );
            if ( index === -1 ) {
                return;
            }
            $scope.sensors.splice( index, 1 );
        };

        // load data  $scope.refreshSensors
        //$scope.refreshSensors();


    }
);
//  ########   #######   #######  ########   ######
//  ##     ## ##     ## ##     ## ##     ## ##    ##
//  ##     ## ##     ## ##     ## ##     ## ##
//  ##     ## ##     ## ##     ## ########   ######
//  ##     ## ##     ## ##     ## ##   ##         ##
//  ##     ## ##     ## ##     ## ##    ##  ##    ##
//  ########   #######   #######  ##     ##  ######
// ===================================================================================================================================================
// Doors Controller
app.controller('Doors', function($scope, $http,mySharedService) {
  $scope.visible = false;
  $scope.status = 'Fetching status';
  $scope.message_no_sensors = 'You have no Door sensors';
  $scope.down = 0;
  $scope.sensors = 0;
  $scope.toggle = function() {
    $scope.visible = !$scope.visible;
  };
  $scope.getDoors = function() {
    $http.get('api/doors').then(function(result) {
      $scope.down = 0;
      $scope.sensors = 0;
      for (i in result.data){
        // increment sensor count
        $scope.sensors++;
        obj = result.data[i];
        if ( obj.current != obj.normal ){
          $scope.down++;
        }
      }
      if ( $scope.down > 0 ){
        $scope.visible = true;
      }else{
        $scope.visible = false;
      }
      $scope.status = ( $scope.down > 0 ) ? ( $scope.down > 1 ) ? $scope.down + ' Doors Opened' : $scope.down + ' Door Opened' : 'All Doors Closed';
      $scope.doors = result.data;
    });
  };
  // Update doors on request
  $scope.$on("handleBroadcast", function (event, args) {
   $scope.getDoors();
  });
  $scope.getDoors();
});
//  ##      ## #### ##    ## ########   #######  ##      ##  ######
//  ##  ##  ##  ##  ###   ## ##     ## ##     ## ##  ##  ## ##    ##
//  ##  ##  ##  ##  ####  ## ##     ## ##     ## ##  ##  ## ##
//  ##  ##  ##  ##  ## ## ## ##     ## ##     ## ##  ##  ##  ######
//  ##  ##  ##  ##  ##  #### ##     ## ##     ## ##  ##  ##       ##
//  ##  ##  ##  ##  ##   ### ##     ## ##     ## ##  ##  ## ##    ##
//   ###  ###  #### ##    ## ########   #######   ###  ###   ######
// ===================================================================================================================================================
// Windows Controller
app.controller('Windows', function($scope, $http) {
  $scope.visible = false;
  $scope.status = 'Fetching status';
  $scope.message_no_sensors = 'You have no Window sensors';
  $scope.down = 0;
  $scope.sensors = 0;
  $scope.toggle = function() {
    $scope.visible = !$scope.visible;
  };
  $scope.getWindows = function() {
    $http.get('api/windows').then(function(result) {
      $scope.down = 0;
      $scope.sensors = 0;
      for (i in result.data){
        // increment sensor count
        $scope.sensors++;
        obj = result.data[i];
        if ( obj.current != obj.normal ){
          $scope.down++;
        }
      }
      if ( $scope.down > 0 ){
        $scope.visible = true;
      }else{
        $scope.visible = false;
      }
      $scope.status = ( $scope.down > 0 ) ? ( $scope.down > 1 ) ? $scope.down + ' Windows Opened' : $scope.down + ' Window Opened' : 'All Windows Closed';
      $scope.windows = result.data;
    });
  };
  // Update windows on request
  $scope.$on("handleBroadcast", function (event, args) {
   $scope.getWindows();
  });
  $scope.getWindows();
});
//   ######      ###    ########     ###     ######   ########
//  ##    ##    ## ##   ##     ##   ## ##   ##    ##  ##
//  ##         ##   ##  ##     ##  ##   ##  ##        ##
//  ##   #### ##     ## ########  ##     ## ##   #### ######
//  ##    ##  ######### ##   ##   ######### ##    ##  ##
//  ##    ##  ##     ## ##    ##  ##     ## ##    ##  ##
//   ######   ##     ## ##     ## ##     ##  ######   ########
// ===================================================================================================================================================
// Garage Controller
var door_open = '';
app.controller('Garage', function($scope,$http) {
  $scope.visible = false;
  $scope.status = 'Fetching status';
  $scope.message_no_sensors = 'You have no Garage sensors';
  $scope.down = 0;
  $scope.sensors = 0;
  $scope.toggle = function() {
    $scope.visible = !$scope.visible;
  };

  $scope.getGarage = function() {
    $http.get('api/garage').then(function(result) {
      $scope.down = 0;
      $scope.sensors = 0;
      for (i in result.data){
        // increment sensor count
        $scope.sensors++;
        obj = result.data[i];
        if ( obj.current != obj.normal ){
          $scope.down++;
        }
      }
      if ( $scope.down > 0 ){
        $scope.visible = true;
      }else{
        $scope.visible = false;
      }
      $scope.status = ( $scope.down > 0 ) ? ( $scope.down > 1 ) ? $scope.down + ' Doors Opened' : $scope.down + ' Door Opened' : 'All Doors Closed';
      $scope.doors = result.data;
    });
    $scope.openDoor = function(id){
      // send request to server
      $http.post('api/garage/open/' + id).then(function(result) {
        if ( result.data.message == ''){
          door_open.close();
        }else {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            title: result.data.title,
            message: result.data.message
          });
        }
      });
    }
    $scope.closeDoor = function(id){
      // send request to server
      $http.post('api/garage/close/' + id).then(function(result) {
        if ( result.data.message == ''){
          door_open.close();
        }else {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            title: result.data.title,
            message: result.data.message
          });
        }
      });
    }
    $scope.showOpen = function(door){
      status = (door.normal == door.current) ? 'Open' : 'Close';
      if ( status == 'Open' ){
        action = function(dialogRef){
            $scope.openDoor(door.id);
        }
      }else{
        action = function(dialogRef){
            $scope.closeDoor(door.id);
        }
      }

      door_open = BootstrapDialog.show({
        type: BootstrapDialog.TYPE_PRIMARY,
        title: status + ' Garage Door',
        message: 'Are you sure you want to ' + status + ' the garage door',
        buttons: [{
            icon: 'glyphicon glyphicon-check',
            label: status + ' Door',
            cssClass: 'btn-primary',
            autospin: true,
            action: action
        },{
            icon: 'glyphicon glyphicon-check',
            label: 'Cancel',
            cssClass: 'btn-danger',
            autospin: false,
            action: function(dialogRef){
                dialogRef.close();
            }
        }]
      });
    }
  };

  // Update garage on request
  $scope.$on("handleBroadcast", function (event, args) {
   $scope.getGarage();
  });
  $scope.getGarage();
});
//  ##     ##  #######  ##     ##  ######  ########
//  ##     ## ##     ## ##     ## ##    ## ##
//  ##     ## ##     ## ##     ## ##       ##
//  ######### ##     ## ##     ##  ######  ######
//  ##     ## ##     ## ##     ##       ## ##
//  ##     ## ##     ## ##     ## ##    ## ##
//  ##     ##  #######   #######   ######  ########
// ===================================================================================================================================================
// House Controller
app.controller('House', function($scope,$http, mySharedService) {
  $scope.tripped = 0;
  $scope.armed = false;

  $scope.getStatus = function() {
    $http.get('api/system').then(function(result) {
      if ( !result.data.id ){
        // No settings in the db, lets create them
        window.location ='/new';
      }else{
        // Show status of the system
        $scope.tripped = result.data.tripped;
        $scope.armed = result.data.armed;
      }
    });
  };

  $scope.toggle_arm = function() {
    $http.post('api/system/arm').then(function(result) {
      if ( result.data.message == ''){
        $scope.getStatus()
      }else {
        //alert(result.data.message)
        //BootstrapDialog.alert(result.data.message);
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_WARNING,
          title: result.data.title,
          message: result.data.message
        });
      }

    });
    mySharedService.prepForBroadcast('test');
  };

  // Get current status
  $scope.getStatus();
});


// Log Controller
app.controller('Log', function($scope,$http, mySharedService) {
  $scope.logs = [];
  $scope.getLogs = function() {
    $http.get('api/logs').then(function(result) {
      $scope.logs = result.data;
    });
  };

  // Update windows on request
  $scope.$on("handleBroadcast", function (event, args) {
   $scope.getLogs();
  });
  // Get current logs
  //$scope.getLogs();
});










app.service('',function($http,$q){

  var status  = '';
  var down    = 0;
  var sensors = 0;


  // Private METHODS
  var g = function(){

  }
  // public METHODS
  this.getDoors = function(){
    var deferred = $q.defer();
    $http({
      method: 'get',
      url: 'api/doors'
    }).success(function(data){
      deferred.resolve(data);
    }).error(function(data){
      deferred.reject('There was an error');
    });
    return deferred.promise;
    /*
    $http.get('api/doors').then(function(result) {
      for (i in result.data){
        // increment sensor count
        sensors++;
        obj = result.data[i];
        // if sensor in abnormal state
        if ( obj.current != obj.normal ){
          // increment down
          down++;
        }
      }
      // do we show doors
      if ( down > 0 ){
        visible = true;
      }else{
        visible = false;
      }
      status = ( down > 0 ) ? ( down > 1 ) ? down + ' Doors Opened' : down + ' Door Opened' : 'All Doors Closed';
      doors = result.data;
    });*/
  }

});
