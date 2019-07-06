apple.controller('mentoringSession', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', 'dateNames', '$filter',
function($scope, $stateParams, $rootScope, $state, $timeout, server, dateNames, $filter) {
	$scope.courseId = $stateParams["courseId"];
	$scope.showPopupSessionType = false;
	$scope.showPopupStudents = false;
	$scope.sessionTypes = [];
	$scope.sessionType;
	$scope.students=[];
	$scope.dayText = $rootScope.dictionary.dayText;
	$scope.sessionComment='';
	$scope.sessionIsValid = false;
	$scope.dateValid = false;
	$scope.timeValid = false;
	$scope.open = false;
	$scope.courseId = $stateParams["courseId"];

	$scope.init = function() {
		$rootScope.$broadcast('setHeaderTitle', {
			title : $rootScope.dictionary.mentoringSessionCreation
		});
		$('#lesson-hour-picker').timepicker({
				'timeFormat': 'H:i',
				'step': 15
			}).on('focus', function () {
				$(this).trigger('blur');
		});
		getSessionTypes();
		getStudents();
	};
	$scope.init();
	function getSessionTypes() {
		var data = {};
		server.requestPhp(data, "GetSessionTypes").then(function(data) {
			$scope.sessionTypes = data;
		});
	}

	$scope.getSessionTypeById = function(id) {
		for (var i = 0; i < $scope.sessionTypes.length; i++) {
			if ($scope.sessionTypes[i].id == id)
				return $scope.sessionTypes[i];
		}
		return {};
	};

	function getStudents()
	{
		var data = {};
		data.courseid = $scope.courseId;
		data.type = "post";
		server.requestPhp(data, "GetStudentsStatistics").then(function(data) {
			console.log(data);
			if(data.error=="access permission")
			$scope.noPermission = true;
			else
			{
			for (var i=0; i<data.length;i++)
			{
				if(data[i].status!='נשר')
				{
					data[i].fullname=data[i].firstname+" "+data[i].lastname;
					$scope.students.push(data[i]);
				}
			}
			}
		});
	}
	$scope.getSelectedStudents = function() {
		var selectedStudents = [];
		for (var i = 0; i < $scope.students.length; i++) {
			if ($scope.students[i].checked) {
				selectedStudents.push($scope.students[i]);
			}
		}
		return selectedStudents;
	};
	function closePopup() {
		$scope.showPopupSessionType = false;
		$scope.showPopupStudents = false;
		$rootScope.$broadcast('setHeaderTitle', {
			title : $rootScope.dictionary.mentoringSessionCreation
		});
	}

	$scope.openSessionTypePopup = function() {
		$rootScope.$broadcast('setHeaderTitle', {
			title : $rootScope.dictionary.sessionType
		});
		$scope.showPopupSessionType = true;
	};
	
	$scope.openInvitedStudentsPopup = function() {
		$rootScope.$broadcast('setHeaderTitle', {
			title : $rootScope.dictionary.studentSelection
		});
		$scope.showPopupStudents = true;
	};

	//datepicker
	$.fn.datetimepicker.dates['ln'] = $rootScope.dictionary.dateTimePickerLanguage;

	$('#lesson-date-picker').datetimepicker({
		pickTime: false,
		format: 'YYYY-MM-DD',
		language: 'ln'
	}).on('changeDate', function (e) {
		$timeout(function () {
			$scope.date = moment(e.localDate).format('DD-MM-YYYY');
			$scope.dateValue = e.localDate;
		}, 0);
		$(this).datetimepicker('hide');
	});

	$scope.openList = function() {
		$timeout(function() {
			$scope.open = true;
		}, 0);
	};

	//check if the lesson that create has all the requires fields
	$scope.sessionValidation = function() {
		return $scope.date && $scope.timepicker && $scope.sessionType && $scope.getSelectedStudents().length>0;
	};

	$scope.commentChanged = function(comment) {
		$scope.sessionComment = comment;
	};

	$scope.confirmSessionCreation = function() {

		if ($scope.sessionValidation() == true) {
			var date = $scope.dateValue;
			// date
			var timeArr = $scope.timepicker.split(':');
			date.setHours(timeArr[0]);
			date.setMinutes(timeArr[1]);
			var data = {};
			data.courseid = $scope.courseId;
			data.scheduleddate = new Date(date).getTime();
			data.comments = $scope.sessionComment;
			data.type = $scope.sessionType;
			data.students=[];
			for (var i=0; i<$scope.students.length;i++)
			{
				if($scope.students[i].checked)
				data.students.push($scope.students[i].userid);
			}
			server.requestPhp(data, "AddMentoringSession").then(function(data) {
				$state.transitionTo('singleCourse', {
					courseId : $stateParams["courseId"]
				});

			});
		};
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
}]);

