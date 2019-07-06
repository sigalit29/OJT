apple.controller('sylabus', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter) {

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.SyllabusText
	});

	$scope.getSylabusLesson = function() {
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		server.requestPhp(data, "GetSubjectLessonByLessonId").then(function(data) {
			if (data && !data.error) {
				$scope.syllabusLessonData = data;
				//Yaniv: auto-open any subject that has at least one sub-subject in it checked
				for (var i = 0; i < $scope.syllabusLessonData.length; i++) {
					if ($scope.syllabusLessonData[i].subsubjects) {
						for (var j = 0; j < $scope.syllabusLessonData[i].subsubjects.length; j++) {
							if ($scope.syllabusLessonData[i].subsubjects[j].isChecked==1) {
								$scope.syllabusLessonData[i].open = true;
								break;
							}
						}
					}
				}
			}
		});
	};

	$scope.getSylabusLesson();

	$scope.$on('nextButton', function(event, data) {
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.courseId = $stateParams["courseId"];
		data.syllabus = $scope.syllabusLessonData;
		server.requestPhp(data, "UpdateSubjectLesson").then(function(data) {
			$state.transitionTo('presenceLesson', {
				courseId : $stateParams["courseId"],
				lessonId : $stateParams["lessonId"]
			});
		});
	});

	//$scope.getSyllabus = function () {
	//    var data = {}

	//    data.courseid = $stateParams["courseId"];
	//    server.requestPhp(data, "GetSyllabusSubjectsByCourseId").then(function (data) {
	//        console.log(data)
	//        if (data && !data.error) {
	//            //$scope.courseSubjects = data
	//            $scope.syllabusData = data

	//        }
	//    });

	//}
	//$scope.getSyllabus();

	$scope.checkFullSubsubjet = function() {
		var x = $scope.syllabusLessonData;
		if ($scope.syllabusLessonData && $scope.syllabusLessonData.length > 0) {
			for (var i = 0; i < $scope.syllabusLessonData.length; i++) {
				var checkedNumbers = false;
				if ($scope.syllabusLessonData[i].subsubjects && $scope.syllabusLessonData[i].subsubjects.length > 0) {
					for (var j = 0; j < $scope.syllabusLessonData[i].subsubjects.length; j++) {
						if ($scope.syllabusLessonData[i].subsubjects[j].isChecked == '1')
							checkedNumbers++;
					}
					if (checkedNumbers == $scope.syllabusLessonData[i].subsubjects.length)
						$scope.syllabusLessonData[i].fullSubsubjectsChecked = true;
					else
						$scope.syllabusLessonData[i].fullSubsubjectsChecked = false;
				}
			}
		}
	};

	$scope.checkFullSubsubjet();

	$scope.getCheckedSubjectsLength = function() {
		var thereIsCheckedSubjects = false;
		if ($scope.syllabusLessonData && $scope.syllabusLessonData.length > 0) {
			for (var i = 0; i < $scope.syllabusLessonData.length; i++) {
				var checkedSubjects = $filter('filter')($scope.syllabusLessonData[i].subsubjects, {
					isChecked : "1"
				});
				var checkedMainSubjects = $filter('filter')($scope.syllabusLessonData, {
					isChecked : "1"
				});
				if ((checkedSubjects && checkedSubjects.length > 0) || (checkedMainSubjects && checkedMainSubjects.length > 0)) {
					thereIsCheckedSubjects = true;
				}
			}
		}
		return thereIsCheckedSubjects;
	};

	$scope.toggleCheckedSubj = function(subSubject) {
		$timeout(function() {
			if (subSubject.isChecked) {
				if (subSubject.isChecked == '0') {
					subSubject.isChecked = '1';
				} else {
					subSubject.isChecked = '0';
				}
			} else {
				subSubject.isChecked = '1';
			}
			console.log($scope.syllabusLessonData);
		}, 0);
	};

	$scope.toggleCheckedFirstSubj = function(subject) {
		$timeout(function() {
			if (subject.isChecked) {
				if (subject.isChecked == '0') {
					subject.isChecked = '1';
				} else {
					subject.isChecked = '0';
				}
			} else {
				subject.isChecked = '1';
			}
			console.log($scope.syllabusLessonData);
		}, 0);
	};

	$scope.checkSubSubject = function(subject) {
		if (!subject.subsubjects || !(subject.subsubjects.length > 0)) {
			if (subject.isChecked == '1') {
				subject.isChecked = '0';
			} else {
				subject.isChecked = '1';
			}
			// subject.Checked = !subject.Checked;
		}
		subject.open = !subject.open;
	};
}]);
