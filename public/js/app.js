var app = angular.module('profile', []);

app.factory('AuthInterceptor', function ($window, $q) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.getItem('token')) {
                config.headers['x-access-token'] = $window.sessionStorage.getItem('token'); // save token for pages which needs auth
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

app.directive('userMenu', function() {
  return {
    template: '<a href="/">Home</a> <a href="/login">Login</a> <a href="/register">Register</a>'
  };
});

app.directive('adminMenu', function() {
  return {
    template: '<a href="/admin/users">Users</a> <a href="/admin/posts">Posts</a>'
  };
});

app.controller('login', function($scope,$http,$window){

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
	    	if (response.data.role == 'admin') {
	    		sessionStorage.admin = true;
	    	} else {
	    		sessionStorage.admin = false;
	    	}
	    	sessionStorage.loggedIn = true;
	    	sessionStorage.userLogin = response.data.userLogin;
	    } else {
	    	$scope.hide = false;
	    	$scope.message = response.data.message;
	    }
	  }, function (response) {
	    console.log(response);
	  });
	}

})

app.controller('register', function($scope,$http,$window){

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
		  }, function (response) {
		    console.log(response);
		  });
		} else {
			$scope.hide = false;
			$scope.message = 'Passwords does not match!';
		}
	}

})

app.controller('showProfile', function($scope,$http,$window){
	$http({
		method: 'get',
		url: '/api'+window.location.pathname
	}).then(function (response) {
    $scope.user = response.data;
  }, function (response) {
    console.log(response);
    //$window.location.href = '/login';
  });
})

app.controller('adminUsers', function($scope,$http,$window,$timeout){

$scope.edit;
$scope.editFrame = false;
$scope.users;
$scope.message;
$scope.hide = true;
	
	// GET all users
	$http({
		method: 'get',
		url: '/api/users'
	}).then(function (response) {
		if (response.data.success === false) {
    	window.alert(response.data.message); // if fail, show error message and redirect to front page.
			$window.location.href = '/';
		} else {
			$scope.users = response.data; // if success, populate $scope.users with users from db.
		}
  }, function (response) {
    console.log(response);
  });

	$scope.editUser = function () {
		$scope.message = null;
		$scope.edit = this.user; // populate edit with clicked user
		$scope.editFrame = true; // show edit frame
		console.log(this.user);
	}

	$scope.saveUser = function () {
		$http({
			method: 'put',
			url: '/api/users/'+$scope.edit._id,
			data: this.edit
		}).then(function (response) {
	    $scope.message = response.data.message;
	    $scope.edit = null; // clear edit
			$scope.editFrame = false; // hide edit frame
			$scope.hide = false; // show message
			$timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
			console.log($scope.message);
	  }, function (response) {
	    console.log(response);
	    $scope.message = response.data.message;
	    $scope.hide = false; // show message
	    console.log($scope.message);
	  });
	}

	$scope.deleteUser = function (id) {
		if (window.confirm('Do you really want to delete user with '+id+'?')) {
			$http({
				method: 'delete',
				url: '/api/users/'+id
			}).then(function (response) {
		    $scope.message = response.data.message;
		    $scope.hide = false; // show message
		    $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
		    console.log($scope.users.indexOf(id));
		    //$scope.users.splice($scope.users.indexOf(id),1)
				console.log($scope.message);
		  }, function (response) {
		    $scope.message = response.data.message;
		    $scope.hide = false; // show message
		    console.log($scope.message);
		  });
		}
	}

	$scope.sort = function (regex) {
		$http({
			method: 'get',
			url: '/api/users/'+regex
		}).then(function (response) {
	    $scope.users = response.data;
	  }, function (response) {
	    $scope.message = response.data.message;
	    $scope.hide = false; // show message
	    console.log($scope.message);
	  });
	}

})