var apple = angular.module('apple', ['angular.filter','app.directives', 'ui.sortable', 'ui.router','ngFileUpload','emoji','ngSanitize','ui.toggle'])

apple.service('userService',['$q', '$state','$rootScope', 'server', function($q,$state,$rootScope, server){
	var loginStatus =null;
	var isFirstEnter = true;
	this.isLogin = function(){
		if (!loginStatus){
			var data = {token : $rootScope.userToken};
			server.requestPhp(data, 'isLogin').then(function (data) {
				if(data!=false)
				{
				}
				loginStatus=(data!=false);	
				return loginStatus;
			});
		}
		else {
			var defer = $q.defer();
			defer.resolve( loginStatus );
			return( defer.promise );
		}
	};
	
	this.login = function(){
		loginStatus=true;
	};
	
	// this.firstEnter = function(){
	// 	var state = isFirstEnter;
	// 	//isFirstEnter = false;
	// 	return state;
	// };
	//
	this.logout = function(){
		var data = {token : $rootScope.userToken};
		server.requestPhp(data, 'logout').then(function (data) {
			loginStatus	=false;
			$rootScope.userToken = "";
			$rootScope.activeUser = {};
			$rootScope.isAdmin = false;
			$state.transitionTo('login');
		});
	}
}]);

apple.run(function ($rootScope, $timeout, $state, userService, $document, server, $templateCache) {
    // setting the active user to rootscope after refresh + loading token and other stuff from local storage
	var retrievedActiveuser = localStorage.activeUser;
	var retrievedUserToken = localStorage.token;
	$rootScope.isAdmin = (localStorage.isAdmin === 'true');
	if (retrievedActiveuser) {
		$rootScope.activeUser = JSON.parse(retrievedActiveuser);
	}
	$rootScope.userToken = retrievedUserToken;
    $(window).on('beforeunload', function() {
        //add this back in to make users automatically log out on refresh
        //userService.logout();
    });
	// $(window).on('beforeunload', function() {
	// //add this back in to make users automatically log out on refresh
	// 	//userService.logout();
	// });
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
	});
})

