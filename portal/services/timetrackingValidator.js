apple.factory('timetrackingValidator', [function () {
       self={}; 
       self.requestPhp = function (editedRows, contextRows) {
			// variable that remains true as long as no reports have been auto
			// formatted
			var wasFormatted = true;
			var validHours = true;
			var validFinishHour = true;
			var noInterstion = true;
			var containsProject = true;
			var containsSubject = true;
			// a list of all the report rows that have to be verified, i.e. not
			// already accepted or requiring the addition of some report subject
			var checkingList = [];
			for (var i = 0; i < $scope.reports.length; i++) {
				if ($scope.reports[i].status=='')
					checkingList.push($scope.reports[i]);
				else
					{
					//console.log("important "+$scope.reports[i].status)
					}
			}
			// check that the hours are correctly identified as time values
			for (var i = 0; i < checkingList.length; i++) {
				var report = checkingList[i];
				if(report.automatic==0)
				{
					report.hoursvalid = true;
					report.finishhourvalid=true;
					report.starthourvalid=true;
					report.noInterstion=true;
					report.isSetProject=true;
					report.isSetSubject=true;
					var t1 = moment(report.finishhour, "hh:mm");
					var t2 = moment(report.starthour, "hh:mm");
					var t3 = moment.utc(moment(t1, "HH:mm").diff(moment(t2, "HH:mm"))).format("HH:mm");
					if (t3 == 'Invalid date') {
						report.hoursvalid = false;
						validHours = false;
					}
				}
			}
			if (!validHours) {
				alert("ודאו שכל השעות שדווחו בפורמט תקין");
				return false;
			}
			// check that the record has a defined project
			for (var i = 0; i < checkingList.length; i++) {
				var report = checkingList[i];
				if(!report.projectid)
				{
					containsProject = false;
					report.isSetProject=false;
				}
			}
			if (!containsProject) {
				alert("לחלק מהרשומות לא מוגדר פרוייקט");
				return false;
			}
			// check that the record has a defined report subject
			for (var i = 0; i < checkingList.length; i++) {
				var report = checkingList[i];	
				if(!report.actionid)
				{
					report.isSetSubject=false;
					containsSubject = false;
				}
			}
			if (!containsSubject) {
				alert("לחלק מהרשומות לא מוגדר נושא דיווח");
				return false;
			}
			// check that finish hours is after beginning hour
			for (var i = 0; i < checkingList.length; i++) {
				var report = checkingList[i];
				if(report.automatic==0)
				{
				var t1 = moment(report.finishhour, "hh:mm");
				var t2 = moment(report.starthour, "hh:mm");
				var t3 = moment.utc(moment(t1, "HH:mm").diff(moment(t2, "HH:mm"))).format("HH:mm");
				if (t1-t2<=0)
				{
					report.finishhourvalid=false;
					validFinishHour = false;
				}
				}
			}
			if (!validFinishHour) {
				alert("חלק מהרשומות מכילות נתונים לא תקינים. ודאו ששעת סיום העבודה לאחר שעת תחילת העבודה.");
				return false;
			}
			// check that hours are formatted correctly
			for (var i = 0; i < checkingList.length; i++) {
				var report = checkingList[i];
				if(report.automatic==0)
				{
					var t1 = report.finishhour;
					var t2 = report.starthour;
					//formatted time
					var ft1 = moment(report.finishhour, ["HH:mm", "HHmm"]).format("HH:mm");
					var ft2 = moment(report.starthour, ["HH:mm", "HHmm"]).format("HH:mm");
				if (report.starthour != ft2) {
					report.starthour = ft2;
					report.copyreport.starthour = ft2;
					report.starthourvalid=false;
					wasFormatted = false;
				}
				if (report.finishhour != ft1 ) {
					report.finishhour = ft1;
					report.copyreport.finishhour = ft1;
					report.finishhourvalid=false;
					wasFormatted = false;
				}
				}
			}
			if (!wasFormatted) {
				alert("השעות שהזנת באמצעות המקלדת פורמטו אוטומטית.\nלחץ על OK, בדוק שהשעות מדויקות ואז שמור מחדש.");
				return false;
			}
			// check that hours don't intersect
			for (var i = 0; i < checkingList.length; i++) {
				var report1 = checkingList[i];
				var t1 = moment(report1.finishhour, "hh:mm");
				var t2 = moment(report1.starthour, "hh:mm");
				for (var j = 0; j < checkingList.length; j++) {
					if(j!=i)
					{
						var report2 = checkingList[j];
						if (report2.date==report1.date)
						{
							var t3 = moment(report2.starthour, "hh:mm");
							if (t3>=t2&&t3<t1)
							{
								//console.log(i+", "+j);
								report2.notIntersecting = false;
								report1.notIntersecting = false;
								noInterstion=false;
							}
						}
					}
				}
			}
			if (!noInterstion) {
				alert("לא ניתן לדווח על מספר פעילויות בשעות חופפות");
				return false;
			}
			return true;
        }
        return self;
}]);