app.controller('showProfile', function($scope,$http,$window,$cookies,Upload,$timeout){
	$scope.edit;
	$scope.editFrame = false;
	$scope.users;
	$scope.message;
	$scope.hide = true;
	$http({
		method: 'get',
		url: '/api'+window.location.pathname
	}).then(function (response) {
        $scope.user = response.data.user;
        $scope.admin = ($cookies.get('admin') == 'true'); // if cookie is true set true, else set false
        $scope.loggedIn = ($cookies.get('loggedIn') == 'true');
        $scope.userLogin = $cookies.get('userLogin');
        if ($scope.user.username === $scope.userLogin) {
        	$scope.isOwner = true;
        } else {
        	$scope.isOwner = false;
        }
        console.log($scope.isOwner);
    }, function (response) {
        console.log(response);
        $window.location.href = '/login';
    });

    $scope.editUser = function () {
        $scope.message = null;
        $scope.edit = $scope.user; // populate edit with user
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

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: '/api/images/',
            data: { file: file, 'username': $scope.user.username },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            method: 'post'
        }).then(function (response) {
            $scope.message = response.data.message;
            $scope.hide = false; // show message
            $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        });
    };
})