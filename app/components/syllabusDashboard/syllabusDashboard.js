apple.controller('syllabusDashboard', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter) {
	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.SyllabusText
	});
	$scope.courseid = $stateParams["courseid"];
	$scope.syllabus = [];
	
	function getSyllabus() {
		var data = {};
		data.courseid = $scope.courseid;
		server.requestPhp(data, "getSyllabusSubjectsLearntByCourseId").then(
			function(data) {
				for (i=0 ; i<data.length ; i++){
					addTosubjectsTaught(data[i]);
				}
				$scope.syllabus = data;
			});
	}

	$scope.toggleSubjectDetails = function(subject) {
		$timeout(function() {
			subject.open = !subject.open;
		}, 0);
	};
	getSyllabus();


	$scope.subjectsTaught = [];

	function addTosubjectsTaught(node) {
	
		if (node.subsubjects.length === 0 && node.wasLearnt==="1") {
			$scope.subjectsTaught.push(node.subjectid);
			return ;
		}
		for (var j = 0; j < node.subsubjects.length; j++) {
				addTosubjectsTaught(node.subsubjects[j]);
		}
	}
	
}]);
