apple.directive('header', ['$state', '$stateParams', '$rootScope', '$http', 'userService', function ($state, $stateParams, $rootScope, $http, userService) {
    return {
        restrict: 'E',
        templateUrl: './directives/header/header.html',
        link: function (scope, el, attrs) {
            scope.openMainMenu = true;
            scope.openAdminMenu = true;
            if (!$rootScope.activeUser){
                $rootScope.activeUser = localStorage.getItem('activeUser');
            }
            scope.goToUserProfile = function (user) {
                $state.transitionTo('singleUser', {
                    userId: $rootScope.activeUser.userid
                });
            }
            scope.logout = function () {
                userService.logout();
            }
            //temp solution
            scope.nomineeAccessMailList =
                [
                    'amalb@appleseeds.org.il',
                    'adiy@neta-project.org',
                    'eliav@neta-project.org',
                    'kerencm@neta-project.org',
                    'leliansh@appleseeds.org.il',
                    'maayang@neta-project.org',
                    'maymonasm@neta-project.org',
                    'michaelha@neta-project.org',
                    'naorav@neta-project.org',
                    'nasimm@appleseeds.org.il',
                    'omara@neta-project.org',
                    'oritbash@neta-project.org',
                    'oshridg@neta-project.org',
                    'rotemc@neta-project.org',
                    'rotemsho@neta-project.org',
                    'tzlils@neta-project.org',
                    'waseemak@neta-project.org',
                    'yonatans@neta-project.org',
                    'zivle@neta-project.org',
                    'raeda@appleseeds.org.il',
                    'daniels@appleseeds.org.il',
                    'analyst@appleseeds.org.il',
                    'nataliem@appleseeds.org.il',
                    'natalyz@neta-project.org',
                    'shanyb@neta-project.org',
                    'oshridg@neta-project.org',
                    'monak@neta-project.org',
                    'dork@neta-project.org',
                    'baro@neta-project.org',
                    'ashadmin@appleseeds.org.il'

                ];
        },
        replace: true
    };
} ]);
