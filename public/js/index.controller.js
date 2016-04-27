app.controller('index', function($scope,$cookies){

$scope.admin = ($cookies.get('admin') == 'true'); // if cookie is true set true, else set false
$scope.loggedIn = ($cookies.get('loggedIn') == 'true');
$scope.userLogin = $cookies.get('userLogin');

});