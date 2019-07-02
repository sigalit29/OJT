apple.controller('checkreport', ['$rootScope', '$scope', '$state', '$http','userService', '$q', 'Upload', 'server', function ($rootScope, $scope, $state, $http,userService,  $q, Upload, server) {

    // Updating the state name for the navbar to highlight the active page
    $rootScope.stateName = "checkreport";
    //$scope.choosecheckbox = true;
    $scope.editing = false;
    $scope.test={a:{}};
    $scope.allreporters = [];
    $scope.months={"1":"ינואר","2":"פברואר","3":"מרץ","4":"אפריל","5":"מאי","6":"יוני","7":"יולי","8":"אוגוסט","9":"ספטמבר","10":"אוקטובר","11":"נובמבר","12":"דצמבר"};
    $scope.year = "";
    $scope.month = "";
    $scope.pageIndex=0;
    var usefulReporters = [];
    const rowsPerPage = 15;
    var pagenmb = 0;

    $scope.orderByDate = false;

    //a copy of the report row currenty edited before the edit, for restoration if the edit is cancelled
    var beforeEdit = {};

    $scope.GetCurrentDate = function()
    {
        //console.log("GetCurrentDate");
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        $scope.year = yyyy;
        $scope.month = $scope.months[mm];
        $scope.monthindex = mm;
    }

    $scope.GetCurrentDate();

    $scope.GetReports = function () {
        $scope.loading=true;
        usefulReporters = [];
        var data={'month': $scope.monthindex, 'year': $scope.year};
        server.requestPhp(data, 'GetAllReporters').then(function (data) {
            for(var i=0;i<data.length; i++)
            {
                if(data[i].reports.length>0||data[i].status==1)
                {
                    usefulReporters.push(data[i]);
                }
            }
            
            usefulReporters.sort(function(a, b){
                var x = a.firstname;
                var y = b.firstname;
                if (x < y) {return -1;}
                if (x > y) {return 1;}
                return 0;
              });
              
            var searchedReporters = usefulReporters;
            if($scope.search)
            {
                searchedReporters = usefulReporters.filter(searchNames);
            }
            // use search string to filter results;
            // if($scope.search)
            // {
            //     data = data.filter(searchNames);
            // }

            //split final results into pages for pagination
            $scope.pageCount = (parseInt((searchedReporters.length-1)/rowsPerPage));
            $scope.allreporters = [];
            for (var i=0; i<rowsPerPage; i++) 
            {
                if(searchedReporters[i])
                {
                $scope.allreporters.push(searchedReporters[i]);
            }
            }
            // $scope.allreporters = data;
            // console.log($scope.allreporters);
            //numberify the carkm and public transportation cost
            for (var i=0; i<$scope.allreporters.length; i++)
            {
                for (var j=0; j<$scope.allreporters[i].reports.length; j++)
                {
                    var report = $scope.allreporters[i].reports[j];
                    report.carkm = parseFloat(report.carkm);
                    report.cost = parseFloat(report.cost);
                    report.automatic = parseFloat(report.automatic);
                    report.approval = parseFloat(report.approval);
                    report.status2=true;
                    report.missingreportsubject = parseFloat(report.missingreportsubject);
                    if(!report.checkdate)
                    {
                        report.checkdate="לא התרחש שינוי עדיין";
                        // console.log(report.checkdate);
                    }

                    if (report.copyreport)
                    {
                        report.copyreport.carkm = parseFloat(report.copyreport.carkm);
                        report.copyreport.cost = parseFloat(report.copyreport.cost);
                    }
                    $scope.calculateHours($scope.allreporters[i].reports[j]);

                }
                $scope.calculateHoursSummary($scope.allreporters[i]);
            }
            $scope.loading=false;
        });
    }
    $scope.GetReports();

    $scope.goToPage = function(pageNum)
	{
        // pagenmb = pageNum;
        $scope.allreporters = [];
		if(pageNum>=0&&pageNum<=$scope.pageCount)
		{
            $scope.pageIndex=pageNum;
            
            var data = usefulReporters;
            // use search string to filter results;
            if($scope.search)
            {
                data = usefulReporters.filter(searchNames);
            }

            //split final results into pages for pagination
            $scope.pageCount = (parseInt((data.length-1)/rowsPerPage));
            $scope.allreporters = [];
            for (var i=0; i<rowsPerPage; i++) 
            {
                if(data[($scope.pageIndex*rowsPerPage)+i])
                {
                $scope.allreporters.push(data[($scope.pageIndex*rowsPerPage)+i])
            }
            }

            // console.log($scope.allreporters);
            //numberify the carkm and public transportation cost
            for (var i=0; i<$scope.allreporters.length; i++)
            {
                for (var j=0; j<$scope.allreporters[i].reports.length; j++)
                {
                    var report = $scope.allreporters[i].reports[j];
                    report.carkm = parseFloat(report.carkm);
                    report.cost = parseFloat(report.cost);
                    report.automatic = parseFloat(report.automatic);
                    report.approval = parseFloat(report.approval);
                    report.status2=true;
                    report.missingreportsubject = parseFloat(report.missingreportsubject);
                    if(!report.checkdate)
                    {
                        report.checkdate="לא התרחש שינוי עדיין";
                        // console.log(report.checkdate);
                    }

                    if (report.copyreport)
                    {
                        report.copyreport.carkm = parseFloat(report.copyreport.carkm);
                        report.copyreport.cost = parseFloat(report.copyreport.cost);
                    }
                    $scope.calculateHours($scope.allreporters[i].reports[j]);

                }
                $scope.calculateHoursSummary($scope.allreporters[i]);
            }
		}
    }


    
    $scope.refreshResults=function()
	{
		// $state.go('.', {
		// 	// search : $scope.search,
		// 	page: $scope.pageIndex
		// },
		// {
		// 	notify: false
        // });
        // if($scope.search)
            // {
                var data = usefulReporters.filter(searchNames);
            // }

            //split final results into pages for pagination
            $scope.pageCount = (parseInt((data.length-1)/rowsPerPage));
		$scope.goToPage(0);
    }
    
    
    //function used to filter search string on first and last names
    function searchNames(name)
    {
        var inSearch = name.firstname.includes($scope.search) || name.lastname.includes($scope.search)
        return inSearch;

    }

    $scope.goLeft = function()
    {
        $scope.monthindex = $scope.monthindex - 1;
        if($scope.monthindex==0)
        {
            $scope.monthindex = 12;
            $scope.year = $scope.year - 1;
        }
        $scope.month = $scope.months[$scope.monthindex];
        $scope.pageIndex=0;
        $scope.GetReports();
    }

    $scope.goRight = function()
    {
        var tempMonth = $scope.monthindex + 1;
        var tempYear = $scope.year;
        if(tempMonth==13)
        {
            tempMonth = 1;
            tempYear+=1;
        }
        var today = new Date();
        var nextMonth = new Date(tempYear, tempMonth-1, 1);
        if(nextMonth>today)
            return;
        $scope.monthindex = tempMonth;
        $scope.year = tempYear;
        $scope.month = $scope.months[$scope.monthindex];
        $scope.pageIndex=0;
        $scope.GetReports();
    }

    $scope.getReportersProjectNameById = function(reporter, projectid)
    {
        var res = getArrayFieldById(reporter.reportingPerimeter, "projectid", "projectname", projectid);
        return res;
    }
    $scope.getReportersProjectActionsById = function(reporter, projectid)
    {
        var res = getArrayFieldById(reporter.reportingPerimeter, "projectid", "actions", projectid);
        return res;
    }
    $scope.getReportersActionNameById = function(projectActions, subjectreportid)
    {
        return getArrayFieldById(projectActions, "subjectreportid", "actionname", subjectreportid);
    }
    $scope.getReportersProjectCoursesById = function(reporter, projectid)
    {
        var res = getArrayFieldById(reporter.reportingPerimeter, "projectid", "courses", projectid);
        return res;
    }
    $scope.getReportersCourseNameById = function(projectCourses, courseid)
    {
        return getArrayFieldById(projectCourses, "courseid", "name", courseid);
    }

    function getArrayFieldById (arr, idField, targetField, id)
    {
        if(arr==null||id==null)
            return null;
        for (var i=0; i<arr.length; i++)
        {
            if (arr[i][idField]===id)
            {
                return arr[i][targetField];
            }
        }
        return null;
    }

    $scope.resetAction = function (report)
    {
        report.actionid="";
    }
    $scope.resetCourse = function (report)
    {
        report.courseid="";
    }
    $scope.resetEndHour = function (report)
    {
        report.finishhour="";
    }
    $scope.calculateHours = function(report)
    {
        if(report.finishhour && report.starthour){
            var t1 = moment(report.finishhour, "hh:mm");
            var t2 = moment(report.starthour, "hh:mm");
            var t3 = moment.utc(moment(t1,"HH:mm").diff(moment(t2,"HH:mm"))).format("HH:mm");
            report.hours = t3;
        }
    }

    $scope.ApproveSingleRow = function (reporterIndex, reportIndex)
    {
        // console.log("ApproveSingleRow():");
        // console.log("reporter :");
        // console.log(reporterIndex);
        // console.log("report :");
        // console.log(reportIndex);
        if(checkRecordValidity(reporterIndex, reportIndex))
        {
            var reporter = $scope.allreporters[reporterIndex];
            var rep = $scope.allreporters[reporterIndex].reports[reportIndex];
            if(rep.editing)
            {
                $scope.editing = false;
                rep.editing=false;
                rep.approval=1;
                rep.status2=true;
                rep.checkdate2=true;
                $scope.SaveData(reporterIndex, reportIndex);

            }
            else
            {
                $scope.ApproveRows([rep], reporter);
            }

        }
    }
    // Added new RejectSingleRow function to support the new reject status
    $scope.RejectSingleRow = function (reporterIndex, reportIndex)
    {
        // console.log("RejectSingleRow():");
        // console.log("reporter :");
        // console.log(reporterIndex);
        // console.log("report :");
        // console.log(reportIndex);
        if(checkRecordValidity(reporterIndex, reportIndex))
        {
            var reporter = $scope.allreporters[reporterIndex];
            var rep = $scope.allreporters[reporterIndex].reports[reportIndex];
            if(rep.editing)
            {
                $scope.editing = false;
                rep.editing=false;
                rep.approval=-1;
                rep.status2=true;
                rep.checkdate2=true;
                $scope.SaveData(reporterIndex, reportIndex);
            }
            else
            {
                $scope.RejectRows([rep], reporter);
            }
        }

    }
    $scope.ApproveRows = function(reps, reporter)
    {
        SetReportApproval(reps, 1, reporter)
    }
    $scope.UnapproveRows = function(reps, reporter)
    {
        SetReportApproval(reps, 0, reporter)
    }
    $scope.RejectRows = function(reps, reporter)
    {
        SetReportApproval(reps, -1, reporter)

    }
    function SetReportApproval(reps, reportStatus, reporter)
    {
        // console.log("SetReportApproval():");

        var reportids=getColumnInArray(reps, "reportid");
        var data = {'reportids' : reportids, 'status' : reportStatus, 'checkdate2':true};
        //var data = {'reportids' : reportids, 'status' : reportStatus};
        server.requestPhp(data, 'SetReportApproval').then(function(data) {
            if(data&&!data.error)
            {
                //console.log(data);
                for (var i=0; i<reps.length; i++)
                {
                    reps[i].approval = reportStatus;
                    reps[i].checkdate = data;
                    reps[i].status2=true;
                }
                $scope.calculateHoursSummary(reporter);
                if(data === true)
                    alert("נשמר בהצלחה");
                else if(data === "no ids supplied")
                    alert("יש לבחור רשומות תחילה");
            }
            else
            {
                alert("הפעולה לא הצליחה - נא לפנות לנטלי מזרחי או לדניאל סעאת ולדווח להם על הבעיה.");
            }
        });
        unCheckRows(reps,reporter);
    }
    function unCheckRows(reps,reporter)
    {
        for (var i=0; i<reps.length; i++)
        {
            if(reps[i]["choose"])
                reps[i]["choose"]=!reps[i]["choose"];
            if(reporter.chooseAll)
                reporter.chooseAll=!reporter.chooseAll;
        }
    }

    function getColumnInArray(arr, colName)
    {
        var res = [];
        for (var i=0; i<arr.length; i++)
        {
            res.push(arr[i][colName])
        }
        return res;
    }

    $scope.getSelectedRows = function(reporters)
    {
        var keys = Object.keys(reporters.reports);
        var selected=[];
        for(var i=0 ; i < keys.length ; i++)
        {
            if(reporters.reports[i]["choose"]==true)
            {
                selected.push(reporters.reports[i]);
            }
        }
        return selected;
    }

    $scope.chooseAll = function(reporter)
    {
        reporter.chooseAll=!reporter.chooseAll;
        for(var i=0; i<reporter.reports.length; i++)
        {
            if(reporter.reports[i].status2)
                reporter.reports[i]["choose"] = reporter.chooseAll;
        }
    }

    //adds a report row to some staff
    $scope.AddData = function(reporter) {
        // console.log("AddData");
        reporter.reports.push({
            "reportid" : "-1",
            "coursename" : "כללי",
            "copyreport" : {},
            "status" : "",
            "userid" : reporter.userid,
            "editing" : true,
            "automatic": false,
            "checkdate":"לא התחרש שינוי עדיין",
            "status2": false,//determine if report is kosher or not
            "checkdate2":false,//if manger saved the report with approval\rejection the value is true, else - false.

        });

        var len=reporter.reports.length;
        if (len>0 && reporter.reportingPerimeter) {
            var projKeys = Object.keys(reporter.reportingPerimeter);
        }            
        if (projKeys && projKeys.length === 1){
            reporter.reports[len - 1].projectid = projKeys[0];
            reporter.reports[len - 1].copyreport = { projectid: projKeys[0] };
        }
        $scope.editing = true;
        $scope.orderByDate = false;
    };

    $scope.isFirstEnter = false;
    $scope.GetUserProfile = function () {
        var data = {};
        $scope.user = {};
        server.requestPhp(data, 'GetMyProfile').then(function (data) {
            $scope.user = data;
            $scope.user.image = ($scope.user.image) ? $scope.user.image : "portal/img/user.png";
        });
    }
    $scope.GetUserProfile();

    $scope.enableRowEditing = function (report)
    {
        //TODO this is a hack - change it to something sensible.
        beforeEdit = JSON.parse(JSON.stringify(report));
        report.editing=true;
        $scope.editing = true;
    }

    $scope.getReporteIndexById = function (userid){
        for (var i=0; i<$scope.allreporters.length; i++)
        {
            if ($scope.allreporters[i].userid===userid)
                return i;
        }
        return null;
    };
    $scope.getReporterIndexByID = function(reporterId){
        for(var i=0; i<$scope.allreporters.length; i++)
        {
            if($scope.allreporters[i].userid==reporterId)
                return i;
        }
        return -1;
    }
    $scope.cancelEdit = function (reporterIndex, reportIndex) {
        $scope.allreporters[reporterIndex].reports[reportIndex] = beforeEdit;
        $scope.allreporters[reporterIndex].reports[reportIndex].editing=false;
        $scope.editing = false;
    }

    $scope.SaveData = function(reporterIndex, reportIndex)
    {
        // console.log("SaveData");

        var reporter = $scope.allreporters[reporterIndex];
        var rep = $scope.allreporters[reporterIndex].reports[reportIndex];
        if(!checkRecordValidity(reporterIndex, reportIndex))
        {
            return;
        }
        $scope.editing = false;
        rep.editing=false;
        var data={};
        data.report=rep;
        server.requestPhp(data, 'UpdateReport').then(function (data) {
            if(data)
            {
                alert("saved!");
                if(data==true)
                    $scope.allreporters[reporterIndex].reports[reportIndex].checkdate="לא התרחש שינוי עדיין	";
                else
                    $scope.allreporters[reporterIndex].reports[reportIndex].checkdate=data;
                $scope.allreporters[reporterIndex].reports[reportIndex].status2=true;
            }
            else{
                alert("not saved! check your reports");
            }
            $scope.orderByDate = true;
            //	$scope.allreporters[reporterIndex].reports[reportIndex].checkdate="לא התרחש שינוי עדיין";
        });
    }
    $scope.DuplicateData = function(reporterIndex, reportIndex) {
        var rep = $scope.allreporters[reporterIndex].reports[reportIndex];
        var tempreport = {};
        tempreport.courses=rep.courses;
        tempreport.actions = rep.actions;
        tempreport.automatic = 0;
        if (rep.actionid)
            tempreport.actionid = rep.actionid;
        if (rep.carkm)
            tempreport.carkm = rep.carkm;
        if (rep.comment)
            tempreport.comment = rep.comment;
        if (rep.cost)
            tempreport.cost = rep.cost;
        if (rep.coursecode)
            tempreport.coursecode = rep.coursecode;
        if (rep.courseid)
            tempreport.courseid = rep.courseid;
        if (rep.coursename)
            tempreport.coursename = rep.coursename;
        if (rep.date)
            tempreport.date = rep.date;
        if (rep.finishhour)
            tempreport.finishhour = rep.finishhour;
        if (rep.hours)
            tempreport.hours = rep.hours;
        if (rep.projectid)
            tempreport.projectid = rep.projectid;
        if (rep.projectname)
            tempreport.projectname = rep.projectname;
        if (rep.userid)
            tempreport.userid = rep.userid;
        if (rep.starthour)
            tempreport.starthour = rep.starthour;
        // if (rep.checkdate)
        // 	tempreport.checkdate = rep.checkdate;
        if (rep.subject)
            tempreport.subject = rep.subject;
        tempreport.status = rep.status;
        tempreport.reportid = "-1";
        tempreport.editing = true;
        $scope.editing = true;
        $scope.allreporters[reporterIndex].reports.push(tempreport);
    };

    function checkRecordValidity(reporterIndex, reportIndex) {
        var reporter = $scope.allreporters[reporterIndex];
        var rep = $scope.allreporters[reporterIndex].reports[reportIndex];
        //console.log(reporter);
        //console.log(rep);
        // variable that remains true as long as no reports have been auto
        // formatted
        var wasFormatted = true;
        var validHours = true;
        var validFinishHour = true;
        var noIntersection = true;
        var containsProject = true;
        var containsSubject = true;
        // a list of all the report rows that have to be verified, i.e. not
        // already accepted or requiring the addition of some report subject
        var checkingList = reporter.reports;
        // check that the hours are correctly identified as time values
        var report = rep;
        report.hoursvalid = true;
        report.finishhourvalid=true;
        report.starthourvalid=true;
        report.notIntersecting=true;
        report.isSetProject=true;
        report.isSetSubject=true;
        for (var j = 0; j < checkingList.length; j++) {
            checkingList[j].notIntersecting = true;
        }
        var t1 = moment(report.finishhour, "hh:mm");
        var t2 = moment(report.starthour, "hh:mm");
        var t3 = moment.utc(moment(t1, "HH:mm").diff(moment(t2, "HH:mm"))).format("HH:mm");
        if (t3 == 'Invalid date') {
            report.hoursvalid = false;
            validHours = false;
        }
        if (!validHours) {
            alert("ודאו שכל השעות שדווחו בפורמט תקין");
            return false;
        }
        // check that the record has a defined project

        var report = rep;
        if(!report.projectid)
        {
            containsProject = false;
            report.isSetProject=false;
        }
        if (!containsProject) {
            alert("לחלק מהרשומות לא מוגדר פרוייקט");
            return false;
        }
        // check that the record has a defined report subject
        var report = rep;
        if(!report.actionid)
        {
            report.isSetSubject=false;
            containsSubject = false;
        }
        if (!containsSubject) {
            alert("לחלק מהרשומות לא מוגדר נושא דיווח");
            return false;
        }
        // check that finish hours is after beginning hour
        var report = rep;
        var t1 = moment(report.finishhour, "hh:mm");
        var t2 = moment(report.starthour, "hh:mm");
        var t3 = moment.utc(moment(t1, "HH:mm").diff(moment(t2, "HH:mm"))).format("HH:mm");
        if (t1-t2<=0)
        {
            report.finishhourvalid=false;
            validFinishHour = false;
        }
        if (!validFinishHour) {
            alert("חלק מהרשומות מכילות נתונים לא תקינים. ודאו ששעת סיום העבודה לאחר שעת תחילת העבודה.");
            return false;
        }
        // check that hours are formatted correctly
        var report = rep;
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
        if (!wasFormatted) {
            alert("השעות שהזנת באמצעות המקלדת פורמטו אוטומטית.\nלחץ על OK, בדוק שהשעות מדויקות ואז שמור מחדש.");
            return false;
        }
        // check that hours don't intersect
        var report1 = rep;
        var t1 = moment(report1.starthour, "hh:mm");
        var t2 = moment(report1.finishhour, "hh:mm");
        for (var j = 0; j < checkingList.length; j++) {
            if(j!=reportIndex)
            {
                var report2 = checkingList[j];
                if (report2.date==report1.date)
                {
                    var t3 = moment(report2.starthour, "hh:mm");
                    var t4 = moment(report2.finishhour, "hh:mm");
                    if (t3>=t1&&t3<t2||t1>=t3&&t1<t4)
                    {
                        report2.notIntersecting = false;
                        report1.notIntersecting = false;
                        noIntersection=false;
                    }
                }
            }
        }
        if (!noIntersection) {
            alert("לא ניתן לדווח על מספר פעילויות בשעות חופפות");
            return false;
        }
        return true;
    }

    $scope.calculateHoursSummary = function(reporter)
    {
        var reported = 0;
        var approved = 0;
        var unapproved = 0;
        var rejected = 0;
        for (var i=0; i<reporter.reports.length; i++)
        {
            if(reporter.reports[i].hours)
            {
                var reportHours=timeStringToAmount(reporter.reports[i].hours);
                reported+=reportHours;
                if(reporter.reports[i].approval=='1')
                {
                    approved+=reportHours;
                }
                else if (reporter.reports[i].approval == '-1') {
                    rejected += reportHours;
                } else {
                    unapproved+=reportHours;
                }
            }
        }
        reporter.reportedHours=reported.toFixed(2);
        reporter.approvedHours=approved.toFixed(2);
        reporter.unapprovedHours=unapproved.toFixed(2);
        reporter.rejectedHours = rejected.toFixed(2);
    }
    $scope.sumHours = function (reports)
    {
        var sum = 0;
        for (var i=0; i<reports.length; i++)
        {
            if(reports[i].hours)
            {
                sum+=timeStringToAmount(reports[i].hours);
            }
        }
        return sum;
    }
    function timeStringToAmount(timeString) {
        var hoursMinutes = timeString.split(":");
        var hours = parseInt(hoursMinutes[0]);
        var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1]) : 0;
        return hours + minutes / 60;
    }

    $scope.getReportsFull = function(paramObj){
           
            
        var rep = JSON.parse(JSON.stringify(paramObj.param1.reports));
        var reportingPerimeter = JSON.parse(JSON.stringify(paramObj.param1.reportingPerimeter));
        rep.forEach(function(el){
            el.approval=el.approval===0 ? "ממתין":el.approval===1?"אושר":el.approval===-1?"נדחה":"לא מוגדר";
            
            el.actionid = ((reportingPerimeter[el.projectid]||{projectid:null,subjects:["לא מוגדר"]}).subjects.filter(function(sel){
                return el.actionid === sel.reportsubjectid;
            })[0]||{"reportsubjectid": null, "subject": "לא מוגדר"}).subject;
            el.courseid = ((reportingPerimeter[el.projectid]||{projectid:null,courses:["לא מוגדר"]}).courses.filter(function(cer){
                return el.courseid === cer.courseid;
            })[0]||{"courseid":null, "courseName":"כללי"}).courseName;
            el.projectid = (reportingPerimeter[el.projectid]||{"projectid":null, "projectName": "לא מוגדר"}).projectName;
            el.date=moment(el.date,"DD/MM/YYYY")._d;
        });
        
        var head = {date: "תאריך", projectid:"פרויקט", actionid:"נושא פעילות", courseid:"מס/שם קורס",	starthour:"שעת התחלה",	finishhour:"שעת סיום", hours: 'סה"כ שעות',	carkm:'רכב פרטי ק"מ',	cost: 'תחבורה ציבורית ש"ח',	comment:"הערות", approval: "אישור נוכחות", checkdate: 'זמן שינוי סטטוס ע"י מנהל'};
        rep.unshift(head);
        var async = $q.defer();
        async.resolve(rep);
        return async.promise;
    };


} ]);