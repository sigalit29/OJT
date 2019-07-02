//TODO: No idea what this is supposed to be, should probably be deleted
apple.directive('modalQuestionlist', [ 'server',function (server) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/questionslist.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			qtype:'@qtype',
			mainquestions:'='
        },		
		link: function (scope, elem, attrs) {
			console.log(scope.mainquestions);
			var qtype=scope.qtype;
			scope.addQ=[];
			scope.modalShow=false;
			var data = {};
			data.qtype = qtype;
		    server.requestPhp(data, "getQuestionList").then(function (data) {
				scope.questions=data;						
			});	
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			scope.close=function(){
				console.log(scope.addQ);
				scope.addQ=[];
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
				
			}
			scope.confirm=function(){		
				scope.mainquestions.push.apply(scope.mainquestions,scope.addQ);
				//scope.mainquestions=angular.copy(scope.mainquestions.concat(scope.addQ));
				
				scope.close();
				if(attrs.onConfirm){				
					scope.onConfirm();
				}
			}
			scope.searchByQid= function(obj){
				console.log(obj);
				  for(var i=0;i<scope.mainquestions.length;i++){
					  console.log(obj.qid,scope.mainquestions[i].qid);
					  if(obj.qid==scope.mainquestions[i].qid)
						  return true;
				  }
				  return false;
			  }
			
        },
    };
} ]);

