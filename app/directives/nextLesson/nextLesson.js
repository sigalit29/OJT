apple.directive('nextLesson', ['$rootScope', '$timeout', '$state','server', function ($rootScope, $timeout, $state,server) {
    return {
        restrict: 'E',
        templateUrl: './directives/nextLesson/nextLesson.html',
        link: function (scope, el, attrs) {

            var data = {}
            data.lessonid = attrs.lessonId;
            server.requestPhp(data, "GetLessonById").then(function (data) {
                scope.lessonData = data;

            });
        },
        replace: true
    };

} ]);