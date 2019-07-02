apple.controller('city', ['$rootScope', '$scope', '$state', 'userService','Upload', 'server', function ($rootScope, $scope, $state, userService,Upload, server) {

    $rootScope.stateName = "city";

    $scope.cities = [];
	$scope.alertcontrol={};
    $scope.GetCities = function () {
    	var data={};
    	server.requestPhp(data, "GetCities").then(function (data) {
		    $scope.cities = data;
		});
    }
    $scope.GetCities();
	$scope.SaveData = function () {
		var data={};
		data.cities = $scope.cities;
    	server.requestPhp(data, "AddCity").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetCities();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetCities();
    }
	
	$scope.CreateData = function()
	{
		$scope.cities.push({
			"name": '',
			"IsShow":true
		});
	}
		
} ]);