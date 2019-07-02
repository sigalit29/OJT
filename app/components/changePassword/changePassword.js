apple.controller('changePassword', ['$scope', '$stateParams', '$rootScope', '$state', 'login', 'server',
function ($scope, $stateParams, $rootScope, $state, login, server) {
	$rootScope.$broadcast('setHeaderTitle', {
		title: $rootScope.dictionary.changePasswordText
	});
	$scope.backState = $stateParams["backState"];
	$scope.cancel = function () {
		$state.transitionTo('login');
	}
	$scope.oldPass='';
	$scope.newPass='';
	$scope.repeatPass='';
	var waitingForPassChange = false;
	$scope.changePassword = function () {
		if($scope.repeatPass != $scope.newPass || !$scope.validatePass($scope.newPass) || waitingForPassChange)
			return;
		waitingForPassChange=true;
		if($scope.backState != 'forget'){
			var data = {};
			data.pass = $scope.oldPass;
			data.newpass1 = $scope.newPass;
			data.newpass2 = $scope.repeatPass;
			data.token = $rootScope.loginToken; ;
			server.requestPhp(data, "ChangeMyPassword").then(function (data) {
				waitingForPassChange=false;
				if (data.error) {
					if (data.error == "token not found") {
						$scope.showTokenError = true;
					}
					if (data.error == "pass not exist") {
						$scope.showPassError = true;
					}
				}
				else if (!data.error) {
					$scope.showError = false;
					window.alert($rootScope.dictionary.passChangedSuccessfully);
					$state.transitionTo('login');
				}
			});
		}
		else{
			var data = {};
			data.id = $stateParams["token"];
			data.pass1 = $scope.newPass;
			data.pass2 = $scope.repeatPass;
			server.requestPhp(data, "ChangeMisPass").then(function (data) {
				if (data.error) {
					if (data.error == "token not found") {
						$scope.showTokenError = true;
					}
					waitingForPassChange=false;
				}
				else if (!data.error) {
					$scope.showError = false;
					window.alert($rootScope.dictionary.passChangedSuccessfully);
					window.location.assign(window.location.href.substring(0, window.location.href.indexOf("www/")+4));
				}
			});
		}
	}
	$scope.validateStep1 = function() {
		return $scope.validatePassCheck() && $scope.validatePass();
	};

	$scope.validatePass = function() {
		var val = $scope.newPass;
		//checks that the string length is higher than 12
		var checkPassLength = /^(.{12,})$/;
		//checks that the string contains at least one digit
		var containsDigits = /.*[0-9].*/;
		//checks that the string contains at least one lower case letter and one higher case letter
		var containsLetters = /^(?=.*[a-z])(?=.*[A-Z]).*$/;
		//checks that the string contains at least one special character
		var containsSpecialChars = /^.*[~`"'!@#$%^&*()[\]{}'/<>|;:+=.\\\-]+.*$/;
		//checks that the length condition, and at least 2 of the 3 remaining conditions, are met.
		return (checkPassLength.test(val) && (containsDigits.test(val) + containsLetters.test(val) + containsSpecialChars.test(val) >= 2));
	};
	$scope.validatePassCheck = function() {
		//checks that the two password fields contain the same string
		return $scope.newPass === $scope.repeatPass;
	};
}]);