apple.controller('language', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "language";

    $scope.languages = [];
	$scope.alertcontrol={};
    
	$scope.getLanguages = function () {
    	var data={};
    	server.requestPhp(data, "GetLanguages").then(function (data) {
		    $scope.languages = data;
		});
    }
    $scope.getLanguages();
    
	$scope.SaveData = function () {
		var data={};
		data.languages=$scope.languages;
    	server.requestPhp(data, "AddLanguage").then(function (data) {
    		if(data.error!=null)
    		{
    			alert(data.error);
    		}
    		else
    		{
    			$scope.alertcontrol.open();
    			$scope.getLanguages();
    		}
    	});
	}

	$scope.ClearData = function () {
		$scope.getLanguages();
    }
	
	$scope.CreateData = function()
	{
		$scope.languages.push({
			"name": '',
			"IsShow":true
		});
	}
		
} ]);