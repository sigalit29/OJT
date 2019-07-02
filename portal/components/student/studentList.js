apple.controller('studentList', ['$rootScope', '$scope', '$state', '$stateParams','userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, userService, Upload, server) {	
		
	$scope.search=$stateParams.search;
	$scope.sortingField=$stateParams.sorting?$stateParams.sorting:"studentid";
	$scope.reverseOrder=$stateParams.desc;
	$scope.pageIndex = $stateParams.page;
	$scope.pageCount;
	$scope.students=[];
	$scope.studentStatus=1;

	$scope.alertcontrol={};
	$scope.show=false;
	
	$scope.Type="";
	$scope.GetMyType = function()
	{
		var data ={};
		server.requestPhp(data, 'GetMyType').then(function (data) {
		    $scope.Type = data;
		});
	}
	$scope.GetMyType();
	
	$scope.getStudents = function() {
		$scope.loading=true;
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var userstatus = $scope.studentStatus;
		var page = $scope.pageIndex;

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page};
		server.requestPhp(data, 'SearchStudents').then(function (data) {
			$scope.students = data.students;
			$scope.pageCount = parseInt(data.pages);
			$scope.loading=false;
		});
	}
	$scope.getStudents();
	
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
		$scope.getStudents();
	}
	
	$scope.goToActiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.studentStatus=1;
		$scope.getStudents();
	}
	
	$scope.goToInactiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.studentStatus=0;
		$scope.getStudents();
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
		console.log(sortIndex);
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
	
	$scope.addStudent = function()
	{
		$state.transitionTo('singleStudent', {
			studentId : ''
		});
	}
	
	$scope.goToStudentPage = function(student)
	{
		$state.transitionTo('singleStudent', {
			studentId : student.studentid
		});
	}
	
	$scope.fileUpload=false;
	
	$scope.onFileSelect = function($files) {
			$scope.fileUpload=true;
			Upload.upload({
				url: phpDomain+'datagate.php?type=UploadStudentsFile&token=' + $rootScope.userToken,
				file: $files,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				if(data.data.error!=null)
				{
					alert(data.data.error);
				}
				else if (data.status==200)
				{
					alert("החניכים נקלטו במערכת");
					$state.reload();
				}
				else
				{
					alert("תקלה בהעלאת קובץ");
				}
				$scope.fileUpload=false;
			}); 
	}
} ]);