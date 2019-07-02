apple.controller('lessonGrading', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter', '$interval',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter, $interval) {

	$scope.userName = $rootScope.userData.firstname;
	$rootScope.gradePage = false;
	$scope.courseId = $stateParams["courseId"];

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.lessonGradingText
	});
	
	$scope.getstudentStatusOfLesson = function() {
        var data = {};
        data.courseid = $scope.courseId;
        server.requestPhp(data, "GetUserFlowPosInCourse").then(function (data) {
            //check if the user has already given their feedback
            if (data.lastlesson&&data.lastlesson!=undefined) {
            	if ($rootScope.userType == 'student' && data.lastlesson.checkoutProgress.gaveSubjectsFeedback) {
            		$state.transitionTo('singleCourse', {courseId: $stateParams["courseId"]});
            	}
            }
            else {
            	$state.transitionTo('singleCourse', { courseId: $stateParams["courseId"]});
            }
        });
	};
	
	$scope.getstudentStatusOfLesson();
	// the function get the syllabus data, and convert to new array with the subject and subsubject that was learned.
	$scope.getEducationMterial = function() {
		var data = {};
		data.courseId = $stateParams["courseId"];
		data.lessonid = $stateParams["lessonId"];
		server.requestPhp(data, "GetSubjectLessonByLessonId").then(function(data) {
			// console.log(data);
			if (data && !data.error) {
				$scope.syllabusData = data;
				$scope.subjestQuestion = [];
				var index = 0;
				if ($scope.syllabusData && $scope.syllabusData.length > 0) {
					for (var i = 0; i < $scope.syllabusData.length; i++) {
						$scope.answers = [{
							value : 0,
							text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
							textarabic : $scope.syllabusData[i].subjectinarabic
						}, {
							value : 1,
							text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
							textarabic : $scope.syllabusData[i].subjectinarabic
						}, {
							value : 2,
							text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
							textarabic : $scope.syllabusData[i].subjectinarabic
						}, {
							value : 3,
							text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
							textarabic : $scope.syllabusData[i].subjectinarabic
						}, {
							value : 4,
							text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
							textarabic : $scope.syllabusData[i].subjectinarabic
						}];
						if ($scope.syllabusData[i].isChecked == '1') {
							$scope.subjestQuestion[index] = {
								question : (!$rootScope.arabicLnguage || $scope.syllabusData[i].subjectinarabic == '') ? $scope.syllabusData[i].subject : $scope.syllabusData[i].subjectinarabic,
								answers : $scope.answers,
								type : 'specific',
								questionid : index
							};
							index++;
						}

						$scope.len = $scope.syllabusData[i].subsubjects;
						if ($scope.syllabusData[i].subsubjects && $scope.syllabusData[i].subsubjects.length > 0) {
							for (var j = 0; j < $scope.syllabusData[i].subsubjects.length; j++) {

								$scope.answers = [{
									value : 0,
									text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subsubjects[j].subsubject : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic,
									textarabic : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic
								}, {
									value : 1,
									text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subsubjects[j].subsubject : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic,
									textarabic : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic
								}, {
									value : 2,
									text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subsubjects[j].subsubject : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic,
									textarabic : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic
								}, {
									value : 3,
									text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subsubjects[j].subsubject : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic,
									textarabic : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic
								}, {
									value : 4,
									text : !$rootScope.arabicLnguage ? $scope.syllabusData[i].subsubjects[j].subsubject : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic,
									textarabic : $scope.syllabusData[i].subsubjects[j].subsubjectinarabic
								}];

								if ($scope.syllabusData[i].subsubjects[j].isChecked == '1') {
									$scope.subjestQuestion[index] = {
										question : !$rootScope.arabicLnguage ? $scope.len[j].subsubject : $scope.len[j].subsubjectinarabic,
										answers : $scope.answers,
										type : 'specific',
										questiontype : 'close',
										questionid : index

									};
									index++;
								}
							}
						}
					}
				}
			}
		});
	};

	$scope.commentChanged = function(comment) {
		$scope.feedbackComment = comment;

	}
	
	$scope.getEducationMterial();

	$scope.$on('finishClick', function() {
		$scope.finishClick()
	});

	$scope.finishClick = function() {
		if($scope.waitingForServerResponse == true)
    		return;
    	$scope.waitingForServerResponse = true;
		//console.log($scope.subjestQuestion)
		var data = {};
		data.token = $rootScope.loginToken;
		data.lessonid = $stateParams["lessonId"]
		data.feedbacklist = angular.copy($scope.subjestQuestion);
		if ($scope.feedbackComment) {
			data.feedbacklist.push({
				"question" : "open",
				"answer" : $scope.feedbackComment,
				"questiontype" : "open"
			});
		}
		data.type = 'specific'
		server.requestPhp(data, "StudentCheckOut").then(function(data) {
			$scope.waitingForServerResponse = false;
			console.log(data)
			$state.transitionTo('end', {
				courseId : $stateParams["courseId"],
				lessonId : $stateParams["lessonId"]
			})
		});
	}

	$scope.initTextAreaInit = function() {
		initTextareaResize()
	}
	
}]); 