var app = angular.module('profile', []);

app.factory('AuthInterceptor', function ($window, $q) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.getItem('token')) {
                config.headers['x-access-token'] = $window.sessionStorage.getItem('token');
            }
            return config || $q.when(config);
        },
        response: function(response) {
            if (response.status === 401) {
                // TODO: Redirect user to login page.
            }
            return response || $q.when(response);
        }
    };
});

// Register the previously created AuthInterceptor.
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});

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
	    	$window.sessionStorage.setItem('token', response.data.token);
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
	console.log(window.location.pathname);
	$http({
		method: 'get',
		url: '/api'+window.location.pathname
	}).then(function (response) {
    $scope.user = response.data;
    console.log($scope.user);
  }, function (response) {
    console.log(response);
  });
})