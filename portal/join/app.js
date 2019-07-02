var apple = angular.module('apple', ['app.directives', 'ui.router'])

apple.service('userService',['$q', '$state','$rootScope', 'server', function($q,$state,$rootScope, server){
}]);

apple.run(function ($rootScope, $timeout, $state, userService, $document, server) {
})

/**** UI Router ****/
apple.config(function ($stateProvider, $urlRouterProvider,$httpProvider) {
	$urlRouterProvider.otherwise("/RegistrationForm/he");

	$stateProvider
        .state("RegistrationForm", {
            url: "/RegistrationForm/:lang",
            views: {
                "main": {
                    templateUrl: "components/RegistrationForm/RegistrationForm.html",
                    controller: "RegistrationForm"
                }
            }
        })
        .state("SuccessfulRegistration", {
            url: "/SuccessfulRegistration",
            views: {
                "main": {
                    templateUrl: "components/SuccessfulRegistration/SuccessfulRegistration.html",
                    controller: "SuccessfulRegistration"
                }
            }
        });
});
