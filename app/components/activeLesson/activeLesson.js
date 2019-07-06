apple.controller(    'activeLesson', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', 'permissions', '$filter', '$interval', '$sce',
function ($scope, $stateParams, $rootScope, $state, $timeout, server, permissions, $filter, $interval, $sce) {

    $scope.lessonId = $stateParams["lessonId"];
	$scope.courseId = $stateParams["courseId"];
	permissions.getRole($scope.courseId);
	$scope.rightActive = true;
    $scope.lesson={};
    $scope.lesson.resourceLinks=[];
    $scope.trustedVideoUrls={};
    console.log($scope.lesson.resourceLinks.length);
    console.log($scope.lesson.resourceLinks);
    $scope.celebrationEvents=[];
    console.log($scope.celebrationEvents.length);
    console.log($scope.celebrationEvents);

    $rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.activeMeeting });
    $scope.checkLessonStatus = function () {
        var data = {};
        data.lessonid = $scope.lessonId;
        server.requestPhp(data, "GetLessonById").then(function (data) {
            $scope.lesson = data.lesson;
			getCelebrationEvents();

			$scope.displayYoutubeVideo();
        });
    };
	//set iframe to display an embedded yooutube video if necessary
	$scope.displayYoutubeVideo = function(){
		if(!$scope.lesson.resourceLinks||!$scope.lesson.resourceLinks.length)
			return;
		$scope.trustedVideoUrls = [];
		for(var i=0; i<$scope.lesson.resourceLinks.length; i++)
		{
			var videoLink = $scope.lesson.resourceLinks[i].link;
			if(videoLink.indexOf("youtube")!=-1)
			{
				var videoId = videoLink.substr(videoLink.indexOf("v=") + 2, 11)
				var embedLink = "https://www.youtube.com/embed/" + videoId;
				$scope.trustedVideoUrls.push($sce.trustAsResourceUrl(embedLink));
			}
		}
		$scope.updateBoxSizes();
	};
    //check the lesson status 
    $scope.checkLessonStatus();
	
	$scope.studentStatuses = [
		{'statusid':0, 'title':'comingText'},
		{'statusid':1, 'title':'lateText'},
		{'statusid':2, 'title':'notComingText'},
		{'statusid':3, 'title':'didNotCheckin'}
	];
	
	$scope.students=[];
    /**
     * fetches the up to date attendance status of the students expected to attend the meeting
     */
    function getStudentsAttendanceStatus() {
        var data = {};
        data.lessonid = $scope.lessonId;
        server.requestPhp(data, "GetStudentsAttendance").then(function (data) {
            $scope.students = data;
            //console.log(data);
        });
    }
    
    /**
     * goes to the profile page of a student by their id
     * student id - the unique id of the student
     */
    $scope.goToStudentProfile = function (userid)
	{
		 $state.transitionTo('userProfile', {userId: userid});
	};

    $scope.madrichCheckout = function () {
		//TODO - fix hardcoding of enrollmentroleid
		if($rootScope.role!=2)
			return;
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
    	data.courseid = $scope.courseId;
    	data.type = "post";
		server.requestPhp(data, "GetCelebrationEvents").then(function(data) {
			$scope.celebrationEvents = data;
		});
    }
   
    $scope.getLangCode= function()
    {
    	if($rootScope.isArabic)
    		return "ar";
    	else
    		return "he";
    };

    $scope.madrichConfirmCheckout = function () {
		var data = {};
		data.lessonid = $scope.lessonId;
		if($scope.waitingForServerResponse)
			return;
		$scope.waitingForServerResponse = true;
		server.requestPhp(data, "closeMeeting").then(function (data) {
			$interval.cancel(checkPresenceStudent);
			$state.transitionTo('syllabus', { lessonId: $scope.lessonId, courseId: $scope.courseId});
			$scope.waitingForServerResponse = false;
        });
    };

    $scope.closePopup = function () {
        $scope.confirmCheckout = false;
    };
	
	$scope.getLessonStatusByIdServer = function() {
		if ($scope.meetingClosed) {
			$interval.cancel(checkLessonStatusInterval);
		} else {
			var data = {};
			data.lessonid = $scope.lessonId;
			server.requestPhp(data, "GetLessonStatusById").then(function(data) {
				if (data.status)
				{
					$scope.meetingClosed = true;
				}
			});
		}
	};
	
	$scope.studentCheckout = function() {
		if(!$scope.meetingClosed)
			return;
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetUserFlowPosInCourse").then(function(data) {
			var attendance = data.lastlesson.checkoutProgress.attendanceStatus;
			//if the student hasn't attended
			if(attendance == 2 || attendance == 3)
			{
				$state.transitionTo('singleCourse', {courseId: $scope.courseId});
			}
			//if they have attended
			else
			{
				$state.transitionTo('studentFeedback', {lessonId: $scope.lessonId, courseId: $scope.courseId});
			}
		});
	};

	var checkLessonStatusInterval;
	checkLessonStatusInterval = $interval($scope.getLessonStatusByIdServer, 5000);
	$scope.$on('$destroy', function() {
		$interval.cancel(checkLessonStatusInterval);
	});
	//called on click on a box header. Identifies the coressponding box content, and slides it up/down.
	$scope.toggleBoxSlide = function (e){
		var correspondingBox = $($(e.target).parent()[0]);
		var boxContent = $(correspondingBox.find(".box-content")[0]);
		if(!correspondingBox.hasClass("box-expanded"))
		{
			$(boxContent).height(0).height(boxContent[0].scrollHeight);
		}
		else
		{
			$(boxContent).height(0);
		}
		correspondingBox.toggleClass("box-expanded");
	};
	$scope.updateBoxSizes = function () {
		$timeout(function () {
			var boxes = $.find(".box-expanded");
			for (var i = 0; i < boxes.length; i++) {
				var box = boxes[i];
				var boxContent = $($(box).find(".box-content")[0]);
				//$(boxContent).height(0).height(boxContent[0].scrollHeight);
			}
		}, 100);
	};

	$scope.getStudentCountByStatusId = function (statusId) {
		var count = 0;
		for (var i=0; i < $scope.students.length; i++) {
			if (parseInt($scope.students[i].attendanceStatus) === statusId) {
				count++;
			}
		}
		return count;
	};
} ]);
