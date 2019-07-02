apple.directive('popup', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/popup/popup.html',
		transclude: true,
		scope: {
			visibility: '=visibility'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('visibility', function(newVal, oldVal) {
			}, true);
			scope.openPopup = function()
			{
				scope.visibility=true;
			};
			scope.closePopup = function()
			{
				scope.visibility=false;
			}
		}
	};
} ]);