apple.controller('hoursreport', ['$rootScope', '$scope', '$state', '$http', "$q",'userService', 'Upload', 'server',
    function($rootScope, $scope, $state, $http, $q, userService, Upload, server) {
        // Updating the state name for the navbar to highlight the active page
        $rootScope.stateName = "hoursreport";

        // disables the save button if still waiting for the server to respond
        var disableSaveButton = false;
        $scope.test = {
            a : {}
        };
        $scope.reports = [];
        $scope.months = {
            "1" : "ינואר",
            "2" : "פברואר",
            "3" : "מרץ",
            "4" : "אפריל",
            "5" : "מאי",
            "6" : "יוני",
            "7" : "יולי",
            "8" : "אוגוסט",
            "9" : "ספטמבר",
            "10" : "אוקטובר",
            "11" : "נובמבר",
            "12" : "דצמבר"
        };
        $scope.year = "";
        $scope.month = "";
        $scope.deletingcontrol = {};
        $scope.deletedrep = {};

        $scope.GetCurentDate = function() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;

            var yyyy = today.getFullYear();

            $scope.year = yyyy;
            $scope.month = $scope.months[mm];
            $scope.monthindex = mm;

            $scope.curentmonth = $scope.months[mm];
            $scope.curentyear = yyyy;
        };
        $scope.GetCurentDate();

        $scope.GetReports = function() {
            $scope.loading=true;
            var data = {
                month : $scope.monthindex,
                year : $scope.year
            };
            server.requestPhp(data, 'GetReports').then(function (data) {
                $scope.reports = [];
                if(data)
                {
                    for(var i=0; i<data.length; i++){
                        var report = data[i];
                        if (report["carkm"])
                            report["carkm"] = parseFloat(report["carkm"]);
                        if (report["cost"])
                            report["cost"] = parseFloat(report["cost"]);
                        if (report["missingreportsubject"])
                            report["missingreportsubject"] = parseFloat(report["missingreportsubject"]);
                        if (report["automatic"])
                            report["automatic"] = parseFloat(report["automatic"]);
                        if (report["approval"])
                            report["approval"] = parseFloat(report["approval"]);
                        if(!report.checkdate)
                        {
                            report.checkdate="לא התרחש שינוי עדיין";
                            // console.log(report.checkdate);
                        }
                        $scope.reports.push(report);
                    }
                }
                $scope.loading=false;
            });
        };
        $scope.GetReports();

        $scope.getReportsFull = function(){
           
            
            var rep = JSON.parse(JSON.stringify($scope.reports));
            
            rep.forEach(function(el){
                el.approval=el.approval===0 ? "ממתין":el.approval===1?"אושר":el.approval===-1?"נדחה":"לא מוגדר";
                
                el.actionid = (($scope.reportingPerimeter[el.projectid]||{projectid:null,subjects:["לא מוגדר"]}).subjects.filter(function(sel){
                    return el.actionid === sel.reportsubjectid;
                })[0]||{"reportsubjectid": null, "subject": "לא מוגדר"}).subject;
                el.courseid = (($scope.reportingPerimeter[el.projectid]||{projectid:null,courses:["לא מוגדר"]}).courses.filter(function(cer){
                    return el.courseid === cer.courseid;
                })[0]||{"courseid":null, "courseName":"כללי"}).courseName;
                el.projectid = ($scope.reportingPerimeter[el.projectid]||{"projectid":null, "projectName": "לא מוגדר"}).projectName;
            });
            var str=JSON.stringify(rep);
            str=str.replace(/actionid/g, "action").replace(/courseid/g,"course").replace(/projectid/g,"project");
            rep = JSON.parse(str);
            rep.forEach(function(el){
                el.date=moment(el.date,"DD/MM/YYYY")._d;
                delete el.userid;
                delete el.reportid;
            });
            
            var head = {date: "תאריך", project:"פרויקט", action:"נושא פעילות", course:"מס/שם קורס",	starthour:"שעת התחלה",	finishhour:"שעת סיום", hours: 'סה"כ שעות',	carkm:'רכב פרטי ק"מ',	cost: 'תחבורה ציבורית ש"ח',	comment:"הערות", approval: "אישור נוכחות", checkdate: 'זמן שינוי סטטוס ע"י מנהל'};
            rep.unshift(head);
            var async = $q.defer();
            async.resolve(rep);
            return async.promise;
        };

        $scope.reportingPerimeter=[];
        $scope.GetReportingPerimeter = function() {
            var data = {};
            server.requestPhp(data, 'GetMyReportingPerimeter').then(function (data) {
                $scope.reportingPerimeter=data;
            });
        };
        $scope.GetReportingPerimeter();

        $scope.goLeft = function() {
            $scope.monthindex = $scope.monthindex - 1;
            if ($scope.monthindex == 0) {
                $scope.monthindex = 12;
                $scope.year = $scope.year - 1;
            }
            $scope.month = $scope.months[$scope.monthindex];
            $scope.GetReports();
        };

        $scope.goRight = function() {
            $scope.monthindex = $scope.monthindex + 1;
            if ($scope.monthindex == 13) {
                $scope.monthindex = 1;
                $scope.year = $scope.year + 1;
            }
            $scope.month = $scope.months[$scope.monthindex];
            $scope.GetReports();
        };

        $scope.calculateHours = function(report) {
            if (report.finishhour && report.starthour) {
                var t1 = moment(report.finishhour, "HH:mm");
                var t2 = moment(report.starthour, "HH:mm");
                var t3 = moment.utc(moment(t1, "HH:mm").diff(moment(t2, "HH:mm"))).format("HH:mm");
                report.hours = t3;
                report.copyreport.hours=t3;
            }
        };

        $scope.resetEndHour = function(report) {
            report.finishhour = null;
            report.hours = null;
            report.copyreport.finishhour=null;
            report.copyreport.hours=null;
        };

        $scope.AddData = function() {
            $scope.reports.push({
                "reportid" : "-1",
                "coursename" : "כללי",
                "copyreport" : {},
                "status" : "",
                "automatic":0,
            })
            var len=$scope.reports.length;
            if (len>0 && $scope.reportingPerimeter) {
                var projKeys = Object.keys($scope.reportingPerimeter);
            }            
            if (projKeys && projKeys.length === 1){
                $scope.reports[len - 1].projectid = projKeys[0];
                //angular.element(".report-table-wrap td.changedByManager").removeClass("changedByManager");
                $scope.reports[len - 1].copyreport = { projectid: projKeys[0] };
            }
        };


        $scope.ClearData = function() {
            $scope.GetReports();
        };
        function checkRecordValidity() {
            //	console.log("checkRecordValidity():");
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

            var checkingList = $scope.reports

            // for (var i = 0; i < $scope.reports.length; i++) {
            // 	if ($scope.reports[i].status=='')
            // 		checkingList.push($scope.reports[i]);
            // 	else
            // 		{
            // 		//console.log("important "+$scope.reports[i].status)
            // 		}
            // }
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
                                //	console.log(i+", "+j);
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


        $scope.SaveData = function() {
            if(disableSaveButton)
                return;
            if (checkRecordValidity()) {
                disableSaveButton=true;
                var data = {};
                data.reports=$scope.reports;
                // console.log("hour reports:");
                // console.log(data.reports);
                server.requestPhp(data, 'SaveReports').then(function (data) {
                    alert("saved");
                    $scope.GetReports();
                    disableSaveButton=false;
                });
            }
            else{
                return;
            }
        };

        $scope.GetCoursesOfProject = function(rep) {
            if (rep.projectid != null && rep.projectid != '') {
                var data = {
                    'projectid' : rep.projectid
                }
                server.requestPhp(data, 'GetCoursesOfProject').then(function (data) {
                    rep.courses = data;
                    rep.coursecode = '';
                    rep.coursename = 'כללי';
                    rep.courseid = '';
                    rep.copyreport.courses = data;
                    rep.copyreport.coursecode = '';
                    rep.copyreport.coursename = 'כללי';
                    rep.copyreport.courseid = '';
                });

                $scope.projects.forEach(function(element) {
                    if (element["projectid"] == rep.projectid) {
                        rep.projectname = element["projectname"];
                        rep.copyreport.projectname = element["projectname"];
                    }
                });
                var data = {
                    'projectid' : rep.projectid
                };
                server.requestPhp(data, 'GetMyActionsOfProject'
                ).then(function (data) {
                    rep.actions = data;
                    if (rep.actions.length > 0) {
                        rep.subject = rep.actions[0].actionname;
                        rep.actionid = rep.actions[0].subjectreportid;
                        rep.copyreport.subject = rep.actions[0].actionname;
                        rep.copyreport.actionid = rep.actions[0].subjectreportid;
                    }
                });
            }
        };

        $scope.SetCourseNameCode = function(rep) {
            if (rep.courseid == "") {
                rep.coursecode = '';
                rep.coursename = 'כללי';
            } else {
                rep.courses.forEach(function(element) {
                    if (element["courseid"] == rep.courseid) {
                        rep.coursecode = element["code"];
                        rep.coursename = element["name"];
                    }
                });
            }
        };

        $scope.SetSubject = function(rep) {
            rep.actions.forEach(function(element) {
                if (element["subjectreportid"] == rep.actionid) {
                    rep.subject = element["actionname"];
                }
            });
        };

        $scope.Delete = function(rep) {
            $scope.deletedrep = rep;
            $scope.deletingcontrol.open();
        };

        $scope.DeleteData = function() {
            var rep = $scope.deletedrep;
            var index = $scope.reports.indexOf(rep);
            if (index > -1) {
                $scope.reports.splice(index, 1);
            }
            var data = {'reportid' : rep.reportid};
            if (rep.reportid && rep.reportid > 0) {
                server.requestPhp(data, 'DeleteReportById').then(function (data) {
                });
            }
        };

        $scope.DuplicateData = function(rep) {
            var tempreport = {};
            tempreport.courses=rep.courses;
            tempreport.actions = rep.actions;
            tempreport.automatic = rep.automatic;
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
            if (rep.staffid)
                tempreport.staffid = rep.staffid;
            if (rep.starthour)
                tempreport.starthour = rep.starthour;
            if (rep.subject)
                tempreport.subject = rep.subject;
            tempreport.status = rep.status;
            tempreport.reportid = "-1";
            tempreport.copyreport={};
// set report copy
            if (tempreport.actionid)
                tempreport.copyreport.actionid = tempreport.actionid;
            if (tempreport.carkm)
                tempreport.copyreport.carkm = tempreport.carkm;
            if (tempreport.comment)
                tempreport.copyreport.comment = tempreport.comment;
            if (tempreport.cost)
                tempreport.copyreport.cost = tempreport.cost;
            if (tempreport.coursecode)
                tempreport.copyreport.coursecode = tempreport.coursecode;
            if (tempreport.courseid)
                tempreport.copyreport.courseid = tempreport.courseid;
            if (tempreport.coursename)
                tempreport.copyreport.coursename = tempreport.coursename;
            if (tempreport.date)
                tempreport.copyreport.date = tempreport.date;
            if (tempreport.finishhour)
                tempreport.copyreport.finishhour = tempreport.finishhour;
            if (tempreport.hours)
                tempreport.copyreport.hours = tempreport.hours;
            if (tempreport.projectid)
                tempreport.copyreport.projectid = tempreport.projectid;
            if (tempreport.projectname)
                tempreport.copyreport.projectname = tempreport.projectname;
            if (tempreport.staffid)
                tempreport.copyreport.staffid = tempreport.staffid;
            if (tempreport.starthour)
                tempreport.copyreport.starthour = tempreport.starthour;
            if (tempreport.status)
                tempreport.copyreport.status = tempreport.status;
            if (tempreport.subject)
                tempreport.copyreport.subject = tempreport.subject;
            $scope.reports.push(tempreport);
        };

        $scope.sumHours = function ()
        {
            var sum = 0;
            for (var i=0; i<$scope.reports.length; i++)
            {
                if($scope.reports[i].hours)
                {
                    sum+=timeStringToAmount($scope.reports[i].hours);
                }
            }
            return sum;
        }

        function timeStringToAmount(timeString)
        {
            var hoursMinutes = timeString.split(":");
            var hours = parseInt(hoursMinutes[0]);
            var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1]) : 0;
            return hours + minutes / 60;
        }
    }]);
