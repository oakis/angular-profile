app.controller('adminUsers', function($scope,$http,$window,$timeout,$cookies,$anchorScroll){

$scope.admin = ($cookies.get('admin') == 'true'); // if cookie is true set true, else set false
$scope.loggedIn = ($cookies.get('loggedIn') == 'true');
$scope.userLogin = $cookies.get('userLogin');

$scope.edit;
$scope.editFrame = false;
$scope.users;
$scope.message;
$scope.hide = true;
$scope.needAccept;

function getNeedAccept (user) {
	if (user.role == 'needAccept') {
		return true;
	} else {
		return false;
	}
}
	
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
		$timeout(function() { $anchorScroll('editFrame') }, 100);
	}

	$scope.saveUser = function () {
		$http({
			method: 'put',
			url: '/api/users/'+$scope.edit.username,
			data: this.edit
		}).then(function (response) {
			if (response.data.success) {
		    $scope.message = response.data.message;
		    $scope.edit = null; // clear edit
				$scope.editFrame = false; // hide edit frame
				$scope.hide = false; // show message
				$scope.needAccept = $scope.users.filter(getNeedAccept).length;
				$timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
			} else {
				$scope.message = response.data.message;
				$scope.hide = false; // show message
				$scope.needAccept = $scope.users.filter(getNeedAccept).length;
				$timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
			}
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

	$scope.show = function (regex) {
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

	$scope.listOrder = function (prop) {
		$scope.reverse = ($scope.order === prop) ? !$scope.reverse : false;
    $scope.order = prop;
	}

	$scope.showNeedAccept = function () {
		$scope.users = $scope.users.filter(getNeedAccept);
	}

})