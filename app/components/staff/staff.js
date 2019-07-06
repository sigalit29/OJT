apple.controller('staff', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {

	$scope.staff={};
	$scope.test={a:{}};
	$scope.deletingcontrol={};
	$scope.word="";
	$scope.fill={"sortby":"","tznumber":"","firstname":"","firstnameinarabic":"","lastname":"","lastnameinarabic":"","phone":"","adress":"","birthday":"","email":"","type":"","superstaff":""};
	$scope.alertcontrol={};
	$scope.alertcontroldupl={};
	$scope.confirmcontrol={};
	$scope.reportcontrol={};
	$scope.reportcontroll={};
	$scope.reportedit={};
	$scope.reporteditforcourse={};
	
	$scope.reports=[];
	$scope.Getreportsubject = function()
	{
		var data = {};
		server.requestPhp(data, 'GetSubjectreports').then(function (data) {
			$scope.reports.reportsubject=[];
			data.forEach(function(reportsubject) {
				if( reportsubject.IsShow=="1")
				{
					//console.log(reportsubject);
					$scope.reports.reportsubject.push(reportsubject);
				}
			});
		});
	};
	$scope.Getreportsubject();
	
	$scope.Getclientcode = function()
	{
		var data = {};
		server.requestPhp(data, 'GetClientcodes').then(function (data) {
			$scope.reports.clientcode=[];
			data.forEach(function(clientcode) {
				if( clientcode.IsShow=="1")
				{
					$scope.reports.clientcode.push(clientcode);
				}
			});
		});
	};
	$scope.Getclientcode();
	/*
	$scope.Getsalarycode = function()
	{
		server.requestPhp(data, 'GetSalarycodes').then(function (data) {
			$scope.reports.salarycode=[];
			data.forEach(function(salarycode) {
				if( salarycode.IsShow=="1")
				{
					$scope.reports.salarycode.push(salarycode);
				}
			});
		});
	};
	$scope.Getsalarycode();*/
	
	$scope.Type="";
	$scope.GetMyType = function()
	{
		var data = {};
		server.requestPhp(data, 'GetMyType').then(function (data) {
		    $scope.Type = data;
		});
	};
	$scope.GetMyType();
	
    $scope.languages = [];
    $scope.GetLanguages = function () {
    	var data = {};
        server.requestPhp(data, 'GetLanguages').then(function (data) {
			data.forEach(function(element) {
				element["id"] = element["languageid"];
				delete element["languageid"];
				if(element["IsShow"]=='1')
				{
					$scope.languages.push(element);
				}
			});
		});
    };
    $scope.GetLanguages();
	
	$scope.professions = [];
    $scope.GetProfessions = function () {
    	var data = {};
        server.requestPhp(data, 'GetProfessions').then(function (data) {
			data.forEach(function(element) {
				element["id"] = element["professionid"];
				delete element["professionid"];
				if(element["IsShow"]=='1')
				{
					$scope.professions.push(element);
				}
			});
		});
    };
    $scope.GetProfessions();
	
	$scope.certificates = [];
    $scope.GetCertificates = function () {
    	var data = {};
        server.requestPhp(data, 'GetCertificates').then(function (data) {
			data.forEach(function(element) {
				element["id"] = element["certificateid"];
				delete element["certificateid"];
				if(element["IsShow"]=='1')
				{
					$scope.certificates.push(element);
				}
			});
		});
    };
    $scope.GetCertificates();
	
	$scope.genders = [];
    $scope.GetGenders = function () {
    	var data = {};
        server.requestPhp(data, 'GetGenders').then(function (data) {
		    $scope.genders = data;
		});
    };
    $scope.GetGenders();
	
	$scope.cities = [];
    $scope.GetCities = function () {
    	var data = {};
        server.requestPhp(data, 'GetCities').then(function (data) {
		    $scope.cities = data;
		});
    };
    $scope.GetCities();
	
	$scope.religions = [];
    $scope.GetReligions = function () {
    	var data = {};
        server.requestPhp(data, 'GetReligions').then(function (data) {
		    $scope.religions = data;
		});
    };
    $scope.GetReligions();
	
	$scope.staffs = [];
    $scope.GetStaffs = function () {
    	var data = {};
        server.requestPhp(data, 'GetStaffs').then(function (data) {
				$scope.staffs = data;
		});
    };
    
    $scope.GetStaffs();
	
	$scope.SuperStaffs = [];
	$scope.mystaffs = [];
    $scope.GetSuperStaffs = function () {
    	var data = {};
        server.requestPhp(data, 'GetSuperStaffs').then(function (data) {
		    $scope.SuperStaffs = data;
			/*data.forEach(function(element) {
				element["id"] = element["staffid"];
				element["name"] = element["firstname"]+'-'+element["lastname"];
				delete element["languageid"];
				$scope.mystaffs.push(element);
			});*/
		});
   };
    $scope.GetSuperStaffs();
	
	$scope.mycourses = [];
	    $scope.GetCourses = function () {
	    	var data = {};
        server.requestPhp(data, 'GetCoursesAndProjectname').then(function (data) {
			data.forEach(function(element) {
				element["id"] = element["courseid"];
				if(element["project"])
				{
					element["name"] = element["name"]+'-'+element["project"];
				}else
				{
					element["name"] = element["name"];
				}
				delete element["courseid"];
				$scope.mycourses.push(element);
			});
		});
   };
	$scope.GetCourses();
	
	$scope.types = ["madrich","admin"];
	
	$scope.SaveStaff = function () {
		if(checkForm())
		{
			var data = {};
			data.staff = $scope.staff;
			server.requestPhp(data, 'AddStaff').then(function (data) {
				if(data.error!=null)
				{
					alert(data.error);
				}else
				{
					$scope.alertcontrol.open();
					$scope.GetStaffs();
				}
			});
		}
   };
	
	$scope.ClearStaff = function () 
	{
		$scope.staff={};
		$scope.member = {language: [] };
	};
	
	$scope.SearchWord = function($word) {
	  $scope.word = $word;
	  var data = {word: $word, fillter: $scope.fill};
	  server.requestPhp(data, 'SearchStaff').then(function (data) {
			$scope.staffs = data;
		});
	};
	
	$scope.openCreatePage = function()
	{
		if($scope.Type=='admin')
		{
			$scope.ClearStaff();
			$scope.staff.status=1;
			$scope.tabindex="home";
		}
	};
	
	$scope.staffClick = function(staff)
	{
		//if($scope.Type=='admin')
		//{
			//staff.phone = parseInt(staff.phone);
			staff.tznumber = parseInt(staff.tznumber);
			$scope.staff=staff;
			var d = $scope.staff.registerdate;
			d = d.split(' ')[0];
			$scope.staff.registerdate = d;
			$scope.tabindex="home";
		//}
	};
	
	$scope.CheckPermmetion = function()
	{
		if($scope.Type!="admin")
		{
			$(".form-control").attr('disabled','disabled');
			$(".btn-info").hide();
		}
	};
	
	/*$scope.fillter = [
	{"id":"firstname","name":"שם"},
	{"id":"lastname","name":"שם משפחה"},
	{"id":"tznumber","name":"ת'ז"},
	{"id":"birthday","name":"תאריך לידה"},
	{"id":"email","name":"אימייל"},
	{"id":"type","name":"סוג"}
	];*/
	
	$scope.filltor = function(x)
	{
		if(x!='superstaff')
			$scope.fill['superstaff']='';
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
		//console.log($scope.fill);
		$scope.SearchWord($scope.word);
	};
	
	$scope.fileUpload=false;
	$scope.onFileSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.fileUpload=true;
			var $file = $files[i];
			Upload.upload({
				url: phpDomain+'datagate.php?type=uploadDoc&token=' + $rootScope.userToken,
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
	};
	
	$scope.fileUpload=false;
	$scope.onStaffFileSelect = function($files) {
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
					$scope.regulations ="המדריכים נקלטו במערכת";
				else
					alert("תקלה בהעלאת קובץ");
				$scope.fileUpload=false;
			}); 
	}
	
	$scope.memberprofession = {profession: [] };
	$scope.staff.professions = [];
	
	$scope.membercertificate = {certificate: [] };
	$scope.staff.certificates = [];
	
	$scope.member = {language: [] };
	$scope.staff.languages = [];
	
	/*$scope.membertemp = {staffs: [] };
	$scope.staff.mystaffs = [];*/
	
	/*$scope.membercourse = {courses: [] };
	$scope.staff.mycourses = [];*/
		
	$scope.IfDeleteStaff = function()
	{	
		if($scope.staff.staffid!=null)
		{
			$scope.deletingcontrol.open();
		}
	};
	
	$scope.DeleteStaff = function()
	{
		var data = {staffid:$scope.staff.staffid};
		server.requestPhp(data, 'DeleteStaff').then(function (data) {
			});
		$scope.ClearStaff();
	};
		
	$scope.goToOpenstaffs = function()
	{
		$scope.staff={};
		$scope.member = {language: [] };
				
		if($scope.Type=="admin")
		{
			var Emptystaff = angular.equals($scope.staff, {});
			if($scope.tabindex=='home' && !Emptystaff)
			{
				$scope.confirmcontrol.open();
			}else
			{
				$scope.word='';
				$scope.GetStaffs();
				$scope.tabindex='profile';
			}
		}else
		{
			$scope.word='';
			$scope.GetStaffs();
			$scope.tabindex='profile';
		}
	};
	
	$scope.movedTo = function()
	{
		$scope.ClearStaff();
		$scope.goToOpenstaffs();
	};
	
	$scope.DuplicateStaff = function()
	{
		delete $scope.staff["tznumber"];
		delete $scope.staff["email"];
		delete $scope.staff["firstname"];
		delete $scope.staff["firstnameinarabic"];
		delete $scope.staff["staffid"];
		$scope.alertcontroldupl.open();
	};
	
	$scope.AddSubReport = function(staff)
	{
		if(staff['mycourses'] && staff['mycourses'].length>0)
		{
			var data = {};
			data.courses=staff['mycourses'];
			server.requestPhp(data, 'GetProjectsOfCourses').then(function (data) {
				$scope.reports.project = data;
				$scope.reportcontrol.open();
			});
		}
	};
	
	$scope.AddSubReportt = function(staff)
	{
		var data ={};
		server.requestPhp(data, 'GetAllProjects').then(function (data) {
			$scope.reports.project=[];
			data.forEach(function(project) {
				if( project.IsShow=="1")
				{
					$scope.reports.project.push(project);
				}
			});
				$scope.reportcontroll.open();
		});
	};
	
	$scope.DeleteReport = function(report,allreport)
	{
		var index = allreport.indexOf(report);
		allreport.splice(index, 1); 
	};
	
	$scope.goToCourse = function(couseid)
	{
		$rootScope.tempPass={courseid:couseid};
		$state.transitionTo('course');
	};
	
	$scope.goToStaff = function(staffid)
	{
		$scope.staffs.forEach(function(element) {
			if(element["staffid"]==staffid)
			{
				//$scope.languages.push(element);
				$scope.staffClick(element);
			}
		});
	};
	$scope.editeReport = function(report)
	{
		$scope.pro = report.projectid;
		$scope.sub = report.subjectreportid;
		$scope.cli = report.clientcodeid;
		$scope.sal = report.salarycodeid;
		$scope.id = report.id;
		var data = {};
		server.requestPhp(data, 'GetAllProjects').then(function (data) {
				$scope.reports.project = data;
				$scope.reportedit.open();
		});
	};
	
	$scope.editeReportforcourse = function(report,staff)
	{
		$scope.pro = report.projectid;
		$scope.sub = report.subjectreportid;
		$scope.cli = report.clientcodeid;
		$scope.sal = report.salarycodeid;
		$scope.id = report.id;
		if(staff['mycourses'] && staff['mycourses'].length>0)
		{
			var data = {};
			data.courses=staff['mycourses'];
			server.requestPhp(data, 'GetProjectsOfCourses').then(function (data) {
				$scope.reports.project = data;
				$scope.reporteditforcourse.open();
			});
		}
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
}]);


