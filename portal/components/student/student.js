apple.controller('student', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {	
		
	$scope.word="";
	$scope.fill={"sortby":"","tznumber":"","firstname":"","firstnameinarabic":"","lastname":"","lastnameinarabic":"","phone":"","adress":"","birthday":"","email":"", "notes":"", "phone2owner":""};
	$scope.student={};
	$scope.alertcontrol={};
	$scope.students=[];
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
	
	
	$scope.SearchWord = function($word, mystatus) {
	  $scope.word = $word;
	  var data ={word: $word, fillter: $scope.fill, status: mystatus};
	  server.requestPhp(data, 'SearchStudents').then(function (data) {
			$scope.students = data;
			if(mystatus=='1' || mystatus==true)
			{
				$scope.activestudents = $scope.students;
			}else
			{
				$scope.unactivestudents =  $scope.students;
			}
		});
	}
	
	$scope.activestudents = [];
    $scope.GetActiveStudents = function () {
		$scope.SearchWord('','1');
    }
    $scope.GetActiveStudents();
	
	$scope.unactivestudents = [];
    $scope.GetUnActiveStudents = function () {
     /*   server.requestPhp(data, 'GetStudentsByStatus', data:'0').then(function (data) {
				$scope.unactivestudents = data;
		});*/
		$scope.SearchWord('','0');
    }
    $scope.GetUnActiveStudents();
	
	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data ={};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    }
    $scope.GetGenders();
	
	$scope.religions = [];
    $scope.GetReligions = function () {
    	var data ={};
        server.requestPhp(data, 'GetReligions').then(function (data) {
		    $scope.religions = data;
		});
    }
    $scope.GetReligions();
	
	
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data ={};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    }
    $scope.GetCities();
	
	$scope.SaveStudent = function()
	{
		if(checkForm()){
			var data = {};
			data.student=$scope.student;
			server.requestPhp(data, 'AddStudent').then(function (data) {
				if(data.error!=null)
				{
					alert(data.error);
				}else
				{
					$scope.alertcontrol.open();
					$scope.student={};
					$scope.member = {language: [] };
					$scope.GetUnActiveStudents();
					$scope.GetActiveStudents();
				}
			});
		}
	}
	
	$scope.openCreatePage = function()
	{
		if($scope.Type=="admin")
		{
			$scope.student={};
			$scope.student.status=1;
			$scope.tabindex="create";
		}
	}
	
	$scope.goToActivetab = function()
	{
		$scope.tabindex="activetable";
	}
	
	$scope.goToUnactivetab = function()
	{
		$scope.tabindex="unactivetable";
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
					$scope.regulations ="החניכים נקלטו במערכת";
				else
					alert("תקלה בהעלאת קובץ");
				$scope.fileUpload=false;
			}); 
	}
	
	$scope.ExportStudents = function() {
			Upload.upload({
				url: phpDomain+'datagate.php?type=GetStudents&token=' + $rootScope.userToken,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				for (i = 0; i < data.data.length; i++) 
				{
					delete data.data[i].studentid;
					delete data.data[i].type;
				}
				alasql('SELECT * INTO XLSX("students.xlsx",{headers:true}) FROM ?',[data.data]);
			}); 
	}
	
	$scope.studentClick = function(student)
	{
		//student.phone = parseInt(student.phone);
		//student.phone2 = parseInt(student.phone2);
		student.tznumber = parseInt(student.tznumber);
		$scope.student=student;
		var d = $scope.student.registerdate;
		d = d.split(' ')[0];
		$scope.student.registerdate = d;
		$scope.tabindex="create";
	}
	
	$scope.imageUpload=false;
	$scope.onImageSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.imageUpload=true;
			var $file = $files[i];
			Upload.upload({
				url: phpDomain+'datagate.php?type=uploadDoc',
				file: $file,
				progress: function(e){}
			}).then(function(data, status, headers, config) {
				// file is uploaded successfully
				if (data.data.fileUrl)
					$scope.student.image =data.data.fileUrl;
				else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.imageUpload=false;
			}); 
		}
	}
	
	$scope.filltor = function(x)
	{
		if(x!='tznumber')
			$scope.fill.tznumber='';
		if(x!='firstname')
			$scope.fill.firstname='';
		if(x!='firstnameinarabic')
			$scope.fill.firstnameinarabic='';
		if(x!='lastname')
			$scope.fill.lastname='';
		if(x!='lastnameinarabic')
			$scope.fill.lastnameinarabic='';
		if(x!='phone')
			$scope.fill.phone='';
		if(x!='adress')
			$scope.fill.adress='';
		if(x!='birthday')
			$scope.fill.birthday='';
		if(x!='email')
			$scope.fill.email='';
		if(x!='type')
			$scope.fill.type='';
		
		if($scope.fill[x]==null)
		{
			$scope.fill[x] = 'asc';
		}else
		{
			if($scope.fill[x]=='asc')
			{
				$scope.fill[x]='desc';
			}else
			{
				$scope.fill[x]='asc';
			}
		}
		$scope.fill.sortby = x;
		if($scope.tabindex=='activetable')
		{
			$scope.SearchWord($scope.word,'1');
		}else
		{
			$scope.SearchWord($scope.word,'0');
		}
	}
	
	$scope.ClearStudent = function()
	{
		$scope.student={};
	}
	
	$scope.goToStudentsPage = function()
	{
		$scope.tabindex="activetable";
		
	}
	
function checkForm()
  {
	pwd1 = $('.myPassword');
	email = $('.myEmail');
	errormassege = $('.errorpassword');
	
    if(pwd1.val()!=null && pwd1.val() != "") {
      if(pwd1.val().length < 12) {
       // alert("Error: Password must contain at least six characters!");
        pwd1.focus();
		errormassege.show();
        return false;
      }
      if(pwd1.val() == email.val()) {
        alert("Error: Password must be different from Email!");
        pwd1.focus();
		errormassege.show();
        return false;
      }
      re = /[0-9]/;
      if(!re.test(pwd1.val())) {
      //  alert("Error: password must contain at least one number (0-9)!");
        pwd1.focus();
		errormassege.show();
        return false;
      }
      re = /[a-z]/;
      if(!re.test(pwd1.val())) {
      //  alert("Error: password must contain at least one lowercase letter (a-z)!");
        pwd1.focus();
		errormassege.show();
        return false;
      }
      re = /[A-Z]/;
      if(!re.test(pwd1.val())) {
      //  alert("Error: password must contain at least one uppercase letter (A-Z)!");
        pwd1.focus();
		errormassege.show();
        return false;
      }
    }
	errormassege.hide();
    return true;
  }
} ]);