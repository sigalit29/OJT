
/* Directive */
/*
Attributes:
fileName - default name of the file. Can change it at time of save.
getData - name of function that makes data for export (requests data from the server, if needed, and transforms it). The function is required to return a promise in the the format: array of objects.
paramObj - optional parameter - can add parameters for getData function. For example, on singleCourse page it can export for student or a teacher roles, so param-obj = "{'param1':  role}" - adds a role to the directive.
makeHeader - optional parameter, by default is true. This attribute explains how to make a header for Excel files: true - take keys from the first object of the data array and using it as a header.
*/
apple.directive('excelExport', function () {
	return {
		restrict: 'A',
		scope: {
			fileName: "@",
			getData: "=",
			paramObj: "&?",
			makeHeader: "@" 
		},
		replace: true,
		template: '<button type = "button" class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="updateData();">יצוא ל- Excel <i class="fa fa-download"></i></button>',
		link:
			function (scope,elements, attrs) {
				scope.data = [];
				if(!scope.makeHeader)
				{
					scope.makeHeader="true";
				}
				
				scope.updateData = function () {
					var dataObj = [];
					scope.getData(scope.paramObj?scope.paramObj():{}).then(function(res){
						dataObj=res;
						if (dataObj.length>0){
								alasql("SELECT * INTO XLSX(\"" + scope.fileName + ".xlsx\"" + ",{headers:"+scope.makeHeader+"}) FROM ?", [dataObj]);							
						}
					});
				};
				
			}
	};
}
);
