apple.directive('pageNavigator', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/pageNavigator/pageNavigator.html',
		scope: {
			pageCount: '=pageCount',
			pageIndex: '=pageIndex',
			loading: '=loading',
			goToPage: '=goToPage',
			data: '=data'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('pageCount', function(newVal, oldVal) {
			}, true);
			scope.$watch('pageIndex', function(newVal, oldVal) {
			}, true);
			scope.$watch('loading', function(newVal, oldVal) {
			}, true);
			scope.nextPage = function()
			{
				if(scope.pageIndex<scope.pageCount)
				{
					scope.goToPage(scope.pageIndex+1, scope.data);
				}
			};
			scope.prevPage = function()
			{
				if(scope.pageIndex>0)
				{
					scope.goToPage(scope.pageIndex-1, scope.data);
				}
			}
		}
	};
} ]);