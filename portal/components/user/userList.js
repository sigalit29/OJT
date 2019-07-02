apple.controller('userList', ['$rootScope', '$scope', '$state', '$stateParams', '$q', 'userService','Upload', 'server', function ($rootScope, $scope, $state, $stateParams, $q, userService, Upload, server) {
    $rootScope.stateName= $stateParams.userType;
    console.log($stateParams.userType);
   // $rootScope.stateName= "userList";
    $scope.search=$stateParams.search;
	$scope.sortingField=$stateParams.sorting?$stateParams.sorting:"userid";
	$scope.reverseOrder=$stateParams.desc;
	$scope.pageIndex = $stateParams.page;
	$scope.userType = $stateParams.userType;
	$scope.pageCount;
	$scope.userList=[];
	$scope.userStatus=1;
   // $rootScope.stateName = $stateParams.userType;


    var fetchMethods={
		"student":"SearchStudentsUnderMe",
		"staff":"SearchStaffUnderMe",
		"new":"SearchNewUsers",
		"excel":"SearchStaffUnderMeForExcel"
	};
	
	var fetchMethodsFull={
		"student":"SearchStudentsUnderMe",
		"staff":"SearchStaffUnderMeForExcel",
		"new":"SearchNewUsers"
	};

	$scope.alertcontrol={};
	$scope.show=false;

	//for excel useage
    $scope.AllUsersUnderMe={};


    $scope.SearchStaffUnderMeForExcel = function() {

        var search = $scope.search;
        var sorting = $scope.sortingField;
        var desc = $scope.reverseOrder;;
        var userstatus = $scope.userStatus;
        var page=-1;
        var userClassificationFetchMethod = fetchMethods[$scope.userType];
        var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page};
        server.requestPhp(data, userClassificationFetchMethod).then(function (data) {
            $scope.AllUsersUnderMe = data;
        });
    }
    //end.

    $scope.SearchStaffUnderMeForExcel();

    $scope.getUsers = function() {
		$scope.loading=true;
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var userstatus = $scope.userStatus;
		var page = $scope.pageIndex;
		
		var userClassificationFetchMethod = fetchMethods[$scope.userType];

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page};
		server.requestPhp(data, userClassificationFetchMethod).then(function (data) {
			$scope.userList = data.users;
			$scope.pageCount = parseInt(data.pages);
			$scope.loading=false;
		});
	}

	$scope.getUsers();
	
	$scope.getUsersFull = function() {
		$scope.loading=true;
		var userListFull = [];
		var search = $scope.search;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var userstatus = $scope.userStatus;
		var page = -1;
		var async = $q.defer();
		var userClassificationFetchMethod = fetchMethodsFull[$scope.userType];

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page};
		server.requestPhp(data, userClassificationFetchMethod).then(function (data) {
			userListFull = data;
			userListFull.forEach(function(el){
				el.birthday = el.birthday === null ? "": moment(el.birthday,"YYYY-MM-DD")._d;
				var key = Object.keys(el);
				key.forEach(function(k){
					if (!el[k])
					{
						el[k]="";
					}
				});
				
				// var arr = Object.values(el);
				// for (var i=0;i<arr.length;i++){
				// 	if(arr[i] === null)
				// 	{
				// 		arr[i] ="";
				// 	}
				// }
			});
			$scope.loading=false;
			async.resolve(userListFull);
		});
		return async.promise;
	};


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
		$scope.getUsers();
	}
	
	$scope.goToActiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.userStatus=1;
		$scope.getUsers();
	}
	
	$scope.goToInactiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.userStatus=0;
		$scope.getUsers();
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
	
	$scope.AddUser = function()
	{
		$state.transitionTo('singleUser', {
			userId : ''
		});
	}
	
	$scope.goToUserPage = function(user)
	{
        $state.transitionTo('singleUser', {
			userId : user.userid
		});
	}
	
	$scope.fileUpload=false;
	
	$scope.onFileSelect = function($files) {
		console.log($files);
		$scope.fileUpload=true;
		Upload.upload({
			url: phpDomain+'datagate.php?type=UploadUsers&token=' + $rootScope.userToken + '&v=' + version,
			file: $files,
			progress: function(e){}
		}).then(function(data, status, headers, config) {
			if(data.data.error!=null)
			{
				alert(data.data.error);
			}
			else if (data.status==200)
				alert("המשתמשים נקלטו במערכת");
            else if (data.status==500)
                alert(data);
			else
				alert("תקלה בהעלאת קובץ");
			$scope.fileUpload=false;
		}); 
	}
} ]);
