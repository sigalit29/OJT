apple.controller('singleUser', ['$rootScope', '$scope', '$state', '$stateParams', '$http','userService','Upload', 'server', '$q', function ($rootScope, $scope, $state, $stateParams, $http, userService, Upload, server, $q) {

    $rootScope.stateName= $stateParams.userType;
    $scope.userId = $stateParams.userId;
    $scope.user={};
    $scope.access={};
    $scope.courses={};
    $scope.substaff={};
    $scope.password={};

   // console.log("$rootScope:");
   //  console.log($rootScope);
   //  console.log("$scope:");
   //  console.log($scope);
   //  console.log("$state:");
   //  console.log($state);
   //  console.log("$stateParams:");
   //  console.log($stateParams);
   //  console.log("$http:");
   //  console.log($http);
   //  console.log("userService:");
   //  console.log(userService);
   //  console.log("Upload:");
   //  console.log(Upload);
   //  console.log("server:");
   //  console.log(server);

    console.log(" $scope.userId:");
    console.log( $scope.userId);

    $scope.GetUser = function () {
        var data ={};
        data.userId = $scope.userId;


        server.requestPhp(data, 'GetUserProfileById').then(function (data) {
            $scope.user = data.profile;
           // console.log($scope.user);
            $scope.access = data.access
        });

        var data ={};

        data.userId = $scope.userId;
        server.requestPhp(data, 'GetManagedUsersByUserId').then(function (data) {
            $scope.substaff = data;

        });

        //get users who get their hours approved by me

        var data ={};
        data.userId = $scope.userId;
        server.requestPhp(data, 'GetUsersWhoHoursApprovedByMe').then(function (data) {
            $scope.getApprovedstaff = data;
        });

        //get enrollment roles list
        $scope.roles = [];
        var getEnrollmentRoles = function () {
            var data ={};
            server.requestPhp(data, 'GetEnrollmentRoles').then(function (data) {
                $scope.roles = data;
                if(Array.isArray($scope.roles))
                    getEnrollments();
            });
        }
        getEnrollmentRoles();

        //get projects list
        $scope.Userprojects = [];
        var GetUserProjects = function () {
            var data ={};
            data.userid = $scope.userId;
            server.requestPhp(data, 'GetUserProjects').then(function (data) {
                $scope.Userprojects = data;
                console.log( $scope.Userprojects);
            });
            $scope.Userprojects=$scope.user.projects;
        }
        GetUserProjects();

        $scope.displayedEnrollments =[];

        var getEnrollments = function () {
            for(var i=0; i<$scope.roles.length; i++)
            {
                var role = $scope.roles[i];
                var roleEnrollments=[];
                roleEnrollments.courses = [];
                roleEnrollments.search = "";
                roleEnrollments.page = 0;
                roleEnrollments.pageCount = 0;
                roleEnrollments.loading = false;
                $scope.displayedEnrollments[role.enrollmentroleid] = roleEnrollments;
                $scope.getEnrolledInCoursesInRole(role.enrollmentroleid);
            }
        }
    };

    $scope.getUserReportSubjectFull=function(){
			//clone array
			var reportSubj = JSON.parse(JSON.stringify($scope.user.reportSubjects));
			reportSubj.forEach(function(el){
				el.projectid = ($scope.projects.filter(function(pel){
					return el.projectid === pel.projectid;})[0]||{projectid:null, projectname:"לא מוגדר"}).projectname;
				el.reportsubjectid = ($scope.reportSubjects.filter(function(rsel){
					return el.reportsubjectid === rsel.reportsubjectid;})[0]||{reportsubjectid:null,subject:"לא מוגדר"}).subject;
				el.clientcodeid = ($scope.clientCodes.filter(function(ccel){
					return el.clientcodeid === ccel.clientcodeid;
				})[0]||{clientcodeid:null,code:"לא מוגדר"}).code;
				el.reportSubjectStatus=el.reportSubjectStatus==="1"?"פעיל":el.reportSubjectStatus==="0"?"לא פעיל":"לא מוגדר";
			});
			var head = {projectid: "פרויקט", reportsubjectid: "נושא", clientcodeid: "קוד לקוח", reportSubjectStatus: "סטטוס"};
			reportSubj.unshift(head);
			var async = $q.defer();
			async.resolve(reportSubj);
			return async.promise;
		};

    $scope.getEnrolledInCoursesInRole = function(roleid) {

        $scope.displayedEnrollments[roleid].loading=true;
        var data ={};
        data.userId = $scope.userId;
        data.page = $scope.displayedEnrollments[roleid].page;
        data.search = $scope.displayedEnrollments[roleid].search;
        data.roleid = roleid;
        server.requestPhp(data, 'GetCoursesWithUserEnrolledAsRole').then(function (data) {
            $scope.displayedEnrollments[roleid].courses = data.enrolled;
            $scope.displayedEnrollments[roleid].pageCount = data.pages;
            $scope.displayedEnrollments[roleid].loading=false;
        });
    };

    $scope.getEnrolledInCoursesInRoleFull = function(paramObj) {
        var roleid = paramObj.param1.enrollmentroleid;
        $scope.displayedEnrollments[roleid].loading=true;
        var data ={};
        data.userId = $scope.userId;
        data.page = -1;//$scope.displayedEnrollments[roleid].page;
        data.search = $scope.displayedEnrollments[roleid].search;
        data.roleid = roleid;
        var async = $q.defer();
        var courses = [];
        server.requestPhp(data, 'GetCoursesWithUserEnrolledAsRole').then(function (data) {
            courses = data;
            var header = {coursename:"קורס", projectname: "פרוייקט"};
            courses.unshift(header);
            async.resolve(courses);
            $scope.displayedEnrollments[roleid].loading=false;
        });

        return async.promise;
    };

    $scope.goToEnrolledInCoursesPage = function (pageNum, data) {
        if(pageNum>=0&&pageNum<=$scope.displayedEnrollments[data.roleid].pageCount)
        {
            $scope.displayedEnrollments[data.roleid].page=pageNum;
            $scope.getEnrolledInCoursesInRole(data.roleid);
        }
    };

    if($scope.userId) {

        $scope.GetUser();

        $scope.password.update=false;
    }

    else {
        $scope.user.status=1;
        $scope.user.certificates=[];
        $scope.user.languages=[];
        $scope.user.professions=[];
        $scope.user.reportSubjects=[];
        $scope.user.firstnameinarabic="";
        $scope.user.lastnameinarabic="";
        $scope.user.phone="";
        $scope.user.phone2=null;
        $scope.user.phone2owner=null;
        $scope.user.address="";
        $scope.user.image="";
        $scope.user.genderid="";
        $scope.user.religionid="";
        $scope.password.update=true;
        $scope.user.managerid=null;
        $scope.access = {"edit": true, "resetPassword": true};
    }

    $scope.reportSubjects = [];

    $scope.GetReportSubjects = function() {
        var data = {};
        server.requestPhp(data, 'GetReportSubjects').then(function (data) {
            $scope.reportSubjects = data;
        });
    };

    $scope.GetReportSubjects();

    $scope.clientCodes = [];

    $scope.GetClientCodes = function() {
        var data = {};
        server.requestPhp(data, 'GetClientCodes').then(function (data) {
            $scope.clientCodes = data;
        });
    };

    $scope.GetClientCodes();

    $scope.projects = [];

    $scope.GetProjects = function() {
        var data ={}
        server.requestPhp(data, 'GetProjects').then(function (data) {
            $scope.projects = data;
            console.log("projects:");
            console.log($scope.projects);
        });
    };

    $scope.GetProjects();

    $scope.languages = [];

    $scope.GetLanguages = function () {
        var data = {};
        server.requestPhp(data, 'GetLanguages').then(function (data) {
            $scope.languages = data;
        });
    };

    $scope.GetLanguages();

    $scope.professions = [];

    $scope.GetProfessions = function () {
        var data = {};
        server.requestPhp(data, 'GetProfessions').then(function (data) {
            $scope.professions = data;
        });
    };

    $scope.GetProfessions();

    $scope.certificates = [];

    $scope.GetCertificates = function () {
        var data = {};
        server.requestPhp(data, 'GetCertificates').then(function (data) {
            $scope.certificates = data;
        });
    };

    $scope.GetCertificates();

    $scope.genders = [];

    $scope.GetGenders = function () {
        var data = {};
        server.requestPhp(data, 'GetGenders').then(function (data) {
            $scope.genders = data;
        });
    };

    $scope.GetGenders();

    $scope.cities = [];

    $scope.GetCities = function () {
        var data = {};
        server.requestPhp(data, 'GetCities').then(function (data) {
            $scope.cities = data;
        });
    };

    $scope.GetCities();

    $scope.religions = [];

    $scope.GetReligions = function () {
        var data = {};
        server.requestPhp(data, 'GetReligions').then(function (data) {
            $scope.religions = data;
        });
    };

    $scope.GetReligions();

    $scope.searchManager = function (search, page, onSuccess) {
        var desc = false;
        var userstatus = 1;
        var sorting = "userId";
        var excludeIds = [];
        excludeIds.push($scope.userId);
        var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page, 'excludeIds':excludeIds};
        server.requestPhp(data, 'SearchUserToAssignAsManager').then(function (data) {
            onSuccess(data);
        });
    }

    $scope.assignManager = function (manager) {
        $scope.user.superstaffname = manager.fullname;
        $scope.user.managerid = manager.userid;
        $scope.chooseManager=false;
    }

    /////////////////////////////////////////////////////////////////_____HOUR APPROVERS_____//////////////////////////////////////////////////////////////
    $scope.getHoursApprovers = function() {
        var data ={'userid':$scope.userId};
        server.requestPhp(data, 'GetHoursApprovers').then(function (data) {
            $scope.hourApprovers=data;
            var hoursApproversNames = $scope.hourApprovers.map(function(approver){return approver.firstname+" "+approver.lastname});
            $scope.hoursApproversNames = hoursApproversNames.join(", ");
            $scope.hrsApproversNames = hoursApproversNames;
        });
    }

    $scope.getHoursApprovers();

    $scope.toAssignAsApprovers=[];

    $scope.searchHoursApprovers = function (search, page, onSuccess) {
        var desc = false;
        var userstatus = 1;
        var sorting = "userId";
        var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page, 'userid':$scope.userId};
        server.requestPhp(data, 'SearchHoursApprovers').then(function (data) {
            if(data.error)
                return;
            else onSuccess(data);
        });
    }

    $scope.addHoursApproversToList = function (user) {
        if($scope.toAssignAsApprovers.indexOf(user.userid)==-1)
        {
            $scope.toAssignAsApprovers.push(user.userid);
        }
        else
        {
            $scope.toAssignAsApprovers.splice($scope.toAssignAsApprovers.indexOf(user.userid), 1);
        }
    }

    $scope.commitNewHoursApprovers = function () {
        var data ={'approverIds': $scope.toAssignAsApprovers, 'userId': $scope.userId};
        server.requestPhp(data, 'AddHoursApprovers').then(function (data) {
            $scope.getHoursApprovers();
        });
        $scope.closeApproversForm();
    }

    $scope.closeApproversForm = function() {
        $scope.addHoursApproval = false;
        $scope.toAssignAsApprovers=[];
    }

    $scope.allowApproversForm = function() {
        $scope.addHoursApproval = true;
    }

    $scope.removeApprover = function(remAppr) {
        if($rootScope.isAdmin) {
            var remAppId = getUserId(remAppr);
            var data = {};
            data.userid = $scope.userId;
            data.userids = [remAppId];
            server.requestPhp(data, 'DeleteReportApprovers').then(function (data) {
                // $scope.GetUserProjects();
            });
        }
        else
        {
            alert("permission denied");
        }
    }

    getUserId = function(remAppr) {
        for (var i = 0; i < $scope.hourApprovers.length; i++)
        {
            flname = $scope.hourApprovers[i].firstname + " " + $scope.hourApprovers[i].lastname;
            if ( flname == remAppr  )
                return $scope.hourApprovers[i].userid;
        }
    }


    //////////////////////////////////////////////////////////____PROJECTS_____///////////////////////////////////////////////////////////////////////


    $scope.toAssignProjects=[];

    $scope.searchProjects = function (search, page, onSuccess) {
        var desc = false;
        var data ={'search': search, 'page': page};
        server.requestPhp(data, 'SearchProjects').then(function (data) {
            if(data.error)
                return;
            else onSuccess(data);
        });
    }

    $scope.addProjectsToList = function (project) {
        console.log("addProjectsToList");
        if($scope.toAssignProjects.indexOf(project.projectid)==-1)
        {
            $scope.toAssignProjects.push(project.projectid);
        }
        else
        {
            $scope.toAssignProjects.splice($scope.toAssignProjects.indexOf(project.projectid), 1);
        }
    };

    //this one exist because i wanted to send only the projects id to the server side - and not all the project objects
    $scope.ProjectsIds=[];

    var PopAllProjectsIds = function() {
        for(var j=0;j<$scope.Userprojects.length;j++) {
            $scope.ProjectsIds.push($scope.Userprojects[j].projectid);
        }
    };

    $scope.commitNewProjects = function () {

        for(var i =0;i<$scope.toAssignProjects.length;i++)
        {
            for(var j=0;j<$scope.projects.length;j++)
            {
                if($scope.projects[j].projectid==$scope.toAssignProjects[i])
                    $scope.Userprojects.push($scope.projects[j]);
            }
        }
        PopAllProjectsIds();
        $scope.user.projects=$scope.ProjectsIds;
        $scope.closeProjectsForm();
    };

    $scope.closeProjectsForm = function() {
        $scope.ShowProjectsPopUp = false;
        $scope.toAssignProjects=[];
    }

    $scope.allowProjectsForm = function() {
        $scope.ShowProjectsPopUp = true;
    }

    $scope.removeProject = function(project){

        $scope.Userprojects.splice(project,1);
        PopAllProjectsIds();
        console.log("removeProject");
        //////////////////////////////////////////continue here
        console.log($scope.user.projects);
    }



    //////////////////////////////////////////////////////////____report subject____///////////////////////////////////////////////////////////////////////

    $scope.addReportSubject = function () {
        var newSubject = {};
        newSubject.reportSubjectStatus="1";
        $scope.user.reportSubjects.push(newSubject);
    }

    //////////////////////////////////////////////////////////_____image____///////////////////////////////////////////////////////////////////////
    $scope.fileUpload=false;

    $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; $files && i < $files.length; i++) {
            $scope.fileUpload=true;
            var $file = $files[i];
            Upload.upload({
                url: phpDomain+'datagate.php?type=uploadDoc&token=' + $rootScope.userToken,
                file: $file,
                progress: function(e){}
            }).then(function(data, status, headers, config) {
                // file is uploaded successfully
                if (data.data.fileUrl) {
                    $scope.user.image = data.data.fileUrl;
                    $rootScope.activeUser.image= $scope.user.image;
                }
                else if (data.data.error)
                    alert(data.data.error);
                else
                    alert("תקלה בהעלאת קובץ");
                $scope.fileUpload=false;
            });
        }
    };



    //approve the email of the student, to complete their registration
    $scope.approveUserRegistration = function () {
        var data = {};
        data.userId = $scope.userId;
        server.requestPhp(data, 'approveUserEmail').then(function (data) {
            $scope.user.needacceptregister = "";
        });
    }

    //////////////////////////////////////////////////////////_____SAVE_____///////////////////////////////////////////////////////////////////////


    $scope.SaveUser  = function() {
        var data = {};
        data.user=$scope.user;
        data.user.updatePassword = $scope.password.update;
        if($scope.userId)
        {
            server.requestPhp(data, 'UpdateUser').then(function (data) {
                alertSaveResults(data);
            });
        }
        else
        {
            server.requestPhp(data, 'AddUser').then(function (data) {
                alertSaveResults(data);
            });
        }
        if($rootScope.activeUser.userid==$scope.user.userid)
            $rootScope.activeUser.firstname=$scope.user.firstname;
    }

    var alertSaveResults = function (data) {
        if(data.error)
        {
            alert(data.error);
        }
        else
        {
            //display 'saved successfully' message
            alert("נשמר בהצלחה");
            $state.transitionTo('singleUser', {
                userId : $scope.userId
            });
        }
    }

    $scope.goBack = function(){
        if(confirm("שינויים שנעשו לא יישמרו"))
        {
            window.history.back();
        }
    };

    $scope.duplicateStaff = function() {
        $scope.user["tznumber"] = "";
        $scope.user["email"] = "";
        $scope.user["firstname"] = "";
        $scope.user["firstnameinarabic"] = "";
        $scope.user["lastname"] = "";
        $scope.user["lastnameinarabic"] = "";
        $scope.user["userId"]="";
        $scope.userId = null;

        unbindReportSubjectsFromStaff();
        alert("נא למלא את השדות החסרים ולשמור");
    };

    function unbindReportSubjectsFromStaff() {
        $scope.user.reportSubjects.forEach(function (subject)
        {
            //reset subject id
            subject.reportsubjectid=null;
        })
    }

    $scope.goToUserPage = function(user) {
        $state.transitionTo('singleUser', {
            userId : user.userid
        });
    }

    $scope.goToCoursePage = function(course) {
        $state.transitionTo('singleCourse', {
            courseId : course.courseid
        });
    }

    $scope.changed = function() {
        alert("שמירת פעולה זו תגרום לשינוי הסטטוס של משתמש\\ת זה\\ו בכל המערכת (כולל הרשמה לקורסים)");
    }
}]);