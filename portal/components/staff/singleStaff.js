apple.controller('singleStaff', ['$rootScope', '$scope', '$state', '$stateParams', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, $http, userService, Upload, server) {
	$scope.staffid = $stateParams.staffId;
	$scope.staff={};
	$scope.courses={};
	$scope.substaff={};
	
	$scope.GetStaff = function () {
		var data ={};
		data.id = $scope.staffid;
		server.requestPhp(data, 'GetStaffProfileById').then(function (data) {
	    	$scope.staff = data;
		});
		var data ={};
		data.id = $scope.staffid;
		server.requestPhp(data, 'GetCoursesTaughtByStaff').then(function (data) {
	    	$scope.courses = data;
		});
		var data ={};
		data.id = $scope.staffid;
		server.requestPhp(data, 'GetSubStaffByStaffId').then(function (data) {
	    	$scope.substaff = data;
		});
	}
	if($scope.staffid)
	{
		$scope.GetStaff();
	}
	else
	{
		$scope.staff.status=1;
		$scope.staff.certificates=[];
		$scope.staff.languages=[];
		$scope.staff.professions=[];
		$scope.staff.reportSubjects=[];
		$scope.staff.firstnameinarabic="";
		$scope.staff.lastnameinarabic="";
		$scope.staff.adress="";
		$scope.staff.image="";
		$scope.staff.genderid="";
		$scope.staff.religionid="";
	}
	
	$scope.reportSubjects = [];
	$scope.GetReportSubjects = function()
	{
		var data = {};
		server.requestPhp(data, 'GetSubjectreports').then(function (data) {
			$scope.reportSubjects = data;
		});
	};
	$scope.GetReportSubjects();
	
	$scope.clientCodes = [];
	$scope.GetClientCodes = function()
	{
		var data = {};
		server.requestPhp(data, 'GetClientCodes').then(function (data) {
			$scope.clientCodes = data;
		});
	};
	$scope.GetClientCodes();
	
	$scope.projects = [];
	$scope.GetProjects = function() {
		var data ={}
		server.requestPhp(data, 'GetProjects').then(function (data) {
			$scope.projects = data;
		});
	};
	$scope.GetProjects();
	
    $scope.languages = [];
    $scope.GetLanguages = function () {
    	var data = {};
        server.requestPhp(data, 'GetLanguages').then(function (data) {
			$scope.languages = data;
		});
    };
    $scope.GetLanguages();
	
	$scope.professions = [];
    $scope.GetProfessions = function () {
    	var data = {};
        server.requestPhp(data, 'GetProfessions').then(function (data) {
			$scope.professions = data;
		});
    };
    $scope.GetProfessions();
	
	$scope.certificates = [];
    $scope.GetCertificates = function () {
    	var data = {};
        server.requestPhp(data, 'GetCertificates').then(function (data) {
			$scope.certificates = data;
		});
    };
    $scope.GetCertificates();
	
	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data = {};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    };
    $scope.GetGenders();
	
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data = {};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    };
    $scope.GetCities();
	
	$scope.religions = [];
    $scope.GetReligions = function () {
    	var data = {};
        server.requestPhp(data, 'GetReligions').then(function (data) {
		    $scope.religions = data;
		});
    };
    $scope.GetReligions();
	
	$scope.searchManager = function (search, page, onSuccess)
	{
		var desc = false;
		var userstatus = 1;
		var sorting = "staffid";
		var excludeIds = [];
		excludeIds.push($scope.staffid);
		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page, 'excludeIds':excludeIds};
		server.requestPhp(data, 'SearchManagerToAssign').then(function (data) {
			onSuccess(data);
		});
	}
	$scope.assignManager = function (manager)
	{
		$scope.staff.superstaffname = manager.staffname;
		$scope.staff.superstaffid = manager.staffid;
		$scope.chooseManager=false;
	}

	$scope.addReportSubject = function ()
	{
		var newSubject = {};
		newSubject.reportSubjectStatus="1";
		$scope.staff.reportSubjects.push(newSubject);
	}

	$scope.fileUpload=false;
	$scope.onFileSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.fileUpload=true;
			var $file = $files[i];
			Upload.upload({
				url: phpDomain+'datagate.php?type=uploadDoc&token=' + $rootScope.userToken,
				file: $file,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if (data.data.fileUrl)
					$scope.staff.image =data.data.fileUrl;
				else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.fileUpload=false;
			}); 
		}
	};
	
	$scope.SaveStaff = function()
	{
		var data = {};
		data.staff=$scope.staff;
		if($scope.staffid)
		{
			server.requestPhp(data, 'UpdateStaff').then(function (data) {
				alertSaveResults(data);
			});
		}
		else
		{
			server.requestPhp(data, 'AddStaff').then(function (data) {
				alertSaveResults(data);
			});
		}
	}
	var alertSaveResults = function (data)
	{
		if(data.error)
		{
				alert(data.error);
		}
		else
		{
			//display 'saved successfully' message
			alert("נשמר בהצלחה");
			$state.transitionTo('singleStaff', {
				staffId : data.staffid
			});
		}
	}
	
	$scope.goBack = function(){
		if(confirm("שינויים שנעשו לא יישמרו"))
		{
			window.history.back();
		}
	};
	
	$scope.duplicateStaff = function()
	{
		$scope.staff["tznumber"] = "";
		$scope.staff["email"] = "";
		$scope.staff["firstname"] = "";
		$scope.staff["firstnameinarabic"] = "";
		$scope.staff["lastname"] = "";
		$scope.staff["lastnameinarabic"] = "";
		$scope.staff["staffid"]="";
		$scope.staffid = null;
		unbindReportSubjectsFromStaff();
		alert("נא למלא את השדות החסרים ולשמור");
	};
	function unbindReportSubjectsFromStaff()
	{
		$scope.staff.reportSubjects.forEach(function (subject)
		{
			//reset subject id
			subject.staffreportsubjectid=null;
		})
	}
	
	$scope.goToStaffPage = function(staff)
	{
		$state.transitionTo('singleStaff', {
			staffId : staff.staffid
		});
	}
	$scope.goToCoursePage = function(course)
	{
		$state.transitionTo('singleCourse', {
			courseId : course.courseid
		});
	}
}]);