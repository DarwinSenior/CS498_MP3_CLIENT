// var demoApp = angular.module('demoApp', ['demoControllers']);

var demoApp = angular.module('demoApp', ['ngRoute', 'demoControllers', 'demoServices', '720kb.datepicker']);

demoApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TaskController'
  }).
  when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UserController'
  }).
  when('/createUser',{
    templateUrl: 'partials/createUser.html',
    controller: 'CreateUserController'
  }).
  when('/user/:id', {
    templateUrl: 'partials/user.html',
    controller: 'UserInfoController'
  }).
  when('/task/:id', {
    templateUrl: 'partials/task.html',
    controller: 'TaskInfoController'
  }).
  when('/createTask',{
    templateUrl: 'partials/createTask.html',
    controller: 'CreateTaskController'
  }).
  when('/editTask/:id',{
    templateUrl: 'partials/editTask.html',
    controller: 'EditTaskController'
  }).
  otherwise({
    redirectTo: '/users'
  });
}]);