apple.controller('attendanceReporting', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', '$interval',
function($scope, $stateParams, $rootScope, $state, $timeout, server, $interval) {
	$scope.lessonid = $stateParams["lessonId"];
	$scope.courseid = $stateParams["courseId"];
	$scope.userName = $rootScope.me.firstname;
	$scope.noTextTitle = $rootScope.dictionary.noTextTitle;
	$scope.noTextSubTitle = $rootScope.dictionary.noTextSubTitle;
	$scope.confirmNoText = $rootScope.dictionary.confirmNoText;
	$scope.beLateTextTitle = $rootScope.dictionary.beLateTextTitle;
	$scope.beLateTextSubTitle = $rootScope.dictionary.beLateTextSubTitle;
	$scope.confirmBeLateText = $rootScope.dictionary.confirmBeLateText;
	$scope.showConfirmBubble = false;
	$scope.startAnimateCircles = false;
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.attendance});

	$scope.checoutBtn = false;
	
	$scope.actionClick = function(type) {
		/*
		0 - attending
		1 - late
		2 - not attending
		3 - didn't report yet
		*/
		$scope.actionType = type;
		if (type == 1) {
			$scope.bubbleText = $scope.beLateTextTitle;
			$scope.bubbleSubText = $scope.beLateTextSubTitle;
			$scope.bubblefooterBtn = $scope.confirmBeLateText;
			$scope.trianglePos = 'late';
		}
		if (type == 2) {
			$scope.bubbleText = $scope.noTextTitle;
			$scope.bubbleSubText = $scope.noTextSubTitle;
			$scope.bubblefooterBtn = $scope.confirmNoText;
			$scope.trianglePos = 'not attendance';
		}
		$scope.showConfirmBubble = true;
	};
	$scope.statusResponses ={
		0:$rootScope.dictionary.attendingResponse,
		1:$rootScope.dictionary.lateResponse,
		2:$rootScope.dictionary.absentResponse
	};
	$scope.reportAttendance = function(attendanceStatus) {
		//block attempts to click the check button multiple times
		if ($scope.collapseCircles)
			return;
		$scope.sendCheckInToServer(attendanceStatus);
		$scope.showConfirmBubble = false;
		$scope.responseTextForUserCheckin = $scope.statusResponses[attendanceStatus];
		triggerCollapseAnimation();
	};
	//this function handles the switch between the expanding circles animation and the collapsing circles animation
	var triggerCollapseAnimation = function ()
	{
		var collapseCirclesDOM = document.getElementById("collapsingCircles");
		var expandingCirclesDOM = document.getElementById("expandingCircles");
		console.log(collapseCirclesDOM);
		for (var i=0; i< expandingCirclesDOM.children.length; i++)
		{
			var toHide = expandingCirclesDOM.children.item(i);
			var toDisplay = collapseCirclesDOM.children.item(i);
			//get the calculated transformation values for the animation
			var transformMatrix = window.getComputedStyle(toHide).transform;
			//parse transformation matrix string - insert the values into an array
			transformMatrix = transformMatrix.replace(/^.*\((.*)\)$/g, "$1").split(/, +/);
			//apply the transformation value to the new circles
			toDisplay.style.width = "calc("+window.getComputedStyle(toDisplay).width+" * "+transformMatrix[0]+")";
			toDisplay.style.height = "calc("+window.getComputedStyle(toDisplay).height+" * "+transformMatrix[3]+")";
			toDisplay.style.opacity = window.getComputedStyle(toHide).opacity;
			toDisplay.style.transform = "scale(1, 1)";

		}
		$scope.collapseCircles = true;
		$timeout(function (){
			var collapseCirclesDOM = document.getElementById("collapsingCircles");
			for (var i=0; i< collapseCirclesDOM.children.length; i++)
			{
				var toCollapse = collapseCirclesDOM.children.item(i);
				toCollapse.style.transition = "transform 1.5s";
				toCollapse.style.transform = "scale(0, 0)";
			}
		}, 20);
	}
	
	$scope.cancel = function() {
		$scope.showConfirmBubble = false;
		};
		
	$scope.sendCheckInToServer = function(status) {
		var data = {};
		data.lessonid = $stateParams["lessonId"];
		data.status = status;
		if($scope.waitingForServerResponse)
			return;
		$scope.waitingForServerResponse = true;
		server.requestPhp(data, "ReportAttendance").then(function(data) {
			//delay moving to the next screen until the animation finishes
			$timeout(function (){
				$state.transitionTo('activeLesson', {lessonId: $scope.lessonid, courseId: $scope.courseid});
			}, 2250);
			$scope.waitingForServerResponse = false;
		});
	};
    
}]);

