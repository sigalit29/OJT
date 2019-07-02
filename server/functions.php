<?php
define ('SERVERROOT',__DIR__);
date_default_timezone_set('UTC');
require(SERVERROOT."/XLSXReader.php");
require SERVERROOT."/config.php";
require SERVERROOT."/db.php";
require 'PHPMailer/PHPMailerAutoload.php';
//require_once 'google-api-php-client-2.2.2/vendor/autoload.php';

require_once(SERVERROOT."/modules/YouTubeSearch.php");
require_once(SERVERROOT."/modules/User.php");
require_once(SERVERROOT."/modules/Profile.php");
require_once(SERVERROOT."/modules/UserExcelParser.php");
require_once(SERVERROOT."/modules/Course.php");
require_once(SERVERROOT."/modules/Lesson.php");
require_once(SERVERROOT."/modules/CheckStudent.php");
require_once(SERVERROOT."/modules/MentoringSession.php");
require_once(SERVERROOT."/modules/Question.php");
require_once(SERVERROOT."/modules/Language.php");
require_once(SERVERROOT."/modules/Gender.php");
require_once(SERVERROOT."/modules/Religion.php");
require_once(SERVERROOT."/modules/City.php");
require_once(SERVERROOT."/modules/Project.php");
require_once(SERVERROOT."/modules/ProjectCustomField.php");
require_once(SERVERROOT."/modules/YearBudget.php");
require_once(SERVERROOT."/modules/Reporter.php");
require_once(SERVERROOT."/modules/Subjectreport.php");
require_once(SERVERROOT."/modules/ReportApprover.php");
require_once(SERVERROOT."/modules/Salarycode.php");
require_once(SERVERROOT."/modules/Clientcode.php");
require_once(SERVERROOT."/modules/Statistic.php");
require_once(SERVERROOT."/modules/EnrollmentTag.php");
require_once(SERVERROOT."/modules/DashboardEngagement.php");
require_once(SERVERROOT."/modules/CelebrationEvents.php");
require_once(SERVERROOT."/modules/StatNotification.php");
require_once(SERVERROOT."/modules/Syllabus.php");
require_once(SERVERROOT."/modules/SyllabusExcelParser.php");
require_once(SERVERROOT."/modules/Profession.php");
require_once(SERVERROOT."/modules/Certificate.php");
require_once(SERVERROOT."/modules/Enrollment.php");
require_once(SERVERROOT."/modules/EnrollmentRole.php");
require_once(SERVERROOT."/modules/permissions.php");
require_once(SERVERROOT."/modules/FireBaseFCM.php");
//neta join
require_once(SERVERROOT."/modules/NetaJoin/Nominee.php");
require_once(SERVERROOT."/modules/NetaJoin/School.php");
require_once(SERVERROOT."/modules/NetaJoin/NetaCity.php");
require_once(SERVERROOT."/modules/NetaJoin/Grade.php");
require_once(SERVERROOT."/modules/NetaJoin/HearAboutUs.php");
require_once(SERVERROOT."/modules/NetaJoin/NomineeStatus.php");

$db = new Db($conf->DB->host,$conf->DB->DBName,$conf->DB->userName,$conf->DB->pass,$conf->DB->logError);

