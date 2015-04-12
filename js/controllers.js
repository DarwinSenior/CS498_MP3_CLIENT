var demoControllers = angular.module('demoControllers', []);

function SettingController($scope, $window){
  $scope.init = function(){
    $scope.urltext = $window.sessionStorage.urltext || "http://www.uiucwp.com:4000";
    $window.sessionStorage.urltext = $scope.urltext;
  }
  $scope.setURL = function(){
    $window.sessionStorage.urltext = $scope.urltext || "http://www.uiucwp.com:4000";
  }
  $scope.init();
}
demoControllers.controller('SettingController', ['$scope', '$window', SettingController]);

function TaskController($scope, $window, $http){
  $scope.init = function(){
    $scope.skip = 0;
    $scope.sort = 'nothing';
    $scope.fetch();
  }
  $scope.fetch = function(){
    var where;
    switch ($scope.type){
      case "pending": 
        where = '&where={"completed" : false}';
        break;
      case "completed":
        where = '&where={"completed" : true}';
        break;
      default:
        where = "";
    }
    var sort = $scope.sort=='nothing' ? '' : '&sort={"'+$scope.sort+'":'+($scope.order=="ascending" ? 1 : -1)+'}';
    var skip = "&skip="+$scope.skip*10;
    var url = $window.sessionStorage.urltext+"/api/tasks?limit=10"+where+sort+skip;

    $http.get(url).success(function(data, status){
      $scope.selectedTasks = data.data;
    });
  }
  $scope.turn = function(number){
    var url = $window.sessionStorage.urltext+"/api/tasks?count=true";
    $http.get(url).success(function(data, status){
      var counter = Math.ceil(data.data/10);
      $scope.skip = ($scope.skip+counter+number)%counter;
      $scope.fetch();
    });
  }
  $scope.deleteTask = function(task){
    var url = $window.sessionStorage.urltext+"/api/tasks/"+task._id;
    $http.delete(url)
    .success(function(data, status){
      $scope.fetch();
    })
    .error(function(data, status){
      console.log("error");
    })
    var url = $window.sessionStorage.urltext+"/api/users/"+task.assignedUser;
    $http.get(url).success(function(data){
      var user = data.data;
      user.pendingTasks.filter(function(item){return item!=task._id});
      $http.put(url, user)
      .success(function(data, status){
        console.log("success");
      });
    })
  }
  $scope.init();
}
demoControllers.controller('TaskController', ['$scope', '$window', '$http', TaskController]);

function UserController($scope, $window, $http){
  $scope.init = function(){
    $scope.skip = 0;
    $scope.fetch();
  }
  $scope.fetch = function(){
    var url = $window.sessionStorage.urltext+"/api/users?limit=10&skip="+$scope.skip*10;
    $http.get(url).success(function(data, status){
      $scope.selectedUsers = data.data;
      $scope.selectedUsers;
    });
  }
  $scope.deleteUser = function(user){
    var url = $window.sessionStorage.urltext+"/api/users/"+user._id;
    $http.delete(url)
    .success(function(data, status){
      console.log("delete success");
      $scope.fetch();
    })
    .error(function(data, status){
      console.log("failed");
    });
    user.pendingTasks.forEach(function(id){
      var url = $window.sessionStorage.urltext+"/api/tasks/"+id;
      $http.put(url, {$set: {assignedUser: "", assignedUserName: "unassigned"}})
      .success(function(data, status){
        console.log("unassigned successful!");
      });
    });
  }
  $scope.turn = function(number){
    var url = $window.sessionStorage.urltext+"/api/users?count=true";
    $http.get(url).success(function(data, status){
      var counter = Math.ceil(data.data/10);
      $scope.skip = ($scope.skip+counter+number)%counter;
      $scope.fetch();
    });
  }

  $scope.init();
}
demoControllers.controller('UserController', ['$scope', '$window', '$http', UserController]);

function CreateUserController($scope, $window, $http){
  $scope.init = function(){
    $scope.fail = false;
    $scope.success = false;
  }
  $scope.submit = function(){
    console.log("submit triggered!!!");
    console.log($scope.username);
    console.log($scope.email);

    $scope.success = false;
    $scope.fail = false;

    var url = $window.sessionStorage.urltext+'/api/users';
    $http.post(url, {name: $scope.username, email: $scope.email})
    .success(function(data, status){
      $scope.successMsg = "Congratulations! "+$scope.username+" has been created!";
      $scope.success = true;
    })
    .error(function(data, status){
      $scope.failMsg = "Aho, it seem there is an error: Please try it again, maybe it has already been created";
      $scope.fail = true;
    });
  }
  $scope.init();
}
demoControllers.controller('CreateUserController', ['$scope', '$window', '$http', CreateUserController]);

