var apple_directives = angular.module('app.directives', []);
apple.directive('modalConfirm', [ function () {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalConfirm.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			text:'@text',
			control: '='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			if(scope.control){
				scope.control.open=scope.open;
			}
			scope.close=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
        },
    };
} ]);

apple.directive('modalSearchAddStudent', [ function () {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalSearchAddStudent.html',
		transclude: true,
        scope: {
            onConfirm:'=',
			allStudents:'='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			if(scope.control){
				scope.control.open=scope.open;
			}
			scope.close=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
					if(scope.chosen){
					if(attrs.onConfirm){
						scope.onConfirm(scope.chosen);
					}
				}
				scope.close();
			}
			scope.choose=function(student){
				scope.chosen=student;
			}
        },
    };
} ]);

apple.directive('modalConfirm2', [ function () {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalConfirm2.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			text:'@text',
			control: '='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			if(scope.control){
				scope.control.open=scope.open;
			}
			scope.close=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
        },
    };
} ]);

apple.directive('modalConfirm3', [ function () {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalConfirm3.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			text:'@text',
			control: '='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			if(scope.control){
				scope.control.open=scope.open;
			}
			scope.close=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
        },
    };
} ]);

apple.directive('modalSelectImage', ['Upload', 'server', function (Upload,server) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalSelectImage.html',
		transclude: true,
        scope: {
            onConfirm: '=onConfirm',
			text:'@text',
			ngModel: '='
        },
		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.selectGroup=0;
			scope.selectIndex=0;
			scope.gallery=null;
			scope.updategGllery=function(){
				var data={};
		    	server.requestPhp(data, "getGallery").then(function (data)
		    			{
							scope.gallery=data;
						});	
			}
			scope.open=function(){
				if(scope.gallery==null) scope.updategGllery();
				scope.selectIndex=0;
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";				
				scope.modalShow=true;
			}
			scope.close=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.select=function(i){
				scope.selectIndex=i;
			}
			scope.setSelectGroup=function(i){
				scope.selectGroup=i;
			}
			scope.confirm=function(){
				scope.close();
				// console.log();
				scope.ngModel=scope.gallery[scope.selectGroup].list[scope.gallery[scope.selectGroup].list.length-scope.selectIndex-1];
				if(attrs.onConfirm){
					scope.onConfirm(scope.ngModel);
				}
			}
			
			scope.onFileSelect = function($files) {
				//$files: an array of files selected, each file has name, size, and type.
				for (var i = 0; $files && i < $files.length; i++) {
					var $file = $files[i];
					Upload.upload({
						url: phpDomain+'/data.php?type=uploadImageToGallery&group='+scope.selectGroup,
						file: $file,
						progress: function(e){}
					}).then(function(data, status, headers, config) {
						// file is uploaded successfully
						if (data.data.fileUrl)
							scope.updategGllery();
						else if (data.data.error)
							alert(data.data.error);
						else
							alert("תקלה בהעלאת קובץ");
					}); 
				}
			}
			
			scope.addGroup = function($files) {
				var data={};
		    	server.requestPhp(data, "addGroupToGallery").then(function (data)
		    		{
					scope.updategGllery();
				});	
			}
			scope.saveGroupName = function($files) {
				var data={};
				data = {group:scope.selectGroup,name:scope.gallery[scope.selectGroup].name};
		    	server.requestPhp(data, "addGroupToGallery").then(function (data)
		    			{
							scope.updategGllery();
						});	
			}
        },
    };
} ]);