$YouTubeSearch=new YouTubeSearch();
$FireBaseFCM = new FireBaseFCM();
$User = new User();
$Profile = new Profile();
$UserExcelParser = new UserExcelParser();
$Statistic = new Statistic();
$SyllabusExcelParser = new SyllabusExcelParser();
$Syllabus = new Syllabus();
$CelebrationEvents = new CelebrationEvents();
$StatNotification = new StatNotification();
$CheckStudent = new CheckStudent();
$Lesson = new Lesson();
$MentoringSession = new MentoringSession();
$Question = new Question();
$Course = new Course();
$Language = new Language();
$Gender = new Gender();
$Religion = new Religion();
$City = new City();
$Profession = new Profession();
$Certificate = new Certificate();
$Project = new Project();
$ProjectCustomField = new ProjectCustomField();
$YearBudget = new YearBudget();
$Reporter = new Reporter();
$Subjectreport = new Subjectreport();
$ReportApprover = new ReportApprover();
$EnrollmentTag = new EnrollmentTag();
$Salarycode = new Salarycode();
$Clientcode = new Clientcode();
$Enrollment = new Enrollment();
$EnrollmentRole = new EnrollmentRole();
$DashboardEngagement = new DashboardEngagement();
$permissions = new permissions();
$mail = new PHPMailer;
//neta join
$Nominee = new Nominee();
$NomineeStatus=new NomineeStatus();
$Grade = new Grade();
$NetaCity = new NetaCity();
$School = new School();
$HearAboutUs= new HearAboutUs();

function uploadDoc($file){
   //return $file;

	// $maxsize=5000000; //1MB
    $acceptable = array(
        'bmp',
        'jpg',
        'gif',
        'png',
        'jpeg'
    );
	$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
	if($file["error"]==0){
		$temp = explode(".", $file["name"]);
		//return $temp;
		$extension = end($temp);
       //return $extension;
		$fileName="data/images/".round(microtime(true) * 1000).".".$extension;
		//return $fileName;
		//$thumbnail =imagescale ($file,300, 300);
        $thumbnail = resize_image($file["tmp_name"], 300, 300, false, $extension);
		imagejpeg($thumbnail,"../".$fileName);
//		 if(!$result || $result=="incompatible file type");
//             return array("error" => "file upload error");
	//	amazon_s3_upload($fileName);
		return array("fileUrl" => $fileName);
	}
	return array("error" => "file upload error");
}

function resize_image($file, $w, $h, $crop, $ftype) {
	list($width, $height) = getimagesize($file);
	$r = $width / $height;
	if ($crop) {
		if ($width > $height) {
			$width = ceil($width-($width*abs($r-$w/$h)));
		} else {
			$height = ceil($height-($height*abs($r-$w/$h)));
		}
        $newwidth = $w;
        $newheight = $h;
	} else {
		if ($w/$h > $r) {
			$newwidth = $h*$r;
			$newheight = $h;
		} else {
			$newheight = $w/$r;
			$newwidth = $w;
		}
	}
	if($ftype === "jpg" || $ftype === "jpeg")
		$src = imagecreatefromjpeg($file);
    else if($ftype === "png")
        $src = imagecreatefrompng($file);
    else if($ftype === "gif")
        $src = imageCreateFromGif($file);
    else if($ftype === "bmp")
        $src = imageCreateFromBmp($file);
    else
        return "incompatible file type";
    $dst = imagecreatetruecolor($newwidth, $newheight);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    return $dst;
}
	
function getManagedUsers()
{
	global $db;
	global $me;
	global $myid;
	$users = $db->smartQuery(array(
			'sql' => "
			SELECT userid, managerid
			FROM user_profile 
			WHERE
				userid<>:userid
				AND managerid IS NOT NULL ",
			'par' => array('userid'=>$myid),
			'ret' => 'all'
	));
	if($me['isAdmin'])
	{
		return array_column($users, 'userid');
	}
	else
	{
		$foundAllAccessibleStaff = false;
		$accessible = array($myid=>$myid);
		//this function could be optimized to run in O(n), instead of nLog(n), by building a tree
		while(!$foundAllAccessibleStaff)
		{
			$foundAllAccessibleStaff = true;
			foreach($users as $currUser)
			{
				if(!isset($accessible[$currUser['userid']]))
				{
					if(isset($accessible[$currUser['managerid']]))
					{
						$foundAllAccessibleStaff = false;
						$accessible[$currUser['userid']] = $currUser['userid'];
					}
				}
			}
		}
		unset($accessible[$myid]);
		$secondaryUsers=GetUsersWhoHoursApprovedByMe();
		$result=array_merge($accessible,$secondaryUsers);
		return array_values($result);
	}
}

