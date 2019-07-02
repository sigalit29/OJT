apple.controller('project', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "project";
    $scope.projects = [];
	$scope.test={a:{}};
	$scope.alertcontrol={};
	$scope.GetProjects = function () {
		var data={};
		server.requestPhp(data, "GetAllProjects").then(function (data) {
			$scope.projects = data;
			for(var i=0; i<$scope.projects.length; i++)
			{
				var project = $scope.projects[i];
				$scope.projects[i].activeProject=parseInt(project.activeProject);
				for(var j=0; j<project.projecttags.length;j++)
				{
					var tag = project.projecttags[j];
					$scope.projects[i].projecttags[j].activeProjectTag = parseInt(tag.activeProjectTag);
				}
			}
		});
	}
	$scope.GetProjects();
	$scope.SaveData = function () {
		var data={};
		data.projects = $scope.projects;
		server.requestPhp(data, "AddProject").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetProjects();
			}
		});
	}
	
	$scope.CreateProject = function()
	{
		$scope.projects.push({
			"id": $scope.projects.length+1,
			"name": '',
			"activeProject":1,
			"projecttags":[]
		});
	}
	
	$scope.addProjectTag = function(project)
	{
		project.projecttags.push({
			activeProjectTag:1,
			projecttagid:null,
			projecttagname:""
		});
	}
	$scope.markProjectChanges = function(project)
	{
		project.changed = true;
	}
	$scope.markProjectTagChanges = function(tag)
	{
		tag.changed = true;
	}
	$scope.ClearData = function()
	{
		$scope.GetProjects();
	}
} ]);