apple.controller('activeLessonGuide', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter', '$interval', function ($scope, $stateParams, $rootScope, $state, $timeout, server, $filter, $interval) {

    $scope.rightActive = true;
    $scope.courseData={};
    $rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.activeMeetingText });
    $scope.checkLessonStatus = function () {
        var data = {};
        data.lessonid = $stateParams["lessonId"];
        server.requestPhp(data, "GetLessonById").then(function (data) {
            //if the meeting was already closed - go back to the course page
            if (data.lesson && data.lesson.status == "close") {
            	$scope.courseData = data;
                $state.transitionTo('singleCourse', { courseId: $stateParams["courseId"] });
            }
            //set the course data
            else {
            	$scope.courseData = data;
                $scope.courseid = data.lesson.courseid;
				getCelebrationEvents();
            }
        });
    };
    //check the lesson status 
    $scope.checkLessonStatus();
    /**
     * fetches the up to date attendance status of the students expected to attend the meeting
     */
    function getStudentsAttendanceStatus() {
        var data = {};
        data.lessonid = $stateParams["lessonId"];
        data.courseid = $stateParams["courseId"];
        server.requestPhp(data, "GetStudentsStatus").then(function (data) {
            $scope.studentsStatuses = data;
        });
    }
    
    /**
     * goes to the profile page of a student by their id
     * student id - the unique id of the student
     */
    $scope.goToStudentProfile = function (studentid)
	{
		 $state.transitionTo('studentProfile', { studentId: studentid});
	};

    $scope.madrichCheckout = function () {
        $scope.confirmCheckout = true;
    };
    
    var checkPresenceStudent;

    $scope.leftTab = function () {
    	getStudentsAttendanceStatus();
        $scope.rightActive = false;
        //check the students status online
        checkPresenceStudent = $interval(getStudentsAttendanceStatus, 5000);
    };

    $scope.rightTab = function () {
        $scope.rightActive = true;
        $interval.cancel(checkPresenceStudent);
    };

    $scope.$on('$destroy', function () {
        $interval.cancel(checkPresenceStudent);
    });
    
    function getCelebrationEvents()
    {
    	var data = {};
    	data.courseid = $scope.courseid;
    	data.type = "post";
		server.requestPhp(data, "GetCelebrationEvents").then(function(data) {
			$scope.celebrationEvents = data;
		});
    }
   
    $scope.getLangCode= function()
    {
    	if($rootScope.arabicLnguage)
    		return "ar";
    	else
    		return "he";
    }

    $scope.madrichConfirmCheckout = function () {
        var data = {};
        data.lessonid = $stateParams["lessonId"];
        server.requestPhp(data, "MadrichCheckOut").then(function (data) {
            $interval.cancel(checkPresenceStudent);
            $state.transitionTo('sylabus', { lessonId: $stateParams["lessonId"], courseId: $stateParams["courseId"] });
        });
    };
    $scope.closePopup = function () {
        $scope.confirmCheckout = false;
    };

} ]);