function GetUsersWhoHoursApprovedByMe()
{
    global $db;
    global $myid;
    $users = $db->smartQuery(array(
        'sql' => "
			SELECT userid
			FROM reportapprover 
			WHERE approverid = :userid",
        'par' => array('userid'=>$myid),
        'ret' => 'all'
    ));
    return array_column($users, 'userid');

}

function GetAccessibleCourses()
{
	global $db;
	global $me;
	global $myid;
	
	if($me['isAdmin'])
	{
		$courses = $db->smartQuery(array(
			'sql' => "SELECT courseid FROM `course`",
			'par' => array(),
			'ret' => 'all'
		));
	}
	else
	{
		$mySubStaff = getManagedUsers();
		array_push($mySubStaff, $myid);
		$params = array();
		//TODO - fix hardcoding of enrollmentroleid
		$sql = "
			SELECT c.courseid
			FROM
			enrollment AS e
			JOIN course AS c ON c.courseid=e.courseid
			WHERE 
			e.enrollmentroleid=2
			AND e.userid IN (";
		foreach ($mySubStaff AS $index=>$userid)
		{
			$sql.=":userid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($mySubStaff)-1)?",":"";
			//add coresponding parameter to the array
			$params['userid'.$index]=$userid;
		}
		$sql.=")";
		//fetch courses
		$courses = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $params,
			'ret' => 'all'
		));
	}
	//return indexed array (lose 'courseid' key wrap): [{'courseid':0},{'courseid':1}...]->[0, 1...]
	return array_column($courses, "courseid");
}
function GetMyStudents()
{
	global $db;
	global $Course;
	$myCourses = GetAccessibleCourses();
	$params = array();
	//TODO - fix hardcoding of enrollmentroleid
	$sql = "
		SELECT e.userid
		FROM enrollment AS e
		WHERE e.enrollmentroleid=1
		AND e.courseid IN (";
	foreach ($myCourses AS $index=>$courseid)
	{
		$sql.=":courseid".$index;
		//add a comma to seperate values, unless working on the last value
		$sql.=($index<count($myCourses)-1)?",":"";
		//add coresponding parameter to the array
		$params['courseid'.$index]=$courseid;
	}
	$sql.=")";
	//fetch students
	$students = $db->smartQuery(array(
		'sql' => $sql,
		'par' => $params,
		'ret' => 'all'
	));
	//return into indexed array (lose 'userid' key wrap): [{'userid':0},{'userid':1}...]->[0, 1...]
	return array_column($students, "userid");;
}
function arrayToTrees ($arr, $id, $parentid, $nestIn)
{
	$trees = array();
	$nestedArrs= array();
	foreach($arr as $index=>$val)
	{
		$nestedArrs[$val[$id]]=$val;
		$nestedArrs[$val[$id]][$nestIn]=array();
	}
	foreach($nestedArrs as $index=>&$val)
	{
		if($val[$parentid]!=null)
		{
			$nestedArrs[$val[$parentid]][$nestIn][] = &$nestedArrs[$index];
		}
	}
	foreach($nestedArrs as $index=>&$val)
	{
		if($val[$parentid]==null)
		{
			$trees[] = $val;
		}
	}
	return $trees;
}
	
function TreesToArray($arr, $trees, $parentid, $nestedIn, $idIndex, $parentIdIndex)
{
    foreach ($trees as $key => $node) {
		$node->$parentIdIndex=$parentid;
		$node->$idIndex=count($arr);
		$arr[] = $node;
        if (array_key_exists($nestedIn, $node)) {
            $arr = TreesToArray($arr, $node->$nestedIn, $node->$idIndex, $nestedIn, $idIndex, $parentIdIndex);
            unset($node->$nestedIn);
        }
    }
    return $arr;
}
function indexArrayByAttribute($arr, $attribute)
{
	$indexed = array();
	foreach($arr as $index=>$val)
	{
		if(isset($indexed[$val[$attribute]]))
		{
			throw new Exception('detected multiple items with the same id');
		}
		$indexed[$val[$attribute]]=$val;
	}
	return $indexed;
}
function indexObjectArrayByAttribute($arr, $attribute)
{
	$indexed = array();
	foreach($arr as $index=>$val)
	{
		if(isset($indexed[$val->$attribute]))
		{
			throw new Exception('detected multiple items with the same id');
		}
		$indexed[$val->$attribute]=$val;
	}
	return $indexed;
}
/**
 * takes a flat array, and produces an array of nested objects
 * @param arr - the array on which to perform the changes
 * @param groupBy - which field in the array should be used to destinguish between different objects
 * @param nestedObjectIndex - which index to use to identify a single nested object
 * @param nestedObjects - instructions on which properties to nest, and how to index the array
 * format: [{"nestBy":"arrayIndex", "fieldsToNest":["fieldIndex1"...]}...]
 * @return a nested array
 */
function nestArray($arr, $groupBy, $nestedObjects)
{
	if(!isset($arr)||!isset($groupBy)||!isset($nestedObjects))
	{
		throw new Exception('Bad Input');
		return $arr;
	}
	$afterNesting = array();
	foreach($arr as $row)
	{
		if(!isset($afterNesting[$row[$groupBy]]))
		{
			$afterNesting[$row[$groupBy]] = $row; 
		}
		foreach($nestedObjects as $template)
		{
			if(!isset($afterNesting[$row[$groupBy]][$template['nestIn']]))
			{
				$afterNesting[$row[$groupBy]][$template['nestIn']] = array();
			}
			$nestedProperties = array();
			foreach($template['fieldsToNest'] as $nestedField)
			{
				if(isset($row[$nestedField]))
					$nestedProperties[$nestedField]=$row[$nestedField];
				if(isset($afterNesting[$row[$groupBy]][$nestedField]))
					unset($afterNesting[$row[$groupBy]][$nestedField]);
			}
			if ($row[$template['nestBy']]!=null)
				$afterNesting[$row[$groupBy]][$template['nestIn']][$row[$template['nestBy']]]=$nestedProperties;
		}
	}
	//lose redundant keys in nested objects aaray
	foreach ($afterNesting AS $rowIndex=>$row)
	{
		foreach ($nestedObjects AS $nestedObject)
		{
			$afterNesting[$rowIndex][$nestedObject['nestIn']]=array_values($row[$nestedObject['nestIn']]);
		}
	}
	return array_values($afterNesting);
}
function cutPage($results, $resultsIndex, $page)
{
	$ITEMS_PER_PAGE=15;
	$pages = max(0,floor((count($results)-1)/$ITEMS_PER_PAGE));
	$currPageResults = array_slice($results, $page*$ITEMS_PER_PAGE, $ITEMS_PER_PAGE);
	return array($resultsIndex=>$currPageResults, 'pages'=>$pages);
}
function checkPassword($pwd) {
	//check that the length of the password is above the minimum length
	if (strlen($pwd) < 12) {
		return array("error"=>"password must be at least 12 characters");
	}
	//check that the password contains at least 2 of the three content conditions
	$metConditions=0;
	//check whether the password contains digits
	if (!preg_match("/.*[0-9]+.*/", $pwd)) {
		$metConditions++;
	}
	//check whether the password contains both upper
	if( !preg_match("/.*[a-z]+.*/", $pwd) || !preg_match("/.*[A-Z]+.*/", $pwd) ) {
		$metConditions++;
	}
	//check whether the password contains special symbols
	if( !preg_match("/.*\W+.*/", $pwd) ) {
		$metConditions++;
	}    
	
	if($metConditions>=2)
	{
		return array("error"=>"Password must include at least two of the following: digits, symbols, both upper and lowercase letters");
	}
	else
	{
		return true;
	}
}

function containsDuplicates ($arr){
	$dupe_array = array();
	foreach ($arr as $val) {
		if (isset($dupe_array[$val])) {
			return true;
		}
		$dupe_array[$val]=1;
	}
	return false;
}