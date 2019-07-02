apple.directive('customField', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/customField/customField.html',
		scope: {
			value: '=value',
			fieldType: '=fieldType',
			params: '=params',
			onChange: '=onChange',
			userId: '=userId',
			enrollmentId: '=enrollmentId',
			fieldId: '=fieldId'
		},
		link: function (scope, elem, attrs) {
			scope.$watch('value', function(newVal, oldVal) {
			}, true);
			if(scope.params)
			{
				scope.options=JSON.parse(scope.params);
			}
			else
				scope.options=[];
			if(scope.fieldType=="INT")
				scope.value=parseInt(scope.value);
			if(scope.fieldType=="FLOAT")
				scope.value=parseFloat(scope.value);
			if(scope.fieldType=="DATE"&&scope.value)
			{
				var dateParts = scope.value.split("/");
				scope.value=new Date(dateParts[0], dateParts[1]-1, dateParts[2]);
			}
		}
	};
} ]);