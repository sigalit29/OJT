apple.directive('sidebar', ['$rootScope', '$timeout', '$state', 'server', 'login',
function($rootScope, $timeout, $state, server, login) {
	return {
		restrict : 'E',
		templateUrl : './directives/sidebar/sidebar.html',
		link : function(scope, el, attrs) {
			$rootScope.isOpen = false;
			scope.profileClick = function() {
				$rootScope.isOpen = false;
				$state.transitionTo('userProfile', {
					userId : $rootScope.me.userid
				});
			};
			scope.closeSidebar = function() {
				$rootScope.isOpen = false;
			};
			scope.goToCoursesPage = function() {
				$rootScope.isOpen = false;
				$state.transitionTo('courses');
			};

			scope.goToSettingPage = function() {
				$rootScope.isOpen = false;
				$state.transitionTo('setting');
			};
			scope.logout = function() {
				$rootScope.isOpen = false;
				var data = {};
				server.requestPhp(data, "logoutApi").then(function(data) {
					login.logout().then(function() {
						$state.transitionTo("login");
					});
				});
			};
		},
		replace : true
	};

}]);