apple.directive('modalQuestion', ["Upload", function (Upload) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalQuestion.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			question:'='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.hasError=false;
			scope.modalLoad=false;
			scope.orginalQuestion=angular.copy(scope.question);
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
				//fix for old data.
				if (!scope.question.answers[0].isCorrect){
					var answers;	// updated
					if(scope.question.answers[1].isCorrect){
						answers=[
							 scope.question.answers[1],
							 scope.question.answers[0],
							 scope.question.answers[2],
							 scope.question.answers[3]
						];
					}
					else if(scope.question.answers[2].isCorrect){
						answers=[
							 scope.question.answers[2],
							 scope.question.answers[0],
							 scope.question.answers[1],
							 scope.question.answers[3]
						];
					}
					else if(scope.question.answers[3].isCorrect){
						answers=[
							 scope.question.answers[3],
							 scope.question.answers[0],
							 scope.question.answers[1],
							 scope.question.answers[2]
						];
					}
						
						
					scope.question.answers=answers;
				}
				
			}
			scope.close=function(){
				scope.question=angular.copy(scope.orginalQuestion);
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				var hasError=false;
				if (scope.question.text==""){
					hasError=true;
				}
				scope.question.answers.forEach(function(elm){
					if (elm.text==""){
						hasError=true;
					}
				})
				scope.hasError=hasError;
				if(hasError) return;
				
				scope.question.answers=shuffle(scope.question.answers);
				// console.log(scope.question);
				scope.orginalQuestion=scope.question;
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
			scope.set_correct=function(ans){
				scope.question.answers.forEach(function(curr){
					curr.isCorrect=false;
				})
				ans.isCorrect=true;
			}
			scope.onFileSelect = function($index,$files) {
				//$files: an array of files selected, each file has name, size, and type.
				for (var i = 0; $files && i < $files.length; i++) {
					var $file = $files[i];
					scope.modalLoad=true;
					Upload.upload({
						url: phpDomain+'/data.php?type=uploadImage',
						file: $file,
						progress: function(e){}
					}).then(function(data, status, headers, config) {
						// file is uploaded successfully
						if (data.data.fileUrl)
							scope.question.img=data.data.fileUrl;
						else if (data.data.error)
							alert(data.data.error);
						else
							alert("תקלה בהעלאת קובץ");
						scope.modalLoad=false;
					}); 
				}
			}
        },
    };
} ]);

apple.directive('modalCorrectorder', ["Upload",'$timeout', function (Upload,$timeout) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalCorrectOrder.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			question:'='
        },
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.hasError=false;
			scope.modalLoad=false;
			scope.orginalQuestion=angular.copy(scope.question);
 		    scope.data={};
			// console.log(scope.question);

			
			scope.open=function(){
				// alert('modal.js, corOrder: open');
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			scope.close=function(){
				scope.question=angular.copy(scope.orginalQuestion);
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				// alert('modal.js, corOrder: confirm');
				var hasError=false;
				if( scope.question.text	==""){
						hasError=true;
				}
					
				if(scope.question.withPoints  == "true" &&
				   scope.question.numOfPoints == 0)
						hasError=true;
					
				scope.hasError=hasError;
				if(hasError) return;
				
				scope.orginalQuestion=scope.question;
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
			scope.change = function(){
			    scope.question.withPoints = (scope.question.numOfPoints!='')?'true':'false';
			}
			scope.onFileSelect = function($index,$files) {
				//$files: an array of files selected, each file has name, size, and type.
				for (var i = 0; $files && i < $files.length; i++) {
					var $file = $files[i];
					scope.modalLoad=true;
					Upload.upload({
						url: phpDomain+'/data.php?type=uploadImage',
						file: $file,
						progress: function(e){}
					}).then(function(data, status, headers, config) {
						// file is uploaded successfully
						if (data.data.fileUrl)
							scope.question.img=data.data.fileUrl;
						else if (data.data.error)
							alert(data.data.error);
						else
							alert("תקלה בהעלאת קובץ");
						scope.modalLoad=false;
					}); 
				}
			}
        },
    };
} ]);

