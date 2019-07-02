apple.controller('salarycode', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {	
		
	$scope.salarycodes = [];
	$scope.alertcontrol={};
    $scope.Getsalarycodes = function () {
    	var data={};
	    server.requestPhp(data, "GetSalarycodes").then(function (data) {
		    $scope.salarycodes = data;
		});
    }
    $scope.Getsalarycodes();
		$scope.SaveData = function () {
		var data={};
		data.salaryCodes=$scope.salarycodes;
		server.requestPhp(data, "AddSalarycodes").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.Getsalarycodes();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.Getsalarycodes();
    }
	
	$scope.CreateData = function()
	{
		$scope.salarycodes.push({
			"code": '',
			"IsShow":true
		});
	}
		
} ]);