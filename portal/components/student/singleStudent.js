apple.controller('singleStudent', ['$rootScope', '$scope', '$state', '$stateParams', 'userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, userService,Upload, server) {	
	$scope.studentid = $stateParams.studentId;
	//if creating a new student, require a password to be input
	$scope.password={};
	$scope.password.update=($scope.studentid=="");
	//get image directory into scope
	$scope.imgsDomain=imgsDomain;
	//get data about the student whose id was provided in the url
	$scope.student={};
	$scope.GetStudent = function () {
		var data ={};
		data.id = $scope.studentid;
		server.requestPhp(data, 'GetCoursesLearntByStudent').then(function (data) {
	    	$scope.courses = data;
		});
		var data ={};
		data.id = $scope.studentid;
		server.requestPhp(data, 'GetStudentProfileById').then(function (data) {
	    	$scope.student = data;
		});
	}
	//get courses list
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data ={};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    }
    $scope.GetCities();
	if($scope.studentid)
	{
		$scope.GetStudent();
	}
	else
	{
		$scope.student.status=1;
		$scope.student.genderid="";
		$scope.student.religionid="";
		$scope.student.adress="";
		$scope.student.firstnameinarabic="";
		$scope.student.lastnameinarabic="";
		$scope.student.phone2="";
		$scope.student.phone2owner="";
		$scope.student.image="";
		$scope.student.notes="";
		$scope.student.managerid="";
		$scope.student.notes="";
	}
	
	//get genders list
	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data ={};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    }
    $scope.GetGenders();
	
    //get religions list
	$scope.religions = [];
    $scope.GetReligions = function () {
    	var data ={};
        server.requestPhp(data, 'GetReligions').then(function (data) {
		    $scope.religions = data;
		});
    }
    $scope.GetReligions();
	
	//get cities list
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data ={};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    }
    $scope.GetCities();

	$scope.SaveStudent = function()
	{
		var data = {};
		data.student=$scope.student;
		data.updatePassword=$scope.password.update;
		if($scope.studentid)
		{
			server.requestPhp(data, 'UpdateStudent').then(function (data) {
				alertSaveResults(data);
			});
		}
		else
		{
			server.requestPhp(data, 'AddStudent').then(function (data) {
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
			$state.transitionTo('singleStudent', {
				studentId : data.studentid
			});
		}
	}
	
	$scope.goBack = function(){
		if(confirm("שינויים שנעשו לא יישמרו"))
		{
			window.history.back();
		}
	};
	
	//approve the email of the student, to complete their registration
    $scope.approveUserRegistration = function () {
    	var data = {};
		data.userid = $scope.studentid;
        server.requestPhp(data, 'approveUserEmail').then(function (data) {
		    $scope.student.needacceptregister = "";
		});
    }
	
	$scope.imageUpload=false;
	$scope.onImageSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.imageUpload=true;
			var $file = $files[i];
			Upload.upload({
				url: phpDomain+'datagate.php?type=uploadDoc&token=' + $rootScope.userToken,
				file: $file,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if (data.data.fileUrl)
					$scope.student.image =data.data.fileUrl;
				else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.imageUpload=false;
			}); 
		}
	}
	
	$scope.goToCoursePage = function(course)
	{
		$state.transitionTo('singleCourse', {
			courseId : course.courseid
		});
	}
} ]);