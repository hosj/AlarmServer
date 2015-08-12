var app = angular.module('House', ['mgo-angular-wizard']);

// Define the root-level controller for the application.
app.controller(
    "AppController",
    function( $scope, $http ) {
      $scope.writeNew = function(){
          $http.post('api/system/setup',{
              "name":$('#name').val()
            }).then(function(result) {
            if ( result.data.message == '' ){
              window.location = '';
            }else{
              alert('Error: ' + result.data.message );
            }
          });
      }
    }
);
