apple.directive('searchSelector', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/searchSelector/searchSelector.html',
		scope: {
			onSearch: '=onSearch',
			onSelect: '=onSelect',
			valueIndex: '=valueIndex',
			textIndex: '=textIndex',
			resultsArrIndex: "=resultsArrIndex",
			searchPlaceholder: "=searchPlaceholder",
			selected: "=selected"
		},
		link: function (scope, elem, attrs) {
			scope.results=[];
			scope.search="";
			scope.pageIndex=0;
			scope.pageCount=0;
			scope.$watch('selected', function(newVal, oldVal) {
			}, true);
			var onSuccess = function (searchResults)
			{
				scope.results=searchResults[scope.resultsArrIndex];
				scope.pageCount=searchResults['pages'];
			}
			scope.refreshResults = function ()
			{
				scope.onSearch(scope.search, scope.pageIndex, onSuccess);
			}
			scope.refreshResults();
			scope.goToPage = function(pageNum)
			{
				if(pageNum>=0&&pageNum<=scope.pageCount)
				{
					scope.pageIndex=pageNum;
					scope.refreshResults();
				}
			}
			scope.refreshSearch = function()
			{
				scope.pageIndex=0;
				scope.refreshResults();
			}
			scope.preventSubmit = function(e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
	};
} ]);