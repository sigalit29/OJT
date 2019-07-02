apple.controller('grade', ['$scope', '$stateParams', '$rootScope', '$state', 'server', function ($scope, $stateParams, $rootScope, $state, server) {

    $rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.lessonGradingText });

    $scope.hideGardeSection = false;
    $scope.checkoutOpen = true;
    $rootScope.gradePage = true;
    
$scope.getstudentStatusOfLesson = function () {
        $scope.courseId = $stateParams["courseId"];
        var data = {};
        data.courseid = $scope.courseId;
        server.requestPhp(data, "GetUserFlowPosInCourse").then(function (data) {
            //check if the user has already given their feedback
            if (data.lastlesson&&data.lastlesson!=undefined) {
            	if ($rootScope.userType == 'madrich' && data.lastlesson && data.lastlesson.checkoutProgress.gaveFeedback) {
            		$state.transitionTo('singleCourse', {courseId: $stateParams["courseId"]});
            	}
            }
            else {
            	$state.transitionTo('singleCourse', { courseId: $stateParams["courseId"]});
            }
        });
	};
	$scope.getstudentStatusOfLesson();
	$scope.getQuestions = function () {
        var data = {};
        data.lessonid = $stateParams["lessonId"];
        if ($rootScope.userType == 'student') {
            server.requestPhp(data, "GetUniformQuestionsApi").then(function (data) {
                $scope.callStructure(data);
            });
        }
        else if ($rootScope.userType == 'madrich') {
            server.requestPhp(data, "GetMadrichQuestionsApi").then(function (data) {
                $scope.callStructure(data);
            });
        }
    };
    $scope.getQuestions();

    $scope.callStructure = function (data) {
        if (data && !data.error) {
            $scope.question = data;
            $scope.changeStructureQuestionObject();
        }
    };

    $scope.changeStructureQuestionObject = function () {
        var data = {};
        if ($scope.question && $scope.question.length > 0) {
            for (var i = 0; i < $scope.question.length; i++)
                for (var j = 0; j < $scope.question[i].answers.length; j++) {
                    $scope.question[i].answers[j].value = j;
                }
        }
    };

    $scope.commentChanged = function (comment) {
        $scope.feedbackComment = comment;
    };

    $scope.sendFeedback = function () {
    	//don't send feedback multiple times if button is pressed in rapid succession.
    	if($scope.waitingForServerResponse == true)
    		return
    	$scope.waitingForServerResponse = true;
        var data = {};
        data.token = $rootScope.loginToken;
        data.lessonid = $stateParams["lessonId"];
        data.feedbacklist = angular.copy($scope.question);
        if($scope.feedbackComment){
             data.feedbacklist.push({ "question": "open", "answer": $scope.feedbackComment, "questiontype": "open" });
        }
        console.log(data.feedbacklist);
        data.type = 'general';
        if ($rootScope.userType == 'student') {
            server.requestPhp(data, "StudentCheckOut").then(function (data) {
            	$scope.waitingForServerResponse = false;
                $state.transitionTo('lessonGrading', { courseId: $stateParams["courseId"], lessonId: $stateParams["lessonId"] });
            });
        }
        else if ($rootScope.userType == 'madrich') {
            server.requestPhp(data, "SetLessonFeedback").then(function (data) {
                $scope.waitingForServerResponse = false;
                $state.transitionTo('end', { courseId: $stateParams["courseId"], lessonId: $stateParams["lessonId"] });
            });
        }
    };

    $scope.initTextAreaInit = function () {
        initTextareaResize();
    };

	$scope.$on('nextButton', function(event, data) {
		  $scope.sendFeedback();
	});
	
} ]);

