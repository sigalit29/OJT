apple.directive('selectableStat', ['$rootScope', '$timeout', '$state', function ($rootScope, $timeout, $state) {
	return {
		restrict: 'E',
		templateUrl: './directives/selectableStat/selectableStat.html',
		scope: {
			stat: '=',
			selected: '=',
			onSelection: '='
		},
		link: function (scope, el, attrs) {
			scope.$watch('selected', function(newVal, oldVal) {
			}, true);
			scope.toggleSelection=function(){
				if(scope.selected.indexOf(scope.stat)==-1)
				{
					scope.selected.push(scope.stat);
				}
				else
				{
					scope.selected.splice(scope.selected.indexOf(scope.stat), 1);
				}
				scope.onSelection();
			}
		}
	};

} ]);