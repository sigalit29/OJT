apple.controller('myClassroom', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$filter', '$interval',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $filter, $interval) {
	//Course ID
	$scope.courseId = $stateParams["courseId"];
	$scope.rightActive = true;
	$scope.valueType="attendance";
	$scope.sortBy="fullname";
	$scope.reverse=false;
	$scope.students = [];
	//the gradient used to determine the colors of some text and the smileys [[color1 position, [r1,g1,b1]],[color2 position, [r2,g2,b2]]...]
	$scope.colorScale = [[69.99, [255, 181, 0]], [70, [219, 233, 249]]];

	$scope.leftTab = function() {
		$scope.rightActive = false;
		$scope.valueType="understanding";
	}

	getStudents();

	$scope.rightTab = function() {
		$scope.rightActive = true;
		$scope.valueType="attendance";
	};

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.myClassText
	});
	/**
	 * Function to get a color in a specific place along a predefined gradient.
	 * @param {number} value: a number between 0 and 100, signifying the position of the desired color along the colorScale gradient
	 * return: the color in [value]% of the gradient, formatted as rgb(r, g, b); for ease of use in CSS
	 */
	$scope.getColorByVal = function(value) {
		var c1 = $scope.colorScale[0];
		var c2 = $scope.colorScale[$scope.colorScale.length - 1];
		for (var i = 0; i < $scope.colorScale.length; i++) {
			if ($scope.colorScale[i][0] <= value) {
				if (Math.abs(c1[0] - value) > Math.abs($scope.colorScale[i][0] - value))
					c1 = $scope.colorScale[i];
			} else {
				if (Math.abs(c2[0] - value) > Math.abs($scope.colorScale[i][0] - value))
					c2 = $scope.colorScale[i];
			}
		}
		var transitionDelta = c2[0] - c1[0];
		var val = Math.min(Math.max(0, (value - c1[0]) * (100 / transitionDelta)), 100);
		isNaN(val) ? val = 0 : val = val;
		var red = Math.floor(c2[1][0] / 100 * val + c1[1][0] / 100 * (100 - val));
		var green = Math.floor(c2[1][1] / 100 * val + c1[1][1] / 100 * (100 - val));
		var blue = Math.floor(c2[1][2] / 100 * val + c1[1][2] / 100 * (100 - val));
		return ("rgb(" + red + ", " + green + ", " + blue + ");");
	};

    $scope.StudentsEnrollmentTags = [];

    function GetEnrollmentTagsForStudents() {
        var data = {};
        server.requestPhp(data, "GetEnrollmentTagsForStudents").then(function(data) {
            $scope.StudentsEnrollmentTags = data;
        });
    }

    GetEnrollmentTagsForStudents();

    function getStudents()
	{
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetStudentsStatistics").then(function(data) {
			if(data.error=="access permission")
			$scope.noPermission = true;
			else
			{
				$scope.students = data;
				for (var i=0; i<$scope.students.length;i++)
				{
					$scope.students[i].fullname=$scope.students[i].firstname+" "+$scope.students[i].lastname;
					//add a field that saves the previous enrollmenttagid, in order to alow undos
					$scope.students[i].prevEnrollmentRoleId=$scope.students[i].enrollmenttagid;
				}
			}
		});
	}
	$scope.sortStudents=function (sortIndex)
	{
		if($scope.sortBy==sortIndex)
		{
			$scope.reverse=!$scope.reverse;
		}
		else
		{
			$scope.sortBy=sortIndex;
			$scope.reverse=false;
		}
	};
	$scope.updateEnrollmentTag = function (student)
	{
		var confirmed = confirm($rootScope.dictionary.informManager);
		if(!confirmed)
		{
			student.enrollmenttagid=student.prevEnrollmentRoleId;
			return;
		}
		student.prevEnrollmentRoleId=student.enrollmenttagid;
		var changeStatusTo = $scope.getStatusByEnrollmentTag(student.enrollmenttagid);
		if(changeStatusTo!=null)
			student.status = changeStatusTo;
		var data = {};
		data.courseId = $scope.courseId;
		data.userId = student.userid;
		data.enrollmentTagId = student.enrollmenttagid;
		console.log("updateEnrollmentTag");
		server.requestPhp(data, "updateEnrollmentTag").then(function(data) {
		});
	}
	$scope.getStatusByEnrollmentTag = function (tagid){
		// console.log("input "+tagid);
        // console.log($scope.StudentsEnrollmentTags);
		for(var i=0; i<$scope.StudentsEnrollmentTags.length; i++){
			//console.log("tags "+$scope.StudentsEnrollmentTags[i].enrollmenttagid);
			if($scope.StudentsEnrollmentTags[i].enrollmenttagid==tagid)
				return $scope.StudentsEnrollmentTags[i].changestatusto;
		}
		return null;
	}
	$scope.goToStudentProfile = function (userId)
	{
		 $state.transitionTo('userProfile', {userId: userId});
	};
}]);
