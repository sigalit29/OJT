apple.controller('subjectFeedback', ['$scope', '$stateParams', '$rootScope', '$state', 'server', function ($scope, $stateParams, $rootScope, $state, server) {

	$scope.courseid = $stateParams["courseId"];
	$scope.lessonid = $stateParams["lessonId"];
	$rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.subjectFeedbackText });
	$scope.subjects = [];
	$scope.customSubjects=[];
	//$scope.customSubjectModel={rating:null};
	
	$scope.getLessonData = function () {
		var data = {}
		data.lessonid = $scope.lessonid;
		server.requestPhp(data, "GetLessonById").then(function (data) {
			//console.log(data.lesson);
			$scope.customSubjects = data.lesson.customSubjects;
			$scope.subjects = data.lesson.syllabus;
		});
	}
	$scope.getLessonData();
	
	$scope.commentChanged = function (comment) {
		$scope.feedbackComment = comment;
	};
	
	$scope.sendFeedback = function () {
		console.log("sendFeedback");
		//don't send feedback multiple times if button is pressed in rapid succession.
		if($scope.waitingForServerResponse)
			return;
		$scope.waitingForServerResponse = true;
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.ratings = [];
		data.csRatings=[];
	//	data.customSubjectRating = $scope.customSubjectModel.rating;
		data.comments = [];
		for (var i = 0; i < $scope.subjects.length; i++)
		{
			var subject = $scope.subjects[i];
			var response = {};
			response.subjectid = subject.subjectid;
			response.responseid = subject.grading;
			response.customSubject=0;
			data.ratings.push(response);
			// console.log("data1:");
			console.log(data.ratings);
		}
		for (var i = 0; i < $scope.customSubjects.length; i++)
		{
			var subject = $scope.customSubjects[i];
			var response = {};
			response.subjectid = subject.subjectid;
			response.responseid = subject.rading;
			response.customSubject=1;
			data.ratings.push(response);
			// console.log("data2:");
			console.log(data.ratings);
		}
		if($scope.feedbackComment)
			data.comments.push($scope.feedbackComment);
        console.log(data);
		server.requestPhp(data, "postStudentSubjectFeedback").then(function (data) {
			$state.transitionTo('end', { courseId: $stateParams["courseId"], lessonId: $stateParams["lessonId"] });
			$scope.waitingForServerResponse = false;
		});
	};
	
	} ]);
	
	