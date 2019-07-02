apple.controller('myprofile', ['$rootScope', '$scope', '$state','userService','Upload', 'server', function ($rootScope, $scope, $state,userService,Upload, server) {	

	$scope.alertcontrol={};
	
	$scope.MyStaffs = [];
	$scope.GetMyStaffs = function()
	{
		var data = {};
	    server.requestPhp(data, "GetMyStaffs").then(function (data) {
		    $scope.MyStaffs = data;
		})
	}
    $scope.GetMyStaffs();
	
	$scope.languages = [];
    $scope.GetLanguages = function () {
    	var data={};
    	server.requestPhp(data, "GetLanguages").then(function (data) {
			data.forEach(function(element) {
				element["id"] = element["languageid"];
				delete element["languageid"];
				if(element["IsShow"]=='1')
				{
					$scope.languages.push(element);
				}
			});
		});
    }
    $scope.GetLanguages();

	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data={};
    	server.requestPhp(data, "GetGenders").then(function (data) {
		    $scope.genders = data;
		});
    }
    $scope.GetGenders();
	
	$scope.religions = [];
    $scope.GetReligions = function () {
    	var data={};
    	server.requestPhp(data, "GetReligions").then(function (data) {
		    $scope.religions = data;
		});
    }
    $scope.GetReligions();
	
	$scope.staff = [];
    $scope.GetProfile = function () {
    	var data={};
    	server.requestPhp(data, "GetProfile").then(function (data) {
		    $scope.staff = data;
			$scope.staff.phone = parseInt($scope.staff.phone);
			$scope.staff.tznumber = parseInt($scope.staff.tznumber);
			var d = $scope.staff.registerdate;
			d = d.split(' ')[0];
			$scope.staff.registerdate = d;
		});
    }
    $scope.GetProfile();
	
	$scope.member = {language: [] };
	$scope.staff.languages = [];
	
	$scope.SaveStaff = function () {
		var data={};
		data.staff=$scope.staff;
    	server.requestPhp(data, "AddUser").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.staff={};
				$scope.member = {language: [] };
				$scope.GetProfile();
			}
		});
    }
	
	$scope.fileUpload=false;
	$scope.onFileSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.fileUpload=true;
			var $file = $files[i];
			Upload.upload({
				url: phpDomain+'datagate.php?type=uploadDoc',
				file: $file,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if (data.data.fileUrl)
					$scope.staff.image =data.data.fileUrl;
				else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.fileUpload=false;
			}); 
		}
	}
	
	$scope.ChangePassword = function()
	{
		$scope.staff.password = $scope.staff.firstnewpass;
		delete $scope.staff["secondnewpass"];
		delete $scope.staff["firstnewpass"];
		delete $scope.staff["curentpassword"];
		
		$scope.alertcontrol.open();
	}
} ]);