apple.directive('modalMultipleclicks', ["Upload",'$timeout', function (Upload,$timeout) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalMultipleClicks.html',
		transclude: true,
        scope: {
            onConfirm: '&onConfirm',
			question:'='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.hasError=false;
			scope.modalLoad=false;
			scope.orginalQuestion=angular.copy(scope.question);
 		    scope.data={};
			
			// if(scope.question.withAnimation && scope.question.withAnimation!=''){
				// alert('modal.js, scope.question.withAnimation:', scope.question.withAnimation);
				// scope.data.withAnimation=scope.question.withAnimation;
			// }
			
			scope.open=function(){  //ready
				// alert('mulClicks: open');
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			scope.close=function(){	// ready
				scope.question=angular.copy(scope.orginalQuestion);
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){ //ready
				// alert('mulClicks: confirm');
				//scope.question.withAnimation=scope.data.withAnimation;	// .gif/not-gif
				var hasError=false;
				if( scope.question.text == ""){
						hasError=true;
				}
					
				if(!scope.question.numOfClicks       || 
				    scope.question.numOfClicks == "" ||
				    scope.question.numOfClicks <  0)
						hasError=true;

				if(scope.question.withTimer == true && 
				   (!scope.question.numOfSeconds || scope.question.numOfSeconds =="" || scope.question.numOfSeconds <= 0)){
					hasError=true;
				}	
				
				if(!scope.question.numOfFrames       || 
				    scope.question.numOfFrames == "" ||
				    scope.question.numOfFrames <  0)
						hasError=true;
					
				if(!scope.question.numOfPoints       || 
				    scope.question.numOfPoints == "" ||
				    scope.question.numOfPoints <  0)
						hasError=true;
						
				scope.hasError=hasError;
				if(hasError) return;
				
				scope.orginalQuestion=scope.question;
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
			scope.change = function(){ //ready
			    scope.question.withPoints =(scope.question.numOfPoints!='')?'true':'false';
			}
			scope.onFileSelect = function($index,$files) {
				//$files: an array of files selected, each file has name, size, and type.
				for (var i = 0; $files && i < $files.length; i++) {
					var $file = $files[i];
					scope.modalLoad=true;
					Upload.upload({
						url: phpDomain+'/data.php?type=uploadImage',
						file: $file,
						progress: function(e){}
					}).then(function(data, status, headers, config) {
						// file is uploaded successfully
						if (data.data.fileUrl)
							scope.question.img=data.data.fileUrl;
						else if (data.data.error)
							alert(data.data.error);
						else
							alert("תקלה בהעלאת קובץ");
						scope.modalLoad=false;
					}); 
				}
			}
        },
    };
} ]);

