apple.controller('teacherDashboard', ['$scope', '$stateParams', '$rootScope', '$state', 'server', 'dateNames', '$timeout',
function($scope, $stateParams, $rootScope, $state, server, dateNames, $timeout) {
	//Course ID
	$scope.courseId = $stateParams["courseId"];
	//Meetings object
	$scope.meetingIds = [];
	$scope.meetings = [];
	//course data
	$scope.courseData = [];
	//index of the meeting that's currently displayed
	$scope.currMeeting = 0;
	//whether the current tab is the one on the right.
	$scope.rightActive = true;
	//the gradient used to determine the colors of some text and the smileys [[color1 position, [r1,g1,b1]],[color2 position, [r2,g2,b2]]...]
	$scope.colorScale = [[20, [255, 0, 0]], [50, [150, 47, 219]], [80, [74, 144, 226]]];
	//an array containing names of charts that are already loaded
	$scope.loadedCharts = [[], []];
	//a boolean array - each boolean signifies a menu, where false=closed, and true=open
	$scope.openedMenu = [];

	$scope.studentAttendanceVisible = false;

	$scope.loadingMeeting;

	$scope.loading = true;
	/**
	 *changes header titles
	 */
	$rootScope.$broadcast('setHeaderTitle', {

		title : $rootScope.dictionary.statisticText
	});
	/**
	 *switches to the left tab (lesson)
	 */
	$scope.leftTab = function() {
		if ($scope.mySwiper) {

			postUsage($scope.mySwiper.activeIndex);
		}
		$scope.rightActive = false;
	};
	/**
	 *switches to the right tab (lesson)
	 */
	$scope.rightTab = function() {

		$scope.rightActive = true;

		$scope.meetings[$scope.mySwiper.activeIndex].lastOpenedAt = new Date();
	};
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
			if ($scope.meetings[event.activeIndex] && $scope.meetings[event.activeIndex].usage) {
				//update usage stats timer
				$scope.meetings[event.activeIndex].lastOpenedAt = new Date();
				}
			if ($scope.meetings[event.previousIndex]) {
				//post data of previous meeting
				postUsage(event.previousIndex);
			}
			//scroll back to top of last slide
			event.slides[event.previousIndex].getElementsByClassName("meeting-wrap")[0].scrollTop = 0;
			//close down menus
			$scope.openedMenu=[false, false, false];
			$scope.studentAttendanceVisible = false;
			//load adjacent slides if not loaded yet
			loadMeetingBatch(event.activeIndex);
			$scope.$applyAsync();
		};
	};

	var logData = function() {
		// //for debugging
		// console.log("meta data: ");
		// console.log($scope.meetings);
		// console.log("loaded meetings: ");
		// console.log($scope.meetings);
		// console.log("slides: ");
		// console.log($scope.mySwiper.slides);
		// console.log("course: ");
		// console.log($scope.courseData);
	};
	// logData();
	/**check if meeting was opened
	 * @param {object} meeting: the meeting to check
	 */
	var wasMeetingActivated = function(m) {

		return m.checkin!=undefined&&m.checkin!=null&&m.checkin!='';
	};
	/**
	 * gets meta data on every single meeting in the course (time of meeting, id, name), loads that into the $scope.meetingIds array
	 * loads first batch of meetings automatically
	 */
	var loadAllMeetings = function() {
        // console.log("loadAllMeetings: ");
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
				loadMeetingBatch(0);
				if ($scope.meetingIds.length == 0) {
					$scope.loading = false;
				}
			}
		});
	};
	/**
	 *gets a meeting index as input, loads all meetings within a 2 meetings radius and refreshes the view (including the meeting itself)
	 *  @param {number} index: the index of the meeting you want to load the adjacent meetings to.
	 */
	var loadMeetingBatch = function(index) {
        // console.log("loadMeetingBatch: ");
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
	var loadMeeting = function(index) {
        // console.log("loadMeeting: ");
		//console.log(index);
		var data = {};
		data.lessonid = $scope.meetingIds[index]["lessonid"];
		data.courseid = $scope.courseId;
		data.type = "post";
		server.requestPhp(data, "GetStatistic").then(function(data) {
			if (data && !data.error) {
				$scope.meetings[index] = data;
				$scope.meetings[index].date = $scope.meetingIds[index].checkin;
				$scope.meetings[index].name = $scope.meetingIds[index].name;
				$scope.meetings[index].usage = {
					"dashboarddisplayduration" : 0,
					"dashboardmeetingcommentsdisplay" : 0,
					"dashboardsubjectsfeedbackdisplay" : 0,
					"dashboardsubjectscommentsdisplay" : 0
				};
				$scope.meetings[index].lastOpenedAt = new Date();
				if (index == $scope.meetingIds.length - 1) {
					$scope.loading=false;
					$scope.$applyAsync();
				}
			}
		});
	};

	var loadCourseStats = function(courseId) {
		var data = {};
		data.courseid = courseId;
		data.type = "post";
		server.requestPhp(data, "GetCourseStatistic").then(function(data) {
			//console.log(data);
			if (data && !data.error) {
				$scope.courseData = data;
				var attendanceChartValues = [];
				var understandingChartValues = [];
				for (var i = 0; i < $scope.courseData['lessons'].length; i++) {
					attendanceChartValues.push($scope.courseData['lessons'][i]['attendance']);
					understandingChartValues.push($scope.courseData['lessons'][i]['understanding']);
				}
				//$scope.drawBarChart('attendance_bar_chart', attendanceChartValues);
				//$scope.drawBarChart('understanding_bar_chart', understandingChartValues);
			}
		});
	};
	//load the data for each meeting
	loadAllMeetings($scope.courseId);
	//load course level statistics
	loadCourseStats($scope.courseId);
	/**
	 * posts usage statistics to the server (time spent looking at the dashboard, which menus were opened)
	 * @param {number} meetingIndex: the index of the meeting which's usage you want to post
	 */
	var postUsage = function(meetingIndex) {
		var currMeeting = $scope.meetings[meetingIndex];
		if (!currMeeting || currMeeting == undefined || currMeeting.cooking) {
			return;
		}
		var data = {};
		currMeeting.usage.dashboarddisplayduration = Math.floor((new Date() - currMeeting.lastOpenedAt) / 1000);
		data.type = "post";
		data.lessonid = $scope.meetingIds[meetingIndex].lessonid;
		data.engagement = {
			"dashboarddisplayduration" : currMeeting.usage.dashboarddisplayduration,
			"dashboardmeetingcommentsdisplay" : currMeeting.usage.dashboardmeetingcommentsdisplay,
			"dashboardsubjectsfeedbackdisplay" : currMeeting.usage.dashboardsubjectsfeedbackdisplay,
			"dashboardsubjectscommentsdisplay" : currMeeting.usage.dashboardsubjectscommentsdisplay
		};
		server.requestPhp(data, "SaveUsabilityInStatisticScreen").then(function(data) {
			//	console.log(data);
		});
	};

	$(window).on('beforeunload', function(){
		if($scope.rightActive)
		{
			if($scope.mySwiper) {
				postUsage($scope.mySwiper.activeIndex);
			}
		}
	});
	$scope.$on('$destroy', function() {
		if($scope.rightActive)
		{
			if($scope.mySwiper) {
				postUsage($scope.mySwiper.activeIndex);
			}
		}
	});
	/**
	 * Go to the profile page of a student by their id
	 */
	$scope.goToUserProfile = function (userId) {
		 $state.transitionTo('userProfile', {userId: userId});
	};
	/**
	* Gets a meetingIndex and input, toggles the appropriate meeting "ignore me" status, and updates the server that a toggle has taken place.
	*/
	$scope.toggleIgnore = function(meetingStatus, meetingIndex) {

		var confirmed = confirm($rootScope.dictionary.informManager);
		if(!confirmed)
		{
			$timeout(function(){$scope.meetingIds[meetingIndex].ignoreMe=meetingStatus?0:1}, 1);
			return;
		}
		$scope.meetingIds[meetingIndex].ignoreMe=meetingStatus;
		var data = {
			"lessonid": $scope.meetingIds[meetingIndex].lessonid,
			"courseid": $scope.courseId,
			"ignoreMe": $scope.meetingIds[meetingIndex].ignoreMe
		};
		server.requestPhp(data, "ToggleLessonIgnore").then(function(data) {
			//	console.log(data);
		});
	}
	/**
	 *Returns attendance, considering late students as 50%
	 *  @param {object} att: an array containing the attendance data
	 */
	$scope.getRealAttendance = function(att) {
		if (att != undefined && att.from != 0)
			return Math.floor((att.exist - (att.late / 2)) / att.from * 100);
		return undefined;
	};

	$scope.getMeetingAttendanceSummary = function(students) {
		var attended = 0;
		for (var i=0; i<students.length; i++)
		{
			attended+=$scope.filterOnTimeStudents(students[i])?1:$scope.filterLateStudents(students[i])?0.5:0;
		}
		return attended/students.length;
	}

	$scope.filterAbsentStudents = function(student) {

		return (student['attendanceStatus']==3)||(student['attendanceStatus']==2);
	};

	$scope.filterOnTimeStudents = function(student) {

		return (student['attendanceStatus']==0);
	};

	$scope.filterLateStudents = function(student) {

		return (student['attendanceStatus']==1);
	};

	$scope.filterAttendingStudents = function(student) {

		return $scope.filterLateStudents(student)||$scope.filterOnTimeStudents(student);
	};

	$scope.filterFeedbackStudents = function(student) {
		return student['givenFeedback']>0;
	};

	$scope.filterNoFeedbackStudents = function(student) {

		return student['givenFeedback']<=0;
	};

	$scope.awaitingFeedback=function(student) {

		return $scope.filterAttendingStudents(student)&&$scope.filterNoFeedbackStudents(student);
	}

	$scope.hideStudentAttendance=function() {

		$scope.studentAttendanceVisible=false;
		var data = {};
		data.lessonid = $scope.meetingIds[$scope.mySwiper.activeIndex].lessonid;
		data.students = $scope.meetings[$scope.mySwiper.activeIndex].students;
		server.requestPhp(data, "UpdateStudentAttendance").then(function(data) {
		});
	}

	$scope.showStudentAttendance=function() {

		$scope.studentAttendanceVisible=true;
	}

	$scope.setAttendanceStatus = function(student, status) {
		student.attendanceStatus = status;
	};
	/**
	 *Returns an attendance array, considering late students as 50%
	 *  @param {object} att: an array containing attendance objects
	 */
	$scope.getRealCourseAttendance = function(att) {
		if (att != undefined) {
			var arr = [];
			for (var i = 0; i < att.length; i++) {
				arr.push($scope.getRealAttendance(att[i]));
				if(arr[i]==undefined)
				arr[i]=0;
			}
			return arr;
		}
		return undefined;
	};
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
	/**
	 *function to get the suffix (e.g. "02") of the file name of a smiley image that corresponds with a certain value
	 * @param {number} value: a number between 0 and 100, signifying
	 * return: a number between 1 and 5, formatted like "05"
	 */
	getFaceIndexByVal = function(value) {
		return "0" + Math.min((Math.floor((Math.max(0, Math.min(100, value))) / 20) + 1), 5);
	};
	/**
	 *gets a column of a multi-dimensional array based on the key of the column
	 * @param {Object} arr: an array from which you want to extract a column
	 * @param {Object} key: key (or index) of the wanted column
	 * return: an array containing all values within the requested column
	 */
	$scope.columnOfArray = function(arr, key) {
		//console.log(bySubject);
		if (arr != undefined) {
			var col = [];
			for (var i = 0; i < arr.length; i++) {
				col[i] = arr[i][key];
			}
			return col;
		}
		return undefined;
	};
	/**
	 *calculates the average value in an array
	 * @param {Object} arr: an array within which you want to find the average value
	 * return: the average of all the values in the array
	 */
	$scope.avgOfArray = function(arr) {
		//console.log(bySubject);
		if (arr != undefined) {
			return Math.round($scope.sumOfArray(arr) / arr.length);
		}
		return undefined;
	};

	$scope.sumOfArray = function(arr) {
		//console.log(bySubject);
		if (arr != undefined) {
			var sum = 0;
			for (var i = 0; i < arr.length; i++) {
				sum += parseInt(arr[i]);
			}
			return sum;
		}
		return undefined;
	};
	//a shortcut function to get the appropriate color for a value that is an average of some array
	$scope.getAvgColor = function(arr, key) {
		return $scope.getColorByVal($scope.avgOfArray($scope.columnOfArray(arr, key)));
	};
	/**
	 * convertes a unix time stamp to a date
	 * @param {number} unix: a unix time stamp
	 * return: a date in DD MONTH format
	 */
	$scope.getShortDate = function(unix) {
		if (unix == undefined)
			return "loading";
		var date = new Date(unix * 1000);
		var result = date.getDate() + " " + dateNames.getMonthName(date.getMonth(), $rootScope.isArabic?"ar":"he");
		return result;
	};
	/**
	 *gets the current value inside some div with some id in some slide
	 * @param {Number} slide: index of slide that contains the div
	 * @param {Text} segmentName: class of the div
	 * return: an Int parsed from the div contents
	 */
	$scope.getValueFromDiv = function(slide, segmentName) {
		var segment = slide.getElementsByClassName(segmentName)[0];
		return parseInt(segment.innerText);
	};
	/**
	 *creates a canvas and draws a smiley chart on it
	 * @param {Object} containerId: the div that the canvas should be appended to
	 * @param {Object} value: the value to determine color, image, and arc angle when painting the chart
	 */
	$scope.createChart = function(containerId, value) {
		if ($scope.loadedCharts[0].indexOf(containerId) != -1)
			if ($scope.loadedCharts[1][$scope.loadedCharts[0].indexOf(containerId)] == value) {
				return;
			}
		var container = document.getElementById(containerId);
		if (container == null)
			return;
		var canvas = document.createElement('canvas');
		canvas.width = 296;
		canvas.height = 296;
		container.innerHTML = "";
		if (value != undefined && !isNaN(value)) {
			var color = $scope.getColorByVal(value);
			color = color.substring(0, color.length - 1);
			var image = loadImage("img/" + getFaceIndexByVal(value) + "_report_face.png");
		} else
			return;
		/**
		 *loads the image in a given path
		 * @param {Object} src: the relative path of the image to be loaded
		 * return: an Image object with the requiered src
		 */
		function loadImage(src) {
			var temp = new Image;
			temp.onload = draw;
			temp.src = src;
			return temp;
		}

		/**
		 *draws a smiley chart based on the parameters given earlier
		 */
		function draw() {
			$scope.loadedCharts[0].push(containerId);
			$scope.loadedCharts[1].push(value);
			var ctx = canvas.getContext('2d');
			//ctx.clearRect(0, 0, canvas.width, canvas.height);
			//draw mask
			ctx.fillStyle = color;
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = "source-out";
			//ctx.imageSmoothingEnabled= false;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = "source-over";
			var highlightWidth = Math.max(3, Math.floor(0.09 * canvas.width));
			//draw circular frame
			ctx.strokeStyle = "#15457d";
			ctx.lineWidth = Math.ceil(highlightWidth / 8);
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.width / 2, canvas.width / 2 - Math.ceil(highlightWidth / 2), 0, 2 * Math.PI);
			ctx.stroke();
			ctx.closePath();
			//draw bold arc
			//draw circular frame
			ctx.strokeStyle = color;
			ctx.lineWidth = highlightWidth;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.width / 2, canvas.width / 2 - Math.ceil(highlightWidth / 2) - 0, -0.5 * Math.PI, ((value / 50) - 0.5) * Math.PI);
			ctx.stroke();
			ctx.closePath();
		}


		container.appendChild(canvas);
		return;
	};

	$scope.drawBarChart = function(containerId, data) {
		if (data == undefined || $scope.loadedCharts[0].indexOf(containerId) != -1)
			return;
		//console.log($scope.courseData);
		var container = document.getElementsByClassName(containerId)[0];
		container.style.display = "block";
		var canvas = container.getElementsByTagName("canvas")[0];
		var zoom = 1;
		//the canvas width is equal to 100vw*92.8(reportblock)*0.9(reportsegment)
		var originalWidth = Math.floor(0.8352 * window.innerWidth) * 2;
		canvas.height = Math.floor(0.3 * window.innerHeight) * 2;
		// Math.floor(0.3 * window.innerHeight);
		canvas.width = originalWidth * zoom;
		canvas.dir = "ltr";
		canvas.addEventListener("wheel", zoomOnWheel);
		var fontSize = Math.floor(canvas.width * 0.04);
		var numOfLevels = 6;
		var chartAreaWidth = Math.floor(canvas.width - Math.max(canvas.width * 0.15, fontSize * 3));
		var chartLeftMargin = canvas.width - chartAreaWidth;
		var chartVertMargin = Math.max(Math.floor(canvas.height / 6), fontSize * 3);
		var barGap = 5;
		var	barWidth = Math.floor(Math.min(Math.max(2, (chartAreaWidth - (barGap * data.length)) / data.length), originalWidth/4));
		var barRadius = Math.floor(barWidth / 3);
		draw();
		function draw() {
			var ctx = canvas.getContext("2d");
			ctx.translate(0, Math.floor(chartVertMargin / 2));
			ctx.strokeStyle = "#d8d8d8";
			ctx.font = fontSize + "px Assistant";
			ctx.fillStyle = "#15457d";
			ctx.lineWidth = Math.floor(canvas.height * 0.01);
			for (var i = 0; i < numOfLevels; i++) {
				ctx.beginPath();
				ctx.moveTo(chartLeftMargin, (canvas.height - chartVertMargin) / (numOfLevels - 1) * i);
				ctx.lineTo(canvas.width, (canvas.height - chartVertMargin) / (numOfLevels - 1) * i);
				ctx.stroke();
				ctx.closePath();
				ctx.fillText(((numOfLevels - 1 - i) / (numOfLevels - 1) * 100 + '%'), 2, (canvas.height - chartVertMargin) / (numOfLevels - 1) * i + fontSize / 4);
			}
			ctx.fillText("מפגשים", 0, canvas.height - chartVertMargin + fontSize * 1.5);
			//ctx.translate(0, -Math.floor(chartVertMargin));
			for (var i = 0; i < data.length; i++) {
				ctx.fillStyle = "rgba(74, 144, 226, 0.9)";
				drawRoundedTopRect(ctx, chartLeftMargin + (barGap + barWidth) * i, canvas.height - chartVertMargin, barWidth, -data[i] * (canvas.height - chartVertMargin) / 100, barRadius);
				ctx.fillStyle = "#15457d";
				if (showNumber(i + 1))
					drawCenteredText(ctx, i + 1, chartLeftMargin + (barGap + barWidth) * i, canvas.height - chartVertMargin / 2, barWidth);
			}
			$scope.loadedCharts[0].push(containerId);
			$scope.loadedCharts[1].push("");
		}

		function drawRoundedTopRect(ctx, x, y, width, height, rad) {
			x = Math.floor(x);
			y = Math.floor(y);
			width = Math.floor(width);
			height = Math.floor(height);
			var radius = Math.floor(Math.min(Math.abs(height), rad));
			ctx.moveTo(x, y);
			ctx.beginPath();
			ctx.lineTo(x, y + height + radius);
			ctx.arc(x + radius, y + height + radius, radius, Math.PI, 1.5 * Math.PI);
			ctx.lineTo(x + width - radius, y + height);
			ctx.arc(x + width - radius, y + height + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
			ctx.lineTo(x + width, y);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.fill();
		}

		function drawCenteredText(ctx, text, x, y, width) {
			var textWidth = ctx.measureText(text).width;
			ctx.fillText(text, Math.floor(x + (width - textWidth) / 2), y);
		}

		function showNumber(num) {
			n = data.length;
			return num == n ? true : num == 1 ? true : fontSize < barWidth * 0.5 ? true : (fontSize < barWidth * 1 && num % 5 == 0) ? true : (num % 10 == 0 && (n - num) > 2);
		}

		function zoomOnWheel(event) {
			zoom = Math.max(1, Math.min(data.length / 3, zoom - event.deltaY / 400));
			canvas.width = originalWidth * zoom;
			chartAreaWidth = Math.floor(canvas.width - Math.max(originalWidth * 0.15, fontSize * 4));
			barWidth = Math.floor(Math.min(Math.max(2, (chartAreaWidth - (barGap * data.length)) / data.length), originalWidth/4));
			barRadius = Math.floor(barWidth / 3);
			draw();
		}

	};
}]);

