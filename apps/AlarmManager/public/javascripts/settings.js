var app = angular.module('House', []);
/*======================================================================================================================================================
  Define the root-level controller for the application.
*/
app.controller(
    "AppController",
    function( $scope, $http, $interval ) {
        $scope.objects = [];
        $scope.obj2 = [];
        $scope.obj3 = [];
        $http.get('api/gpio').then(function(result) {
          $scope.objects = result.data;
          for ( i=0;i<$scope.objects.length;i++){
            $scope.objects[i].pin = pad($scope.objects[i].pin);
            if ( isEven($scope.objects[i].pin) ){
              $scope.obj2.push($scope.objects[i]);
              console.log($scope.objects[i].color)
            }else{
              $scope.obj3.push($scope.objects[i]);
            }

          }
        });




    }
);
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
