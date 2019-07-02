apple.controller('singleNominee', ['$rootScope', '$scope', '$state', '$stateParams', 'userService', 'server', function ($rootScope, $scope, $state, $stateParams, userService, server) {	
    $scope.nomineeId = $stateParams.nomineeId;
    console.log("$stateParams: "+$stateParams.nomineeId);

    $scope.submitted=false;
	//get data about the student whose id was provided in the url
	$scope.nominee={};
	$scope.GetStudent = function () {
		var data ={};
		data.nomineeid = $scope.nomineeId;
		server.requestPhp(data, 'GetStudentProfileById').then(function (data) {
	    	$scope.nominee = data;
		});
	}

    $scope.GetStudent();
    console.log("nomineeId: "+ $scope.nominee.nomineeId);

	//get cities list
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data ={};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    }
    $scope.GetCities();
	
	//get genders list
	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data ={};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    }
    $scope.GetGenders();

    //get NetaCities list
    $scope.NetaCities = [];
    $scope.GetNetaCities = function () {
        var data ={};
        server.requestPhp(data, 'GetNetaCities').then(function (data) {
            $scope.NetaCities = data;
        });
    }
    $scope.GetNetaCities();

    //get schools list
    $scope.schools = [];
    $scope.GetSchoolsByNetaCityId = function () {
        var data = {};
        data.NetaCityId = $scope.nominee.netacityid;
        server.requestPhp(data, "GetSchoolsByNetaCityId").then(function (data) {
            $scope.schools = data;
        });
    }
    //get Classes list
    $scope.Classes = [];
    $scope.GetClasses = function () {
        var data={};
        server.requestPhp(data, "GetClasses").then(function (data) {
            $scope.Classes = data;
        });
    }
    $scope.GetClasses();

    //get statuses list
    $scope.Statuses = [];
    $scope.GetStatuses = function () {
        var data={};
        server.requestPhp(data, "GetNomineeStatuses").then(function (data) {
            $scope.Statuses = data;
        });
    }
    $scope.GetStatuses();


    //get HearAboutUs list
    $scope.HearAboutUs = [];
    $scope.GetHearAboutUsOptions = function () {
        var data={};
        server.requestPhp(data, "GetHearAboutUsOptions").then(function (data) {
            $scope.HearAboutUs = data;
        });
    }
    $scope.GetHearAboutUsOptions();

    //UpdateNominee
	$scope.UpdateNominee = function()
	{
		console.log("nominee comments: "+$scope.nominee.comments);
        if($scope.submitted)
            return;
        $scope.submitted=true;

		var data = {};
		data.nominee=$scope.nominee;
		server.requestPhp(data, 'UpdateNominee').then(function (data) {
            alert("נשמר בהצלחה");
            window.history.back();
		});
	}

	$scope.goBack = function(){
		if(confirm("שינויים שנעשו לא יישמרו"))
		{
			window.history.back();
		}
	};
	


} ]);