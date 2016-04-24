app.directive('mainMenu', function() {
	return {
		templateUrl: '../templates/menu.html'
	};
})

app.directive('menu', function() {
  return {
    template: '<a href="/">Home</a> <a href="/login">Login</a> <a href="/register">Register</a>'
  };
});

app.directive('userMenu', function() {
  return {
    template: '<a href="/">Home</a> <a href="/profile/{{userLogin}}">Profile</a> <a href="/logout">Logout</a>'
  };
});

app.directive('adminMenu', function() {
  return {
    template: '<a href="/admin/users">Users</a> <a href="/admin/posts">Posts</a>'
  };
});