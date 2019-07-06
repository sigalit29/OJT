apple.directive('header', ['$rootScope', '$timeout', '$state',
function($rootScope, $timeout, $state) {
	return {
		restrict : 'E',
		templateUrl : './directives/header/header.html',
		link : function(scope, el, attrs) {
			scope.headerTitle = "";
			$rootScope.$on('setHeaderTitle', function(event, data) {
				scope.headerTitle = data.title;
			});

			scope.backCreateCourse = function() {
				$timeout(function() {
					$rootScope.showPopuplesson = false;
				}, 0);
			};

			scope.editClick = function() {
				$rootScope.$broadcast('editClick');
			};

			scope.nextClick = function() {
				if ($state.is('syllabus') || $state.is('attendanceApproval') || $state.is('studentFeedback')) {
					$rootScope.$broadcast('nextButton');
				}
			};
		},
		replace : true
	};
}]);

