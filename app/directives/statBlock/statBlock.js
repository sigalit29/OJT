apple.directive('statBlock', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/statBlock/statBlock.html',
		scope: {
			title: '=',
			onMoreClick: '=',
			val1: '=',
			label1: '=',
			val2: '=',
			label2: '=',
			preposition: '=',
			icon: '=',
			commentary: '='
		},
		link: function (scope, el, attrs) {
		}
	};

} ]);