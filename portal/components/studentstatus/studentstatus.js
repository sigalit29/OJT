apple.controller('studentstatus', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "studentstatus";

    $scope.statuses = [];
	$scope.alertcontrol={};
    $scope.GetStatuses = function () {
    	var data={};
	    server.requestPhp(data, "GetEnrollmentTags").then(function (data) {
		    $scope.statuses = data;
		});
    }
    $scope.GetStatuses();
	$scope.SaveData = function () {
		var data={};
		data.studentStatuses = $scope.statuses;
		server.requestPhp(data, "AddStudentstatus").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetStatuses();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetStatuses();
    }
	
	$scope.CreateData = function()
	{
		$scope.statuses.push({
			"status": '',
			"IsShow":true
		});
	}
		
} ]);