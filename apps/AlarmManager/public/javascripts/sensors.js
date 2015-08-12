var app = angular.module('House', []);
/*======================================================================================================================================================
  Define the root-level controller for the application.
*/
app.controller(
    "AppController",
    function( $scope, $http, $interval ) {
        // I am the model for new friends.
        $scope.newSensorName = "";
        $scope.sensors = [];
        $scope.zones = [];
        $scope.types = [];
        $http.get('api/sensors').then(function(result) {
          $scope.sensors = result.data;
        });
        $http.get('api/zones').then(function(result) {
          $scope.zones = result.data;
        });
        $http.get('api/types').then(function(result) {
          $scope.types = result.data;
        });

        /*----------------------------------------------------------------------
          Sensor
        */
        $scope.addSensor = function() {
          var sensor = {
            "name":  $('#addName').val(),
            "zone":  $('#addZone').val(),
            "type":  $('#addType').val(),
            "normal":  $('#addNormal').val(),
            "gpio":  $('#addGPIO').val(),
            "enabled":  $('#addEnabled').prop('checked')
          }
          var missing = '';
          for ( f in sensor ){
            if ( sensor[f] == '' ){
              missing += '<br>' + f;
            }
          }

          if ( missing != '' ){
            BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING,
              title: 'All fields are required',
              message: '<h2>Missing:</h2><blockquote>' + missing + '</blockquote>'
            });
            return;
          }

          $scope.sensors.push(sensor);
          // Add sensor to db
          $http.post('api/sensors',sensor);
          sensor = {};

        };

        // I remove the given friend from the collection.
        $scope.removeSensor = function( friend ) {
          var index = $scope.sensors.indexOf( friend );
          if ( index === -1 ) {
              return;
          }
          $scope.sensors.splice( index, 1 );
        };

        /*----------------------------------------------------------------------
          Zones
        */
        $scope.addZone = function(){
          var name = $('#addZoneName').val();
          if ( name != ''){
            $scope.zones.push({
                name: name
            });
            // Add zone to db
            $http.post('api/zones',{"name":name});
          }else{
            BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING,
              title: 'Error',
              message: 'You need to type something'
            });
          }
        };
        /*----------------------------------------------------------------------
          Types
        */
        $scope.addType = function(){
          var name = $('#addTypeName').val();
          if ( name != ''){
            $scope.types.push({
                name: name
            });
            // Add type to db
            $http.post('api/types',{"name":name});
          }else{
            BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING,
              title: 'Error',
              message: 'You need to type something'
            });
          }
        };
        // load data  $scope.refreshSensors
        //$scope.refreshSensors();


    }
);
