apple.directive('feedbackSlider', ['$timeout', function ($timeout) {
	return {
		restrict: 'E',
		templateUrl: './directives/feedbackSlider/feedbackSlider.html',
		scope: {
			minGrading: '=minGrading',
			maxGrading: '=maxGrading',
			increment: '=increment',
			grading: '=grading',
			question: '=question',
			answers: '=answers',
			answerTextIndex: '=answerTextIndex',
			answerValueIndex: '=answerValueIndex',
			shouldDisplayAnswer: '=displayAnswer'
		},
		link: function (scope, elem, attrs) {
			elem.addClass('angular-range-slider');
			//the selected grade
			scope.grading = Math.floor((scope.minGrading+scope.maxGrading)/2);
			//previous value, used to animate pointer skew
			scope.prevGrading = scope.grading;
			//whether or not to display the answer (rather than the question)
			scope.displayAns=false;
			//how much time it should take, from the moment the plus/minus buttons are pressed, until the pointer should get to the selected grading
			scope.transitionTime = 0.7;
			//a timeout promise, used to remove additional classes added to the slider while it is moving, in order to animate pointer skew
			scope.movementTimeout = null;
			//a timeout promise, used to remove additional classes added to the slider while the answer is displayed
			scope.answerDisplayTimeout = null;
			scope.$watch('grading', function(newVal, oldVal) {
			}, true);
			scope.getAnswerByGrade=function()
			{
				var minGradingDelta = null;
				var closestAnswer = null;
				if(scope.answers!=null) {
                    for (var i = 0; i < scope.answers.length; i++) {
                        if (closestAnswer == null) {
                            minGradingDelta = Math.abs(scope.answers[i][scope.answerValueIndex] - scope.grading);
                            closestAnswer = i;
                        }
                        else {
                            if (Math.abs(scope.answers[i][scope.answerValueIndex] - scope.grading) < minGradingDelta) {
                                minGradingDelta = Math.abs(scope.answers[i][scope.answerValueIndex] - scope.grading);
                                closestAnswer = i;
                            }
                        }
                    }

                    return scope.answers[closestAnswer];
                }
			};
			scope.dragPointer=function()
			{
				movePointer(scope.prevGrading>scope.grading);
				scope.prevGrading=scope.grading;
			};
			scope.incrementGrading = function()
			{
				scope.grading += scope.increment;
				scope.grading = Math.min(scope.grading, scope.maxGrading);
				if(scope.prevGrading!=scope.grading)
					movePointer(false);
				scope.prevGrading=scope.grading;
			};
			scope.reduceGrading = function()
			{
				scope.grading -= scope.increment;
				scope.grading = Math.max(scope.grading, scope.minGrading);
				if(scope.prevGrading!=scope.grading)
					movePointer(true);
				scope.prevGrading=scope.grading;
			};
			function movePointer(toRight)
			{
				//activate movement classes
				scope.displayAns=scope.shouldDisplayAnswer;
				scope.movingLeft=!toRight;
				scope.movingRight=toRight;
				if(scope.movementTimeout)
				{
					$timeout.cancel(scope.movementTimeout);
				}
				if(scope.answerDisplayTimeout)
				{
					$timeout.cancel(scope.answerDisplayTimeout);
				}
				scope.movementTimeout=$timeout(function () {
						scope.movingLeft=false;
						scope.movingRight=false;
				}, scope.transitionTime*1000/2);
								scope.movementTimeout=$timeout(function () {
						scope.displayAns=false;
				}, scope.transitionTime*1000);
			};
			scope.getGradingIcon = function()
			{
				switch(parseInt(scope.grading))
				{
					case 0:
						return "./img/01_ic_face.png";
					case 1:
						return "./img/02_ic_face.png";
					case 2:
						return "./img/03_ic_face.png";
					case 3:
						return "./img/04_ic_face.png";
					case 4:
						return "./img/05_ic_face.png";
				}
				return "./img/03_ic_face.png";
			};
		}
	};
} ]);