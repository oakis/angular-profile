var app = angular.module('profile', ['ngCookies','ngFileUpload']);

app.factory('AuthInterceptor', function ($window, $q) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.getItem('token')) {
                config.headers['x-access-token'] = $window.sessionStorage.getItem('token'); // save token for pages which needs auth
                config.headers['role'] = $window.sessionStorage.getItem('role');
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

app.controller('logout', function($scope,$http,$cookies,$window,$timeout){

	$scope.hide = true;
	$scope.message = '';

	$http({
		method: 'post',
		url: '/api/logout'
	}).then(function (response) {
		delete $window.sessionStorage.token;
		$cookies.remove('admin');
		$cookies.remove('userLogin');
		$cookies.remove('loggedIn');
  	$scope.hide = false;
  	$scope.message = response.data.message;
  	$timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
  }, function (response) {
    console.log(response);
  });

})

app.controller('login', function($scope,$http,$window,$cookies,$timeout){

	$scope.hide = true;
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
	    	$window.sessionStorage.setItem('token', response.data.token);
	    	$window.sessionStorage.setItem('role', response.data.role);
	    	if (response.data.role == 'admin') {
	    		$cookies.put('admin', true);
	    	} else {
	    		$cookies.put('admin', false);
	    	}
	    	$cookies.put('loggedIn', true);
	    	$cookies.put('userLogin', response.data.userLogin);
	    } else {
	    	$scope.hide = false;
	    	$scope.message = response.data.message;
	    	$timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
	    }
	  }, function (response) {
	    console.log(response);
	  });
	}

})

app.controller('register', function($scope,$http,$window,$timeout){

	$scope.hide = true;
	$scope.message = '';
	
	$scope.doRegister = function () {
		// check if passwords match
		if ($scope.password === $scope.password2 && $scope.email === $scope.email2) {
			var data = {
				'username': $scope.username,
				'email': $scope.email,
				'password': $scope.password
			};
			$http({
				method: 'post',
				url: '/api/register/',
				data: data,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
	        var str = [];
	        for(var p in obj)
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	        return str.join("&");
	    	}
			}).then(function (response) {
		    $scope.hide = false;
		    $scope.message = response.data.message;
		    $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
		    document.getElementById("register").reset();
		  }, function (response) {
		    console.log(response);
		  });
		} else {
			$scope.hide = false;
			$scope.message = 'Passwords does not match!';
		}
	}

})