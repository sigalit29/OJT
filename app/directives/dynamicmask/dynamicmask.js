apple.directive('dynamicmask', ['$rootScope', '$timeout', '$state', function ($rootScope, $timeout, $state) {
    return {
        restrict: 'E',
        templateUrl: './directives/dynamicmask/dynamicmask.html',
        link: function (scope, el, attrs) {
            scope.showAnimateTime = 1500;
            scope.hideAnimateTime = 1500;
            scope.$state = $state;

            scope.$on('displayMask', function (event, data) {
                scope.showBlueBack = true;
            })
            scope.$on('hideMask', function (event, data) {
                scope.hideBlueBack = true;
                $timeout(function () {
                      scope.hideStaticBack = true;
                },  scope.hideAnimateTime)
              })
        },
        replace: true
    };

} ]);