apple.directive('modalFindefy', ["Upload",'$timeout', function (Upload,$timeout) {
    return {
	    restrict: 'A',
	 	    templateUrl: './directives/modal/modalFindEfy.html',
		    transclude: true,
		    scope: {
			   onConfirm: '&onConfirm',
			   question:'='
		    },
		    link: function (scope, elem, attrs) {
			    scope.modalShow=false;
			    scope.hasError=false;
			    scope.modalLoad=false;
			    scope.orginalQuestion=angular.copy(scope.question);
			    scope.data={};
			    scope.data.shapeType='ellipse';
				if(scope.question.shapeType && scope.question.shapeType!='')
					scope.data.shapeType=scope.question.shapeType;
			   
			    scope.open=function(){
				    var body = document.getElementsByTagName("body")[0];
				    body.className = body.className + " modal-open";
				    scope.modalShow=true;
			    }
			    scope.close=function(){
				   scope.question=angular.copy(scope.orginalQuestion);
				   var body = document.getElementsByTagName("body")[0];
				   body.className = body.className.replace(/\bmodal-open\b/,'');
				   scope.modalShow=false;
			    }
			    scope.confirm=function(){
				    scope.question.shapeType=scope.data.shapeType;
				    // console.log("Confirm: start", scope.question);
					var hasError=false;
					if(scope.question.text==""){
					   hasError=true;
				    }
					
					if(scope.question.withTimer == true && 
					   (!scope.question.numOfSeconds || scope.question.numOfSeconds =="" || scope.question.numOfSeconds <= 0)){
						hasError=true;
					}	

				    scope.hasError=hasError;
				    if(hasError) return;
				    scope.orginalQuestion=scope.question;
				    scope.close();
					if(attrs.onConfirm){
					  scope.onConfirm();
					}
					   
					// console.log("Confirm: end", scope.question);
			    }
				scope.changeLimitTime = function(){
				  scope.question.changeLimitTime =(scope.question.timeLimit!='')?'true':'false';
			    }
				scope.changePoints = function(){
				  scope.question.withPoints =(scope.question.numOfPoints!='')?'true':'false';
			    }
			    scope.set_correct=function(ans){
				   scope.question.answers.forEach(function(curr){
					 curr.isCorrect=false;
				   })
				   ans.isCorrect=true;
			    }
			    scope.onFileSelect = function($index,$files) {
				   //$files: an array of files selected, each file has name, size, and type.
				   for (var i = 0; $files && i < $files.length; i++) {
						var $file = $files[i];
						scope.modalLoad=true;
						
						Upload.upload({
						   url: phpDomain+'/data.php?type=uploadImage',
						   file: $file,
						   progress: function(e){}
						}).then(function(data, status, headers, config) {
						    // file uploaded successfully
						    if (data.data.fileUrl){
							   // var img=new Image('/'+data.data.fileUrl);
							   // var img=new Image(data.data.fileUrl);
							   var img=new Image();
							   img.src='/'+data.data.fileUrl;
							   console.log('/'+data.data.fileUrl);
							   console.log(img);
							   console.log(img.width);
							   console.log(img.height);
								scope.question.img=data.data.fileUrl;
						    }
						    else if (data.data.error)
								alert(data.data.error);
						    else{
								alert("תקלה בהעלאת קובץ");
								scope.modalLoad=false;
						    }
							scope.modalLoad=false;
						  
						});
						
						// put file inside canvas
						// get listeners attach mouse events to it
					}
				}
			    scope.setcanvast=function(){
				   var img=  document.getElementById('myCanvasimg');
				   $(img).on('load',scope.setcanvasy);		
				}
			    scope.setcanvasy=function(){
							//Canvas
						var canvas = document.getElementById('myCanvas');
						var ctx = canvas.getContext('2d');
						//var img = new Image('/'+scope.question.img);
						
						canvas.width=	$(canvas).width();	
						canvas.height=	$(canvas).height();	
						//Variables
						var canvasx = $(canvas).offset().left;	// upper left 'x' of canvas
						var canvasy = $(canvas).offset().top;	// upper left 'y' of canvas
						var last_mousex = last_mousey = 0;
						var mousex = mousey = 0;
						var mousedown = false;
						var leftX = leftY = 0;

							// if pressed 'Edit'
						if(scope.data.shapeType && scope.data.shapeType!=''){
							initCanvas();
						}
						function getMousePos(canvas, evt) {		// returns mouse coords relative to canvas
							var rect = canvas.getBoundingClientRect();
							return {
							  x: evt.clientX - canvasx,
							  y: evt.clientY - canvasy
							  
							  // x: evt.clientX - rect.left,
							  // y: evt.clientY - rect.top
							};
					    }
						
						//Mousedown
						$(canvas).on('mousedown', function(e) {
							last_mousex = parseInt(e.clientX-canvasx);	// mouse coords relative to canvas
							last_mousey = parseInt(e.clientY-canvasy);
							mousedown = true;
							
							mousePos = getMousePos(canvas, e);
							leftX=mousePos.x;
							leftY=mousePos.y;
							console.log(leftX,leftY);
							if(scope.data.shapeType === 'rect'){
								scope.question.clickableRectangle.leftUpperX = leftX; 
								scope.question.clickableRectangle.leftUpperY = leftY;
							}
							// ellipse, put temporarily leftUpper values into center coords 
							else if(scope.data.shapeType === 'ellipse'){
								scope.question.clickableEllipse.centerX = leftX; 
								scope.question.clickableEllipse.centerY = leftY;
							}
						});

						//Mouseup
						$(canvas).on('mouseup', function(e) {
							// console.log("Mouseup:start", scope.question);
							mousedown = false;
							mousePos = getMousePos(canvas, e);
							
							if(scope.data.shapeType === 'rect'){
								scope.question.clickableRectangle.leftUpperX  = Math.floor(leftX);
								scope.question.clickableRectangle.leftUpperY  = Math.floor(leftY);
								scope.question.clickableRectangle.rightLowerX = Math.floor(mousePos.x); 
								scope.question.clickableRectangle.rightLowerY = Math.floor(mousePos.y);

								//reCalculateRect();
								// console.log("Mouseup:rect:end", scope.question);
							}
								// ellipse
							else if(scope.data.shapeType === 'ellipse'){
								mousex = mousePos.x;
								mousey = mousePos.y;
								var scalex = (mousex-last_mousex)/2;
								var scaley = (mousey-last_mousey)/2;
								var centerx = (last_mousex/scalex)+1;
								var centery = (last_mousey/scaley)+1;
								
								scope.question.clickableEllipse.scaleX = scalex;
								scope.question.clickableEllipse.scaleY = scaley;
								//Create ellipse
								scope.question.clickableEllipse.centerX = centerx;
								scope.question.clickableEllipse.centerY = centery;
							}
						});

						//Mousemove
						$(canvas).on('mousemove', function(e) {
							mousex = parseInt(e.clientX-canvasx);
							mousey = parseInt(e.clientY-canvasy);
						    mousePos = getMousePos(canvas, e);
							 mousex =  mousePos.x;
							 mousey = mousePos.y;
							console.log('move-',leftX,leftY, mousex,mousey);
							if(mousedown) {
								drawCanvas();
							}
						});
						
						function initCanvas(){
							// console.log('initCanvas');
								//Canvas
							ctx.clearRect(0,0,canvas.width,canvas.height); //clear canvas
							ctx.save();
							ctx.beginPath();

							if(scope.question.shapeType === 'rect'){
								// console.log('draw initCanvas');
								ctx.rect(scope.question.clickableRectangle.leftUpperX,
										 scope.question.clickableRectangle.leftUpperY,	
										 scope.question.clickableRectangle.rightLowerX-scope.question.clickableRectangle.leftUpperX,
										 scope.question.clickableRectangle.rightLowerY-scope.question.clickableRectangle.leftUpperY);
							}
							else if(scope.question.shapeType === 'ellipse'){
								var scalex = scope.question.clickableEllipse.scaleX;
								var scaley = scope.question.clickableEllipse.scaleY;
								var centerx = scope.question.clickableEllipse.centerX;
								var centery = scope.question.clickableEllipse.centerY;
								// console.log('init: scalex', scalex, 'scaley', scaley);
								// console.log('init: centerx', centerx, 'centery', centery);
								ctx.scale(scalex, scaley);
								ctx.arc(centerx, centery, 1, 0, 2*Math.PI);
							}
							
							ctx.restore();
							ctx.strokeStyle = 'red';
							ctx.lineWidth = 3;
							ctx.stroke();
						}
						
						function drawCanvas(){
							// console.log('drawCanvas');
							ctx.clearRect(0,0,canvas.width,canvas.height); //clear canvas
							ctx.save();
							ctx.beginPath();
							
							if(scope.data.shapeType === 'rect'){
								var leftUpperX = leftX, leftUpperY = leftY,
									rightLowerX = mousex, rightLowerY = mousey;
								
								if( leftUpperX > rightLowerX &&
									leftUpperY > rightLowerY){
									// swap values for X and for Y
									var tmpX = leftUpperX;
									leftUpperX = rightLowerX;
									rightLowerX = tmpX;
								
									var tmpY = leftUpperY;
									leftUpperY = rightLowerY;
									rightLowerY = tmpY;
								}
								else if(leftUpperX > rightLowerX){
									// swap values for X only
									var tmp = leftUpperX;
									leftUpperX = rightLowerX;
									rightLowerX = tmp;
								}
								else if(leftUpperY > rightLowerY){
									// swap values for Y only
									var tmp = leftUpperY;
									leftUpperY = rightLowerY;
									rightLowerY = tmp;
								}
								//console.log([leftUpperX,leftUpperY, rightLowerX,rightLowerY]);	
								ctx.rect(leftUpperX,leftUpperY, rightLowerX-leftUpperX,rightLowerY-leftUpperY);
								scope.question.clickableRectangle.leftUpperX = leftUpperX;
								scope.question.clickableRectangle.leftUpperY = leftUpperY;
								scope.question.clickableRectangle.rightLowerX = rightLowerX;
								scope.question.clickableRectangle.rightLowerY = rightLowerY;
							}

							else if (scope.data.shapeType === 'ellipse'){
								//Dynamic scaling
								var scalex = (mousex-last_mousex)/2;
								var scaley = (mousey-last_mousey)/2;
								
								// console.log('draw: scalex', scalex, 'scaley', scaley);
								//Create ellipse
								var centerx = (last_mousex/scalex)+1;
								var centery = (last_mousey/scaley)+1;
								// console.log('draw: centerx', centerx, 'centery', centery);
								
								ctx.scale(scalex,scaley);
								ctx.arc(centerx, centery, 1, 0, 2*Math.PI);								
								scope.question.clickableEllipse.centerX = centerx;
								scope.question.clickableEllipse.centerY = centery;
								scope.question.clickableEllipse.scaleX  = scalex;
								scope.question.clickableEllipse.scaleY  = scaley;
								
								// console.log('draw-Q: scalex', scope.question.clickableEllipse.scaleX, 'scaley', scope.question.clickableEllipse.scaleY);
								// console.log('draw-Q: centerx', scope.question.clickableEllipse.centerX, 'centery', scope.question.clickableEllipse.centerY);
							}

							//Restore and draw
							ctx.restore();
							ctx.strokeStyle = 'red';
							ctx.lineWidth = 5;
							ctx.stroke();
						}

						//Output
						function reCalculateRect() {
							// console.log("reCalculate");
							
							// rectangle
							scope.question.type = 'rect';
							if(scope.question.clickableRectangle.leftUpperX > scope.question.clickableRectangle.rightLowerX &&
							   scope.question.clickableRectangle.leftUpperY > scope.question.clickableRectangle.rightLowerY){
								// swap values for X and for Y
								var tmpX = scope.question.clickableRectangle.leftUpperX;
								scope.question.clickableRectangle.leftUpperX = scope.question.clickableRectangle.rightLowerX;
								scope.question.clickableRectangle.rightLowerX = tmpX;
								
								var tmpY = scope.question.clickableRectangle.leftUpperY;
								scope.question.clickableRectangle.leftUpperY = scope.question.clickableRectangle.rightLowerY;
								scope.question.clickableRectangle.rightLowerY = tmpY;
							}
							else if(scope.question.clickableRectangle.leftUpperX > scope.question.clickableRectangle.rightLowerX){
								// swap values for X only
								var tmp = scope.question.clickableRectangle.leftUpperX;
								scope.question.clickableRectangle.leftUpperX = scope.question.clickableRectangle.rightLowerX;
								scope.question.clickableRectangle.rightLowerX = tmp;
							}
							else if(scope.question.clickableRectangle.leftUpperY > scope.question.clickableRectangle.rightLowerY){
								// swap values for Y only
								var tmp = scope.question.clickableRectangle.leftUpperY;
								scope.question.clickableRectangle.leftUpperY = scope.question.clickableRectangle.rightLowerY;
								scope.question.clickableRectangle.rightLowerY = tmp;
							}
							
						}
				}
			}
		}
	}
]);


