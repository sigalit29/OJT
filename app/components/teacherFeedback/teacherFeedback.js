apple.controller('teacherFeedback', ['$scope', '$stateParams', '$rootScope', '$state', 'server', function ($scope, $stateParams, $rootScope, $state, server) {

$rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.subjectFeedbackText });

$scope.questions = [];

$scope.getQuestions = function () {
	var data = {};
	server.requestPhp(data, "GetMadrichQuestions").then(function (data) {
		$scope.questions=data;
	});
};
$scope.getQuestions();

$scope.commentChanged = function (comment) {
	$scope.feedbackComment = comment;
};

$scope.sendFeedback = function () {
	//don't send feedback multiple times if button is pressed in rapid succession.
	if($scope.waitingForServerResponse)
		return;
	$scope.waitingForServerResponse = true;
	var data = {};
	data.lessonid = $stateParams["lessonId"];
	data.ratings = [];
	data.comments = [];
	for (var i = 0; i < $scope.questions.length; i++)
	{
		var question = $scope.questions[i];
		var response = {};
		response.questionid = question.questionid;
		response.responseid = question.grading;
		data.ratings.push(response);
	}
	if($scope.feedbackComment)
		data.comments.push($scope.feedbackComment);
	server.requestPhp(data, "postTeacherLessonFeedback").then(function (data) {
		$state.transitionTo('end', {courseId: $stateParams["courseId"], lessonId: $stateParams["lessonId"]});
		$scope.waitingForServerResponse = false;
	});
};

} ]);

