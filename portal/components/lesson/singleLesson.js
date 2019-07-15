apple.controller('singleLesson', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$q', 'userService', 'Upload','server',
    function($rootScope, $scope, $state, $stateParams, $http, $q, userService, Upload, server) {

        $scope.lessonId = $stateParams.lessonId;
        $scope.lessonNum = $stateParams.lessonNum;
        $scope.courseId = $stateParams.courseId;
                           
        // To get student attendance in a single lesson :
        // Function name: GetStudentsAttendance
        // Input: lessonid
        $scope.getAttendanceOfLesson = function() {
            var data = {};
            data.lessonid = $scope.lessonId;
            server.requestPhp(data, "GetStudentsAttendance").then(function(data) {
                $scope.stundentsAttandance = data;
                console.log($scope.stundentsAttandance);
            });
        }
    
           
        $scope.getAttendanceOfLesson();
    
        // To get attendance option for dropdown:
        // Function name: GetAttendanceStatuses
        // Input: -
        $scope.GetAttendanceStatuses = function() {
            var data = {};
            server.requestPhp(data, "GetAttendanceStatuses").then(function(data) {
                $scope.AttendanceStatusesTags = data;
                console.log($scope.AttendanceStatusesTags);
            });
        }
    
        $scope.GetAttendanceStatuses();
      
    
        // To update the status of a single student:
        // If the student.checkstudentid==null
        // 	Use:
        // 	Function name: AddCheckStudentStatus
        // 	Input: student, lessonid
        // Else use: 
    
        // 	Function name: UpdateCheckStudentStatus
        // 	Input: student, lessoned
        
        $scope.UpdateAttendeeStatus = function(student) {
            var data={};
            var async = $q.defer(); 
            if (student.checkstudentid==null) {
                data.lessonid=$scope.lessonId;
                data.status = student.attendanceStatus;
                data.student = student.userid;
                console.log(data);
                server.requestPhp(data, 'AddCheckStudentStatus').then(function (data) {
                    console.log("Success in saving status");
                    async.resolve(data); // --> no data came back
                }, function (err) {
                    console.error(err);
                    async.reject(error);
                });
                return async.promise;
            } else {
                data.lessonid=$scope.lessonId;
                data.status = student.attendanceStatus;
                data.student = student.userid;
                console.log(data);
                server.requestPhp(data, 'UpdateCheckStudentStatus').then(function (data) {
                    console.log("Success in saving status");
                    async.resolve(data); // --> no data came back
                }, function (err) {
                    console.error(err);
                    async.reject(error);
                });
                return async.promise;
            }
            
        }
    
        $scope.backSingleCourse = function(){
            $state.transitionTo('singleCourse', {courseId: $scope.courseId});
        };

    }]);
