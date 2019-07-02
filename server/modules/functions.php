<?php
define ('SERVERROOT',__DIR__);
date_default_timezone_set('UTC');
require(SERVERROOT."/XLSXReader.php");
require SERVERROOT."/config.php";
require SERVERROOT."/db.php";
require_once(SERVERROOT."/modules/Student.php");
//require_once("modules/User.php");
//require_once("modules/UserSession.php");
require_once(SERVERROOT."/modules/CheckStudent.php");
require_once(SERVERROOT."/modules/Lesson.php");
require_once(SERVERROOT."/modules/Question.php");
require_once(SERVERROOT."/modules/Course.php");
require_once(SERVERROOT."/modules/AppUser.php");
require_once(SERVERROOT."/modules/Staff.php");
require_once(SERVERROOT."/modules/Language.php");
require_once(SERVERROOT."/modules/Gender.php");
require_once(SERVERROOT."/modules/Religion.php");
require_once(SERVERROOT."/modules/City.php");
require_once(SERVERROOT."/modules/Project.php");
require_once(SERVERROOT."/modules/YearBudget.php");
require_once(SERVERROOT."/modules/Reporter.php");
require_once(SERVERROOT."/modules/Subjectreport.php");
require_once(SERVERROOT."/modules/Studentstatus.php");
require_once(SERVERROOT."/modules/Salarycode.php");
require_once(SERVERROOT."/modules/Clientcode.php");
require_once(SERVERROOT."/modules/Profile.php");
require_once(SERVERROOT."/modules/Statistic.php");
require_once(SERVERROOT."/modules/Profession.php");
require_once(SERVERROOT."/modules/Certificate.php");
require_once(SERVERROOT."/modules/permissions.php");
require_once(SERVERROOT."/modules/FireBaseFCM.php");

$db = new Db($conf->DB->host,$conf->DB->DBName,$conf->DB->userName,$conf->DB->pass,$conf->DB->logError);


$FireBaseFCM = new FireBaseFCM();
$Staff = new Staff();
$Student = new Student();
$Statistic = new Statistic();
//$User = new User();
//$UserSession = new UserSession();
$CheckStudent = new CheckStudent();
$Lesson = new Lesson();
$Question = new Question();
$Course = new Course();
$AppUser = new AppUser();
$Language = new Language();
$Gender = new Gender();
$Religion = new Religion();
$City = new City();
$Profession = new Profession();
$Certificate = new Certificate();
$Project = new Project();
$YearBudget = new YearBudget();
$Reporter = new Reporter();
$Subjectreport = new Subjectreport();
$Studentstatus = new Studentstatus();
$Salarycode = new Salarycode();
$Clientcode = new Clientcode();
$Profile = new Profile();
$permissions = new permissions();




