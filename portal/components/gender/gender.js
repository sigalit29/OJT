apple.controller('gender', ['$rootScope', '$scope', '$state', 'userService','Upload', 'server', function ($rootScope, $scope, $state, userService,Upload, server) {
    $rootScope.stateName = "gender";

    $scope.genders = [];
	$scope.alertcontrol={};
    $scope.GetGenders = function () {
    	var data={};
    	server.requestPhp(data, "GetGenders").then(function (data) {
		    $scope.genders = data;
		});
    }
    $scope.GetGenders();
	
	$scope.SaveData = function () {
		var data={};
		data.genders=$scope.genders;
	    server.requestPhp(data, "AddGender").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetGenders();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetGenders();
    }
	
	$scope.CreateData = function()
	{
		$scope.genders.push({
			"name": '',
			"IsShow":true
		});
	}
		
} ]);