apple.filter('reverse', function() {
  return function(items) {
	if(items==null) return null;
    return items.slice().reverse();
  };
});

apple.directive('datepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.datetimepicker({
					format:'d/m/Y',
					timepicker:false,
					scrollMonth:false,
					scrollTime:false,
					scrollInput:false,
                    onSelect:function (date) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
					
                });
				element.bind('$destroy', function() {
						 element.datetimepicker('destroy');
				});
            });
        }
    }
});

apple.directive('datepickerLimit', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
		scope: {
            selectmonth: '=',
			selectyear: '='
        },
        link : function (scope, element, attrs, ngModelCtrl) {

            $(function(){
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1;
				var yyyy = today.getFullYear();
				var use=true;
				if(mm!=scope.selectmonth)
				{
					use=false;
					mm = scope.selectmonth;
					dd=1;
				}
				if(yyyy!=scope.selectyear)
				{
					use=false;
					yyyy=scope.selectyear;
					dd=1;
				}
				
				var dayinmonth = new Date(yyyy, mm, 0);
				var lastdayinmonth = dayinmonth.getDate();
				
				if(dd> lastdayinmonth || use==false)
				{
					lastday = lastdayinmonth;
				}else
				{
					lastday = dd;
				}
				
				if(lastday<10)
				{
					lastday = '0'+lastday;
				}
				if(dd<10)
				{
					dd = '0'+dd;
				}
				if(mm<10)
				{
					mm= '0'+mm;
				}
				var todayDate = yyyy+'-'+mm+'-1';
				var lastDate = yyyy+'-'+mm+'-'+lastday;
				
				if(use==false)
				{
					var todayDate = yyyy+'-'+mm+'-1';
				}
                element.datetimepicker({
					format:'d/m/y',
					timepicker:false,
					scrollMonth:false,
					scrollTime:false,
					scrollInput:false,
					 startDate: todayDate,
					 endDate: lastDate,
					 minDate:todayDate,
					 maxDate:lastDate,
                    onSelect:function (date) {
						console.log(date);
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
					
                });
				element.bind('$destroy', function() {
						 element.datetimepicker('destroy');
				});
            });
        }
    }
});

