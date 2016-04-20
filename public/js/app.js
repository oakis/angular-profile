var app = angular.module('profile', []);

app.controller('login', function($scope,$http,$window){

	$scope.success = true;
	$scope.message = '';
	
	$scope.doLogin = function () {
		var data = {
			'username': $scope.username,
			'password': $scope.password
		};
		$http({
			method: 'post',
			url: '/api/authenticate/',
			data: data,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    	}
		}).then(function (response) {
	    if (response.data.success) {
	    	$window.location.href = 'profile/'+$scope.username;
	    	$scope.success = true;
	    } else {
	    	$scope.success = false;
	    	$scope.message = response.data.message;
	    }
	  }, function (response) {
	    console.log(response);
	  });
	}

})

app.controller('showProfile', function($scope,$http){
	$http({
		method: 'get',
		url: '/api/profile/',
		params: ''
	}).then(function (response) {
    $scope.user = response.data[0];
    console.log($scope.user);
  }, function (response) {
    console.log(response);
  });
})