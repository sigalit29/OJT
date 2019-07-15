apple.controller('lessonHistory', ['$scope', '$stateParams', '$rootScope', '$state', 'server', '$timeout', '$sce',
function($scope, $stateParams, $rootScope, $state, server, $timeout, $sce) {
	//Course ID
	$scope.courseId = $stateParams["courseId"];
	//Meetings object
	$scope.meetingIds = [];
	$scope.meetings = [];
	//index of the meeting that's currently displayed
	$scope.currMeeting = 0;
	//dictionary between attendance status and the coressponding icon
	$scope.attendanceIcons = {0: "btn_v_normal.png", 1: "btn_late_normal.png", 2: "btn_non_arrival_normal.png", 3: "btn_non_arrival_normal.png"};
	/**
	 *changes header titles
	 */
	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.lessonHistory
	});
	/**
	 *once the DOM is loaded, initialize the Swiper object around the slides
	 */
	$scope.initializeSwiper = function() {
		//initialize swiper when document ready
		$scope.mySwiper = new Swiper('.swiper-container', {
			// Optional parameters
			direction : 'horizontal',
			longSwipes : false,
			// Navigation arrows
			nextButton : '.next-meeting-button',
			prevButton : '.prev-meeting-button',
			onSlideChangeStart : slideChange
		});
		$scope.$applyAsync();
		function slideChange(event) {
			//scroll back to top of last slide
			event.slides[event.previousIndex].getElementsByClassName("meeting-wrap")[0].scrollTop = 0;
			loadMeetingBatch(event.activeIndex);
			$scope.$applyAsync();
		};
	};
	/**check if meeting was opened, and not set to "ignore me"
	* @param {object} meeting: the meeting to check
	*/
	wasMeetingActivated = function(m)
	{
		return (m.checkin!=undefined&&m.checkin!=null&&m.checkin!='');
	};
	/**
	 * gets meta data on every single meeting in the course (time of meeting, id, name), loads that into the $scope.meetingIds array
	 * loads first batch of meetings automatically
	 */
	loadAllMeetings = function() {
		var data = {};
		data.courseid = $scope.courseId;
		data.type = "post";
		server.requestPhp(data, "GetLessonsOfCourse").then(function(data) {
			if (data && !data.error) {
				$scope.meetingIds = data.filter(wasMeetingActivated).sort(function(a, b) {
					return b.checkin - a.checkin;
				});
				for(var i =0; i<$scope.meetingIds.length; i++)
				{
					$scope.meetingIds[i].ignoreMe=parseInt($scope.meetingIds[i].ignoreMe);
				}
				loadMeeting(i);
			}
		});
	};
	/**
	 *gets a meeting index as input, loads all meetings within a 2 meetings radius and refreshes the view (including the meeting itself)
	 *  @param {number} index: the index of the meeting you want to load the adjacent meetings to.
	 */
	loadMeetingBatch = function(index) {
		//console.log(index);
		for (var i = -2; i < 3; i++) {
			if (index + i < $scope.meetingIds.length && index + i >= 0) {
				if (!$scope.meetings[index + i]) {
					loadMeeting(index + i);
				}
			}
		}
	};
	/**
	 * loads all relevant statistics for a particular meeting into the $scope.meetings array
	 * @param {number} index: the index of the meeting to be loaded in the $scope.meetingIds array
	 */
	loadMeeting = function(index) {
		console.log("index:");
		console.log(index);
		var data = {};
		data.lessonid = $scope.meetingIds[index]["lessonid"];
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetLessonById").then(function(data) {
			if (data && !data.error) {
				$scope.meetings[index] = data.lesson;
                console.log($scope.meetings[index]);
				var dateInDateFormat = new Date(parseInt($scope.meetings[index].beginningdate));
				$scope.meetings[index].date = moment(dateInDateFormat).format('DD-MM-YYYY');
				$scope.meetings[index].hour = moment(dateInDateFormat).format('HH:mm');
				$scope.meetings[index].trustedVideoUrls = [];
				if (index == $scope.meetingIds.length - 1) {
					$scope.$applyAsync();
				}
				$scope.displayYoutubeVideo(index);
				loadMeetingActivity(index);
			}
		});
	};
	/*loads up data specific to the user in the meeting, e.g. attendance, comments*/
	loadMeetingActivity = function(index) {
		var data = {};
		data.lessonid = $scope.meetingIds[index]["lessonid"];
		server.requestPhp(data, "GetMyActivity").then(function(data) {
			if (data && !data.error) {
				$scope.meetings[index].activity = data;
			}
		});
	};
	//load the data for each meeting
	loadAllMeetings($scope.courseId);
	
	//set iframe to display an embedded yooutube video if necessary
	$scope.displayYoutubeVideo = function(index){
		if(!$scope.meetings[index].resourceLinks||!$scope.meetings[index].resourceLinks.length)
			return;
		$scope.meetings[index].trustedVideoUrls = [];
		for(var i=0; i<$scope.meetings[index].resourceLinks.length; i++)
		{
			var videoLink = $scope.meetings[index].resourceLinks[i].link;
			if(videoLink.indexOf("youtube")!=-1)
			{
				var videoId = videoLink.substr(videoLink.indexOf("v=") + 2, 11)
				var embedLink = "https://www.youtube.com/embed/" + videoId;
				$scope.meetings[index].trustedVideoUrls.push($sce.trustAsResourceUrl(embedLink));
			}
		}
		$scope.updateBoxSizes();
	}
	//called on click on a box header. Identifies the coressponding box content, and slides it up/down.
	$scope.toggleBoxSlide = function (e){
		var correspondingBox = $($(e.target).parent()[0]);
		var boxContent = $(correspondingBox.find(".box-content")[0]);
		if(!correspondingBox.hasClass("box-expanded"))
		{
			$(boxContent).height(0).height(boxContent[0].scrollHeight);
		}
		else
		{
			$(boxContent).height(0);
		}
		correspondingBox.toggleClass("box-expanded");
	}
	$scope.updateBoxSizes = function(){
		$timeout(function(){
			var boxes = $.find(".box-expanded");
			for (var i=0; i<boxes.length; i++)
			{
				var box = boxes[i];
				var boxContent = $($(box).find(".box-content")[0]);
				$(boxContent).height(0).height(boxContent[0].scrollHeight);
			}
		}, 100);
	}
}]);

