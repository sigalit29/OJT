apple.controller('profession', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "profession";

	$scope.professions = [];
	$scope.alertcontrol={};
    $scope.GetProfessions = function () {
    	var data={};
	    server.requestPhp(data, "GetProfessions").then(function (data) {
		    $scope.professions = data;
		});
    }
    $scope.GetProfessions();
	
	$scope.SaveData = function () {
		var data={};
		data.professions=$scope.professions;
		server.requestPhp(data, "AddProfessions").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetProfessions();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetProfessions();
    }
	
	$scope.CreateData = function()
	{
		$scope.professions.push({
			"name": '',
			"IsShow":true
		});
	}
} ]);


