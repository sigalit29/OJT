apple.controller('certificate', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "certificate";

    $scope.certificates = [];
	$scope.alertcontrol={};
    $scope.GetCertificates = function () {
    	var data={};
    	server.requestPhp(data, "GetCertificates").then(function (data) {
		    $scope.certificates = data;
		});
    }
    $scope.GetCertificates();
	
	$scope.SaveData = function () {
		var data={};
		data.certificates = $scope.certificates;
	    server.requestPhp(data, "AddCertificates").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetCertificates();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetCertificates();
    }
	
	$scope.CreateData = function()
	{
		$scope.certificates.push({
			"name": '',
			"IsShow":true
		});
	}
} ]);


