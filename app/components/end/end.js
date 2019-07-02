apple.controller('end', ['$scope', '$stateParams', '$rootScope', '$state', 'server', 'permissions', '$interval',
function ($scope, $stateParams, $rootScope, $state, server, permissions, $interval) {
$scope.courseId = $stateParams["courseId"];
$scope.lessonId = $stateParams["lessonId"];
permissions.getRole($scope.courseId);
//Yaniv: added header title setting
	$rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.subjectFeedbackText });
	
	$scope.backSingleCourse = function(){
		$state.transitionTo('singleCourse', {courseId: $scope.courseId});
	};

	//transition to dashboard (statistics) screen
	$scope.goToMadrichDashboard = function() {
		$state.transitionTo('teacherDashboard', {
			courseId : $scope.courseId
		});
	};
	
	//get the percentage of attending students who have given feedback;
	getUserLessonStatus = function(){
		var data = {};
		data.lessonid = $scope.lessonId;
		server.requestPhp(data, "GetLessonFeedbackRate").then(function(data) {
			$scope.feedbackProgress = data;
			if($scope.feedbackProgress == 1)
				$interval.cancel(checkFeedbackProgress);
		});
	}
	//fetch feedback progress
	getUserLessonStatus();
	//and continue to get the up to date progress every five seconds
	var checkFeedbackProgress=$interval(getUserLessonStatus, 5000);
	
	//when the user navigates away, stop receiving updates about the feedback progress
	$scope.$on('$destroy', function() {
		$interval.cancel(checkFeedbackProgress);
	});
} ]);

