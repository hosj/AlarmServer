var app = angular.module('House', []);
/*======================================================================================================================================================
  Define the root-level controller for the application.
*/
app.controller(
    "AppController",
    function( $scope, $http, $interval ) {
        $scope.defaultuser = {
          "name":"",
          "email":"",
          "sms":"",
          "proximity_arm":false,
          "notify_email":false,
          "notify_sms":false,
          "notify_gcm":false,
          "ip":""
        };
        $scope.newuser = $scope.defaultuser;
        $scope.users = [];
        $http.get('api/users').then(function(result) {
          $scope.users = result.data;
        });

        /*----------------------------------------------------------------------
          User
        */
        $scope.addUser = function() {
          if ( $scope.newuser.name == '' ){
            BootstrapDialog.show({
              type: BootstrapDialog.TYPE_WARNING,
              title: 'You must supply a name',
              message: '<h2>Missing:</h2><blockquote>Name</blockquote>'
            });
            return;
          }

          $scope.users.push($scope.newuser);
          // Add user to db
          $http.post('api/users',$scope.newuser);

          // Cleanup
          $scope.newuser = $scope.defaultuser;


        };



    }
);