apple.directive('timepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',	
		scope: {
            starttime: '@'
        },
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
				
                element.datetimepicker({
					format:'H:i',
					timepicker:true,
					datepicker:false,
					scrollMonth:false,
					scrollTime:false,
					scrollInput:false,
					step:15,
                    onSelect:function (date) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
				
				element.bind('$destroy', function() {
						 element.datetimepicker('destroy');
				});
            });
        }
    }
});

apple.directive('endtimepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',	
		scope: {
            starttime: '='
        },
        link : function (scope, element, attrs, ngModelCtrl) {
		 
		 $(element).on('click',function(){
			 
			   if(scope.starttime)
				{
					var time = new Date();
					time.setHours(scope.starttime.substr(0,scope.starttime.indexOf(":")));
					time.setMinutes(scope.starttime.substr(scope.starttime.indexOf(":")+1));
				}
				
                element.datetimepicker({
					format:'H:i',
					timepicker:true,
					datepicker:false,
					scrollMonth:false,
					scrollTime:false,
					scrollInput:false,
					minTime: time,
					startDate: time,
					step:15,
                    onSelect:function (date) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
				
				element.bind('$destroy', function() {
						 element.datetimepicker('destroy');
				});
		   })
		   
            $(function(){
				
				 if(scope.starttime)
				{
					var time = new Date();
					time.setHours(scope.starttime.substr(0,scope.starttime.indexOf(":")));
					time.setMinutes(scope.starttime.substr(scope.starttime.indexOf(":")+1));
				}
				
                element.datetimepicker({
					format:'H:i',
					timepicker:true,
					datepicker:false,
					scrollMonth:false,
					scrollTime:false,
					scrollInput:false,
					minTime: time,
					startDate: time,
					step:15,
                    onSelect:function (date) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
		   
				element.bind('$destroy', function() {
						 element.datetimepicker('destroy');
				});
            });
        }
    }
});

apple.directive('oldNew', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
		scope:{
			'new':'=',
			'old':'='
		},
        link : function (scope, element, attrs, ngModelCtrl) {
          var last=scope.old;
		  $(element).on('focus',function(){
			   last=scope.new;
			   
		   })
		   $(element).on('blur',function(){
			   if(scope.new!=last)
					scope.old=last;
			  
		   })
        }
    }
});

