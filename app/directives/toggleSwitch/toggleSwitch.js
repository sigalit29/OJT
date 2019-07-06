apple.directive('toggleSwitch', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/toggleSwitch/toggleSwitch.html',
		scope: {
			model: '=model',
			checkedLabel: '=checkedLabel',
			uncheckedLabel: '=uncheckedLabel',
			onChange: '=onChange',
			onChangeParams: '=onChangeParams'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('model', function(newVal, oldVal) {
			}, true);
		}
	};
} ]);