function UploadStudentsFile($file)
{
	global $Student;
	$studentsCSV = array();
	$xlsx = new XLSXReader($file['tmp_name'][0]);
	$sheetNames = $xlsx->getSheetNames();
	foreach($sheetNames as $sheetName) 
	{
		$sheet = $xlsx->getSheet($sheetName);
		$sheetRows = $sheet->getData();
		$index=0;
		foreach($sheetRows as $sheetRow) 
		{
			if($index!=0)
			{
				$studentsCSV[] =  $sheetRow;
			}
			$index++;
		}
	}
	$result = $Student->UpdateStudents($studentsCSV);
	return $result;
}

	function uploadDoc($file){
        $maxsize=5000000; //1MB
        $acceptable = array(
            'doc',
            'docx',
            'pdf',
            'jpg',
            'gif',
            'png',
        );
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        if(($file['size'] >= $maxsize) || ($file["size"] == 0)) {
            return array("error" => "file size too big", "size" =>$file['size']);
        }
        if(!in_array($ext, $acceptable)) {
            return array("error" => "Invalid file type. Only doc, docx, pdf, JPG, GIF and PNG types are accepted.");
        }
        if($file["error"]==0){
            $temp = explode(".", $file["name"]);
            $extension = end($temp);
            $fileName="data/images/".round(microtime(true) * 1000).".".$extension;
            move_uploaded_file($file["tmp_name"],"../".$fileName);
            //amazon_s3_upload($fileName);
            return array("fileUrl" => $fileName);
        }
        return array("error" => "file upload error");
    }
	
	function UploadSyllabusFile($file)
	{
		global $Student;
		$studentsCSV = array();
		$xlsx = new XLSXReader($file['tmp_name'][0]);
		$sheetNames = $xlsx->getSheetNames();
		foreach($sheetNames as $sheetName) 
		{
			$sheet = $xlsx->getSheet($sheetName);
			$sheetRows = $sheet->getData();
			$index=0;
			$subjects = array();
			foreach($sheetRows as $key1=>$sheetRow) 
			{
				//if($key1>0)
				//{
					$key1 = $key1*2;
				//}
				if($key1+1 < count($sheetRows)){
					foreach($sheetRow as $key2=>$cell)
					{
						if(isset($cell) && $cell!="")
						{
							if($key2==0)
							{
								$subjects[$key1]["id"] = $key1/2;
								$subjects[$key1]["subject"] = $sheetRows[$key1][$key2];
								$subjects[$key1]["subjectinarabic"] = $sheetRows[$key1+1][$key2];
							}else
							{
								if(isset($sheetRows[$key1][$key2]) && $sheetRows[$key1][$key2]!="")
								{
									$subjects[$key1]["subsubjects"][$key2-1]["subsubject"] =  $sheetRows[$key1][$key2];
									$subjects[$key1]["subsubjects"][$key2-1]["subsubjectinarabic"] = $sheetRows[$key1+1][$key2];
								}
							}
						}
					}
				}
			}
		}
		return $subjects;
	}
	
	
	function GetMyStaffs()
	{
		global $db;
		global $me;
		global $myid;
		$staffid = $myid;
		$staffs = array();
		
		if($me['type']=='admin')
		{
			$rows = $db->smartQuery(array(
			'sql' => "Select staffid FROM staff where staffid<>:staffid",
			'par' => array('staffid'=>$staffid),
			'ret' => 'all'
			));
			
			foreach($rows as $row)
			{
				$staffs[] = $row['staffid'];
			}
			return $staffs;
		}else
		{
			$rows = $db->smartQuery(array(
				'sql' => "Select staffid FROM staff where superstaffid=:superstaffid",
				'par' => array('superstaffid'=>$staffid),
				'ret' => 'all'
			));
			
			foreach($rows as $row)
			{
				$staffs[] = $row['staffid'];
			}
			return $staffs;
		}
	}
	
	
	function GetMyUnderStaffs()
	{
		global $db;
		global $me;
		global $myid;
		$staffid = $myid;
		$staffs = array();
		if($me['type']=='admin')
		{
			$rows = $db->smartQuery(array(
			'sql' => "Select staffid FROM staff where staffid<>:staffid",
			'par' => array('staffid'=>$myid),
			'ret' => 'all'
			));
			
			foreach($rows as $row)
			{
				$staffs[] = $row['staffid'];
			}
			return $staffs;
		}else
		{
			$tree = GetTree($staffs, $staffid,$myid);
			return $tree;
		}
	}
	
	function GetTree($staffs, $staffid,$myid)
	{
		global $db;
		$rows = $db->smartQuery(array(
			'sql' => "Select staffid FROM staff where superstaffid=:superstaffid and superstaffid<>0",
			'par' => array('superstaffid'=>$staffid),
			'ret' => 'all'
		));
		
		foreach($rows as $row)
		{
			$staffs[] = $row['staffid'];
			if($row['staffid']!=$myid)
			$staffs = GetTree($staffs, $row['staffid'],$myid);
		}
		return $staffs;
	}
	
	
	function SaveCoursesCodecombinations()
	{
		global $db;
		$chars1 = array('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K', 'L','M','N','O','P','Q','R','S','T','U','V','W','X ','Y','Z');
		$chars2 = array('7','E','F','3','4','5','M','N','O','Y','9','0','J','K', 'L','V','W','X');
		$chars3 = array('G','H','I','S','T','U','1','2','A','B','C','P','Q','R','Z','6','7','8');
		$chars4 = array('9','0','J','K', 'L','V','W','X','3','4','5','D','E','F','M','N','O','Y');
		
		$combinations = combinations(array($chars1, $chars2, $chars3, $chars4));
		
		$codes = "";
		$index=1;
		for($i=170001; $i<count($combinations);$i++)//$i=0//50001//90001//130001//170001
		{
			if($i>210000)//50000//90000//130000//170000//210000
			{
				$index = $i;
				break;
			}
			$codes = $codes . "('".$combinations[$i][0] . $combinations[$i][1] . $combinations[$i][2] . $combinations[$i][3]."'), ";
		}
		$codes = rtrim($codes, ", ");
		
		$db->smartQuery(array(
					'sql' => "insert into codes (`code`)values $codes",
					'par' => array()
		));
		
		print_r($index);
		return true;
		
		/*$chars = array('1','S','T','U','V','W','X ','Y','Z');
		$output = sampling($chars, 4);*/
	}
	
	function combinations($arrays, $i = 0) {
    if (!isset($arrays[$i])) {
        return array();
    }
    if ($i == count($arrays) - 1) {
        return $arrays[$i];
    }

    // get combinations from subsequent arrays
    $tmp = combinations($arrays, $i + 1);

    $result = array();

    // concat each array from tmp with each element from $arrays[$i]
    foreach ($arrays[$i] as $v) {
        foreach ($tmp as $t) {
            $result[] = is_array($t) ? 
                array_merge(array($v), $t) :
                array($v, $t);
        }
    }

    return $result;
}
 

 /*function encrypt($decrypted_string)
 {
	$encrypted_string = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, '413e58d5f358ced6b774a418d9d7fee0', $decrypted_string, MCRYPT_MODE_CBC, 'b93fe262422c8ce4');
	return $encrypted_string;
 }*/
 
