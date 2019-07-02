apple.controller('religion', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "religion";

    $scope.religions = [];
	$scope.alertcontrol={};
    $scope.GetReligions = function () {
    	var data={};
	    server.requestPhp(data, "GetReligions").then(function (data) {
		    $scope.religions = data;
		});
    }
    $scope.GetReligions();
	
	$scope.SaveData = function () {
		var data={};
		data.religions = $scope.religions;
		server.requestPhp(data, "AddReligion").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetReligions();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetReligions();
    }
	
	$scope.CreateData = function()
	{
		$scope.religions.push({
			"name": '',
			"IsShow":true
		});
	}
		
} ]);