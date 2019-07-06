apple.directive('gallery', [ '$rootScope', '$timeout', function ( $rootScope, $timeout) {
    return {
        restrict: 'E',
        templateUrl: './directives/gallery/gallery.html',
        link: function (scope, el, attrs) {
        },
        replace: true
    };
   
} ]);