function CreateTaskController($scope, $window, $http){
  $scope.init = function(){
    $scope.fail = false;
    $scope.success = false;
    $scope.the = {};
    var url = $window.sessionStorage.urltext+'/api/users';
    $http.get(url).success(function(data, status){
      $scope.users = data.data;
      $scope.users.push({id: "", name : "unassigned"});
    });
  }
  $scope.submit = function(){
    console.log("submit triggered!!!");

    $scope.success = false;
    $scope.fail = false;

    var user = {username: "unassigned", _id: ""};
    for (var i=0; i<$scope.users.length; i++){
      if ($scope.users[i]._id == $scope.the.assignedUser){
        user = $scope.users[i];
      }
    }
    var task =  {
      name: $scope.the.taskname, 
      description: $scope.the.description, 
      assignedUser: $scope.the.assignedUser,
      assignedUserName: user.name,
      deadline : $scope.the.deadline
    };
    var url = $window.sessionStorage.urltext+'/api/tasks/';
    $http.post(url, task)
    .success(function(data, status){
      $scope.successMsg = "Congratulations! "+$scope.username+" has been created!";
      $scope.success = true;
      var taskid = data.data._id;
      var url = $window.sessionStorage.urltext+'/api/users/'+user._id;
      user.pendingTasks.push(taskid);
      user.pendingTasks.filter(function(item,pos){return user.pendingTasks.indexOf(item) == pos;});
      $http.put(url, {
        name: user.name,
        email: user.email,
        pendingTasks: user.pendingTasks
      }).success(function(data){console.log("success")});

    })
    .error(function(data, status){
      $scope.failMsg = "Aho, it seem there is an error: Please try it again, maybe it has already been created";
      $scope.fail = true;
    });
  }
  $scope.init();
}
demoControllers.controller('CreateTaskController', ['$scope', '$window', '$http', CreateTaskController]);

function EditTaskController($scope, $window, $http, $routeParams){
  $scope.init = function(){
    $scope.fail = false;
    $scope.success = false;
    $scope.the = {};
    var url = $window.sessionStorage.urltext+'/api/users';
    $http.get(url).success(function(data, status){
      $scope.users = data.data;
      $scope.users.push({id: "", name : "unassigned"});
    });
    var url = $window.sessionStorage.urltext+'/api/tasks/'+$routeParams.id;
    $http.get(url).success(function(data, status){
      $scope.task = data.data;
      $scope.the.taskname = $scope.task.name;
      $scope.the.assignedUser = $scope.task.assignedUser;
      $scope.the.deadline = $scope.task.deadline;
      $scope.the.description = $scope.task.description;
    })
  }
  $scope.submit = function(){
    $scope.success = false;
    $scope.fail = false;
    var user = {username: "unassigned", _id: ""};
    for (var i=0; i<$scope.users.length; i++){
      if ($scope.users[i]._id == $scope.the.assignedUser){
        user = $scope.users[i];
      }
    }
    var task =  {
      name: $scope.the.taskname, 
      description: $scope.the.description, 
      assignedUser: $scope.the.assignedUser,
      assignedUserName: user.name,
      deadline : $scope.the.deadline
    };
    var url = $window.sessionStorage.urltext+'/api/tasks/'+$scope.task._id;
    $http.put(url, task)
    .success(function(data, status){
      $scope.successMsg = "Congratulations! "+$scope.username+" has been modified!";
      $scope.success = true;
      var url = $window.sessionStorage.urltext+'/api/users/'+user._id;
      user.pendingTasks.push($scope.task._id);
      user.pendingTasks.filter(function(item,pos){return user.pendingTasks.indexOf(item) == pos;});
      $http.put(url, {
        name: user.name,
        email: user.email,
        pendingTasks: user.pendingTasks
      }).success(function(data){console.log("success")});
      // var url = $window.sessionStorage.urltext+'/api/users/'+$scope.currentUser._id;
      // if ($scope.currentUser.pendingTasks)
      //   $scope.currentUser.pendingTasks.filter(function(x){return x==$scope.task._id});
      // $scope.put(url, $scope.currentUser).success(function(data){console.log("success")});
      // $scope.currentUser = user;
    })
    .error(function(data, status){
      $scope.failMsg = "Aho, it seem there is an error: Please try it again. :(";
      $scope.fail = true;
    });
  }
  $scope.init();
}
demoControllers.controller('EditTaskController', ['$scope', '$window', '$http', '$routeParams', EditTaskController]);

function UserInfoController($scope, $window, $http, $routeParams){
  $scope.init = function(){
    $scope.fetch();
    $scope.showComplete = true;
  }
  $scope.fetch = function(){
    var url = $window.sessionStorage.urltext+'/api/users/'+$routeParams.id;
    $http.get(url)
    .success(function(data){
      $scope.user = data.data;
      $scope.fetchTasks();
    });
  }
  $scope.fetchTasks = function(){
    $scope.user.tasks = [];
      var tasks = $scope.user.pendingTasks;
      for (var i=0; i<tasks.length; i++){
        var url = $window.sessionStorage.urltext+'/api/tasks/'+tasks[i];
        $http.get(url)
        .success(function(data, status){
          $scope.user.tasks.push(data.data);
        })
      }
  }
  $scope.complete = function(taskid){
    var url = $window.sessionStorage.urltext+'/api/tasks/'+taskid;
    $http.get(url).success(function(data){
      task = data.data;
      task.completed = true;
      $http.put(url, task)
      .success(function(data, status){
        $scope.fetchTasks();
      });
    })
  }
  $scope.completed = function(tasks){
    if(Array.isArray(tasks)){
      return tasks.filter(function(task){
        return task.completed;
      });
    }else{
      return tasks;
    }
  }
  $scope.notcompleted = function(tasks){
    if(Array.isArray(tasks)){
      return tasks.filter(function(task){
        return !task.completed;
      });
    }else{
      return tasks;
    }
  }
  $scope.init();
}
demoControllers.controller('UserInfoController', ['$scope', '$window', '$http', '$routeParams', UserInfoController]);
function TaskInfoController($scope, $window, $http, $routeParams){
  $scope.init = function(){
    $scope.fetch();
  }
  $scope.fetch = function(){
    var url = $window.sessionStorage.urltext+'/api/tasks/'+$routeParams.id;
    $http.get(url)
    .success(function(data, status){
      $scope.task = data.data;
    });
  }
  $scope.init();
}
demoControllers.controller('TaskInfoController', ['$scope', '$window', '$http', '$routeParams', TaskInfoController]);