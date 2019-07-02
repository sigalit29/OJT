apple.directive('dateInputBoxes', [function () {
	return {
		restrict: 'E',
		templateUrl: './directives/dateInputBoxes/dateInputBoxes.html',
		scope: {
			required: '=required',
			min: '=min',
			max: '=max',
			dateModel: '=dateModel',
			placeholderYear: '=placeholderYear',
			placeholderMonth: '=placeholderMonth',
			placeholderDay: '=placeholderDay',
		},
		link: function (scope, elem, attrs) {
			scope.$watch('dateModel', function(newVal, oldVal) {
			}, true);
			scope.years=[];
			scope.selectedYear=null;
			scope.selectedMonth=null;
			scope.selectedDay=null;
			var monthLength=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			for(var i=scope.max; i>=scope.min; i--)
			{
				var currYear ={"year":i, "months":[]};
				for(var j=0; j<12; j++)
				{
					var currMonth ={"month":j+1, "days":[]};
					for(var k=0; k<monthLength[j]; k++)
					{
						currMonth.days.push(k+1);
					}
					//leap year
					if(j==1&&i%4==0&&(i%100!=0||i%400==0))
					{
						currMonth.days.push(29);
					}
					currYear.months.push(currMonth);
				}
				scope.years.push(currYear);
			}
			
			scope.updateDate=function()
			{
				if(scope.selectedYear && scope.selectedYear.year && scope.selectedMonth && scope.selectedMonth.month && scope.selectedDay)
					scope.dateModel.date = scope.selectedYear.year+"-"+scope.selectedMonth.month+"-"+scope.selectedDay;
			};
		}
	};
} ]);