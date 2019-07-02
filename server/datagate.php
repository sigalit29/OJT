<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
date_default_timezone_set("Asia/Jerusalem");
$type = isset($_GET["type"]) ? $_GET["type"] : null;
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set("error_log", "error_log_1");
error_reporting(E_ALL);
$time = $_SERVER['REQUEST_TIME'];
require_once ("functions.php");
$data = new StdClass;
$data = json_decode(file_get_contents("php://input"));
if (isset($_GET['token'])) {
	$data = (object) array("token" => '');
	$data -> token = $_GET['token'];
	//fix!!!
	$data -> v =2.1;
}
if (isset($_GET['v'])) {
	$data -> v = $_GET['v'];
}
//$referer = isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:"";
//$clientType = strpos($referer, "portal")?"PORTAL":"APP";

$version = isset($data -> v)?$data -> v:null;
if(!isset($version)|| $version < 2.1 ) {
    echo json_encode(array("alertMessage" => "אנא עדכן גרסה!"));
    return;
}
//-----Start of Calls that Require a Valid Signup Code------
$actualCode = "2018";
$regCode = isset($_GET["regCode"]) ? $_GET["regCode"] : (isset($data -> regCode)?$data -> regCode:null);
if ($type == "checkRegCode") {
	if ($regCode == $actualCode)
		$ans = true;
	else {
		$ans = (object) array("error" => "Wrong Code");
	}
} else if ($type == "signup") {
	if ($regCode == $actualCode) {
		$data -> image = isset($data -> image) ? $data -> image : '';
		$ans = $User -> signup($data -> email, $data -> pass1, $data -> pass2, null /*$data -> googleid*/, $data -> firstname, $data -> lastname, $data -> phone, $data -> phone2, $data -> genderid, $data -> cityid, $data -> image, $data -> tznumber, $data -> birthday, $data -> address);
	} else {
		$ans = (object) array("error" => "access permission");
	}
} else if ($type == "reg_GetCities") {
	if ($regCode == $actualCode) {
		$ans = $City -> GetCities();
	} else {
		$ans = (object) array("error" => "access permission");
	}
} else if ($type == "reg_GetGenders") {
	if ($regCode == $actualCode) {
		$ans = $Gender -> GetGenders();
	} else {
		$ans = (object) array("error" => "access permission");
	}
} else if ($type == "regUploadDoc") {
	if ($regCode == $actualCode) {
		$ans = uploadDoc($_FILES["file"]);
	} else {
		$ans = (object) array("error" => "access permission - ".$regCode);
	}
}
else if ($type == "checkEmailApproval") {
	if ($regCode == $actualCode) {
		$ans = $User -> isEmailApproved($data -> email);
	} else {
		$ans = (object) array("error" => "access permission");
	}
}
else if ($type == "reg_ChangeEmail") {
	if ($regCode == $actualCode) {
		$ans = $User -> reg_ChangeEmail($data -> email1, $data -> email2);
	} else {
		$ans = (object) array("error" => "access permission");
	}
}
else if ($type == "reg_sendVerificationEmail") {
	if ($regCode == $actualCode) {
		$ans = $User -> sendSignupMail($data -> email);
	} else {
		$ans = (object) array("error" => "access permission");
	}
}
//-----End of Calls that Require a Valid Signup Code------
//-----Start of Calls that don't Require Any Qualifier------
else if($type == "InitPassApp"){
	$ans = $User -> InitPassApp($data->email);
}else if ($type == "InitPass") {
	$ans = $User -> InitPass($data -> email);
} else if ($type == "ChangeMisPass") {
	$ans = $User -> ChangeMisPass($data -> id, $data -> pass1, $data -> pass2);
} else if ($type == "login") {
	//IMPORTANT - determines the client type based on the referer URL. This means you MUST use the portal directory for token managment to work properly.
	$referer = isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:"";
	$clientType = strpos($referer, "portal")?"PORTAL":"APP";

	$ans = $User -> login($data -> pass, $data -> email, $clientType);
} else if ($type == "loginWithGoogle") {
	$ans = $User -> loginWithGoogle($data -> id_token);
} else if ($type == "logout") {
	$ans = $User -> logout($data -> token);
} else if ($type == "logoutApi") {
	$ans = $User -> logout($data -> token);
}
//-----End of Calls that don't Require Any Qualifier------
//-----Start of NetaJoin Related Calls------GetCourseEnrollmentProfiles
switch ($type) {
	// ------------ Cities ------------
	case "GetCities" :
		$ans = $City -> GetCities();
		break;
	case "AddCity" :
		if ($me["isAdmin"])
			$ans = $City -> AddCities($data->cities);
		break;
    case "GetNetaCities" :
        $ans = $NetaCity -> GetNetaCities();
        break;
	// ------------ Genders ------------
	case "GetGenders" :
		$ans = $Gender -> GetGenders();
		break;
	case "AddGender" :
		if ($me["isAdmin"])
			$ans = $Gender -> AddGender($data->genders);
			break;
	// ------------ Religions ------------
	case "GetReligions" :
		$ans = $Religion -> GetReligions();
		break;
	case "AddReligion" :
		if ($me["isAdmin"])
			$ans = $Religion -> AddReligion($data->religions);
			break;
    // ------------ Schools ------------
    case "GetSchools" :
        $ans = $School -> GetSchools();
        break;
    case "GetSchoolsByNetaCityId" :
        $ans = $School -> GetSchoolsByNetaCityId($data->NetaCityId);
        break;
    // ------------ Classes ------------
    case "GetClasses" :
        $ans = $Grade -> GetClasses();
        break;
    // ------------ HearAboutUs ------------
    case "GetHearAboutUsOptions" :
        $ans = $HearAboutUs -> GetHearAboutUsOptions();
        break;
    // ------------ Nominees ------------
    case "AddNominee" :
        $ans = $Nominee -> AddNominee($data->nominee);
        break;
    // ------------ Status ------------
    case "GetStatuses" :
        $ans = $NomineeStatus -> GetStatuses();
        break;
}
//-----End of NetaJoin Related Calls------
if(isset($ans))
{
	echo json_encode($ans);
	return;
}else {
	$token = isset($data -> token) ? $data -> token : null;
	$lessonid = isset($data -> lessonid) ? $data -> lessonid : null;
	$courseid = isset($data -> courseid) ? $data -> courseid : null;
	$me = $User -> getLoggedInUser($token);
	if(isset($me -> error)){
		$ans = $me;
	}
	//-----Start of Calls Requiring a Token (Including Tokens Associated with a User Who Need to Replace Their Password------
	//if a password change is required
	else if($me['passChangeRequired'])
	{
		//allow switching to a different password
		if($type == "ChangeMyPassword")
		{
			$myid = $me['userid'];
			$ans = $User -> ChangeMyPassword($data -> pass, $data -> newpass1, $data -> newpass2);
		}
		//but don't allow anything else
		else $ans = (object)array("error" => "password change required");
	}
	//-----End of Calls Requiring a Token (Including Tokens Associated with a User Who Need to Replace Their Password------
	//-----Start of Calls Requiring a Valid Token------
	else {
		$myid = $me['userid'];
		switch ($type) {
			case "GetMyProfile" :
				$ans = $Profile -> GetMyProfile();
				break;
				case "GetUserExtendedProfile" :
				$ans = $Profile -> GetUserExtendedProfile();
				break;
			// ------------ CheckStudent ------------
			case "ReportAttendance" :
				$ans = $CheckStudent -> ReportAttendance($data -> lessonid, $data -> status);
				break;
			case "postStudentLessonFeedback" :
				$customSubjectRating = isset($data -> customSubjectRating)?$data -> customSubjectRating:null;
				$ans = $CheckStudent -> postStudentLessonFeedback($data -> lessonid, $data -> ratings, $data -> comments);
				break;
			case "postStudentSubjectFeedback" :
				$customSubjectRating = isset($data -> customSubjectRating)?$data -> customSubjectRating:null;
				$ans = $CheckStudent -> postStudentSubjectFeedback($data -> lessonid, $data -> ratings, $data -> comments);
				break;
			case "GetStudentsAttendance" :
				$ans = $CheckStudent -> GetStudentsAttendance($data -> lessonid);
				break;
			case "UpdateStudentAttendance" :
				$ans = $CheckStudent -> UpdateStudentAttendance($data ->lessonid, $data->students);
				break;
			case "GetMyActivity" :
            $ans = $CheckStudent -> GetMyActivity($data ->lessonid);
            break;
            case "GetAttendanceStatuses" :
                $ans = $CheckStudent -> GetAttendanceStatuses();
                break;
            case "UpdateCheckStudentStatus" :
                $ans = $CheckStudent -> UpdateCheckStudentStatus($data ->student,$data->lessonid);
                break;
			// ------------ Lesson ------------
            case "GetCustomSubjectsOfLesson" :
                $ans = $Lesson -> GetCustomSubjectsOfLesson($data -> lessonid);
                break;
			case "GetLessonsOfCourse" :
				$ans = $Lesson -> GetLessonsOfCourse($data -> courseid);
				break;
			case "GetLessonStatusById" :
				$ans = $Lesson -> GetLessonStatusById($data -> lessonid);
				break;
			case "GetLessonById" :
				$ans = $Lesson -> GetLessonById($data -> lessonid);
				break;
			case "GetNumberOfLessonsByCourseId":
				$ans = $Lesson -> GetNumberOfLessonsByCourseId($data -> courseid);
				break;
			case "AddLesson" :
				if ($permissions->CheckMadrichCourse($myid, $data -> courseid)) {
					$ans = $Lesson -> AddLesson($data -> courseid, $data -> lesson);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "UpdateLesson" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lesson -> lessonid)) {
					$ans = $Lesson -> UpdateLesson($data -> lesson);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "ActivateMeeting" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> ActivateMeeting($data -> lessonid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "closeMeeting" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> closeMeeting($data -> lessonid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "UpdateSubjectsTaughtInLesson" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> UpdateSubjectsTaughtInLesson($data -> lessonid, $data -> subjectsTaught);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "postTeacherLessonFeedback":
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> postTeacherLessonFeedback($data -> lessonid, $data -> ratings, $data -> comments);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "ToggleLessonIgnore":
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> ToggleLessonIgnore($data -> courseid, $data -> lessonid, $data -> ignoreMe);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "GetLessonFeedbackRate":
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Lesson -> GetLessonFeedbackRate($data -> lessonid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			// ------------ Mentoring Session ------------
			case "AddMentoringSession" :
				$ans = $MentoringSession -> AddMentoringSession($data -> courseid, $data -> scheduleddate, $data -> comments, $data -> type, $data -> students);
				break;
			case "GetSessionTypes" :
				$ans = $MentoringSession -> GetSessionTypes();
				break;
			// ------------ Question ------------
			case "GetUniformQuestions" :
				$ans = $Question -> GetUniformQuestions();
				break;
			case "AddMadrichQuestion" :
				if ($me['isAdmin'])
					$ans = $Question -> AddMadrichQuestion($data->questions);
				break;
			case "AddUniformQuestions" :
				if ($me['isAdmin'])
					$ans = $Question -> AddUniformQuestions($data->questions);
				break;
			case "GetStudentQuestions" :
				$ans = $Question -> GetStudentQuestions();
				break;
			case "GetMadrichQuestions" :
				$ans = $Question -> GetMadrichQuestions();
				break;
			// ------------ Function ------------
			case "UploadSyllabusFile" :
				if ($me['isAdmin'])
					$ans = $SyllabusExcelParser->UploadSyllabusFile($_FILES["file"]);
				else
					$ans = (object) array("error" => "access permission");
				break;
			// ------------ Courses ------------
			case "AddCourse" :
				$ans = $Course -> AddCourse($data -> course);
				break;
			case "UpdateCourse" :
				$ans = $Course -> UpdateCourse($data -> course);
				break;
			case "DeleteCourse" :
				$ans = $Course -> DeleteCourse($data -> courseid);
				break;
			//portal
			case "GetCourseById" :
				$ans = $Course -> GetCourseById($data -> courseid);
				break;
			case "SearchCourses" :
				$ans = $Course-> SearchCourses($data -> search, $data -> sorting, $data -> desc, $data -> coursestatus, $data -> page);
				break;
			case 'GetCoursesOfProject' :
				$staffid = (isset($data -> staffid)) ? $data -> staffid : null;
				$ans = $Enrollment -> GetCoursesOfProject($data -> projectid, $staffid);
				break;
			//app
			case "GetCoursesByMadrichToken" :
				$ans = $Course -> GetCoursesByMadrichToken($data -> token);
				break;
			case "GetCourseDataById" :
				$ans = $Course -> GetCourseDataById($data -> courseid);
				break;
			case "GetMyStatNotifications" :
				$ans = $StatNotification -> getMyStatNotifications($data -> courseid);
				break;
			case "GetUserFlowPosInCourse" :
				$ans = $Course -> GetUserFlowPosInCourse($data -> courseid);
				break;
			//Enrollment
			case "DeleteFromEnrollment" :
				$ans = $Enrollment -> DeleteFromEnrollment($data -> userid, $data -> courseid, $data -> enrollmentroleid);
				break;
			case "SearchUsersToEnroll" :
				$ans = $Enrollment -> SearchUsersToEnroll($data -> courseid, $data -> search, $data -> sorting, $data -> desc, $data -> page);
				break;
			case "EnrollUsers" :
				$ans = $Enrollment -> EnrollUsers($data -> userids, $data -> courseid, $data -> roleid);
				break;
			case "GetCourseEnrollmentProfiles" :
				$ans = $Enrollment -> GetCourseEnrollmentProfiles($data -> courseid, $data -> roleid,  $data -> page, $data -> search);
				break;
			case "GetCoursesWithUserEnrolledAsRole":
				$ans = $Enrollment -> GetCoursesWithUserEnrolledAsRole($data -> userId, $data -> roleid,  $data -> page, $data -> search);
				break;
			case "GetCoursesWhereUserHasRoleByToken":
				$ans = $Enrollment -> GetCoursesWithUserEnrolledAsRole($myid, $data -> roleid,  $data -> page, $data -> search);
				break;
			case "EnrollToCourseByCode" :
				$ans = $Enrollment -> EnrollToCourseByCode($data -> code);
				break;
			case "GetMyEnrollments" :
				$ans = $Enrollment -> GetMyEnrollments();
				break;
			case "GetRoleInCourse" :
				$ans = $Enrollment -> GetEnrollmentRoleOfUserInCourse($data -> courseid, $myid);
				break;
			case "updateEnrollmentTag" :
				$access = $permissions->AccessUserProfile($data -> userId);
				if($access["edit"])
				{
					$ans = $Enrollment -> updateEnrollmentTag($data -> courseId, $data -> userId, $data -> enrollmentTagId);
				}else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "UpdateUserStatus" :
				$access = $permissions->AccessUserProfile($data -> userid);
				if($access["edit"])
				{
					$ans = $Enrollment -> UpdateUserStatus($data -> courseid, $data -> userid, $data -> status);
				}else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "UpdateUserEnrollmentField":
				$access = $permissions->AccessUserProfile($data -> userid);
				if($access["edit"])
				{
					$ans = $Enrollment -> UpdateUserEnrollmentField($data -> enrollmentId, $data -> fieldId, $data -> value);
				}else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			// ------------ Syllabus ------------
			case "GetSyllabusSubjectsByCourseId" :
				$ans = $Syllabus -> GetSyllabusSubjectsByCourseId($data -> courseid);
				break;
            case "GetSubjectsByCourseIdNotInTree" :
                $ans = $Syllabus -> GetSubjectsByCourseIdNotInTree($data -> courseid);
                break;
			case "getSyllabusSubjectsLearntByCourseId" :
				$ans = $Syllabus -> getSyllabusSubjectsLearntByCourseId($data -> courseid);
				break;
			// ------------ Users ------------
			case "GetUserProfileById" :
				$access = $permissions->AccessUserProfile($data -> userId);
				if(!$access["watch"])
				{
					$ans = (object) array("error" => "access permission");
				}
				else
				{
					$ans = array("profile"=>($Profile -> GetUserProfileById($data -> userId)), "access"=>$access);
					//hide profile fields that shouldn't be accessible to the user requesting the data
					foreach($access['hideFields'] as $profileField){
						if(isset($ans["profile"][$profileField]))
						{
							unset($ans["profile"][$profileField]);
						}
					}
				}
				break;
			case "GetManagedUsersByUserId":
				$ans = $Profile -> GetManagedUsersByUserId($data -> userId);
				break;
			case "UpdateUserProfile":
				$access = $permissions->AccessUserProfile($data -> userid);
				if(!$access["edit"])
				{
					$ans = (object) array("error" => "access permission");
				}
				else
				{
					$data -> updatePassword = false;
					$ans = $Profile -> UpdateUser($data);
				}
				break;
			case "UpdateUserProfilePic" :
				$access = $permissions->AccessUserProfile($data -> userId);
				if(!$access["edit"])
				{
					$ans = (object) array("error" => "access permission");
				}
				else
				{
					$ans = $Profile -> UpdateUserProfilePic($data->userId, $data->image);
				}
				break;
			case "AddUser" :
				$ans = $Profile -> AddUser($data->user);
				break;
			case "approveUserEmail" :
				$access = $permissions->AccessUserProfile($data -> userId);
				if($access["approveRegistration"])
				{
					$ans = $User -> approveUserEmail($data->userId);
				}
				else
				{
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "ChangeMyPassword" :
				$ans = $User -> ChangeMyPassword($data -> pass, $data -> newpass1, $data -> newpass2);
				break;
			case "UpdateUser" :
				$ans = $Profile -> UpdateUser($data->user);
				break;
			case "UploadUsers" :
				if($me["isAdmin"]){
					$ans = $Profile -> BatchUploadUsers($_FILES["file"]);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "SearchStaffUnderMe" :
				$ans = $Profile -> SearchStaffUnderMe($data -> search, $data -> sorting, $data -> desc, $data -> userstatus, $data -> page);
				break;
            case "SearchStaffUnderMeForExcel" :
                $ans = $Profile -> SearchStaffUnderMe($data -> search, $data -> sorting, $data -> desc, $data -> userstatus, $data -> page);
                break;
			case "SearchStudentsUnderMe" :
				$ans = $Profile -> SearchStudentsUnderMe($data -> search, $data -> sorting, $data -> desc, $data -> userstatus, $data -> page);
				break;
			case "SearchNewUsers" :
				$ans = $Profile -> SearchNewUsers($data -> search, $data -> sorting, $data -> desc, $data -> userstatus, $data -> page);
				break;
			case "SearchUserToAssignAsManager" :
				$ans = $Profile -> SearchUserToAssignAsManager($data -> search, $data -> sorting, $data -> desc, $data -> userstatus, $data -> page);
				break;
			case "GetCoursesLearntByUser":
				$ans = $Profile -> GetCoursesLearntByStudent($data -> id);
				break;
            case "GetUserProjects":
                $ans = $Profile -> GetUserProjects($data -> userid);
                break;
			case "UpdateUserReligion" :
				$access = $permissions->AccessUserProfile($data -> userid);
				if($access["edit"]) {
					$ans = $Profile -> UpdateUserReligion($data->userid, $data->religionid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "UpdateUserGender" :
				$access = $permissions->AccessUserProfile($data -> userid);
				if($access["edit"]) {
					$ans = $Profile -> UpdateUserGender($data->userid, $data->genderid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
            case "UpdateUserEnrollmentRole" :
                $access = $permissions->AccessUserProfile($data -> userid);
                if($access["edit"]) {
                    $ans = $Profile -> UpdateUserEnrollmentRole($data->userid, $data->enrollmentroleid);
                } else {
                    $ans = (object) array("error" => "access permission");
                }
                break;
			// report approvers
			case "GetHoursApprovers":
					$ans = $ReportApprover -> GetHoursApprovers($data -> userid);
				break;
            case "GetUsersWhoHoursApprovedByMe":
                $ans = $ReportApprover -> GetUsersWhoHoursApprovedByMe($data -> userId);
                break;
			case "SearchHoursApprovers":
				if ($me["isAdmin"])
					$ans = $ReportApprover -> SearchHoursApprovers($data -> userid, $data -> search, $data -> sorting, $data -> desc, $data -> page);
				else {
                    $ans = (object) array("error" => "access permission");
                }
				break;
			case "AddHoursApprovers":
				if ($me["isAdmin"])
					$ans = $ReportApprover -> AddHoursApprovers($data->approverIds, $data->userId);
				break;
			case "DeleteReportApprovers":
				if ($me["isAdmin"])
					$ans = $ReportApprover -> DeleteReportApprovers ($data->userid,$data->userids);
				break;
			// ------------ Cities ------------
			case "GetCities" :
				$ans = $City -> GetCities();
				break;
			case "AddCity" :
				if ($me["isAdmin"])
					$ans = $City -> AddCities($data->cities);
				break;
			// ------------ Profession ------------
			case "GetProfessions" :
				$ans = $Profession -> GetProfessions();
				break;
			case "AddProfessions" :
				if ($me["isAdmin"])
					$ans = $Profession -> AddProfessions($data->professions);
				break;
			// ------------ Certificate ------------
			case "GetCertificates" :
				$ans = $Certificate -> GetCertificates();
				break;
			case "AddCertificates" :
				if ($me["isAdmin"])
					$ans = $Certificate -> AddCertificates($data->certificates);
				break;
			// ------------ Clientcode ------------
			case "GetClientCodes" :
				$ans = $Clientcode -> GetClientCodes();
				break;
			case "AddClientCodes" :
				if ($me["isAdmin"])
					$ans = $Clientcode -> AddClientCodes($data->clientCodes);
				break;
			// ------------ Salarycode ------------
			case "GetSalarycodes" :
				$ans = $Salarycode -> GetSalarycodes();
				break;
			case "AddSalarycodes" :
				if ($me["isAdmin"])
					$ans = $Salarycode -> AddSalarycodes($data->salaryCodes);
				break;
			// ------------ Enrollment Tags ------------
			case "GetEnrollmentTags" :
				$ans = $EnrollmentTag -> GetEnrollmentTags();
				break;
            case "GetEnrollmentTagsForStudents" :
                $ans = $EnrollmentTag -> GetEnrollmentTagsForStudents();
                break;
            case "GetEnrollmentTagsForTeachers" :
                $ans = $EnrollmentTag -> GetEnrollmentTagsForTeachers();
                break;
			// ------------ Enrollment Custom Fields ------------
			case "GetProjectCustomFields" :
				$ans = $ProjectCustomField -> GetProjectCustomFields($data->projectid);
				break;
			case "SaveProjectCustomFields" :
				$ans = $ProjectCustomField -> SaveProjectCustomFields($data->projectid, $data->fields);
				break;
			// ------------ Languages ------------
			case "GetLanguages" :
				$ans = $Language -> GetLanguages();
				break;
			case "AddLanguage" :
				if ($me["isAdmin"])
					$ans = $Language -> AddLanguage($data->languages);
					break;
			// ------------ Genders ------------
			case "GetGenders" :
				$ans = $Gender -> GetGenders();
				break;
			case "AddGender" :
				if ($me["isAdmin"])
					$ans = $Gender -> AddGender($data->genders);
					break;
			// ------------ Religions ------------
			case "GetReligions" :
				$ans = $Religion -> GetReligions();
				break;
			case "AddReligion" :
				if ($me["isAdmin"])
					$ans = $Religion -> AddReligion($data->religions);
					break;
			// ------------ EnrollmentRole ------------
			case "GetEnrollmentRoles" :
				$ans = $EnrollmentRole -> GetEnrollmentRoles();
				break;
			// ------------ Subjectreport ------------
			case "GetReportSubjects" :
				$ans = $Subjectreport -> GetReportSubjects();
				break;
			case "AddReportSubjects" :
				if ($me["isAdmin"])
					$ans = $Subjectreport -> AddReportSubjects($data->reportSubjects);
				break;
			// ------------ projects ------------
			case "GetMyProjectsReport" :
				$ans = $Project -> GetMyProjectsReport($staffid = null);
				break;
			case "GetAllProjects" :
				$ans = $Project -> GetAllProjects();
				break;
            case "SearchProjects":
                if ($me["isAdmin"])
                    $ans = $Project -> SearchProjects( $data -> search, $data -> page);
                else {
                    $ans = (object) array("error" => "access permission");
                }
                break;
//            case "AddprojectsToUser":
//                if ($me["isAdmin"])
//                    $ans = $Project -> UpdateUserProjects($data->projectsIds, $data->userId);
//                break;
			case "GetProjects" :
				$ans = $Project -> GetProjects();
				break;
			case "AddProject" :
				if ($me["isAdmin"])
					$ans = $Project -> AddProject($data->projects);
				break;
			// ------------ yearsbudget ------------
			case "GetYearsBudget" :
				$ans = $YearBudget -> GetYearsBudget();
				break;
			case "AddYearsBudget" :
				if ($me["isAdmin"])
					$ans = $YearBudget -> AddYearsBudget($data->budgetYears);
				break;
			// ------------ Reporters ------------
			case "GetReports" :
				$ans = $Reporter -> GetReports($data -> year, $data -> month);
				break;
			case "GetMyReportingPerimeter" :
				$ans = $Reporter -> GetReporterPerimeter($myid);
				break;
			case "SaveReports" :
				$ans = $Reporter -> SaveReports($data->reports);
				break;
			case "GetAllReporters" :
				$ans = $Reporter -> GetAllReporters($data -> month, $data -> year);
				break;
			case "UpdateReport" :
				$ans = $Reporter -> SaveReportofUnderstaff($data->report);
				break;
			case "SetReportApproval" :
				$ans = $Reporter -> SetReportApproval($data -> reportids, $data -> status);
				break;
			case "DeleteReportById" :
				$ans = $Reporter -> DeleteReportById($data -> reportid);
				break;
			//------------ profile ------------
			case "GetProfile" :
				$ans = $Profile -> GetProfile();
				break;
			case "GetMyStaffs" :
				$ans = $Profile -> GetMyStaffs();
				break;

			//------------ images ------------
			case "uploadDoc" :
				$ans = uploadDoc($_FILES["file"]);
				break;
			//------------ Statistic ------------
			case "GetStatistic" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $Statistic -> GetStatistic($data -> lessonid, $data -> courseid, true);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "GetStatisticByMeetingNumber" :
				$lessonid = $Lesson->GetLessonOfCourseByNumber($data -> courseid, $data -> num);
				if ($permissions->CheckMadrichLesson($myid, $lessonid)) {
					$ans = $Statistic -> GetStatistic($lessonid, $data -> courseid, false);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "GetCourseStatistic" :
				if ($permissions->CheckMadrichCourse($myid, $data -> courseid)) {
					$ans = $Statistic -> GetCourseStatistic($data -> courseid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "GetStudentsStatistics" :
				if ($permissions->CheckMadrichCourse($myid, $data -> courseid)) {
					$ans = $Statistic -> GetStudentStats($data -> courseid);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			case "SaveUsabilityInStatisticScreen" :
				if ($permissions->CheckMadrichLesson($myid, $data -> lessonid)) {
					$ans = $DashboardEngagement -> SaveDashboardEngagement($data -> lessonid, $data -> engagement);
				} else {
					$ans = (object) array("error" => "access permission");
				}
				break;
			/*Celebrations*/
			case "GetCelebrationEvents" :
				$ans = $CelebrationEvents -> getCourseCelebrationEvents ($data -> courseid);
				break;
			//------------ FireBase ------------
			case 'saveFireBaseToken' :
				$ans = $User -> saveFireBaseToken($data -> fbtoken);
				break;
      //------------ Youtube ------------
      case "GetYouTubeResults":
        $ans=$YouTubeSearch->getContent($data->value);
        break;
			//-------------Neta Join------------
			// ------------ Nominees ------------
			case "SearchNominees" :
				$ans = $Nominee -> SearchNominees($data->search, $data->sorting, $data->desc, $data->page, $data->netaCityFilter, $data->nomineeStatusFilter,$data->ClassFilter);
				break;
			case "UpdateNomineeStatus" :
				$ans = $Nominee -> UpdateNomineeStatus($data->nomineeid,$data->nomineestatusid);
				break;
			case "UpdateNomineeComments" :
				$ans = $Nominee ->UpdateNomineeComments($data->nomineeid,$data->comments);
				break;
			case "GetStudentProfileById" :
				$ans = $Nominee ->GetStudentProfileById($data->nomineeid);
				break;
			case "UpdateNominee" :
				$ans = $Nominee ->UpdateNominee($data->nominee);
				break;
			case "DeleteNominees" :
				$ans = $Nominee ->DeleteNominees($data->nominees);
				break;
			//neta cities
			case "GetNetaCities" :
				$ans = $NetaCity -> GetNetaCities();
				break;
			case "AddNetaCities" :
				$ans = $NetaCity -> AddNetaCities($data->NetaCities);
			break;
			// ------------ Schools ------------
			case "GetSchools" :
				$ans = $School -> GetSchools();
				break;

			case "GetSchoolsByNetaCityId" :
				$ans = $School -> GetSchoolsByNetaCityId($data->NetaCityId);
				break;

			// ------------ Classes ------------
			case "GetClasses" :
				$ans = $Grade -> GetClasses();
				break;
			case "AddClass" :
					$ans = $Grade -> AddClass($data->classes);
				break;
			// ------------ Status ------------
			case "GetNomineeStatuses" :
				$ans = $NomineeStatus -> GetNomineeStatuses();
				break;
			case "AddNomineeStatus" :
				$ans = $NomineeStatus -> AddNomineeStatus($data->status);
				break;
            case "GetEnrollmentTags" :
                $ans = $Enrollment -> GetEnrollmentTags();
                break;

			// ------------ HearAboutUs ------------
			case "GetHearAboutUsOptions" :
				$ans = $HearAboutUs -> GetHearAboutUsOptions();
				break;
			case "AddHearAbout" :
				$ans = $HearAboutUs -> AddHearAbout($data->hearabout);
				break;
			default :
				$ans = array("error" => "not valid type");
		}
	}
}
//if ($version!=2.1)
//	$ans = array("alertMessage" => "your version of the app is no longer supported");
echo json_encode($ans);
