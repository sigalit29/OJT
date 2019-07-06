apple.directive('pushpopup', ['$rootScope', '$timeout', '$state', '$stateParams', 'push',
function ($rootScope, $timeout, $state, $stateParams, push) {
    return {
        restrict: 'E',
        templateUrl: './directives/pushpopup/pushpopup.html',
        scope: {
            pushdata: '='
        },
        link: function (scope, el, attrs) {
          //  scope.pushData = data;
            scope.showPushPopup = true;
            scope.pushPopupTitle = scope.pushdata.title; //data.title;
            scope.pushPopupContent = scope.pushdata.text; //data.text;
            scope.pushCourseId = scope.pushdata.courseid; //data.courseid;
            console.log(JSON.stringify(scope.pushdata.title));

            scope.closePushPopup = function () {
                scope.showPushPopup = false;
                push.removePushFromStack(scope.pushdata);
                push.goToPageByNotification(scope.pushdata);
            };

        },
        replace: true
    };

} ]);
