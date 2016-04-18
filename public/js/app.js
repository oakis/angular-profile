var app = angular.module('profile', []);

app.controller('showProfile', function($scope,$http){
	var username = 'oakis';
	$http({
		method: 'get',
		url: '/api/profile/'+username
	}).then(function (response) {
    $scope.user = response.data[0];
    console.log($scope.user);
  }, function (response) {
    console.log(response);
  });
})