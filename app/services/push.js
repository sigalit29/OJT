apple.factory('push', ['$rootScope', '$http', '$q', '$state', '$timeout', 'server',
function($rootScope, $http, $q, $state, $timeout, server) {
	return {
		pushArr : new Array(),
		initPush : function(data, type) {
			//init the get push token events
			try {
				pushService = this;
				FCMPlugin.getToken(function(token) {
					console.log(token);
					pushService.setPushToken(token);
				});

				FCMPlugin.onTokenRefresh(function(token) {
					console.log(token);
					pushService.setPushToken(token);
				});
				FCMPlugin.onNotification(function(data) {
					console.log(JSON.stringify(data));
					if (data.wasTapped) {
						this.pushData = data;
						//  alert(JSON.stringify(data))
						//navigate by push type
						pushService.goToPageByNotification(data);
					} else {
						$timeout(function() {
							//insert the push notification to stack  - for the popup preview
							pushService.pushArr.push(data);
							// alert(JSON.stringify(data))
						}, 0);
					}
				});

			} catch (e) {
				console.log('FCMPlugin not exist');
			}

		},
		removePushFromStack : function(data) {
			var pushItemIndex = this.pushArr.indexOf(data);
			this.pushArr.splice(pushItemIndex, 1);
		},
		goToPageByNotification : function(data) {
			if (data.type == 'newLesson') {
				//this notification appears for students when a new lesson in opened
				$state.transitionTo('nextLesson', {
					lessonId : data.lessonid,
					courseId : data.courseid,
				});
			} else if (data.type == 'lessonActivated') {
				//this notification appears when a meeting has been opened, and students should report their attendance
				$state.transitionTo('activeLesson', {
					lessonId : data.lessonid
				});
			} else if (data.type == 'checkout') {
				$state.transitionTo('studentFeedback', {
					courseId : data.courseid,
					lessonId : data.lessonid
				});
			} else if (data.type == 'dashboardReminder') {
				//this notification lets a teacher know that there is now a new meeting they havn't checked yet in their dashboard.
				$state.transitionTo('teacherDashboard', {
					courseId : data.courseid
				});
			} else if (data.type == 'closingReminder') {
				//this notification appears for teachers if a meeting is open for more than 10 hours
				$state.transitionTo('activeLesson', {
					courseId : data.courseid,
					lessonId : data.lessonid
				});
			} else if (data.type == 'activationReminder') {
				//this notification appears for teachers a couple of minutes before the meeting is scheduled to begin
				$state.transitionTo('nextLesson', {
					lessonId : data.lessonid,
					courseId : data.courseid,
				});
			} else {
				$state.transitionTo('singleCourse', {
					courseId : data.courseid
				});
			}

		},
		//set the push in local storage and throw event about it
		setPushToken : function(token) {
			localStorage.setItem('pushToken', token);
			this.updateServerWithToken();
		},
		updateServerWithToken : function() {
			var pushToken = localStorage.getItem('pushToken');
			//if there is pushToken and the user login  -update the server
			if (pushToken) {
				var data = {};
				data.fbtoken = pushToken;
				//update the server
				server.requestPhp(data, "saveFireBaseToken").then(function(data) {
					var x = data;
				});
			}
		},
		getPush : function(data, type) {
			var deferred = $q.defer();
			//if the user login -update the server with the push token
			var pushToken = localStorage.getItem('pushToken');
			return pushToken;
		}
	};
}]);
//listen to device ready and init push
try {
	document.addEventListener("deviceready", function() {
		angular.element(document.body).injector().get("push").initPush();
	}, false);
} catch (e) {
	console.log(e);
}