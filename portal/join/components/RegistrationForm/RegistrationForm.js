apple.controller('RegistrationForm', ['$rootScope', '$scope', '$stateParams', '$state', 'userService', 'server', function ($rootScope, $scope, $stateParams, $state, userService, server) {
	$scope.isArabic = $stateParams["lang"]=='ar';
    $scope.dictionary=dictionary[$stateParams["lang"]];
	$scope.nominee = {
		firstname: '',
		lastname: '',
		firstnameinarabic: '',
		lastnameinarabic: '',
        genderid:'',
		birthday: {"date":null},
		email: '',
		phone: '',
		parentsphone: '',
		idnumber: '',
		schoolid: '',
		classid: '',
		cityid: null,
		netacityid: '',
		hearaboutid: '',
		hearaboutother: '',
		schoolother: '',
        cityother:'',
        RegistrationDate:'',
        neighborhood:''

	}
	$scope.submitted=false;
	$scope.register = function ()
	{
		if($scope.submitted)
			return;
		$scope.submitted=true;
        var data = {};
        data.nominee=$scope.nominee;
        data.nominee.birthday = data.nominee.birthday.date;
        server.requestPhp(data, "AddNominee").then(function (data) {
            $state.transitionTo('SuccessfulRegistration');
        });
	};
    $scope.schools = [];
	$scope.GetSchoolsByNetaCityId = function () {
        var data = {};
        data.NetaCityId = $scope.nominee.netacityid;
        server.requestPhp(data, "GetSchoolsByNetaCityId").then(function (data) {
            $scope.schools = data;
        });
    }

    $scope.cities = [];
    $scope.GetCities = function () {
        var data={};
        server.requestPhp(data, "GetCities").then(function (data) {
            $scope.cities = data;
        });
    }
    $scope.GetCities();


    $scope.Netacities = [];
    $scope.GetNetaCities = function () {
        var data={};
        server.requestPhp(data, "GetNetaCities").then(function (data) {
            $scope.Netacities = data;
        });
    }
    $scope.GetNetaCities();

    $scope.Classes = [];
    $scope.GetClasses = function () {
        var data={};
        server.requestPhp(data, "GetClasses").then(function (data) {
            $scope.Classes = data;
        });
    }
    $scope.GetClasses();

    $scope.HearAboutUs = [];
    $scope.GetHearAboutUsOptions = function () {
        var data={};
        server.requestPhp(data, "GetHearAboutUsOptions").then(function (data) {
            $scope.HearAboutUs = data;
        });
    }
    $scope.GetHearAboutUsOptions();

    $scope.genders = [];
    $scope.GetGenders = function () {
        var data={};
        server.requestPhp(data, "GetGenders").then(function (data) {
            $scope.genders = data;
        });
    }
    $scope.GetGenders();
}
]);