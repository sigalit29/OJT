apple.factory('login', ['$rootScope', '$http', '$q', '$state', '$timeout', '$sce','$injector', function ($rootScope, $http, $q, $state, $timeout, $sce,$injector) {
	$rootScope.loginToken = localStorage.getItem('loginToken') ? localStorage.getItem('loginToken') : "";
	$rootScope.userLogin;
	$rootScope.me = {};
	$rootScope.logoutTurnOn = false;
	
	function deleteAllCookies() {
		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i];
			var eqPos = cookie.indexOf("=");
			var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
		}
	}
	self = {},

	self.login = function (email, pass){
		var deferred = $q.defer();
		var data = { "email": email, "pass": pass };
		self.requestPhp(data, "login").then(function (data) {
			if (!data.error) {
				localStorage.setItem('loginToken', data.token);
				$rootScope.loginToken = data.token;
				self.setUserData();
				$rootScope.isAdmin = data.isAdmin;
				var push= $injector.get('push');
				push.updateServerWithToken();
			}
			deferred.resolve(data);
		});
		return deferred.promise;
	},
	self.googleLogin = function(token){
		var deferred = $q.defer();
		var data = {"id_token": token};
		self.requestPhp(data, "loginWithGoogle").then(function (data) {
			if (!data.error) {
				localStorage.setItem('loginToken', data.token);
				$rootScope.loginToken = data.token;
				self.setUserData();
				$rootScope.isAdmin = data.isAdmin;
				var push= $injector.get('push');
				push.updateServerWithToken();
			}
			deferred.resolve(data);
		});
		return deferred.promise;
	}
	self.logout = function () {
		var deferred = $q.defer();
		localStorage.removeItem("loginToken");
		localStorage.removeItem("isAdmin");
		$rootScope.loginToken = undefined;
		$rootScope.userType = undefined;
		$rootScope.userLogin = false;
		self.wipeUserData();
		deferred.resolve(true);
		$rootScope.currCourseContext = null;
		$rootScope.role = null;
		//delete all cookies, just to make sure...
		deleteAllCookies();
		return deferred.promise;
	},
	self.setUserData = function () {
		$rootScope.me = {};
		var data = {};
		self.requestPhp(data, "GetMyProfile").then(function(data) {
			$rootScope.me = data;
		});
	},
	self.wipeUserData = function () {
		$rootScope.me = {};
	},
	self.isLogin = function () {
		var deferred = $q.defer();
		var token = localStorage.getItem('loginToken');
		//if there is data on storage - the user login
		if (token){
			try {
				$rootScope.loginToken = token;
				self.setUserData();
				deferred.resolve(true);
				$rootScope.userLogin = true;
				//init the push token
				var push= $injector.get('push');
				push.updateServerWithToken();
			} catch(e) {
				console.log(e);
				$rootScope.isLogin = false;
				deferred.resolve(false);
			}
		}
		else {
			$rootScope.isLogin = false;
			deferred.resolve(false);
		}
		return deferred.promise;
	},

	self.requestPhp = function (data, type) {
		var deferred = $q.defer();
		//add the token to request
		data.token = $rootScope.loginToken;
		//add client version to request
		data.v = version;
		var httpDetails = {
			url: $rootScope.phpDomain + "datagate.php?type=" + type,
			method: "POST",
			data: angular.toJson(data),
			contentType: "application/json"
		};
		if (!data.req) {//if it form data
			httpDetails.transformRequest = angular.identity;
			httpDetails.headers = { 'Content-Type': undefined };
			httpDetails.contentType = undefined;
		}
		$http(httpDetails).
			success(function (json) {
				//if the result is "user not found" - go to login page
				if (json && json.error == "user not found") {
					self.logout().then(function () {
						$state.transitionTo("login");
					});
				}
				deferred.resolve(json);

			}).
			error(function (err) {
				deferred.resolve(err);
			});
		return deferred.promise;
	};
	return self;
} ]);
