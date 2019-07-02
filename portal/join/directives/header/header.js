apple.directive('header', ['$state', '$stateParams', '$rootScope', '$http', 'userService', function ($state,$stateParams, $rootScope,$http, userService) {
	return {
		restrict: 'E',
		templateUrl: './directives/header/header.html',
		link: function (scope, el, attrs) {
			scope.openMainMenu=true;
			scope.openAdminMenu=true;
			scope.logout = function(){
				userService.logout();
			}
		},
		replace: true
	};
} ]);

