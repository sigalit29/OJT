var apple = angular.module('appleApp', ['ui.router', 'ngFileUpload']);
apple.config(function ($stateProvider, $urlRouterProvider, $compileProvider) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(tel|sms|whatsapp|https?|ftp|mailto|chrome-extension):/);
	$urlRouterProvider.otherwise("/login");

	$stateProvider
	.state('login', {
		url: '/login',
		views: {
			"main": {
				controller: 'login',
				templateUrl: './components/login/login.html'
			}
		}
	})
	.state('studentSignup', {
		url: '/studentSignup',
		views: {
			"main": {
				controller: 'studentSignup',
				templateUrl: './components/studentSignup/studentSignup.html'
			}
		}
	})
	.state('userProfile', {
		url: '/userProfile/:userId',
		views: {
			"main": {
				controller: 'userProfile',
				templateUrl: './components/userProfile/userProfile.html'
			}
		}
	})
	.state('teacherProfile', {
		url: '/teacherProfile/:staffId',
		views: {
			"main": {
				controller: 'teacherProfile',
				templateUrl: './components/teacherProfile/teacherProfile.html'
			}
		}
	})
	.state('setting', {
		url: '/setting',
		views: {
			"main": {
				controller: 'setting',
				templateUrl: './components/setting/setting.html'
			}
		}
	})
	.state('courses', {
		url: '/courses',
		views: {
			"main": {
				controller: 'courses',
				templateUrl: './components/courses/courses.html'
			}
		}
	})
	.state('attendanceReporting', {
		url: '/attendanceReporting/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'attendanceReporting',
				templateUrl: './components/attendanceReporting/attendanceReporting.html'
			}
		}
	})
	.state('activeLesson', {
		url: '/activeLesson/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'activeLesson',
				templateUrl: './components/activeLesson/activeLesson.html'
			}
		}
	})
	.state('subjectFeedback', {
		url: '/subjectFeedback/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'subjectFeedback',
				templateUrl: './components/subjectFeedback/subjectFeedback.html'
			}
		}
	})
	.state('attendanceApproval', {
		url: '/attendanceApproval/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'attendanceApproval',
				templateUrl: './components/attendanceApproval/attendanceApproval.html'
			}
		}
	})
	.state('syllabus', {
		url: '/syllabus/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'syllabus',
				templateUrl: './components/syllabus/syllabus.html'
			}
		}
	})
	.state('studentFeedback', {
		url: '/studentFeedback/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'studentFeedback',
				templateUrl: './components/studentFeedback/studentFeedback.html'
			}
		}
	})
	.state('teacherFeedback', {
		url: '/teacherFeedback/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'teacherFeedback',
				templateUrl: './components/teacherFeedback/teacherFeedback.html'
			}
		}
	})
	.state('createLesson', {
		url: '/createLesson/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'createLesson',
				templateUrl: './components/createLesson/createLesson.html'
			}
		}
	})
	.state('singleCourse', {
		url: '/singleCourse/:courseId',
		views: {
			"main": {
				controller: 'singleCourse',
				templateUrl: './components/singleCourse/singleCourse.html'
			}
		}
	})
	.state('nextLesson', {
		url: '/nextLesson/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'nextLesson',
				templateUrl: './components/nextLesson/nextLesson.html'
			}
		}
	})
	.state('end', {
		url: '/end/:courseId/:lessonId',
		views: {
			"main": {
				controller: 'end',
				templateUrl: './components/end/end.html'
			}
		}
	})
	.state('mentoringSession', {
		url: '/mentoringSession/:courseId',
		views: {
			"main": {
				controller: 'mentoringSession',
				templateUrl: './components/mentoringSession/mentoringSession.html'
			}
		}
	})
	.state('teacherDashboard', {
		url: '/teacherDashboard/:courseId',
		views: {
			"main": {
				controller: 'teacherDashboard',
				templateUrl: './components/teacherDashboard/teacherDashboard.html'
			}
		}
	})
	.state('syllabusDashboard', {
		url: '/syllabusDashboard/:courseid',
		views: {
			"main": {
				controller: 'syllabusDashboard',
				templateUrl: './components/syllabusDashboard/syllabusDashboard.html'
			}
		}
	})
	.state('resetPassword', {
		url: '/resetPassword',
		views: {
			"main": {
				controller: 'resetPassword',
				templateUrl: './components/resetPassword/resetPassword.html'
			}
		}
	})
	.state('changePassword', {
		url: '/changePassword/:backState/:token',
		views: {
			"main": {
				controller: 'changePassword',
				templateUrl: './components/changePassword/changePassword.html'
			}
		}
	})
	.state('myClassroom', {
		url: '/myClassroom/:courseId',
		views: {
			"main": {
				controller: 'myClassroom',
				templateUrl: './components/myClassroom/myClassroom.html'
			}
		}
	})
	.state('lessonHistory', {
		url: '/lessonHistory/:courseId',
		views: {
			"main": {
				controller: 'lessonHistory',
				templateUrl: './components/lessonHistory/lessonHistory.html'
			}
		}
	})
});
	
apple.run(['$rootScope', '$state', 'login', 'push', '$window', '$templateCache', function ($rootScope, $state, login, push, $window, $templateCache) {
	//$window.ga('create', 'UA-100454866-1', 'auto');
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
	});
	$rootScope.showPushPopup = false;
	$rootScope.$state = $state;
	$rootScope.phpDomain = phpDomain;
    $rootScope.clientVersion = version;
    $rootScope.imgsDomain = imgsDomain;
	$rootScope.push = push;
	var loginToken = localStorage.getItem('loginToken');
		login.isLogin().then(function (data) {
	});
	$rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
		// $window.ga('send', 'pageview', toState.views.main.controller);
		try {
			// window.cordova.plugins.firebase.analytics.logEvent("page_view", {page: toState.name});
			window.ga.trackView(toState.name);
			window.ga.trackEvent('page_view', toState.name)
		}
		catch (e) {
		}
	});

	$rootScope.setDevicePlatform = function () {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;

		if (/android/i.test(userAgent)) {
			return false;
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return true;
		}
	};
	
	$rootScope.isIos = $rootScope.setDevicePlatform();
	$rootScope.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	$rootScope.initLanguage = function () {
		var langFromStorage = localStorage.getItem('lang');
		//if there is language in localstorage
		if (langFromStorage && langFromStorage.length > 0) {
			if (langFromStorage == 'arabic') {
				$rootScope.dictionary = arabic;
				$rootScope.isArabic = true;
			}
			else if (langFromStorage == 'hebrew') {
				$rootScope.dictionary = hebrew;
				$rootScope.isArabic = false;
			}
		}
		else {
			localStorage.setItem('lang', 'hebrew');
			$rootScope.dictionary = hebrew;
			$rootScope.isArabic = false;
		}
	};
	$rootScope.initLanguage()

}]);
