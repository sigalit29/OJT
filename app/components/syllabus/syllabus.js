apple.controller('syllabus', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter) {
	$scope.lessonId=$stateParams["lessonId"];
	$scope.courseId=$stateParams["courseId"];
	$scope.lesson = {};
	$scope.lesson.subjectsTaught=[];
    $scope.customSubjects=[];
    $scope.syllabus=[];
    $scope.lesson.subjectsTaught=[];

  //sets the header title to "loading" - until the correct title is fetched from the server
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.loading});

	$scope.getLesson = function () {
			var data = {};
			data.lessonid = $stateParams["lessonId"];
			server.requestPhp(data, "GetLessonById").then(function (data) {
				$scope.lesson = data.lesson;
                //console.log($scope.lesson);
                $scope.customSubjectsLength=$scope.lesson.customSubjects.length;
                $scope.getSyllabus();

			});

	};
	$scope.getLesson();

	$scope.getSyllabus = function () {
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetSyllabusSubjectsByCourseId").then(function (data) {
			$rootScope.$broadcast('setHeaderTitle', {
				title : $rootScope.dictionary.SyllabusText
			});
            $scope.syllabus=data;
            $scope.AddCustomSubjectsToSyllabus();
		});
	};

    $scope.customSubject={
        subject:null,
        subjectid:null,
        subjectinarabic:null,
        subsubjects:[],
        supersubjectid:"custom"
    };

    $scope.AddCustomSubjectsToSyllabus=function(){
        if($scope.customSubjectsLength>0)
        {
            for(var sub =0;sub<$scope.customSubjectsLength;sub++)
            {
                $scope.customSubject.subjectid = $scope.lesson.customSubjects[sub].subjectid.toString();
                $scope.customSubject.subject = $scope.lesson.customSubjects[sub].subject;
                $scope.syllabus.push($scope.customSubject);
                $scope.lesson.subjectsTaught.push($scope.customSubject.subjectid);

                $scope.customSubject = {
                    subject: null,
                    subjectid: null,
                    subjectinarabic: null,
                    subsubjects: [],
                    supersubjectid: "custom"
                };
			}
        }
    }



	
	$scope.selectSubjectsToBeTaught = function () {
		$timeout(function () {
			$scope.showSubjectSelectionPopup = true;
		}, 0);
	};
	
	$scope.toggleSubjectSelection = function (subjectid)
	{
		if($scope.lesson.subjectsTaught.indexOf(subjectid)==-1)
		{
			$scope.lesson.subjectsTaught.push(subjectid);
		}
		else
		{
			$scope.lesson.subjectsTaught.splice($scope.lesson.subjectsTaught.indexOf(subjectid), 1);
		}
	}
	
	$scope.$on('nextButton', function(event, data) {
		var data = {};
		data.lessonid = $scope.lessonId;
		data.courseId = $scope.courseId;
		data.subjectsTaught = $scope.lesson.subjectsTaught;
		server.requestPhp(data, "UpdateSubjectsTaughtInLesson").then(function(data) {
			$state.transitionTo('attendanceApproval', {
				courseId : $stateParams["courseId"],
				lessonId : $stateParams["lessonId"]
			});
		});
	});
}]);
