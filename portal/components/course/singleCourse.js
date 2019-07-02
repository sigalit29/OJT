apple.controller('singleCourse', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$q', 'userService', 'Upload','server',

function($rootScope, $scope, $state, $stateParams, $http, $q, userService, Upload, server) {

	//console.log($rootScope);

	$scope.courseid = $stateParams.courseId;

    $scope.alertcontrol={};

    var courseidCTRL, enrollmentroleidCTRL, usersCTRL;

    $scope.showModalDeleteSecondTeacher = function(user, courseid, enrollmentroleid){
    	if($rootScope.isAdmin) {
            $scope.user = user;
            courseidCTRL = courseid;
            enrollmentroleidCTRL = enrollmentroleid;
            usersCTRL = $scope.displayedEnrollments[enrollmentroleid].users;
            $scope.alertcontrol.open();
        }
    };

    var deleteUserFromTable = function(){
        var index =  usersCTRL.indexOf($scope.user);
        if (index > -1) {
            usersCTRL.splice(index, 1);
        }
    }

    var deleteUserFromDBase = function(user){
        var data={};
        data.userid   = user.userid;
        data.courseid = courseidCTRL;
        data.enrollmentroleid = enrollmentroleidCTRL;
        server.requestPhp(data,'DeleteFromEnrollment').then(function(data){
          //  console.log(data);
            if(!data) alert("שגיאה במחיקת מדריך משנה!");
        });
    }

    var usersToDelete = [];

    var deleteUsersFromDBase = function(){
        for (var i=0; i<usersToDelete.length ;i++)
            deleteUserFromDBase(usersToDelete[i]);
    }

    var addToArrayToDelete = function(){
    	usersToDelete.push($scope.user);
    };

    $scope.deleteSecondTeacher = function(){
        addToArrayToDelete  ();
        deleteUserFromTable ();	// deleteUsersFromDBase();
    }

    var arrStrKeys = [];

    var	updatedKeys = {};

    var updatedValues = {};

    var makeStrKey = function(key1,key2,key3){ return key1+";"+key2+";"+key3 }

    var updateUsersEnrollmentFields = function(){
        for(var i=0; i < arrStrKeys.length; i++) {
            var updatedKey = updatedKeys[arrStrKeys[i]];
            $scope.UpdateUserEnrollmentField (updatedKey[0],updatedKey[1],updatedKey[2],updatedValues[arrStrKeys[i]]);
        }
        arrStrKeys = [];
        updatedKeys = {};
        updatedValues = {};
    }

    $scope.saveUserEnrollmentField = function(userId, enrollmentId, fieldId, value) {
        var strKey = makeStrKey(userId,enrollmentId,fieldId);
        if (!arrStrKeys.includes(strKey)) {
            arrStrKeys.push(strKey);
            updatedKeys[strKey] = [userId,enrollmentId,fieldId];
        }
        updatedValues[strKey]=value;
    }

    $scope.UpdateUserEnrollmentField = function(userId, enrollmentId, fieldId, value) {
        var data={};
        data.enrollmentId=enrollmentId;
        data.fieldId = fieldId;
        data.userid = userId;
        data.value = value;
        server.requestPhp(data,'UpdateUserEnrollmentField').then(function (data) {});
    };


    var ConvertUnixTimeStemp = function(timestamp){
        var date = new Date(timestamp*1000);
		// Hours part from the timestamp
        var hours = date.getHours();
		// Minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
		// Seconds part from the timestamp
       // var seconds = "0" + date.getSeconds();

        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
		// Will display time in 10:30 format
        var timestamp =day+'/'+month+'/'+year+' '+ hours + ':' + minutes.substr(-2) ;
        return timestamp;
	};

    var getCourse=function() {
		var data ={};
		data.courseid=$scope.courseid;
		server.requestPhp(data, 'GetCourseById'
		).then(function (data) {
			$scope.course = data;
			console.log($scope.course);
			//an array keeping a list of subjects that should be deleted once the course id saved
			$scope.course.subjectsToDelete=[];
			getProjects();
			getCustomFields();
            $scope.getEnrolledUsersInRole(1);
            $scope.getEnrolledUsersInRole(2)
		});
	};
	
	if($scope.courseid)
	{
		getCourse();
	}
	else
	{
		$scope.course = {};

		$scope.course.status=1;

		$scope.course.subjects=[];
		
	}
	
	$scope.projects = [];

	var getProjects = function() {
		var data ={}
		server.requestPhp(data, 'GetProjects').then(function (data) {
			$scope.projects = data;
			//setTags($scope.course.projectid);
		});
	};

	getProjects();

    $scope.tags = [];

    $scope.EnrollmentTags = [];

    var GetEnrollmentTags = function() {
        var data ={}
        server.requestPhp(data, 'GetEnrollmentTags').then(function (data) {
            $scope.EnrollmentTags = data;
        });
    };

    GetEnrollmentTags();

	$scope.customFields = [];

	var getCustomFields = function(){
		var data = {"projectid":$scope.course.projectid};
		server.requestPhp(data, 'GetProjectCustomFields').then(function (data) {
			$scope.customFields = data;
		});
	}

	$scope.filterCurrProjectTags = function(project){
	    return $scope.course?project.projectid == $scope.course.projectid:false;
	};
	
	$scope.changeProject = function (projectid) {
		$scope.course.tags=[];
	}

	$scope.budgetyears = [];

	var getBudgetYears = function() {
		var data={};
		server.requestPhp(data, 'GetYearsBudget').then(function (data) {
			$scope.budgetyears = data;
		});
	};

	getBudgetYears();

	$scope.cities = [];

	var getCities = function() {
		var data ={};
		server.requestPhp(data, 'GetCities').then(function (data) {
			$scope.cities = data;
		});
	};

	getCities();
	
	//get genders list
	$scope.genders = [];

    var getGenders = function () {
    	var data ={};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    }

    getGenders();
	
    //get religions list
	$scope.religions = [];

    var getReligions = function () {
    	var data ={};
        server.requestPhp(data, 'GetReligions').then(function (data) {
		    $scope.religions = data;
		});
    }

    getReligions();
	
	//get enrollment roles list
	$scope.roles = [];

    var getEnrollmentRoles = function () {
    	var data ={};
        server.requestPhp(data, 'GetEnrollmentRoles').then(function (data) {
		    $scope.roles = data;
		    console.log($scope.roles);
			if(Array.isArray($scope.roles))
			getEnrollments();
		});
    }

    getEnrollmentRoles();

    // $scope.TeachersEnrollmentTags = [];
	//
    // function GetEnrollmentTagsForTeachers() {
    //     var data = {};
    //     server.requestPhp(data, "GetEnrollmentTagsForTeachers").then(function(data) {
    //         $scope.TeachersEnrollmentTags = data;
    //         console.log($scope.TeachersEnrollmentTags);
    //     });
    // }

    $scope.StudentsEnrollmentTags = [];

    function GetEnrollmentTagsForStudents() {
        var data = {};
        server.requestPhp(data, "GetEnrollmentTagsForStudents").then(function(data) {
            $scope.StudentsEnrollmentTags = data;
            console.log($scope.StudentsEnrollmentTags);
        });
    }

   // GetEnrollmentTagsForTeachers();

    GetEnrollmentTagsForStudents();

    $scope.displayedEnrollments =[];

	var getEnrollments = function () {
		for(var i=0; i<$scope.roles.length; i++)
		{
			var role = $scope.roles[i];
			var roleEnrollments=[];
			roleEnrollments.users = [];
			roleEnrollments.search = "";
			roleEnrollments.page = 0;
			roleEnrollments.pageCount = 0;
			roleEnrollments.loading = false;
			$scope.displayedEnrollments[role.enrollmentroleid] = roleEnrollments;
			$scope.getEnrolledUsersInRole(role.enrollmentroleid);
		}
	};
	
	$scope.getEnrolledUsersInRole = function(roleid) {
		$scope.displayedEnrollments[roleid].loading=true;
		var data ={};
		data.courseid = $scope.courseid;
		data.page = $scope.displayedEnrollments[roleid].page;
		data.search = $scope.displayedEnrollments[roleid].search;
		data.roleid = roleid;
		server.requestPhp(data, 'GetCourseEnrollmentProfiles').then(function (data) {
            console.log(data);
			$scope.displayedEnrollments[roleid].users = data.enrolled;
			$scope.displayedEnrollments[roleid].pageCount = data.pages;
			$scope.displayedEnrollments[roleid].loading=false;
		});
	};

	$scope.getEnrolledUsersInRoleFull=function(paramObj) {
		var roleid = paramObj.param1.enrollmentroleid;
		var async = $q.defer();
		$scope.displayedEnrollments[roleid].loading=true;
		var data ={};
		var users = [];
		data.courseid = $scope.courseid;
		data.page = -1;//$scope.displayedEnrollments[roleid].page;
		data.search = $scope.displayedEnrollments[roleid].search;
		data.roleid = roleid;
		server.requestPhp(data, 'GetCourseEnrollmentProfiles').then(function (data) {

			users = data;
			users.forEach(function(el){
				//el.status = el.status==1?"פעיל":"לא פעיל";
				el.genderid = ($scope.genders.filter(function(gel){
					return gel.genderid == el.genderid;
				})[0] || {"genderid":null, "name": "לא מוגדר"}).name;
				el.religionid=($scope.religions.filter(function(rel){
					return rel.religionid == el.religionid;
				})[0] || {"religionid":null, "name": "לא מוגדר"}).name;
				el.address = el.cityname + " " + el.address;
				if(!el.birthday){
					el.birthday="";
				}else
				{
					el.birthday=moment(el.birthday,"YYYY-MM-DD")._d;
				}
			});
			var header={firstname: "שם", lastname: "שם משפחה",	genderid: "מגדר", religionid: "מגזר", status: "סטטוס", email: "אימייל", tznumber: "ת''ז",	phone: "טלפון", address: "כתובת", birthday: "תאריך לידה"};
			
			users.unshift(header);
		    async.resolve(users);
			$scope.displayedEnrollments[roleid].loading=false;
		});
		return async.promise;
	};

	$scope.goToEnrolledUsersOfRolePage = function (pageNum, data) {
		if(pageNum>=0&&pageNum<=$scope.displayedEnrollments[data.roleid].pageCount)
		{
			$scope.displayedEnrollments[data.roleid].page=pageNum;
			$scope.getEnrolledUsersInRole(data.roleid);
		}
	}
		
	$scope.openEnrollmentForm = function() {
		$scope.toAssign = {};
		if($scope.roles)
		{
			$scope.toAssign.roleid = $scope.roles[0].enrollmentroleid;
			$scope.enroll=true
		}
	}
	
	/*
	a list of currently selected users in the new enrollments form
	(after hitting "enroll", all users in this list will be added to the course)
	*/
	$scope.toEnrollUsers = [];
	
	$scope.searchUsersToEnroll = function (search, page, onSuccess) {
		var desc = false;
		var userstatus = 1;
		var sorting = "userid";
		var data =
			{'courseid': ($scope.course.courseid?$scope.course.courseid:-1),
			'search': search,
			'sorting': sorting,
			'desc':desc,
			'userstatus': userstatus,
			'page': page};
		server.requestPhp(data, 'SearchUsersToEnroll').then(function (data) {
			onSuccess(data);
		});
	}
	
	$scope.addUserToEnrollmentList = function (user) {
		if($scope.toEnrollUsers.indexOf(user.userid)==-1)
		{
			$scope.toEnrollUsers.push(user.userid);
		}
		else
		{
			$scope.toEnrollUsers.splice($scope.toEnrollUsers.indexOf(user.userid), 1);
		}
	}
	
	$scope.commitNewEnrollments = function (roleid) {
		var data ={'userids': $scope.toEnrollUsers, 'courseid': $scope.course.courseid, 'roleid': roleid};
		server.requestPhp(data, 'EnrollUsers').then(function (data) {
			$scope.getEnrolledUsersInRole(roleid);
		});
		$scope.closeEnrollmentForm();
	}
	
	$scope.closeEnrollmentForm = function() {
		$scope.enroll = false;
		$scope.toEnrollUsers=[];
	};
	
	$scope.assignPrimaryTeacher = function(user) {
		$scope.course.primaryTeacherId = user.userid;
		$scope.course.primaryTeacherName = user.userinfo;
		$scope.chooseTeacher=false;
	};
	
    $scope.goToUserPage = function(user) {
        if($rootScope.isAdmin) {
            $state.transitionTo('singleUser', {
                userId: user.userid
            });
        }
    };


    $scope.UpdateUserReligion = function(user) {
		var data={};
		data.religionid = user.religionid;
		data.userid = user.userid;
		server.requestPhp(data, 'UpdateUserReligion').then(function (data) {
		});
	};

	$scope.UpdateUserGender = function(user) {
		var data={};
		data.genderid = user.genderid;
		data.userid = user.userid;
		server.requestPhp(data, 'UpdateUserGender').then(function (data) {
		});
	};

    $scope.UpdateUserEnrollmentRole = function(user) {
        if(user.isPrimary==1 && user.enrollmentroleid==1)
        {
            alert("משתמש זה הינו מדריך ראשי - לביצוע פעולה זו יש לפנות למנהל המערכת.");
            return;
        }
        else {
            var data = {};
            data.enrollmentroleid = user.enrollmentroleid;
            data.userid = user.userid;
            server.requestPhp(data, 'UpdateUserEnrollmentRole').then(function (data) {
            });
        }
    };

    $scope.UpdateUserStatus = function(user) {
		var data={};
		data.courseid=$scope.course.courseid;
		data.status = user.status;
		data.userid = user.userid;
		console.log(data);
		server.requestPhp(data, 'UpdateUserStatus').then(function (data) {
		});
	};

    $scope.UpdateEnrollmentTag = function(user) {
        var data={};
        data.courseid=$scope.course.courseid;
        data.enrollmenttagid =user.enrollmenttagid;
        data.userid = user.userid;
        server.requestPhp(data, 'UpdateEnrollmentTag').then(function (data) {
        });
    };

	$scope.UpdateUserEnrollmentField = function(userId, enrollmentId, fieldId, value) {
		var data={};
		data.enrollmentId=enrollmentId;
		data.fieldId = fieldId;
		data.userid = userId;
		data.value = value;
		server.requestPhp(data, 'UpdateUserEnrollmentField').then(function (data) {
		});
	};
	
	$scope.addSubject = function(context) {
		context.push({
			"subjectid" : null,
			"subject" : '',
			"subjectinarabic" : '',
			"subsubjects" : []
		});
	};

	//moves a subject upwards or downwards (switches it with an adjusent subject)

	$scope.switchSubjects = function(subject, roots, dir){
		var currIndex=roots.indexOf(subject);
		if(currIndex+dir>=0&&currIndex+dir<roots.length)
		{
			var tempSubject = subject;
			roots[currIndex] = roots[currIndex+dir];
			roots[currIndex+dir] = tempSubject;
		}
		else
		{
			return;
		}
	}

	$scope.deleteSubject = function(subject, roots){
		if(roots)
		{
			var index = roots.indexOf(subject);
			if (index > -1) {
				roots.splice(index, 1);
			}
		}
		if(subject.subjectid)
		{
			$scope.course.subjectsToDelete.push(subject.subjectid);
		}
		for(var i=0; i<subject.subsubjects.length; i++)
		{
			$scope.deleteSubject(subject.subsubjects[i], null);
		}
	};

	$scope.emptySyllabus = function (){
		if(!confirm("בטוח\\ה? כל הנושאים יימחקו!"))
			return;
		while($scope.course.subjects.length>0)
		{
			$scope.deleteSubject($scope.course.subjects[0], $scope.course.subjects);
		}
	};
	
	$scope.uploadingSyllabus = false;

	$scope.uploadSyllabus = function($files) {
		if(!$files)
			return;
		$scope.uploadingSyllabus = true;
		Upload.upload({
			url : phpDomain+'datagate.php?type=UploadSyllabusFile&token=' + $rootScope.userToken + '&v=' + version,
			file : $files,
			progress : function(e) {
			}
		}).then(function(response, status, headers, config) {
			if (response.data.error != null) {
				alert(response.data.error);
			} else if (response.status == 200) {
				$scope.course.subjects = $scope.course.subjects.concat(response.data);
			} else
				alert("תקלה בהעלאת קובץ");
			$scope.uploadingSyllabus = false;
		});
	};
	
	$scope.SaveCourse = function() {
        var data = {};
        data.course=$scope.course;
        if($scope.courseid)
        {
            if (usersToDelete&&usersToDelete.length) deleteUsersFromDBase();
            server.requestPhp(data, 'UpdateCourse').then(function (data) {
                if(data.error)
                {
                    alert(data.error);
                }
                else
                {
                    //display 'saved successfully' message
                    alert("נשמר בהצלחה");
                    getCourse();
                    //location.reload();
                }
            });
        }
		else
		{
			server.requestPhp(data, 'AddCourse').then(function (data) {
				if(data.error)
				{
					alert(data.error);
				}
				else
				{
					//display 'saved successfully' message
					alert("נשמר בהצלחה");
					$state.transitionTo('singleCourse', {
						courseId : data.courseid
					});
				}
			});
		}
	};
	
	$scope.duplicateCourse = function() {
		$scope.students = [];
		unbindSubjectsFromCourse();
		$scope.course.courseid = null;
		$scope.course.name = '';
		$scope.course.code = '';
		$scope.courseid = null;
		alert("נא למלא את השדות החסרים ולשמור");
	};
	
	function unbindSubjectsFromCourse() {
		for(var i=0; i<$scope.course.subjects.length; i++)
		{
			//and reset their subsubject id
			recursiveSubjectUnbinding($scope.course.subjects[i]);
		};
	};

	function recursiveSubjectUnbinding(subject) {
		subject.subjectid=null;
		if(subject.subsubjects)
		{
			for(var i=0; i<subject.subsubjects.length; i++)
			{
				//and reset their subsubject id
				recursiveSubjectUnbinding(subject.subsubjects[i]);
			};
		}
	};
	
	$scope.goBack = function(){
		if(confirm("שינויים שנעשו לא יישמרו"))
		{
			window.history.back();
		}
	};

	$scope.deleteCourse = function() {
		var data = {courseid : $scope.course.courseid};
		server.requestPhp(data, 'DeleteCourse').then(function(data) {
			window.history.back();
		});
	};

	$scope.preventSubmit = function(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

    $scope.changed = function() {
        alert("שמירת פעולה זו תגרום לשינוי הסטטוסים של החניכים והמדריכים בקורס זה!");
   }
}]);