/**** UI Router ****/
apple.config(function ($stateProvider, $urlRouterProvider,$httpProvider) {
	$urlRouterProvider.otherwise("/login");

	$stateProvider
	.state("login", {
		url: "/login",
		views: {
			"main": {
				templateUrl: "components/login/login.html",
				controller: "login"
			}
		}
	})
	.state("courseList", {
		url: "/courseList?:search&:sorting&{desc:bool}&{page:int}",
		params: {
			search: {
			   dynamic: true,
			   value:""
			},
			sorting:
			{
				dynamic: true,
				value:""
			},
			desc:
			{
				dynamic: true,
				value:false
			},
			page:
			{
				dynamic: true,
				value:0
			}
		},
		views: {
			"main": {
				templateUrl: "components/course/courseList.html",
				controller: "courseList"
			}
		}
	})
	.state("singleCourse", {
		url: "/singleCourse/:courseId",
		views: {
			"main": {
				templateUrl: "components/course/singleCourse.html",
				controller: "singleCourse"
			}
		}
	})
	.state("userList", {
		url: "/userList/:userType?:search&:sorting&{desc:bool}&{page:int}",
		params: {
			search: {
				dynamic: true,
				value:""
			},
			sorting:
			{
				dynamic: true,
				value:""
			},
			desc:
			{
				dynamic: true,
				value:false
			},
			page:
			{
				dynamic: true,
				value:0
			}
		},
		views: {
			"main": {
				templateUrl: "components/user/userList.html",
				controller: "userList"
			}
		}
	})
	.state("singleUser", {
		url: "/singleUser/:userId",
		views: {
			"main": {
				templateUrl: "components/user/singleUser.html",
				controller: "singleUser"
			}
		}
	})
	.state("singleLesson", {
		url: "/singleLesson/:lessonId?lessonNum&",
        params:{
			lessonNum:
			{
				dynamic: true,
				value:""
			}
        },
		views: {
			"main": {
				templateUrl: "components/lesson/singleLesson.html",
				controller: "singleLesson"
			}
		}
	})
	.state("nomineeList", {
			url: "/nomineeList?:search&:sorting&{desc:bool}&{page:int}",
			params: {
				search: {
				   dynamic: true,
				   value:""
				},
				sorting:
				{
					dynamic: true,
					value:""
				},
				desc:
				{
					dynamic: true,
					value:false
				},
				page:
				{
					dynamic: true,
					value:0
				}
			},
			views: {
				"main": {
					templateUrl: "components/nominee/nomineeList.html",
					controller: "nomineeList"
				}
			}
		})
		.state("singleNominee", {
			url: "/singleNominee/:nomineeId",
			views: {
				"main": {
					templateUrl: "components/nominee/singleNominee.html",
					controller: "singleNominee"
				}
			}
		})
	.state("city", {
		url: "/city",
		views: {
			"main": {
				templateUrl: "components/city/city.html",
				controller: "city"
			}
		}
	})
	.state("gender", {
		url: "/gender",
		views: {
			"main": {
				templateUrl: "components/gender/gender.html",
				controller: "gender"
			}
		}
	})
	.state("religion", {
		url: "/religion",
		views: {
			"main": {
				templateUrl: "components/religion/religion.html",
				controller: "religion"
			}
		}
	})
	.state("language", {
		url: "/language",
		views: {
			"main": {
				templateUrl: "components/language/language.html",
				controller: "language"
			}
		}
	})
	.state("project", {
		url: "/project",
		views: {
			"main": {
				templateUrl: "components/project/project.html",
				controller: "project"
			}
		}
	})
	.state("question", {
		url: "/question",
		views: {
			"main": {
				templateUrl: "components/question/question.html",
				controller: "question"
			}
		}
	})
	.state("yearbudget", {
		url: "/yearbudget",
		views: {
			"main": {
				templateUrl: "components/yearbudget/yearbudget.html",
				controller: "yearbudget"
			}
		}
	})
	.state("hoursreport", {
		url: "/hoursreport",
		views: {
			"main": {
				templateUrl: "components/hoursreport/hoursreport.html",
				controller: "hoursreport"
			}
		}
	})
	.state("checkreport", {
		url: "/checkreport",
		views: {
			"main": {
				templateUrl: "components/checkreport/checkreport.html",
				controller: "checkreport"
			}
		}
	})
	.state("salarycode", {
		url: "/salarycode",
		views: {
			"main": {
				templateUrl: "components/salarycode/salarycode.html",
				controller: "salarycode"
			}
		}
	})
	.state("clientcode", {
		url: "/clientcode",
		views: {
			"main": {
				templateUrl: "components/clientcode/clientcode.html",
				controller: "clientcode"
			}
		}
	})
	.state("subjectreport", {
		url: "/subjectreport",
		views: {
			"main": {
				templateUrl: "components/subjectreport/subjectreport.html",
				controller: "subjectreport"
			}
		}
	})
	.state("studentstatus", {
		url: "/studentstatus",
		views: {
			"main": {
				templateUrl: "components/studentstatus/studentstatus.html",
				controller: "studentstatus"
			}
		}
	})
	.state("myprofile", {
		url: "/myprofile",
		views: {
			"main": {
				templateUrl: "components/myprofile/myprofile.html",
				controller: "myprofile"
			}
		}
	})
	.state("profession", {
		url: "/profession",
		views: {
			"main": {
				templateUrl: "components/profession/profession.html",
				controller: "profession"
			}
		}
	})
	.state("certificate", {
		url: "/certificate",
		views: {
			"main": {
				templateUrl: "components/certificate/certificate.html",
				controller: "certificate"
			}
		}
	})
});
