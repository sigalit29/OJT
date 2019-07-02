apple.directive('multiSelector', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/multiSelector/multiSelector.html',
		scope: {
			disable: '=disable',
			options: '=options',
			valueIndex: '=valueIndex',
			textIndex: '=textIndex',
			values: '=values',
		},
		link: function (scope, elem, attrs) {
			scope.$watch('disable', function(newVal, oldVal) {
			}, true);
			scope.$watch('values', function(newVal, oldVal) {
			}, true);
			scope.$watch('options', function(newVal, oldVal) {
			}, true);
			scope.openSelector = function()
			{
				if(!scope.disable)
				{
					scope.showOptions=true;
				}
			};
			scope.addItem = function(itemId)
			{
				if(scope.values.indexOf(itemId)==-1)
				{
					scope.values.push(itemId);
				}
			};
			scope.removeItem = function(itemId)
			{
				if(scope.values.indexOf(itemId)!=-1)
				{
					scope.values.splice(scope.values.indexOf(itemId), 1);
				}
			}
			scope.filterSelected = function(item)
			{
				if(scope.values&&scope.values.indexOf(item[scope.valueIndex])!=-1)
				{
					return true;
				}
				return false;
			};
			scope.filterUnselected = function(item)
			{
				return !scope.filterSelected(item);
			};
		}
	};
} ]);