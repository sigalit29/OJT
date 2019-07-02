apple.controller('course', ['$rootScope', '$scope', '$state', '$http', 'userService', 'Upload','server',
function($rootScope, $scope, $state, $http, userService, Upload, server) {

	$scope.test = {
		a : {}
	};
	$scope.alertcontrolmultyname = {};
	$scope.goToTap = "";
	$scope.course = {};
	$scope.alertcontrol = {};
	$scope.confirmcontrol = {};
	$scope.deletingcontrol = {};
	$scope.alertcontroldupl = {};
	$scope.course.tags = [];
	$scope.courses = [];

	$scope.sortType = 'code';
	// set the default sort type
	$scope.sortReverse = false;
	// set the default sort order

	$scope.Type = "";
	$scope.GetMyType = function() {
		var data ={};
		server.requestPhp(data, 'GetMyType'
		).then(function (data) {
			$scope.Type = data;
		});
	};
	$scope.GetMyType();

	$scope.activestudents = [];
	$scope.GetActiveStudents = function() {
		var data = {courseid : $scope.course.courseid};
		server.requestPhp(data, 'GetStudentsInCourse').then(function (data) {
			$scope.activestudents = data;
			for (var i=0; i<$scope.activestudents.length; i++)
			{
				$scope.activestudents[i].statusincourse = String($scope.activestudents[i].statusincourse);
			}
		});
	};

	$scope.statuses = [];
	
	$scope.GetStudentstatus = function() {
		var data={};
		server.requestPhp(data, 'GetStudentstatus').then(function (data) {
			$scope.statuses = data;
		});
	};
	
	$scope.GetStudentstatus();
	$scope.StudentsNotInCourse = [];
	
	$scope.GetStudentsNotInCourse = function() {
		var data = {courseid : $scope.course.courseid};
		server.requestPhp(data, 'GetStudentsNotInCourse').then(function (data) {
			$scope.StudentsNotInCourse = data;
		});
	};

	$scope.gatAllCourses = function() {
		var data = {status : 'active'};
		server.requestPhp(data, 'GetAllCourses').then(function (data) {
			$scope.courses = data;
		});
	};
	$scope.gatAllCourses();

	$scope.Closecourses = [];
	$scope.gatAllCloseCourses = function() {
		var data = {status : 'closed'}
		server.requestPhp(data, 'GetAllCourses').then(function (data) {
			$scope.Closecourses = data;
		});
	};
	$scope.gatAllCloseCourses();

	$scope.projects = [];
	$scope.GetProjects = function() {
		var data ={}
		server.requestPhp(data, 'GetProjects').then(function (data) {
			$scope.projects = data;
		});
	};
	$scope.GetProjects();

	$scope.yearbudgets = [];
	$scope.GetYearsBudget = function() {
		var data={};
		server.requestPhp(data, 'GetYearsBudget').then(function (data) {
			$scope.yearbudgets = data;
		});
	};
	$scope.GetYearsBudget();

	$scope.cities = [];
	$scope.GetCities = function() {
		var data ={};
		server.requestPhp(data, 'GetCities').then(function (data) {
			$scope.cities = data;
		});
	};
	$scope.GetCities();

	$scope.madrichs = [];
	$scope.GetMadrichem = function() {
		var data = {status : 'madrich'};
		server.requestPhp(data, 'GetStaffsByType').then(function (data) {
			$scope.madrichs = data;
		});
	};
	$scope.GetMadrichem();

	$scope.member = {
		tags : []
	};
	$scope.tags = [];

	$scope.SelectProject = function(projectid) {
		$scope.projects.forEach(function(element) {
			if (element.projectid == projectid) {
				$scope.tags = [];
				$scope.course.tags = [];
				//$scope.dropdownTitle = "תגיות";
				if (element.tagproject != null && element.tagproject.length > 0) {
					element.tagproject.forEach(function(subelement) {
						if (subelement.IsShow == "1") {
							if (subelement["tagprojectid"] != null) {
								subelement["id"] = subelement["tagprojectid"];
								delete subelement["tagprojectid"];
							}
							$scope.tags.push(subelement);
						}
					});
				}
			}
		});
	};

	$scope.subjects = [];
	$scope.CourseClick = function(course, status) {
		$scope.SelectProject(course.projectid);
		$scope.course.status = status;
		$scope.course = course;
		var data = {courseid : course.courseid}
		server.requestPhp(data, 'GetSyllabusSubjectsByCourseId').then(function (data) {
			$scope.subjects = data;
		});
		$scope.tabindex = "home";
		$scope.GetActiveStudents();
		$scope.GetStudentsNotInCourse();
	};

	$scope.CheckPermmetion = function() {
		if ($scope.Type != "admin") {
			$(".form-control").attr('disabled', 'disabled');
			$(".btn-info").hide();
			$(".savebotton").show();
		}
	};

	$scope.AddSubject = function() {
		//console.log($scope.subjects);
		$scope.subjects.push({
			"id" : $scope.subjects.length + 1,
			"subject" : '',
			"subsubjects" : []
		});
	};

	$scope.CreateSubSubject = function(subjectid, id) {
		var update = false;
		$scope.subjects.forEach(function(element) {
			if (element['id'] != null && element['id'] == id) {
				element.subsubjects.push({
					"subsubject" : ''
				});
				update = true;
			}
		});

		$scope.subjects.forEach(function(element) {
			if (update == false && element['subjectid'] == subjectid) {
				if (element.subsubjects == null) {
					element['subsubjects'] = [];
				}
				element.subsubjects.push({
					"subsubject" : ''
				});
			}
		});
	};
	$scope.getStatusNameById = function (statusid)
	{
		
		for (var i=0; i<$scope.statuses.length; i++)
		{
			if($scope.statuses[i].studentstatusid==statusid)
				{
				return $scope.statuses[i].status;
				}
		}
		return "";
	}
	$scope.SaveCourse = function() {
		var data ={course : $scope.course, syllabus : $scope.subjects, students : $scope.activestudents};
		server.requestPhp(data, 'AddCourse').then(function (data) {
			if (data != null && data.error != null && data.coursename != null) {
				$scope.alertcontrolmultyname.open();
			} else {
				$scope.ClearCourse();
				$scope.alertcontrol.open();
			}
		});
	};

	$scope.goToOpenCourses = function() {
		var EmptyCourse = angular.equals($scope.course, {});
		$scope.goToTap = 'OpenCourses';
		if ($scope.tabindex == 'home' && !EmptyCourse) {
			$scope.confirmcontrol.open();
		} else {
			$scope.gatAllCourses();
			$scope.tabindex = 'profile';
		}
	};

	$scope.goToCreateCourse = function() {
		if ($scope.Type == 'admin') {
			$scope.ClearCourse();
			$scope.tabindex = 'home';
		}
	};

	$scope.goToCloseCourses = function() {
		var EmptyCourse = angular.equals($scope.course, {});
		$scope.goToTap = 'OpenCourses';
		if ($scope.tabindex == 'home' && !EmptyCourse) {
			$scope.confirmcontrol.open();
		} else {
			$scope.gatAllCloseCourses();
			$scope.tabindex = 'messages';
		}
	};

	$scope.movedTo = function(tabindex) {
		$scope.ClearCourse();
		if (tabindex == 'OpenCourses') {
			$scope.goToOpenCourses();
		} else if (tabindex == 'CloseCourses') {
			$scope.goToCloseCourses();
		}
	};

	$scope.ClearCourse = function() {
		$scope.course = {};
		$scope.subjects = [];
		$scope.activestudents = [];
	};

	$scope.SearchWord = function($word) {
		var data = {status : 'active', word : $word};
		server.requestPhp(data, 'SearchCouses').then(function (data) {
			$scope.courses = data;
		});
	};

	$scope.SearchWordinCloseCourse = function($word) {
		var data = {status : 'closed', word : $word};
		server.requestPhp(data, 'SearchCouses').then(function (data) {
			$scope.Closecourses = data;
		});
	};

	$scope.IfDeleteCourse = function() {
		if ($scope.course.courseid != null) {
			$scope.deletingcontrol.open();
		}
	};

	$scope.DeleteCourse = function() {
		vardata = {courseid : $scope.course.courseid};
		server.requestPhp(data, 'DeleteCourse').then(function (data) {
		});
		$scope.ClearCourse();
	};

	$scope.fileUpload = false;
	$scope.onFileSelect = function($files) {
		if(!$files)
			return;
		$scope.fileUpload = true;
		Upload.upload({
			url : phpDomain+'datagate.php?type=UploadSyllabusFile&token=' + $rootScope.userToken,
			file : $files,
			progress : function(e) {
			}
		}).then(function(data, status, headers, config) {
			if (data.data.error != null) {
				alert(data.data.error);
			} else if (data.status == 200) {
				console.log(data.data);
				var array = $.map(data.data, function(value, index) {
					return [value];
				});
				console.log(array);
				$scope.subjects = array;
			} else
				alert("תקלה בהעלאת קובץ");
			$scope.fileUpload = false;
		});
	};

	$scope.DuplicateCourse = function() {
		$scope.activestudents = [];
		unbindSubjectsFromCourse();
		delete $scope.course["courseid"];
		delete $scope.course["name"];
		$scope.alertcontroldupl.open();
	};
	
	function unbindSubjectsFromCourse()
	{
		$scope.subjects.forEach(function (subject)
		{
			//reset subject id
			subject.subjectid=null;
			//go through all the subsubjects for the subject
			if(subject.subsubjects)
			{
				subject.subsubjects.forEach(function (subsubject)
						{
					// and reset their subsubject id
					subsubject.subsubjectid=null;
						});
			}
		})
	}
	
	$scope.addStudent = function(data) {
		if ($scope.activestudents.indexOf(data) < 0)
			{
			//by default, set status in course to 'active'
			data.statusincourse=1;
			$scope.activestudents.push(data);
			}
	};

	if ($rootScope.tempPass && $rootScope.tempPass.courseid) {

		var mystatus = "";
		var data = {courseid : $rootScope.tempPass.courseid};
		server.requestPhp(data, 'getcourse').then(function (data) {
			$scope.course = data;
			$scope.CourseClick($scope.course, $scope.course.status);
		});
		$rootScope.tempPass.courseid = null;
	}

}]);
