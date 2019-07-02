apple.controller('nomineeList', ['$rootScope', '$scope', '$state', '$stateParams','userService', 'server', function ($rootScope, $scope, $state, $stateParams, userService, server) {

    $scope.checkedList=new Array(null);

	$scope.search=$stateParams.search;
	$scope.sortingField=$stateParams.sorting?$stateParams.sorting:"studentid";
	$scope.reverseOrder=$stateParams.desc;
	$scope.pageIndex = $stateParams.page;
	$scope.pageCount;
	$scope.nominees=[];
	$scope.filter={};
    $scope.filter.classid=null;
    $scope.filter.netacityid=null;
    $scope.filter.nomineestatusid=null;
    $scope.allSelected ;
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
	
	$scope.getNominees = function() {
		$scope.loading=true;
		var search = $scope.search;
        var ClassFilter = $scope.filter.classid;
        var netaCityFilter = $scope.filter.netacityid;
		var nomineeStatusFilter = $scope.filter.nomineestatusid;
		var sorting = $scope.sortingField;
		var desc = $scope.reverseOrder;
		var userstatus = $scope.studentStatus;
		var page = $scope.pageIndex;

		var data ={'search': search, 'sorting': sorting, 'desc':desc, 'userstatus': userstatus, 'page': page, 'ClassFilter':ClassFilter,'netaCityFilter': netaCityFilter, 'nomineeStatusFilter':nomineeStatusFilter};
		server.requestPhp(data, 'SearchNominees').then(function (data) {
			$scope.nominees = data.nominees;
			$scope.pageCount = parseInt(data.pages);
			$scope.loading=false;
			if(data) {
                for (var i = 0; i < $scope.nominees.length; i++) {
                    $scope.nominees[i].isChecked = false;
                   // console.log($scope.nominees[i].isChecked);
                }
                $scope.allSelected = false;
            }

		});
	}
	$scope.getNominees();
	
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
		$scope.getNominees();
	}
	
	$scope.goToActiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.studentStatus=1;
		$scope.getNominees();
	}
	
	$scope.goToInactiveTab = function()
	{
		$scope.pageIndex=0;
		$scope.studentStatus=0;
		$scope.getNominees();
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
		//console.log(sortIndex);
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
    $scope.NomineesStatuses = [];

    $scope.GetStatuses = function () {
        var data={};
        server.requestPhp(data, "GetNomineeStatuses").then(function (data) {
            $scope.NomineesStatuses = data;
        });
    }
    $scope.GetStatuses();

    $scope.UpdateNomineeStatus = function (nominee) {
        var data={};
        data.nomineeid= nominee.nomineeid;
        data.nomineestatusid= nominee.nomineestatusid;
        server.requestPhp(data, "UpdateNomineeStatus").then(function (data) {}
        );
    }

    $scope.Netacities = [];
    $scope.GetNetaCities = function () {
        var data={};
        server.requestPhp(data, "GetNetaCities").then(function (data) {
            $scope.Netacities = data;
        });
    }
    $scope.GetNetaCities();

    $scope.Classes = [];
    $scope.GetClasses = function () {
        var data={};
        server.requestPhp(data, "GetClasses").then(function (data) {
            $scope.Classes = data;
        });
    }
    $scope.GetClasses();

    $scope.UpdateNomineeComments = function (nominee) {
        var data={};
        data.nomineeid= nominee.nomineeid;
        data.comments= nominee.comments;
        server.requestPhp(data, "UpdateNomineeComments").then(function (data) {});
    }

	$scope.SelectAllRows = function(){
		console.log("allSelected():");
        $scope.allSelected=!$scope.allSelected;
        console.log( "$scope.allSelected");
        console.log($scope.allSelected);
		for(var i=0; i<$scope.nominees.length; i++){
            $scope.nominees[i].isChecked=$scope.allSelected;
            console.log($scope.nominees[i].isChecked);
		}
	}
    $scope.ChangeStatusByComboBox=function(index) {
      //  console.log("im here! "+ index);
        //	$scope.checkedList[index]=!$scope.checkedList[index];
        $scope.nominees[index].isChecked=!$scope.nominees[index].isChecked;
        console.log($scope.nominees[index].isChecked);
    }
    $scope.UpdateMultipleNomineeStatuses=function(s){
      //  console.log("before s: "+s);
        var toChange=[];
        $scope.nominees.forEach(function(nominee) {
            if(nominee.isChecked===true)
            {
                nominee.nomineestatusid= s;
               // console.log("after s: "+s);
                toChange.push(nominee);
            }
        });
        if(toChange!==null) {
            var data = {};
            data.nominees = toChange;
            server.requestPhp(data, "UpdateMultipleNomineeStatus").then(function (data) {
                }
            );
        }
    }
	
	$scope.deleteSelectedNominees = function ()
	{
		if(!confirm("בטוח? לא ניתן לבטל מחיקה!"))
			return
		var toDelete = [];
		$scope.checkedList.forEach(function(el,index) {
    		if(el==true)
			{
    			toDelete.push($scope.nominees[index].nomineeid);
			}
		});
		var data = {};
    	data.nominees = toDelete;
        server.requestPhp(data, "DeleteNominees").then(function (data) {
			$scope.refreshResults();
		});
	}
} ]);