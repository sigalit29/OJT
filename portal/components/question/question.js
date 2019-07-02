apple.controller('question', ['$rootScope', '$scope', '$state', '$http','userService','Upload', 'server', function ($rootScope, $scope, $state, $http,userService,Upload, server) {
    $rootScope.stateName = "question";

    $scope.test={a:{}};
	$scope.goToTap="";
	$scope.confirmcontrol={};
	$scope.alertcontrol={}; 
	$scope.tabindex='home';
	//------------madrichquestion-----------------//
	$scope.MadrichQuestions = [];
    $scope.GetMadrichQuestions = function () {
    	var data={};
	    server.requestPhp(data, "GetMadrichQuestions").then(function (data) {
		    $scope.MadrichQuestions = data;
		});
    }
    $scope.GetMadrichQuestions();
	
	$scope.SaveMadrichQuestions = function () {
		var data={};
		data.questions=$scope.MadrichQuestions;
	    server.requestPhp(data, "AddMadrichQuestion").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetMadrichQuestions();
			}
		});
    }
	
	$scope.CreateMadrichQuestion = function()
	{
		$scope.MadrichQuestions.push({
			"id": $scope.MadrichQuestions.length+1,
			"question": '',
			"IsShow":true,
			"answer":[]
		});
		//////צריך למחוק את הלולאה אם צריך לנהל תשובות
		for(var i=0; i<5; i++)
		{
			$scope.CreateMadrichQuestionAns(0,$scope.MadrichQuestions.length);
		}
	}
	
	$scope.CreateMadrichQuestionAns = function(questionid, id)
	{
		var update = false;
		$scope.MadrichQuestions.forEach(function(element) {
			if(element['id']!=null && element['id']==id)
			{
				element.answer.push({"name":""});
				update = true;
			}
		});
		
		$scope.MadrichQuestions.forEach(function(element) {
			if(update == false && element['questionid']==questionid)
			{
				if(element.answer==null || element.answer=="")
				{
					element.answer = [];
				}
				element.answer.push({"name":""});
			}
		});
	}
	
	$scope.ClearMadrichQuestions = function()
	{
		$scope.GetMadrichQuestions();
	}
	
	$scope.goToMadrich = function()
	{
		$scope.goToTap='ToMadrich';
		$scope.confirmcontrol.open();
	}
	
	$scope.goToStudent = function()
	{
		$scope.goToTap='ToStudent';
		$scope.confirmcontrol.open();
	}
	
	$scope.movedTo = function(tabindex)
	{
		if(tabindex=='ToMadrich')
		{
			$scope.tabindex='home';
			$scope.ClearMadrichQuestions();
		}else if(tabindex=='ToStudent')
		{
			$scope.ClearStudentQuestions();
			$scope.tabindex='profile';
		}
	}
	
	//------------studentquestion-----------------//
	$scope.StudentQuestions = [];
    $scope.GetStudentQuestions = function () {
    	var data={};
	    server.requestPhp(data, "GetUniformQuestions").then(function (data) {
		    $scope.StudentQuestions = data;
		});
    }
    $scope.GetStudentQuestions();
	
	$scope.SaveStudentQuestions = function () {
		var data={};
		data.questions=$scope.StudentQuestions;
	    server.requestPhp(data, "AddUniformQuestions").then(function (data) {
			if(data.error!=null)
			{
				alert(data.error);
			}else
			{
				$scope.alertcontrol.open();
				$scope.GetStudentQuestions();
			}
		});
    }
	
	$scope.CreateStudentQuestions = function()
	{
		$scope.StudentQuestions.push({
			"id": $scope.StudentQuestions.length+1,
			"question": '',
			"IsShow":true,
			"answer":[]
		});
		//////צריך למחוק את הלולאה אם צריך לנהל תשובות
		for(var i=0; i<5; i++)
		{
			$scope.CreateStudentQuestionAns(0,$scope.StudentQuestions.length);
		}
	}
	
	$scope.CreateStudentQuestionAns = function(questionid,id)
	{
		var update = false;
		$scope.StudentQuestions.forEach(function(element) {
			if(element['id']!=null && element['id']==id)
			{
				element.answer.push({"name":""});
				update = true;
			}
		});
		
		$scope.StudentQuestions.forEach(function(element) {
			if(update == false && element['questionid']==questionid)
			{
				if(element.answer==null || element.answer=="")
				{
					element.answer = [];
				}
				element.answer.push({"name":""});
			}
		});
	}
	
	$scope.ClearStudentQuestions = function()
	{
		$scope.GetStudentQuestions();
	}
	
} ]);