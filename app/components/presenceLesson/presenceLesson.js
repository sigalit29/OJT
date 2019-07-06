apple.controller('presenceLesson', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter', '$interval',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter, $interval) {

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.presenceText
	});
	$scope.addClass = false;
	$scope.checkedByGuide = false;
	// $scope.lateStatus = false;

	$scope.changeLateStatus = function(student) {
		//if (student.status == 'attendance')
		//    student.status = 'late'
		//else student.status = 'attendance'
		if (student.status == 'late') {
			student.status = 'attendance';
		} else {
			student.status = 'late';
		}
	};

	$scope.changeAttendanceStatus = function(student) {
		student.status = 'not attendance';
		student.checkedByGuide = true;
	};

	$scope.changeDontAttendanceStatus = function(student) {
		student.status = 'attendance';
		student.checkedByGuide = true;
	};

	$scope.checkStudentPrresenceStatus = function() {
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.courseid = $stateParams["courseId"];
		server.requestPhp(data, "GetStudentsStatus").then(function(data) {
			//console.log(data);
			$scope.studentsStatuses = data;
		});
	};
	$scope.unattendedStatus = function(status){
	    return status.status == 'not checkin' || 
	    status.status == 'not attendance';
	};
	$scope.attendedStatus = function(status){
	    return status.status == 'late' || 
	    status.status == 'attendance';
	};
	$scope.checkStudentPrresenceStatus();

	$scope.$on('nextButton', function(event, data) {

		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.courseId = $stateParams["courseId"];
		data.students = $scope.studentsStatuses;
		server.requestPhp(data, "UpdateStatus").then(function(data) {
			$state.transitionTo('grade', {
				lessonId : $stateParams["lessonId"],
				courseId : $stateParams["courseId"]
			});
		});
	});

}]); 