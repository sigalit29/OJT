apple.directive('menu', ['$rootScope', '$timeout', '$state', '$stateParams',
function($rootScope, $timeout, $state, $stateParams) {
	return {
		restrict : 'E',
		templateUrl : './directives/menu/menu.html',
		link : function(scope, el, attrs) {
			scope.$state = $state;
			scope.backClick = function() {
				if ($state.is('userProfile')) {
					//back in page that has inner page
					$rootScope.$broadcast('hideInnerPage');
				} else if ($state.is('singleCourse')) {
					$state.transitionTo('courses');
				} else if ($state.is('attendanceApproval')) {
					$state.transitionTo('syllabus', {
						courseId : $stateParams["courseId"],
						lessonId : $stateParams["lessonId"]
					});
				} else if ($state.is('syllabus')) {
					$state.transitionTo('singleCourse', {
						courseId : $stateParams.courseId
					});
				} else if ($state.is('teacherDashboard')) {
					$state.transitionTo('singleCourse', {
						courseId : $stateParams.courseId
					});
				}
				else if ($state.is('myClassroom')) {
					$state.transitionTo('singleCourse', {
						courseId : $stateParams.courseId
					});
				} else if ($state.is('studentSignup')) {
				    $rootScope.$broadcast('backButton');
				} else {
					window.history.back();
				}

			};
			scope.toggleMenu = function() {
				$rootScope.isOpen = true;
			};
		},
		replace : true
	};

}]);
