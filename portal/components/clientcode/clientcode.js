apple.controller('clientcode', ['$rootScope', '$scope', '$state', 'userService','Upload', 'server', function ($rootScope, $scope, $state, userService,Upload, server) {
    $rootScope.stateName = "clientcode";

    $scope.Clientcodes = [];
	$scope.alertcontrol={};
    $scope.GetClientcodes = function () {
    	var data={};
    	server.requestPhp(data, "GetClientCodes").then(function (data) {
		    $scope.Clientcodes = data;
		});
    }
    $scope.GetClientcodes();
	$scope.SaveData = function () {
		var data = {};
		data.clientCodes = $scope.Clientcodes;
	    server.requestPhp(data, "AddClientCodes").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetClientcodes();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetClientcodes();
    }
	
	$scope.CreateData = function()
	{
		$scope.Clientcodes.push({
			"code": '',
			"IsShow":true
		});
	}
		
} ]);