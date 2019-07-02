apple.controller('staffList', ['$rootScope', '$scope', '$state', '$stateParams','userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, userService, Upload, server) {	
		
	$scope.search=$stateParams.search;
	$scope.sortingField=$stateParams.sorting?$stateParams.sorting:"staffid";
	$scope.reverseOrder=$stateParams.desc;
	$scope.pageIndex = $stateParams.page;
	$scope.pageCount;
	$scope.staffList=[];
	$scope.staffStatus=1;

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
	
	$scope.getStaff = function() {
		$scope.loading=true;
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var userstatus = $scope.staffStatus;
		var page = $scope.pageIndex;

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page};
		server.requestPhp(data, 'SearchStaff').then(function (data) {
			$scope.staffList = data.staff;
			$scope.pageCount = parseInt(data.pages);
			$scope.loading=false;
		});
	}
	$scope.getStaff();
	
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
		$scope.getStaff();
	}
	
	$scope.goToActiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.staffStatus=1;
		$scope.getStaff();
	}
	
	$scope.goToInactiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.staffStatus=0;
		$scope.getStaff();
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
	
	$scope.addStaff = function()
	{
		$state.transitionTo('singleStaff', {
			staffId : ''
		});
	}
	
	$scope.goToStaffPage = function(staff)
	{
		$state.transitionTo('singleStaff', {
			staffId : staff.staffid
		});
	}
	
	$scope.fileUpload=false;
	
	$scope.onFileSelect = function($files) {
			$scope.fileUpload=true;
			Upload.upload({
				url: phpDomain+'datagate.php?type=UploadStaffFile&token=' + $rootScope.userToken,
				file: $files,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				if(data.data.error!=null)
				{
					alert(data.data.error);
				}
				else if (data.status==200)
					alert("החניכים נקלטו במערכת");
				else
					alert("תקלה בהעלאת קובץ");
				$scope.fileUpload=false;
			}); 
	}
} ]);