/* function decrypt($encrypted_string)
 {
	$decrypted_string = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, '413e58d5f358ced6b774a418d9d7fee0', $encrypted_string, MCRYPT_MODE_CBC, 'b93fe262422c8ce4');
	return trim($decrypted_string, "\0");
 }*/
	
	/*
	function GetTreePermissions()
	{
		global $db;
		global $AppUser;
		 
		$rows = $db->smartQuery(array(
			'sql' => "Select staffid,superstaffid FROM staff",
			'par' => array(),
			'ret' => 'all'
		));
		$tree = buildTree($rows);
		
		$User = $AppUser->GetLoginUser();
		$staffid = $User['appuserid'];
		
		$element = getChildById($tree, $staffid);
		
		return $element;
	}
	
	function buildTree(array $elements, $parentId = 0) {
    $branch = array();

    foreach ($elements as $element) {
        if ($element['superstaffid'] == $parentId) {
            $children = buildTree($elements, $element['staffid']);
            if ($children) {
                $element['children'] = $children;
            }
            $branch[] = $element;
        }
    }

    return $branch;
}

	 function getChildById($root, $id){
		foreach ($root as $node){
			
			if ($node['staffid']==$id) return $node;
			if(isset($node['children']))
				{
					$found = getChildById($node['children'], $id);
				}else
				{
					$found =null;
				}
					if ($found) return $found;
				}         
	} 
	
	function GetChildPermissions()
	{
		global $AllMyChild;
		$child = array();
		$children = $AllMyChild['children'];
		if(isset($children))
		foreach($children as $ch)
		{
			$child[] = $ch['staffid'];
		}
		return $child;
	}

	*/

