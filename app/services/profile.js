apple.factory('profile', ['$rootScope', 'server', function ($rootScope, server) {
	return {
		getMyProfile: function () {
			//if a token is defined, but user data isn't
			if($rootScope.loginToken && (!$rootScope.me||!$rootScope.me=={}))
			{
				$rootScope.me = {};
				var data = {};
				server.requestPhp(data, "GetMyProfile").then(function(data) {
					$rootScope.me = data;
				});
			}
		}
	}
} ]);