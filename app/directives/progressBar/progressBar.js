apple.directive('progressBar', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/progressBar/progressBar.html',
		scope: {
			percentage: '=percentage'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('percentage', function(newVal, oldVal) {
			}, true);
		}
	};
} ]);