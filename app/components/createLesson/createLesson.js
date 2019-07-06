apple.controller('createLesson', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', 'dateNames', '$filter', '$sce',
function ($scope, $stateParams, $rootScope, $state, $timeout, server, dateNames, $filter, $sce) {



	$scope.courseId=$stateParams["courseId"];
	$scope.lessonId=$stateParams["lessonId"];
	$scope.lesson = {};
	$scope.displaySaveApprovalPopup = false;
	$scope.trustedVideoUrls=[];
	$scope.newLink = {};
	$scope.lesson.resourceLinks=[];
    $scope.lesson.customSubjects=[];
    $scope.tempObject={};
	$scope.lesson.subjectsTaught=[];
	$scope.markForDelete = "";
    $scope.ACustomSubjects=[];
    $scope.subjectsTaught=[];



    //sets the header title to "loading" - until the correct title is fetched from the server
	$rootScope.$broadcast('setHeaderTitle', {title : $rootScope.dictionary.loading});

	$scope.getLessonIndex = function () {
		var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetNumberOfLessonsByCourseId").then(function (data) {
			if (data && !data.error) {
				$scope.lesson.num = parseInt(data.LessonCount) + 1;
				$rootScope.$broadcast('setHeaderTitle', {
					title: $rootScope.dictionary.openMeetingText +" "+ $scope.lesson.num
				});
				$scope.getLastMeetingStatistics();
			}
            $scope.getSyllabus();
		});
	};

	$scope.getLessonDetails = function () {
		var data = {};
		data.lessonid = $scope.lessonId;
		server.requestPhp(data, "GetLessonById").then(function (data) {
			$scope.lesson = data.lesson;
			for(var i=0;i<$scope.lesson.subjectsTaught.length;i++)
				$scope.subjectsTaught.push($scope.lesson.subjectsTaught[i]);

            // 		console.log("lesson hey:");
	// 		 console.log($scope.lesson);
            console.log("sent from server");
            console.log($scope.lesson);
            $scope.SelectedCustomLength=$scope.lesson.customSubjects.length;
            $scope.getSyllabus();
			$scope.lesson.notifyStudents = false;
			$rootScope.$broadcast('setHeaderTitle', {
				title: $rootScope.dictionary.lesson +" "+ data.lesson.num
			});
			//parse opening date data
			$scope.lesson.beginningdate = new Date(parseInt($scope.lesson.beginningdate));
			$scope.lesson.date = moment($scope.lesson.beginningdate).format('DD/MM/YY');
			$scope.lesson.hour = moment($scope.lesson.beginningdate).format('HH:mm');
			$scope.getLastMeetingStatistics();
			$scope.displayYoutubeVideo();
        });

	}
	
	$scope.initCreateOrUpdateCoursePage = function () {
		$scope.lesson.customSubjects=[];
		$scope.lesson.subjectsTaught=[];
		if (!$scope.lessonId){
			$scope.getLessonIndex();
			$scope.lesson.notifyStudents = false;
			$scope.lesson.date = null;
			$scope.lesson.hour = null;
			$scope.lesson.highlightedStats=[];
		}
		else {
			$scope.isUpdate = true;
			$scope.getLessonDetails();
		}
	};

	$scope.initCreateOrUpdateCoursePage();

    $scope.customSubject={
        subject:null,
        subjectid:null,
        subjectinarabic:null,
        subsubjects:[],
        supersubjectid:null,
		isCustomSubject:null
    };

    $scope.getSyllabus = function () {
    	var data = {};
		data.courseid = $scope.courseId;
		server.requestPhp(data, "GetSyllabusSubjectsByCourseId").then(function (data) {
			if (data && !data.error) {
				$scope.syllabus = data;
			}

            if($scope.SelectedCustomLength>0)
            {
                for(var sub =0;sub<$scope.SelectedCustomLength;sub++)
                {
                    $scope.customSubject.subjectid = $scope.lesson.customSubjects[sub].subjectid.toString();
                    $scope.customSubject.subject = $scope.lesson.customSubjects[sub].subject;
                    $scope.subjectsTaught.push($scope.customSubject.subjectid);
					$scope.customSubject.isCustomSubject=true;
                    $scope.syllabus.push($scope.customSubject);

                    $scope.customSubject={
						subject:null,
						subjectid:null,
						subjectinarabic:null,
						subsubjects:[],
						supersubjectid:null,
						isCustomSubject:null
                    };
                }
            }
        });
	}

	//get feedbacks and statistics from the last meeting
	$scope.getLastMeetingStatistics = function(){
        var data = {};
		if($scope.lesson.num==1){
			return;
		}
		var data = {};
		data.courseid = $scope.courseId;
		data.num = $scope.lesson.num-1;
		server.requestPhp(data, "GetStatisticByMeetingNumber").then(function (data) {
			if (data && !data.error) {
				$scope.prevLessonStats = data;
				$scope.prevLessonStats.attendance = 0;
				//dictionary mapping between an attendance status and an associated attendance percentage
				var attendanceScores = {"0": 1, "1": 0.5, "2": 0, "3": 0};
				for (var i=0; i<$scope.prevLessonStats.students.length; i++)
				{
					var student=$scope.prevLessonStats.students[i];
					$scope.prevLessonStats.attendance+=attendanceScores[student['attendanceStatus']];
				}
				$scope.prevLessonStats.attendance=Math.round(($scope.prevLessonStats.attendance/$scope.prevLessonStats.students.length)*100)/100;
				if(!$scope.prevLessonStats.attendance||isNaN($scope.prevLessonStats.attendance))
					$scope.prevLessonStats.attendance=0;
			}
		});
	};

	//datepicker init
	$.fn.datetimepicker.dates['ln'] = $rootScope.dictionary.dateTimePickerLanguage;

	$(function () {
		$('#lesson-date-picker').datetimepicker({
			pickTime: false,
			format: 'YYYY-MM-DD',
			language: 'ln',
			date: moment($scope.lesson.beginningdate)
		}).on('changeDate', function (e) {
			$timeout(function () {
				$scope.lesson.date = moment(e.localDate).format('DD/MM/YY');
				$scope.lesson.beginningdate = e.localDate;
			}, 0);
			$(this).datetimepicker('hide');
		}).on('hide', function (e) {
			$scope.hideDatePicker();
		});
	});
	 $("body").on("click",function(event) {
		if($scope.displayDatePicker == true)
		{
			$('#lesson-date-picker').datetimepicker("hide");
			$scope.displayDatePicker = false;
		}
    });

	$scope.showDatePicker = function (event){
		event.stopPropagation();
		$('#lesson-date-picker').datetimepicker("show");
		$scope.displayDatePicker = true;
	}

	$scope.hideDatePicker = function() {
		$timeout(function () {
			$scope.displayDatePicker = false;
		}, 0);
	}

	$('#lesson-hour-picker').timepicker({
        'minTime': '8:00am',
			'timeFormat': 'H:i',
			'step': 15
	}).on('change', function (e) {
		var time = ($('#lesson-hour-picker').timepicker('getTime'));
		$scope.lesson.hour = moment(time).format('HH:mm');

	}).on('focus', function () {
		$(this).trigger('blur');
	}).on('hideTimepicker', function (e) {
		$scope.hideHoursPicker();
	});

	$scope.showHoursPicker = function (event){
		event.stopPropagation();
		$('#lesson-hour-picker').timepicker("show");
		$scope.displayHourPicker = true;
	}

	$scope.hideHoursPicker = function() {
		$timeout(function () {
			$scope.displayHourPicker = false;
		}, 0);
	}

	$scope.selectSubjectsToBeTaught = function () {
		$timeout(function () {
			$scope.showSubjectSelectionPopup = true;
		}, 0);
	};

	$scope.toggleSubjectSelection = function(subjectid) {
		if($scope.subjectsTaught.indexOf(subjectid)==-1)
		{
			$scope.subjectsTaught.push(subjectid);
			$scope.markForDelete = "";
		}
		else
		{
            $scope.subjectsTaught.splice($scope.subjectsTaught.indexOf(subjectid), 1);
            if ($scope.lesson.customSubjects.findIndex(x => x.subjectid == subjectid) >= 0) {
            	$scope.markForDelete = subjectid;
        	}

		}
	}

	$scope.PopAllTheCustomSubjects=function(){

		var i=0;
		while(i<$scope.subjectsTaught.length)
		{
			if($scope.subjectsTaught[i].includes("a"))
			{
               	for(var j=0;j<$scope.ACustomSubjects.length;j++)
				{
					if($scope.subjectsTaught[i]===$scope.ACustomSubjects[j].subjectid)
					{
						   $scope.subjectsTaught.splice(i,1);
						   $scope.lesson.customSubjects.push($scope.ACustomSubjects[j]);
					}   
				}
				i=0;
			}
			i++;
		}
	}

    $scope.SyllabusSubjectIds=[];
	$scope.GetSyllabusSubjectIds=function () {
        var data = {};
        data.courseid = $scope.courseId;
        server.requestPhp(data, "GetSubjectsByCourseIdNotInTree").then(function (data) {
            if (data && !data.error) {
                $scope.SyllabusSubjectIds = data;
            }
        });
    };
    $scope.GetSyllabusSubjectIds();

	$scope.GetAllFixedSubjectsTaught=function(){
        // console.log("GetAllFixedSubjectsTaught");
        // console.log($scope.subjectsTaught);
        if($scope.subjectsTaught.length!=0 && $scope.SyllabusSubjectIds.length!=0) {
            for (var i = 0; i < $scope.subjectsTaught.length; i++) {
				for(var j=0;j<$scope.SyllabusSubjectIds.length;j++)
				{
					if($scope.subjectsTaught[i]==$scope.SyllabusSubjectIds[j].subjectid)
						$scope.lesson.subjectsTaught.push($scope.SyllabusSubjectIds[j].subjectid);
				}
            }
        }
	}



	//check if the lesson that create has all the requires fields
	$scope.validateLesson = function () {

		if(($scope.lesson.highlightedStats&&$scope.lesson.highlightedStats.length)&&!($scope.lesson.statsComments&&$scope.lesson.statsComments.length))
		{
			return false;
		}
		if(($scope.lesson.resourceLinks&&$scope.lesson.resourceLinks.length)&&!($scope.lesson.linkComments&&$scope.lesson.linkComments.length))
		{
			return false;
		}
		if($scope.subjectsTaught.length==0)
		{
			return false;
		}
		return $scope.lesson.date && $scope.lesson.hour && $scope.subjectsTaught.length;
	};

	$scope.youtubeResults = [];

    $scope.searchYoutube = function (query) {
		$scope.loadingVideos = true;
        var data = {};
        data.value = query;
        server.requestPhp(data, "GetYouTubeResults").then(function (data) {
            $scope.youtubeResults=data;
            $scope.loadingVideos = false;
        });
    };

    $scope.hyperlinkPopup=false;

    $scope.closeHyperlinkPopup = function(){
        $scope.hyperlinkPopup=false;
    }

	$scope.saveLink=function(){
        $scope.lesson.resourceLinks.push({"link":$scope.newLink.link, "title":$scope.newLink.title});
		$scope.newLink = {};
        $scope.closeHyperlinkPopup();
	}
	
	$scope.searchYoutubePopup=false;

	$scope.closeYoutubePopup = function() {
		$scope.searchYoutubePopup=false;
	}

	$scope.selectVideo = function(vid){
        $scope.lesson.resourceLinks.push({"link":vid.url, "title":vid.title});
		$scope.closeYoutubePopup();
		$scope.displayYoutubeVideo();
	}

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

	$scope.addCustomSubjects=function() {
		if($scope.customSubject.subject!=null) {

            //rand a subjectid for the new custom subject just for the "toggle taughtsubject"- it will be not sent to the server side
			var subjectIdTemp=0;
			subjectIdTemp+= 9999 * Math.floor(Math.random() * 99999);
            subjectIdTemp+= 'a';
			$scope.customSubject.subjectid=subjectIdTemp.toString();
			$scope.customSubject.isCustomSubject=true;
			$scope.subjectsTaught.push(subjectIdTemp.toString());
            $scope.syllabus.push($scope.customSubject);
            $scope.ACustomSubjects.push($scope.customSubject);

            //this data saved for sending the new custom subjects to the server
          // $scope.lesson.customSubjectsFromUser.push($scope.customSubject);
            $scope.customSubject = {
                subject: null,
                subjectid: null,
                subjectinarabic: null,
                subsubjects: [],
				supersubjectid: null,
				isCustomSubject: null
            };
        }
	}

	$scope.editCustomSubject = function(node) {
		$scope.editCustomSubjectPopup=true;
		$scope.CustomSubject_subject=node.subject;	
		$scope.CustomSubject_subjectId=node.subjectid;	
	}

	$scope.editCustomSubjectPopup=false;

	$scope.deleteCustomSubject = function(subjectid) {

        $scope.syllabus.splice($scope.syllabus.findIndex(x => x.subjectid == subjectid),1);
		$scope.lesson.customSubjects.splice($scope.lesson.customSubjects.findIndex(x => x.subjectid == subjectid), 1);
        $scope.subjectsTaught.splice($scope.subjectsTaught.findIndex(x => x.subjectid == subjectid), 1);



    }

	$scope.closeEditCustomSubjectPopup = function(id,topic) {
		$scope.editCustomSubjectPopup=false;
		if (topic) {
			$scope.syllabus.forEach(element => {
				if (element.subjectid==id) {
					element.subject=topic;
				}
			});
			$scope.lesson.customSubjects.forEach(element => {
				if (element.subjectid==id) {
					element.subject=topic;
				}
			});
		}
	}

	$scope.saveMeeting = function () {
		$scope.PopAllTheCustomSubjects();
		$scope.GetAllFixedSubjectsTaught();
        // console.log("fixed: ");
        // console.log($scope.lesson.subjectsTaught);
		if ($scope.markForDelete != "") {
			$scope.syllabus.splice($scope.syllabus.findIndex(x => x.subjectid == $scope.markForDelete),1);
			$scope.lesson.customSubjects.splice($scope.lesson.customSubjects.findIndex(x => x.subjectid == $scope.markForDelete), 1);
		}
      //    console.log("customSubjects:");
      //   console.log($scope.lesson.customSubjects);

		var date = $scope.lesson.beginningdate;
		var timeArr = $scope.lesson.hour.split(':');
		date.setHours(timeArr[0]);
		date.setMinutes(timeArr[1]);
		$scope.lesson.scheduleDate = new Date(date).getTime();
		var notification = $scope.notifyStudents;
		var data = {};
		data.courseid = $scope.courseId;
		data.lesson = $scope.lesson;
        //console.log($scope.lesson);
		if($scope.lessonId)
		{
			if($scope.waitingForServerResponse)
				return;
			$scope.waitingForServerResponse = true;
            console.log("sent to UpdateLesson");
            console.log($scope.lesson);
			server.requestPhp(data, "UpdateLesson").then(function (data) {

				$state.transitionTo('singleCourse', {
					courseId: $stateParams["courseId"]
				});
				$scope.waitingForServerResponse = false;
			});
		}
		else
		{
			console.log("sent to addLesson");
			console.log($scope.lesson);
			server.requestPhp(data, "AddLesson").then(function (data) {

				$state.transitionTo('singleCourse', {
					courseId: $stateParams["courseId"]
				});
			});
		}
	};

	$scope.cancelMeetingCreation = function () {
		$scope.displaySaveApprovalPopup = false;
	};

	$scope.reviewMeeting = function () {
		if ($scope.validateLesson()) {
			$scope.displaySaveApprovalPopup = true;
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
		return month;
	};

	//get the time
	$scope.getTimeByTimestamp = function (timestamp) {
		//moment($scope.dateValue).format('DD-MM-YYYY')
		var time = moment(parseInt(timestamp)).format('HH:mm');
		return time;
	};

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

	$scope.removeMovie = function (item ) {
		var url= $sce.getTrustedResourceUrl(item);
		url= url.substring(30);
		var linkIndex= $scope.lesson.resourceLinks.findIndex( l=>l.link.indexOf("v="+url)>=0);
		$scope.lesson.resourceLinks.splice(linkIndex,1);
		var videoPossition = $scope.trustedVideoUrls.indexOf (item );
		$scope.trustedVideoUrls.splice(videoPossition,1 );
	};

	$scope.removeLink = function (item ) {
		remove (item);
	}

	function remove (item) {
		var resourcePossition = $scope.lesson.resourceLinks.indexOf (item );
		$scope.lesson.resourceLinks.splice(resourcePossition,1);
	}
	
} ]);