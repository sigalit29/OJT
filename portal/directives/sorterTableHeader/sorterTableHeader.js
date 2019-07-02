apple.directive('sorterTableHeader', [function () {
	return {
		restrict: 'A',
		templateUrl: './directives/sorterTableHeader/sorterTableHeader.html',
		scope: {
			fieldText: '=fieldText',
			fieldIndex: '=fieldIndex',
			sortingField: '=sortingField',
			reverseOrder: '=reverseOrder',
			sortByField: '=sortByField',
		},
		link: function (scope, elem, attrs) {
			scope.$watch('reverseOrder', function(newVal, oldVal) {
			}, true);
			scope.$watch('sortingField', function(newVal, oldVal) {
			}, true);
			scope.sortByThisField = function()
			{
				if (scope.fieldIndex!=undefined)
				{
					scope.sortByField(scope.fieldIndex);
					console.log("sorted by "+scope.fieldIndex);
				}
			};
		}
	};
} ]);