apple.controller('setting', ['$scope', '$stateParams', '$rootScope', '$state', function ($scope, $stateParams, $rootScope, $state) {
	$rootScope.$broadcast('setHeaderTitle', {title: $rootScope.dictionary.preferences});
   
	$scope.changeLanguage = function () {
		$rootScope.isArabic = !$rootScope.isArabic;
		if ($rootScope.isArabic == true) {
			//save the lang in localStorage
			localStorage.setItem('lang', 'arabic')
			$rootScope.dictionary = arabic;
		}
		else {
			//save the lang in localStorage
			localStorage.setItem('lang', 'hebrew')
			$rootScope.dictionary = hebrew;
		}
		$state.transitionTo('courses');
	};
} ]);