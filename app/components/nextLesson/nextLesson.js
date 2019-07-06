apple.controller('nextLesson', ['$scope', '$rootScope', '$stateParams', '$state', '$timeout', 'server', 'permissions', 'dateNames', '$sce', 
function ($scope, $rootScope, $stateParams, $state, $timeout, server, permissions, dateNames, $sce) {
	$scope.checkActivationApproval = false;
	$scope.courseid = $stateParams["courseId"];
	$scope.lessonid = $stateParams["lessonId"];
	permissions.getRole($scope.courseid);
	//sets the header title to "loading" - until the correct title is fetched from the server
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.loading});
	
	$scope.getLessonData = function () {
		var data = {}
		data.lessonid = $scope.lessonid;
		server.requestPhp(data, "GetLessonById").then(function (data) {
			$scope.lesson = data.lesson;
			$rootScope.$broadcast('setHeaderTitle', {
				title: $rootScope.dictionary.lesson +" "+ $scope.lesson.num
			});
			//parse opening date data
			$scope.lesson.beginningdate = new Date(parseInt($scope.lesson.beginningdate));
			$scope.lesson.date = moment($scope.lesson.beginningdate).format('DD/MM/YY');
			$scope.lesson.hour = moment($scope.lesson.beginningdate).format('HH:mm');
			$scope.displayYoutubeVideo();
		});
	}
	$scope.getLessonData();

	//get the day name
	$scope.getMeetingDayOfTheWeek = function () {
		if ($scope.lesson.beginningdate) {
			var month = dateNames.getDayName($scope.lesson.beginningdate.getDay(), $rootScope.isArabic?"ar":"he");
			return month;
		} else {
			return '';
		}
	};
	//get the day letter
	$scope.getMeetingDayLetter = function () {
		if ($scope.lesson&&$scope.lesson.beginningdate) {
			var month = dateNames.getDayLetter($scope.lesson.beginningdate.getDay(), $rootScope.isArabic?"ar":"he");
			return month;
		} else {
			return '';
		}
	};
	//get the month
	$scope.getMeetingMonthName = function () {
		var month = dateNames.getMonthName($scope.lesson.beginningdate.getMonth(), $rootScope.isArabic?"ar":"he");
		month = month;
		return month;
	};
	//get the time
	$scope.getTimeByTimestamp = function () {
		var time = moment(parseInt($scope.lesson.beginningdate.getTime())).format('HH:mm')
		return time;
	}

	$scope.trustedVideoUrls = [];
	//set iframe to display an embedded yooutube video if necessary
	$scope.displayYoutubeVideo = function(){
		if(!$scope.lesson.resourceLinks||!$scope.lesson.resourceLinks.length)
			return;
		$scope.trustedVideoUrls = [];
		for(var i=0; i<$scope.lesson.resourceLinks.length; i++)
		{
			var videoLink = $scope.lesson.resourceLinks[i].link;
			if(videoLink.indexOf("youtube")!=-1)
			{
				var videoId = videoLink.substr(videoLink.indexOf("v=") + 2, 11)
				var embedLink = "https://www.youtube.com/embed/" + videoId;
				$scope.trustedVideoUrls.push($sce.trustAsResourceUrl(embedLink));
			}
		}
		$scope.updateBoxSizes();
	}

	$scope.toggleMeetingStatus = function () {
		$scope.activationPopup = !$scope.activationPopup;
	}

	$scope.activateMeeting = function () {
		var data = {}
		data.lessonid = $scope.lesson.lessonid;
		server.requestPhp(data, "ActivateMeeting").then(function (data) {
			$state.transitionTo('singleCourse', { courseId: $scope.lesson.courseid })
		});
	}
	//handler to edit btn click
	$rootScope.$on('editClick', function (event, data) {
	  //go to create Lesson - with edit status
	   $state.transitionTo('createLesson', { lessonId: $scope.lesson.lessonid , status:1, courseId:$scope.lesson.courseid })
	});
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
} ])

