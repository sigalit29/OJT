apple.factory('server', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {
       self={}; 
       self.requestPhp = function (data, type) {
            var deferred = $q.defer();
            //add the token to request
          // Getting token from localstorage
           data.token = $rootScope.userToken;
         
			//add client version to request
			data.v = version;
            var httpDetails = {
                url: phpDomain + "datagate.php?type=" + type,
                method: "POST",
                data: angular.toJson(data),
                contentType: "application/json"
            };

            if (!data.req) {//if it form data
                httpDetails.transformRequest = angular.identity;
                httpDetails.headers = { 'Content-Type': undefined};
                httpDetails.contentType = undefined;
            }

            $http(httpDetails).success(function (json) {
                deferred.resolve(json);
                if (json && json.error == "user not found") {
            		loginStatus	=false;
            		$rootScope.userToken = "";
            		$rootScope.isAdmin = false;
            		$state.transitionTo('login');
                }
                else if (json && json.error=="access permission")
                {
                    alert(json.error);
                }
            }).
            error(function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        return self;
} ]);