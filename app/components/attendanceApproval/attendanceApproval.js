apple.controller('attendanceApproval', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter', '$interval',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter, $interval) {

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.presenceText
	});

	$scope.students=[];
    /**
     * fetches the up to date attendance status of the students expected to attend the meeting
     */
    function getStudentsAttendanceStatus() {
        var data = {};
        data.lessonid = $stateParams["lessonId"];
        server.requestPhp(data, "GetStudentsAttendance").then(function (data) {
            $scope.students = data;
			/*
				0 - attending
				1 - late
				2 - not attending
				3 - didn't report yet
			*/
        });
    }
	getStudentsAttendanceStatus() ;
	
	$scope.setAttendanceStatus = function(student, status) {
		student.attendanceStatus = status;
	};
	
	$scope.filterAttendants = function(student){
	    return student.attendanceStatus == 1 || student.attendanceStatus == 0;
	};
	$scope.filterNonAttendants = function(student){
	    return student.attendanceStatus == 2 || student.attendanceStatus == 3;
	};
	
	$scope.$on('nextButton', function(event, data) {
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.students = $scope.students;
		server.requestPhp(data, "UpdateStudentAttendance").then(function(data) {
			$state.transitionTo('teacherFeedback', {
				lessonId : $stateParams["lessonId"],
				courseId : $stateParams["courseId"]
			});
		});
	});

}]); 