apple.controller('yearbudget', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "yearsbudget";

    $scope.yearsbudget = [];
	$scope.alertcontrol={};
    $scope.GetYearsbudget = function () {
    	var data={};
		server.requestPhp(data, "GetYearsBudget").then(function (data) {
		    $scope.yearsbudget = data;
		});
    }
    $scope.GetYearsbudget();
	
	$scope.SaveData = function () {
		var data={};
		data.budgetYears = $scope.yearsbudget;
		server.requestPhp(data, "AddYearsBudget").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetYearsbudget();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetYearsbudget();
    }
	
	$scope.CreateData = function()
	{
		$scope.yearsbudget.push({
			"name": '',
			"IsShow":true
		});
	}
		
} ]);