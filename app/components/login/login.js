apple.controller('login', ['$scope', '$stateParams', '$rootScope', '$state', 'login', 'server', 'profile',
function ($scope, $stateParams, $rootScope, $state, login, server, profile) {
    login.isLogin().then(function (data) {
        if (data) {
			profile.getMyProfile();
            $state.transitionTo('courses');
        }
    });

    $rootScope.$broadcast('setHeaderTitle', {
        title: $rootScope.dictionary.loginText
    });
	
    $scope.canLogin = true;
	var waitingForServer = false;
    $scope.login = function () {
		if(waitingForServer)
			return;
		waitingForServer=true;
        login.login($scope.email, $scope.pass).then(function (data) {
			waitingForServer=false;
            if (data.token) {
				profile.getMyProfile();
                $state.transitionTo('courses');
            } else if (data.error) {
                if (data.error == "incorrect credentials") {
                    alert($rootScope.dictionary.errorUsername);
                }
                if (data.error == "the user is inactive") {
                    alert($rootScope.dictionary.errorUserStatus);
                }
                if (data.error == "need to accept register") {
                    alert($rootScope.dictionary.finishRegistrationViaEmail);
                }
            } else {
                alert($rootScope.dictionary.errorTryAgainLater);
            }
        });
    };

    $scope.goToRestorePassword = function () {
        $state.transitionTo('resetPassword', { backState: 'forget'});
    }
    
    $scope.showRegCodeForm = false;
    $scope.openRegCodeForm = function ()
    {
    	$scope.showRegCodeForm=true;
    	window.setTimeout(function () {$("#regCode-input").focus();}, 0);
    };
    $scope.closeRegCodeForm = function () {
        $scope.showRegCodeForm = false;
        $scope.wrongCode = false;
    };
	
    $scope.confirmRegCode = function () {
        var data = {};
        data.regCode = $scope.regCode;
		if(waitingForServer)
			return;
		waitingForServer=true;
        server.requestPhp(data, "checkRegCode").then(function (data) {
			waitingForServer=false;
            //if the course added
            if (data && !data.error) {
                $scope.showRegCodeForm = false;
                $scope.wrongCode = false;
                newUser($scope.regCode);
            }
            else {
                if (data.error) {
                    $scope.wrongCode = true;
                }
            }
        });
    };
    
    function newUser(regCode) {
        $rootScope.regCode = regCode;
		$state.transitionTo("studentSignup");
    }
	/*
	//Sign-In with Google. Disabled because Cordova doesn't support it.
	function onSuccess(googleUser) {
		login.googleLogin(googleUser.getAuthResponse().id_token).then(function (data) {
            if (data.token) {
				profile.getMyProfile();
                $state.transitionTo('courses');
            } else if (data.error) {
                if (data.error == "incorrect credentials") {
                    alert($rootScope.dictionary.errorUsername);
					if(!gapi.auth2){
						gapi.load('auth2', function() {
							gapi.auth2.init();
						});
					}
					gapi.auth2.getAuthInstance().disconnect();
					var auth2 = gapi.auth2.getAuthInstance();
					auth2.signOut().then(function () {
						console.log('User signed out.');
					});
					gapi.auth2.getAuthInstance().disconnect();
                }
                if (data.error == "the user is inactive") {
                    alert($rootScope.dictionary.errorUserStatus);
                }
                if (data.error == "need to accept register") {
                    alert($rootScope.dictionary.finishRegistrationViaEmail);
                }
            } else {
                alert($rootScope.dictionary.errorTryAgainLater);
            }
        });
    }
    function onFailure(error) {
      console.log(error);
    }
    function renderButton() {
		if(!gapi)
			return;
		gapi.signin2.render('my-signin2', {
			'scope': 'profile email',
			'width': 240,
			'height': 50,
			'longtitle': true,
			'theme': 'dark',
			'onsuccess': onSuccess,
			'onfailure': onFailure
		});
	}*/
} ]);