apple.directive('comment', ['$rootScope', '$timeout', '$state', function ($rootScope, $timeout, $state) {
    return {
        restrict: 'E',
        templateUrl: './directives/comment/comment.html',
        scope: {
            commentChanged: '&'
        },
        link: function (scope, el, attrs) {

            scope.isBlueBgPage = attrs.bgname == 'white' ? false : true;
            scope.placeholder = attrs.placeholder;
            scope.lessonComment = attrs.commentvalue;

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
                var text = $(el).find('textarea')[0];
                function resize() {
                    text.style.height = 'auto';
                    text.style.height = text.scrollHeight + 'px';
                }
                function delayedResize() {
                    window.setTimeout(resize, 1);
                }
                observe(text, 'change', resize);
                observe(text, 'cut', delayedResize);
                observe(text, 'paste', delayedResize);
                observe(text, 'drop', delayedResize);
                observe(text, 'keydown', delayedResize);

                //text.focus();
                //text.select();
                delayedResize();
            };
            initTextareaResize();

            scope.commentChangedDir = function () {
                scope.commentChanged({ comment: scope.lessonComment });
            };

            //listener for  comment changed
            $rootScope.$on('commentUpdated', function (event, data) {
            scope.lessonComment = data.comment;
            });
        },
        replace: true
    };

} ]);