apple.controller('resetPassword', ['$scope', '$stateParams', '$rootScope', '$state', 'login', 'server',
function ($scope, $stateParams, $rootScope, $state, login, server) {

	var waitingForServer = false;
	$rootScope.$broadcast('setHeaderTitle', {
		title: $rootScope.dictionary.resetPasswordText
	});
	$scope.sendEmail = function () {
		if(waitingForServer)
			return;
		waitingForServer=true;
		var data = {};
		data.email = $scope.email;
		server.requestPhp(data, "InitPassApp").then(function (data) {
			waitingForServer=false;
		});
		$state.transitionTo('login');
	}

	$scope.cancel = function () {
		$state.transitionTo('login');
	}

} ]);