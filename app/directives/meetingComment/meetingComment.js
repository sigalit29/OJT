apple.directive('meetingComment', ['$rootScope', '$timeout', '$state', function ($rootScope, $timeout, $state) {
	return {
		restrict: 'E',
		templateUrl: './directives/meetingComment/meetingComment.html',
		scope: {
			commentModelWrap: '=',
			commentModelIndex: '=',
			commentChanged: '&',
			profilePic: '=',
			profileName: '=',
			editable: '=',
			placeholder: '=',
			editable: '='
		},
		link: function (scope, el, attrs) {
			scope.$watch('profilePic', function(newVal, oldVal) {
			}, true);
			scope.$watch('profileName', function(newVal, oldVal) {
			}, true);
			var observe;
			if (window.attachEvent) {
				observe = function (element, event, handler) {
					element.attachEvent('on' + event, handler);
				};
			}
			else {
				observe = function (element, event, handler) {
					element.addEventListener(event, handler, false);
				};
			}
			var initTextareaResize=function () {
				$('textarea').on( 'change keyup keydown paste cut', function (){
					$(this).height(0).height(this.scrollHeight);
				});
				$(this).height(0).height(this.scrollHeight);
			};
			initTextareaResize();
		},
		replace: true
	};

} ]);