apple.factory('server', ['$rootScope', '$http', '$q', '$state', '$timeout','login', function ($rootScope, $http, $q, $state, $timeout,login) {
var timeoutMillis = 5000;
	return {
		requestPhp: function (data, type) {
			var deferred = $q.defer();
			//add the token to request
			data.token = $rootScope.loginToken;
			//add client version to request
			data.v = version;
			var httpDetails = {
				url: $rootScope.phpDomain + "datagate.php?type=" + type,
				method: "POST",
				data: angular.toJson(data),
				contentType: "application/json",
				timeout:timeoutMillis,
				config:{timeout:timeoutMillis}
			};

			if (!data.req) {
				httpDetails.transformRequest = angular.identity;
				httpDetails.headers = { 'Content-Type': undefined};
				httpDetails.contentType = undefined;
			}

			$http(httpDetails).
			success(function (json) {
				//if the result is "user not found" - go to login page
				if (json && json.error == "user not found") {
					login.logout().then(function () {
						$state.transitionTo("login");
					})
				}
				if (json && json.error == "password change required") {
					$state.transitionTo("changePassword");
				}
				if (json && json.alertMessage)
				{
					alert(json.alertMessage);
				}
				if (json && json.switchRoute)
				{
					$state.transitionTo(json.toState, json.stateParams);
				}
				deferred.resolve(json);
			}).
			error(function (err) {
				deferred.resolve(err);
			});
			return deferred.promise;
		},


		requestStatic: function (fileName) {
			var deferred = $q.defer();

			var httpDetails = {
				url: $rootScope.domain + "data/" + fileName,
				method: "GET",
				contentType: "application/json"
			};

			$http(httpDetails).
			success(function (json) {

				deferred.resolve(json);

			}).
			error(function (err) {
				deferred.resolve(err);
			});
			return deferred.promise;
		},

		uploadFile: function (file, type) {
			var deferred = $q.defer();


			var formData = new FormData();
			formData.append("image", file);

			$.ajax({
				url: $rootScope.phpDomain + "data.php?type=" + type, // 'http://ec2-54-165-71-31.compute-1.amazonaws.com/toto/server/data.php?type=uploadImage',
				data: formData,
				// THIS MUST BE DONE FOR FILE UPLOADING
				contentType: false,
				processData: false,
				type: 'POST',
				success: function (data) {
					deferred.resolve(data);
				},
				error: function (data) {
					deferred.resolve(data);
				}
			})

			return deferred.promise;
		}
	}
} ]);