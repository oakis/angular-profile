app.controller('showProfile', function($scope,$http,$window,$cookies,Upload,$timeout,$anchorScroll){

	$scope.edit;
	$scope.editFrame = false;
	$scope.user;
	$scope.message;
	$scope.hide = true;
    $scope.class;
    $scope.numSkillMsg;

    // Get profile
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
        $scope.getClass(); // get users class
    }, function (response) {
        console.log(response);
        $window.location.href = '/login';
    });

    $scope.getClass = function () {
        // Get class mates
        $http({
            method: 'get',
            url: '/api/class/'+$scope.user.class
        }).then(function (response) {
            $scope.class =
            response.data.classmates.filter(function(user,i) {
                if (response.data.classmates[i].username == $scope.user.username) {
                    return false;
                }
                return true;
            });
        }, function (response) {
            console.log(response);
        });
    }

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
                $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
            } else {
                $scope.message = response.data.message;
                $scope.hide = false; // show message
                $timeout(function() { $scope.hide = true }, 3000); // hide message after 3 seconds
            }
      }, function (response) {
        $scope.message = response.data.message;
        $scope.hide = false; // show message
      });
    }

    $scope.close = function () {
        $scope.editFrame = false;
    }

    // upload on file select
    $scope.upload = function (file) {
        Upload.upload({
            url: '/api/images/',
            data: { file: file, 'username': $scope.user.username }, // send file and username for naming the file
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

    // show how many others have the same skill
    $scope.skillCompare = function (skill) {
        $http({
            method: 'get',
            url: '/api/skill/'+skill
        }).then(function (response) {
            $scope.numSkill = response.data.sum.length-1;
            $scope.showNumSkill = true;
            if ($scope.numSkill <= 0) {
                $scope.numSkillMsg = 'Nobody has this skill, you are truly amazing!';
            } else {
                $scope.numSkillMsg = 'others have this skill!';
            }
        }, function (response) {
            console.log('err: '+response);
        });
    }

    // hide skill message
    $scope.skillHide = function () {
        $scope.showNumSkill = false;
    }
})