apple.directive('modalChangePass', ["Upload", function (Upload) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalChangePass.html',
		transclude: true,
        scope: {
            onConfirm: '=',
			ngModel:'='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.hasError=false;
			scope.modalLoad=false;
			scope.orginalQuestion=angular.copy(scope.question);
			
			scope.open=function(){
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				scope.modalShow=true;
			}
			
			scope.close=function(){
				scope.question=angular.copy(scope.orginalQuestion);
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				var hasError=false;
				var errormassage=""
				if(!scope.ngModel.curentpassword || !scope.ngModel.firstnewpass || !scope.ngModel.secondnewpass || scope.ngModel.curentpassword=="" || scope.ngModel.firstnewpass=="" || scope.ngModel.secondnewpass=="")
				{
					hasError=true;
				}
				else if((scope.ngModel.firstnewpass==scope.ngModel.secondnewpass) && (scope.ngModel.firstnewpass.length<3 || scope.ngModel.secondnewpass.length<3))
				{
					errormassage="הסיסמה מאוד חלשה";
				}
				else if (scope.ngModel.password!=scope.ngModel.curentpassword){
					errormassage="סיסמה נוכחית לא נכונה!";
				}else if(scope.ngModel.firstnewpass!=scope.ngModel.secondnewpass)
				{
					errormassage="שגיאה באימות סיסמה!";
				}
				
				scope.hasError=hasError;
				if(hasError!=false) return;
				
				scope.errormassage=errormassage;
				if(errormassage!="") return;
				
				scope.orginalQuestion=scope.question;
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
        },
    };

} ]);


