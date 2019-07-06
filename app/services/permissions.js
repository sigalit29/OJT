apple.factory('permissions', ['$rootScope', 'server', function ($rootScope, server) {
	return {
		getRole: function (courseid) {
		//if there's no role configured, or if there was a course switch, fetch new role
			if(!$rootScope.role||$rootScope.currCourseContext!=courseid)
			{
				$rootScope.currCourseContext = courseid;
				var data = {};
				data.courseid = courseid;
				server.requestPhp(data, "GetRoleInCourse").then(function(data) {
					$rootScope.role = data;
				});
			}
		}
	}
} ]);