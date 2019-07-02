apple.directive('gallery', [function () {
    return {
        restrict: 'E',
        templateUrl: './directives/gallery/gallery.html',
        link: function (scope, el, attrs) {
        },
        replace: true
    };
   
} ]);