apple.directive('modalReports', ["Upload", function (Upload) {
    return {
        restrict: 'A',
        templateUrl: './directives/modal/modalReports.html',
		transclude: true,
        scope: {
            onConfirm: '=',
			model:'=',
			control: '=',
			ngModel:'=',
			mytype:'=',
			pro:'=',
			sub:'=',
			cli:'=',
			sal:'=',
			myid:'='
        },		
		link: function (scope, elem, attrs) {
			scope.modalShow=false;
			scope.hasError=false;
			scope.modalLoad=false;
			scope.orginalQuestion=angular.copy(scope.question);
			
			scope.open=function(){
				//console.log(scope.pro);
			//	console.log(scope.model.project);
				if(scope.pro)
				{
					var result = $.grep(scope.model.project, function(e){ return e.projectid == scope.pro; });
					scope.model.pro = JSON.stringify( result[0], function( key, value ) {
						if( key === "$$hashKey" ) {return undefined;}
						return value;
					});
					
					result = $.grep(scope.model.reportsubject, function(e){ return e.subjectreportid == scope.sub; });
					scope.model.sub = JSON.stringify( result[0], function( key, value ) {
						if( key === "$$hashKey" ) {return undefined;}
						return value;
					});
					
					result = $.grep(scope.model.clientcode, function(e){ return e.clientcodeid == scope.cli; });
					scope.model.cli = JSON.stringify( result[0], function( key, value ) {
						if( key === "$$hashKey" ) {return undefined;}
						return value;
					});
					/*
					//yaniv: removed slaray code, as it is 1:1 related to report subject
					result = $.grep(scope.model.salarycode, function(e){ return e.subjectreportid == scope.sub; });
					scope.model.sal = JSON.stringify( result[0], function( key, value ) {
						if( key === "$$hashKey" ) {return undefined;}
						return value;
					});*/
				}
				// if(!scope.model.pro){
				// scope.model.pro = scope.model.project[0];
				// scope.model.sub = scope.model.reportsubject[0];
				// scope.model.cli = scope.model.clientcode[0];
				// scope.model.sal = scope.model.salarycode[0];
				// }
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className + " modal-open";
				
				scope.modalShow=true;
			//console.log(scope.model);
			//console.log(scope.ngModel);
			}
			if(scope.control){
				scope.control.open=scope.open;
			}
			
			scope.close=function(){
				scope.model.pro = null;
				scope.model.sub = null;
				scope.model.cli = null;
				scope.model.sal = null;	
				scope.question=angular.copy(scope.orginalQuestion);
				var body = document.getElementsByTagName("body")[0];
				body.className = body.className.replace(/\bmodal-open\b/,'');	
				scope.modalShow=false;
			}
			scope.confirm=function(){
				var hasError=false;
				//console.log(scope.model.pro);
				/*console.log(scope.model.subject);
				console.log(scope.model.clientcode);
				console.log(scope.model.salarycode);*/
				
				if(!scope.model.pro || !scope.model.sub || !scope.model.cli)
				{
					hasError=true;
				}
				
				scope.hasError=hasError;
				if(hasError!=false) return;
				
				//var jsonObj = $.parseJSON('[' + scope.model.pro+','+ scope.model.sub +','+scope.model.cli+','+scope.model.sal+']');
				var staffreort={};
				
				var array = $.parseJSON(scope.model.pro);
				//var array = scope.model.pro;
				staffreort['project'] = array['name'];
				staffreort['projectid'] = array['projectid'];
				
				var array = $.parseJSON(scope.model.sub);
				//var array = scope.model.sub;
				staffreort['subject'] = array['subject'];
				staffreort['subjectreportid'] = array['subjectreportid'];
				
				var array = $.parseJSON(scope.model.cli);
				//var array = scope.model.cli;
				staffreort['clientcode'] = array['code'];
				staffreort['clientcodeid'] = array['clientcodeid'];
				
				//yaniv: removed slaray code, as it is 1:1 related to report subject
				var array = $.parseJSON(scope.model.sub);
				//var array = scope.model.sal;
				staffreort['salarycode'] = array['subjectnum'];
				staffreort['salarycodeid'] = array['subjectreportid'];
				
				//staffreort['autoforapp'] = scope.mytype;
				staffreort['status'] = true;
				
				if(scope.myid!=null && scope.myid!='')
				{
					for(var i=0 ; i<scope.ngModel.length ; i++)
					{
						if(scope.ngModel[i].id==scope.myid)
						{
							scope.ngModel[i]['project'] = staffreort['project'];
							scope.ngModel[i]['projectid'] = staffreort['projectid'];
							scope.ngModel[i]['subject'] = staffreort['subject'];
							scope.ngModel[i]['subjectreportid'] = staffreort['subjectreportid'];
							scope.ngModel[i]['clientcode'] = staffreort['clientcode'];
							scope.ngModel[i]['clientcodeid'] = staffreort['clientcodeid'];
							scope.ngModel[i]['salarycode'] = staffreort['salarycode'];
							scope.ngModel[i]['salarycodeid'] = staffreort['salarycodeid'];
							//scope.ngModel[i]['autoforapp'] = staffreort['autoforapp'];
							scope.ngModel[i]['status'] = staffreort['status'];
						}
					}
					
				}else
				{
					scope.ngModel.push(staffreort);
				}
				
				scope.model.pro = null;
				scope.model.sub = null;
				scope.model.cli = null;
				scope.model.sal = null;	
				
				scope.close();
				if(attrs.onConfirm){
					scope.onConfirm();
				}
			}
        },
    };

} ]);
