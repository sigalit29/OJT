apple.controller('singleCourse', ['$window', '$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', 'permissions', '$interval',
function($window, $scope, $stateParams, $rootScope, $state, $timeout, server, permissions, $interval){
	//whether the "complete checkout" banner be visible
	$scope.showGradeLabel = false;
	//sets the header title to "loading" - until the correct title is fetched from the server
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.loading});
	//the id of the course, taken from a url embedded parameter
	$scope.courseId = $stateParams["courseId"];
	//data about the course (e.g. name, instructor)
	$scope.courseData = {};
	//the status of the current user in the course, in relation to the state of the last and next meetings
	$scope.flowState = {};
	//update the permissions to match the current course context
	permissions.getRole($scope.courseId);
	
	//populates the course object with relevant data
	getCourseData = function ()
	{
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetCourseDataById").then(function(data) {
			if(!data)
				return;
			$scope.courseData = data;
			//sets the header text to the course name in the appropriate language
			$rootScope.$broadcast('setHeaderTitle', {
				title : $rootScope.isArabic ? $scope.courseData.subnameinarabic : $scope.courseData.subname
			})
		});
	}
	//checks the user status in the course
	getUserLessonStatus = function() {
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetUserFlowPosInCourse").then(function(data) {
			$scope.flowState = data;
			updateCheckoutBannerVisibility();
		});
	}
	$scope.statBlocks=[];
	//for students - checks for relevant statistics to display
	getStatBlocks = function() {
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetMyStatNotifications").then(function(data) {
			$scope.statBlocks = data;
			$scope.statLangCode = $rootScope.isArabic?"ar":"he";
		});
	}
	getStatBlocks();
	function updateCheckoutBannerVisibility ()
	{
		//if a lesson exists for this course, and it was closed
		if($scope.flowState && $scope.flowState.lastlesson && $scope.flowState.lastlesson.closed) {
			//for students 
			//TODO - fix hardcoding of enrollmentroleid
			if($rootScope.role == 1){
				//if the last meeting was attended by the student
				if($scope.flowState.lastlesson.checkoutProgress.attendanceStatus != 2 && $scope.flowState.lastlesson.checkoutProgress.attendanceStatus != 3 && $scope.flowState.lastlesson.checkoutProgress.attendanceStatus != null) {
					//then if the student hasn't completed either steps of their checkout
					if(!$scope.flowState.lastlesson.checkoutProgress.gaveSubjectsFeedback || !$scope.flowState.lastlesson.checkoutProgress.gaveGeneralFeedback) {
						//show them the banner
						$scope.showGradeLabel = true;
					} else {
						//if all steps were completed don't show them the banner
						$scope.showGradeLabel = false;
					}
				}
				else {
					//if the user wasn't present don't show them the banner
					$scope.showGradeLabel = false;
				}
			}
			//for instructors
			//TODO - fix hardcoding of enrollmentroleid
			else if($rootScope.role == 2)
			{
				//if the instructor has either not provided feedback, approved attendance, or approved syllabus progress
				if(!$scope.flowState.lastlesson.checkoutProgress.gaveFeedback || !$scope.flowState.lastlesson.checkoutProgress.approvedAttendance || !$scope.flowState.lastlesson.checkoutProgress.updatedSyllabusProgress)
				{
					//show them the banner
					$scope.showGradeLabel = true;
				}
				else
					{
					//if all steps were completed don't show them the banner
					$scope.showGradeLabel = false;
					}
			}
			//for any other case (unrecognized role) default to false
			else {
				$scope.showGradeLabel = false;
			}
		}
		//if no lessons exist default to false
		else {
			$scope.showGradeLabel = false;
		}
	}
	
	//get general course data (name, ode, etc.)
	getCourseData();
	//get current course state in relation to the user (is there an open meeting? did the student attend? etc.) - timeout is to ensure DOM refresh.
	getUserLessonStatus();
	//and continue to get the up to date course state every five seconds
	var checkUserLessonStatusInterval=$interval(getUserLessonStatus, 5000);
	
	//when the user navigates away, stop receiving updates about the course status.
	$scope.$on('$destroy', function() {
		$interval.cancel(checkUserLessonStatusInterval);
	});
	//transition to lesson creation page
	$scope.goToCreateLesson = function() {
		$state.transitionTo('createLesson', {
			courseId : $scope.courseId,
			lessonId : ''
		});
	};
	
	//transition to the "next lesson" page
	$scope.goToNextLesson = function() {
		$state.transitionTo('nextLesson', {
			lessonId : $scope.flowState.nextlesson,
			courseId : $scope.courseId
		});
	};
	
	//transition to the current meeting
	$scope.goToCurrentLesson = function() {
		//TODO - fix hardcoding of enrollmentroleid
		if ($rootScope.role == 2)
		{
			$state.transitionTo('activeLesson', {
				lessonId : $scope.courseData.lesson.lessonid
			});
		}
		else
		{
			$state.transitionTo('activeLesson', {
				lessonId : $scope.courseData.lesson.lessonid
			});
		}
	};
	
	//transition to mentoring session creation page
	$scope.goToCreateMentoringSession = function() {
		$state.transitionTo('mentoringSession', {
			courseId : $scope.courseId
		});
	};
	
	//transition to the lesson history screen
	$scope.goToLessonHistory = function() {
		$state.transitionTo('lessonHistory', {
			courseId : $scope.courseId,
		});
	};
	//transition to the syllabus dashboard (subjects/progress) screen
	$scope.goToSyllabusDashboard = function() {
		$state.transitionTo('syllabusDashboard', {
			courseid : $scope.courseId,
		});
	};
	//transition to dashboard (meeting/course statistics) screen
	$scope.goToMadrichDashboard = function() {
		$state.transitionTo('teacherDashboard', {
			courseId : $scope.courseId
		});
	};
	//transition to my classroom (student statistics) screen
	$scope.goToMyClassroom = function() {
		$state.transitionTo('myClassroom', {
			courseId : $scope.courseId
		});
	};

	$scope.goToCurrMeetingFlow = function() {
		//for students
		//TODO - fix hardcoding of enrollmentroleid
		if($rootScope.role == 1)
		{
			//if the meeting wasn't even closed yet
			if(!$scope.flowState.lastlesson.closed)
			{
				if($scope.flowState.lastlesson.checkoutProgress.attendanceStatus == null)
				{
					$state.transitionTo('attendanceReporting', {
						lessonId : $scope.flowState.lastlesson.lessonid,
						courseId : $scope.courseId
					});
					return;
				}
				else
				{
					$state.transitionTo('activeLesson', {
						lessonId : $scope.flowState.lastlesson.lessonid,
						courseId : $scope.courseId
					});
					return;
				}
			}
			//if the last meeting was attended by the student
			if($scope.flowState.lastlesson.checkoutProgress.attendanceStatus != 2 && $scope.flowState.lastlesson.checkoutProgress.attendanceStatus != 3 && $scope.flowState.lastlesson.checkoutProgress.attendanceStatus != null) {
				//if the student hasn't given their general feedback on the meeting
				if(!$scope.flowState.lastlesson.checkoutProgress.gaveGeneralFeedback) {
					//go to the meeting rating page
					$state.transitionTo('studentFeedback', {
						lessonId : $scope.flowState.lastlesson.lessonid,
						courseId : $stateParams["courseId"]
					});
					return;
				}
				//otherwise, if the student hasn't given their subject-specific feedback for the meeting
				else if(!$scope.flowState.lastlesson.checkoutProgress.gaveSubjectsFeedback){
					//go to the subjects rating page
					$state.transitionTo('subjectFeedback', {
						lessonId : $scope.flowState.lastlesson.lessonid,
						courseId : $stateParams["courseId"]
					});
					return;
				}
				//if the entire checkout process was completed, do nothing
				return;
			}
			else
			{
			//if the entire student wasn't present, do nothing
			return;
			}
		}
		//for instructors
		//TODO - fix hardcoding of enrollmentroleid
		else if($rootScope.role == 2)
		{
			//if the meeting wasn't even closed yet
			if(!$scope.flowState.lastlesson.closed)
			{
				$state.transitionTo('activeLesson', {
					lessonId : $scope.flowState.lastlesson.lessonid,
					courseId : $scope.courseId
				});
				return;
			}
			//if the instructor has not approved syllabus progress
			else if (!$scope.flowState.lastlesson.checkoutProgress.updatedSyllabusProgress)
			{
				$state.transitionTo('syllabus', {
					lessonId : $scope.flowState.lastlesson.lessonid,
					courseId : $scope.courseId
				});
				return;
			}
			//if the instructor has not approved attendance for the meeting
			else if (!$scope.flowState.lastlesson.checkoutProgress.approvedAttendance)
			{
			$state.transitionTo('attendanceApproval', {
				lessonId : $scope.flowState.lastlesson.lessonid,
				courseId : $scope.courseId
			});
			return;
			}
			//if the instructor has not provided their feedback about the meeting
			else if(!$scope.flowState.lastlesson.checkoutProgress.gaveFeedback)
			{
				$state.transitionTo('teacherFeedback', {
					lessonId : $scope.flowState.lastlesson.lessonid,
					courseId : $scope.courseId
				});
				return;
			}
			//if the entire checkout process was completed, do nothing
			return;
		}
	};
}]);

