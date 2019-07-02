apple.controller('subjectreport', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "subjectreport";

    $scope.subjectreport = [];
	$scope.alertcontrol={};
    $scope.GetSubjectreport = function () {
    	var data={};
	    server.requestPhp(data, "GetReportSubjects").then(function (data) {
		    $scope.subjectreport = data;
		});
    }
    $scope.GetSubjectreport();
	
	$scope.SaveData = function () {
		var data={};
		data.reportSubjects = $scope.subjectreport;
		server.requestPhp(data, "AddReportSubjects").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetSubjectreport();
			}
		});
    }
	
	$scope.ClearData = function () {
		$scope.GetSubjectreport();
    }
	
	$scope.CreateData = function()
	{
		$scope.subjectreport.push({
			"subject": '',
			"subjectnum": '',
			"IsShow":true
		});
	}
		
} ]);