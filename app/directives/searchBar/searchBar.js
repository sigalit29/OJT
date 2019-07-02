apple.directive('searchBar', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/searchBar/searchBar.html',
		scope: {
			onSearch: '=onSearch',
			placeholder: '=placeholder',
			autofocus: '=autofocus'
		},
		link: function (scope, elem, attrs) {
			scope.search="";
		}
	};
} ]);