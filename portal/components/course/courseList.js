apple.controller('courseList', ['$rootScope', '$scope', '$state', '$stateParams', '$q', 'userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, $q, userService, Upload, server) {

    $rootScope.stateName = "course";

    $scope.search=$stateParams.search;
	$scope.sortingField=$stateParams.sorting?$stateParams.sorting:"courseid";
	$scope.reverseOrder=$stateParams.desc;
	$scope.pageIndex = $stateParams.page;
	$scope.pageCount;
	$scope.courses=[];
	$scope.courseStatus=1;

	$scope.alertcontrol={};
	$scope.show=false;
	$scope.fileName = "listOfCourse";
  $scope.profile = {};

  $scope.getCourses = function() {
		$scope.loading=true;
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var coursestatus = $scope.courseStatus;
		var page = $scope.pageIndex;

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'coursestatus': coursestatus, 'page': page};
	//	console.log(data);
		server.requestPhp(data, 'SearchCourses').then(function (data) {
			$scope.courses = data.courses;
			$scope.pageCount = parseInt(data.pages);
			$scope.loading=false;
            $scope.GetMyProfile();
            $scope.GetUserExtendedProfile();
		});
	}
	$scope.getCourses();

  $scope.getCoursesFull = function() {
		var courses = [];
		var async = $q.defer();
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var coursestatus = $scope.courseStatus;
		var page = -1;

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'coursestatus': coursestatus, 'page': page};
		console.log(data);
		$scope.loading=true;
		server.requestPhp(data, 'SearchCourses').then(function (data) {
				courses = data;
				$scope.loading=false;
				async.resolve(courses);
			});
		
		return async.promise;
	};



   $scope.GetUserProfile = function () {
        var data = {};
        $scope.user = {};
        server.requestPhp(data, 'GetMyProfile').then(function (data) {
            $scope.user = data;
            $scope.user.image = ($scope.user.image) ? $scope.user.image : "portal/img/user.png";
        });
    }



    $scope.GetMyProfile = function () {
        var data = {};
        server.requestPhp(data, 'GetMyProfile').then(function (data) {
            $scope.profile = data;
            //console.log(data);
        });
    }

    $scope.GetUserProfile();

    $scope.GetUserExtendedProfile = function () {
        //console.log("hh");
        var data = {};
        server.requestPhp(data, 'GetUserExtendedProfile').then(function (data) {
            $scope.Extendedprofile = data;
          //  console.log($scope.Extendedprofile);
        });
    }
	
	$scope.refreshResults=function()
	{
		$state.go('.', {
			search : $scope.search,
			sorting : $scope.sortingField,
			desc : $scope.reverseOrder,
			page: $scope.pageIndex
		},
		{
			notify: false
		});
		$scope.getCourses();
	}
	
	$scope.goToActiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.courseStatus=1;
		$scope.getCourses();
	}
	
	$scope.goToInactiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.courseStatus=0;
		$scope.getCourses();
	}
	
	$scope.goToPage = function(pageNum)
	{
		if(pageNum>=0&&pageNum<=$scope.pageCount)
		{
			$scope.pageIndex=pageNum;
			$scope.refreshResults();
		}
	}
	
	$scope.sortBy = function(sortIndex)
	{
		if($scope.sortingField==sortIndex)
		{
			$scope.reverseOrder=!$scope.reverseOrder;
		}
		else
		{
			$scope.reverseOrder=false;
		}
		$scope.sortingField=sortIndex;
		$scope.refreshResults();
	}
	
	$scope.addCourse = function()
	{
		$state.transitionTo('singleCourse', {
			courseId : ''
		});
	}
	
	$scope.goToCoursePage = function(course)
	{
		$state.transitionTo('singleCourse', {
			courseId : course.courseid
		});
	}
} ]);