apple.controller('courses', ['$scope', '$stateParams', '$rootScope', '$state', '$timeout', 'server', function ($scope, $stateParams, $rootScope, $state, $timeout, server) {

    $scope.$state = $state;
    $scope.showactive  =  true ;
    $scope.shownotactive  =  false ;
    $scope.dropdownclass = "dropdown-arrow" ;
    $scope.dropdownactivefullclass = "dropdown-arrow rotreg";
    $scope.dropdownnotactivefullclass = "dropdown-arrow rot";
    $rootScope.$broadcast('setHeaderTitle', { title: $rootScope.dictionary.courses });
    $scope.enrollmentRoleNames = {
        1: $rootScope.dictionary.learningIn,
        2: $rootScope.dictionary.teachingIn
    };
    //get enrollment roles list
    $scope.enrollments = [];
    $scope.selectedRole = null;
    var GetMyEnrollments = function () {
        var data ={};
        //GetMyEnrollments
        server.requestPhp(data, 'GetMyEnrollments').then(function (data) {
            $scope.enrollments = data;
            //TODO - fix hardcoding of enrollmentroleid
            if(!$scope.selectedRole)
            {
                if($scope.enrollments&&$scope.enrollments[2])
                    $scope.selectedRole = 2;
                else
                    $scope.selectedRole = 1;
            }
        });
    }
    GetMyEnrollments();
    $scope.onReload=function(){
        GetMyEnrollments();
    }
    $scope.switchRole = function (roleid){
        $scope.selectedRole = roleid;
    }

    $scope.openAddCourse = function () {
        $scope.showEnrollWithCodeForm = true;
    }

    $scope.change = function () {
        if ($scope.courseEnrollmentCode != undefined && $scope.courseEnrollmentCode.length == 0) {
            $scope.invalidCode = true;
        }
        if (!$scope.courseEnrollmentCode.match(/^[0-9a-zA-Z]+$/) && !$scope.courseEnrollmentCode.match(/^\s*$/)) {
            $scope.invalidCode = true;
        }
        else {
            $scope.invalidCode = false;
        }

    }

    $scope.goToCoursePage = function (id) {
        $state.transitionTo('singleCourse', { courseId: id })
    }

    $scope.cancelAddCourse = function () {
        $scope.showEnrollWithCodeForm = false;
        $scope.enrollingError = null;
        $scope.courseEnrollmentCode = "";
        $scope.invalidCode = false;
    }
    $scope.confirmAddCourse = function () {
        var data = {}
        data.code = $scope.courseEnrollmentCode;
        server.requestPhp(data, "EnrollToCourseByCode").then(function (data) {
            //if the course added
            if (data && !data.error) {
                //hide the popup
                $scope.showEnrollWithCodeForm = false
                GetMyEnrollments();
            }
            else
            {
                $scope.enrollingError = data.error;
            }
        });
    }
    $scope.notIsActive = function(course){

        return  ( course.status == '0' ? true : false) ;



    }
    $scope.isActive = function(course){

        return  ( course.status == '1' ? true : false) ;



    }
    $scope.changeActivesShow = function() {



        $scope.showactive = !$scope.showactive;

        $scope.dropdownactivefullclass= $scope.dropdownclass ;

        $scope.showactive ?  $scope.dropdownactivefullclass += " rotreg" : $scope.dropdownactivefullclass += " rot" ;


    }
    $scope.changeNotActivesShow = function() {

        $scope.shownotactive = !$scope.shownotactive;

        $scope.dropdownnotactivefullclass= $scope.dropdownclass ;

        $scope.shownotactive ?  $scope.dropdownnotactivefullclass += " rotreg" : $scope.dropdownnotactivefullclass += " rot" ;

    }

}
])

