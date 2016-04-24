var app = angular.module('profile', ['ngCookies']);

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

app.controller('showProfile', function($scope,$http,$window,$cookies){
	$http({
		method: 'get',
		url: '/api'+window.location.pathname
	}).then(function (response) {
    $scope.user = response.data;
    $scope.admin = ($cookies.get('admin') == 'true'); // if cookie is true set true, else set false
    $scope.loggedIn = ($cookies.get('loggedIn') == 'true');
    $scope.userLogin = $cookies.get('userLogin');
  }, function (response) {
    console.log(response);
    //$window.location.href = '/login';
  });
})

app.controller('adminUsers', function($scope,$http,$window,$timeout,$cookies){

$scope.edit;
$scope.editFrame = false;
$scope.users;
$scope.message;
$scope.hide = true;
$scope.needAccept;
	
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
			$scope.admin = ($cookies.get('admin') == 'true'); // if cookie is true set true, else set false
	    $scope.loggedIn = ($cookies.get('loggedIn') == 'true');
	    $scope.userLogin = $cookies.get('userLogin');
	    function getNeedAccept (user) {
	    	if (user.role == 'needAccept') {
	    		return true;
	    	} else {
	    		return false;
	    	}
	    }
	    $scope.needAccept = $scope.users.filter(getNeedAccept).length;
	    if ($scope.needAccept >= 2) {
	    	$scope.needAcceptMsg = 'users are waiting to be accepted.';
	    } else if ($scope.needAccept = 1) {
	    	$scope.needAcceptMsg = 'user is waiting to be accepted.';
	    }
		}
  }, function (response) {
    console.log(response);
  });

	$scope.editUser = function () {
		$scope.message = null;
		$scope.edit = this.user; // populate edit with clicked user
		$scope.editFrame = true; // show edit frame
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
	  }, function (response) {
	    $scope.message = response.data.message;
	    $scope.hide = false; // show message
	  });
	}

	$scope.deleteUser = function (id,index) {
		if (window.confirm('Do you really want to delete user with '+id+'?')) {
			$http({
				method: 'delete',
				url: '/api/users/'+id
			}).then(function (response) {
		    $scope.message = response.data.message;
		    $scope.hide = false; // show message
		    $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
		    $scope.users.splice(index,1);
		  }, function (response) {
		    $scope.message = response.data.message;
		    $scope.hide = false; // show message
		    $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
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
	  });
	}

})