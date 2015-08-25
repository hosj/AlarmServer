var app = angular.module('House', []);
/*======================================================================================================================================================
  Define the root-level controller for the application.
*/
app.controller(
    "AppController",
    function( $scope, $http, $interval ) {
        // I am the model for new friends.
        $scope.newUserName = "";
        $scope.users = [];
        $scope.zones = [];
        $scope.types = [];
        $http.get('api/users').then(function(result) {
          $scope.users = result.data;
        });

        /*----------------------------------------------------------------------
          User
        */
        $scope.addUser = function() {
          var user = {
            "name":  $('#addName').val(),
            "email":  $('#addZone').val(),
            "sms":  $('#addType').val(),
            "normal":  $('#addNormal').val(),
            "gpio":  $('#addGPIO').val(),
            "enabled":  $('#addEnabled').prop('checked')
          }
          var missing = '';
          for ( f in user ){
            if ( user[f] == '' ){
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

          $scope.users.push(user);
          // Add user to db
          $http.post('api/users',user);
          user = {};

        };



    }
);
