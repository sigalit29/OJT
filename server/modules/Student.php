<?php
class Student{
	function AddStudent($data)
	{
		global $db;
		global $User;
		$firstname = $data->firstname;
		$lastname = $data->lastname;
		$firstnameinarabic = $data->firstnameinarabic;
		$lastnameinarabic = $data->lastnameinarabic;
		$tznumber = $data->tznumber;
		$phone = $data->phone;
		$phone2 = $data->phone2;
		$phone2owner = $data->phone2owner;
		$adress = $data->adress;
		$birthday = $data->birthday;
		$genderid = $data->genderid;
		$religionid = $data->religionid;
		$email = $data->email;
		$password = $data->password;
		$image = $data->image;
		$status = $data->status;
		$cityid = $data->cityid;
		$notes= $data->notes;
		
		$ErrorPassword = checkPassword($password);
		if($ErrorPassword!==true)
		{
			return (object)array("error"=>$ErrorPassword);
		}
		$password = hash('sha256', $password);

		if($birthday!="")
		{
			$pieces = explode("/", $birthday);
			if(count($pieces)>2)
			$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
		}
		if($User->getUserIdByEmail($email)!=null)
		{
			return (object)array("error"=>"email already exists");
		}
		if($User->GetUserIdByTz($tznumber))
		{
			return (object)array("error"=>"tz exist in the system");
		}
		
		$studentid = $db->getUUID();
		$registerdate =  date('Y-m-d H:i:s', time());
		
		$result=$db->smartQuery(array(
			'sql' => "
				INSERT INTO `student`
					(
					`studentid`,`email`,
					`registerdate`,`status`,
					`firstname`,`firstnameinarabic`,
					`lastname`,`lastnameinarabic`,
					`tznumber`,`phone`,`phone2`,`phone2owner`,`adress`,`birthday`,
					`image`,`notes`,
					`genderid`,`religionid`,`cityid`
					)
				VALUES
					(
					:studentid, :email,
					:registerdate,:status,
					:firstname,:firstnameinarabic,
					:lastname,:lastnameinarabic,
					:tznumber,:phone,:phone2,:phone2owner,:adress,:birthday,
					:image,:notes,
					:genderid,:religionid,:cityid
					)",
			'par' => array('firstname' => ''.$firstname,'studentid' => $studentid,'firstnameinarabic' => ''.$firstnameinarabic,'lastname' => ''.$lastname,'lastnameinarabic' => ''.$lastnameinarabic,'tznumber' => ''.$tznumber,'phone' => ''.$phone,'phone2' => ''.$phone2,'phone2owner' => ''.$phone2owner,'adress' => ''.$adress,'birthday' => $birthday,'email' => ''.$email,'image' => ''.$image,'genderid' => ''.$genderid,'religionid' => ''.$religionid,'registerdate' => ''.$registerdate,'status' => ''.$status,'cityid' => ''.$cityid, 'notes' => ''.$notes),					
			'ret' => 'result'
		));
		
		$result=$db->smartQuery(array(
			'sql' => "INSERT INTO `appuser` (`appuserid`,`email`,`password`,`type`, `needacceptregister`,`logintimestamp`, `passtry`) VALUES (:appuserid,:email,:password,'student', '', 0, 0)",
			'par' => array('appuserid' => $studentid,'email' => ''.$email,'password' => ''.$password),					
			'ret' => 'result'
		));
		return (object)array("studentid"=>$studentid);
	}
	function UpdateStudent($data, $updatePassword)
	{
		global $db;
		global $User;
		$studentid = $data->studentid;
		$firstname = $data->firstname;
		$lastname = $data->lastname;
		$firstnameinarabic = $data->firstnameinarabic;
		$lastnameinarabic = $data->lastnameinarabic;
		$tznumber = $data->tznumber;
		$phone = $data->phone;
		$phone2 = $data->phone2;
		$phone2owner = $data->phone2owner;
		$adress = $data->adress;
		$birthday = $data->birthday;
		$genderid = $data->genderid;
		$religionid = $data->religionid;
		$email = $data->email;
		$password = isset($data->password)?$data->password:'';
		$image = $data->image;
		$status = $data->status;
		$cityid = $data->cityid;
		$notes= $data->notes;
		
		$userByEmail = $User->getUserIdByEmail($email);
		if($userByEmail!=$studentid)
		{
			return (object)array("error"=>"email already exists");
		}
		$userByTz = $User->GetUserIdByTz($tznumber);
		if($userByTz&&$userByTz!=$studentid)
		{
			return (object)array("error"=>"tz exist in the system");
		}
		
		if($updatePassword)
		{
			$ErrorPassword = checkPassword($password);
			if($ErrorPassword!==true)
			{
				return (object)array("error"=>$ErrorPassword);
			}
			$password = hash('sha256', $password);
		}
		
		if($birthday!="")
		{
			$pieces = explode("/", $birthday);
			if(count($pieces)>2)
			$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
		}
		$result=$db->smartQuery(array(
			'sql' => "
				UPDATE `student`
					SET
						`firstname`=:firstname,`firstnameinarabic`=:firstnameinarabic,
						`lastname`=:lastname,`lastnameinarabic`=:lastnameinarabic,
						`tznumber`=:tznumber,`phone`=:phone,`phone2`=:phone2,`phone2owner`=:phone2owner,`adress`=:adress,`birthday`=:birthday,
						`image`=:image, `notes`=:notes,
						`email`=:email,
						`genderid`=:genderid,`religionid`=:religionid,`cityid`=:cityid,
						`status`=:status
					WHERE
						`studentid`=:studentid",
				'par' => array('email' => $email, 'studentid' => $studentid, 'firstname' => ''.$firstname,'firstnameinarabic' => ''.$firstnameinarabic,'lastname' => ''.$lastname,'lastnameinarabic' => ''.$lastnameinarabic,'tznumber' => ''.$tznumber,'phone' => ''.$phone,'phone2' => ''.$phone2, 'phone2owner' => ''.$phone2owner, 'adress' => ''.$adress,'birthday' => $birthday,'image' => ''.$image, 'genderid' => $genderid,'religionid' => $religionid,'status' => $status,'cityid' => $cityid, 'notes' => $notes),
			'ret' => 'result'
			));
		if($updatePassword)
		{
			$result=$db->smartQuery(array(
			'sql' => "
				UPDATE `appuser`
					SET
						`email`=:email,
						`password`=:password
					WHERE
						`appuserid`=:appuserid",
			'par' => array('email' => ''.$email,'password' => ''.$password,'appuserid' => $studentid),
			'ret' => 'result'
			));
		}
		else
		{
			$result=$db->smartQuery(array(
			'sql' => "
				UPDATE `appuser`
					SET
						`email`=:email
					WHERE
						`appuserid`=:appuserid",
			'par' => array('email' => ''.$email, 'appuserid' => $studentid),
			'ret' => 'result'
			));
		}
		return (object)array("studentid"=>$studentid);
	}
	function UpdateStudents($newStudents){
		global $db;
		global $User;
		$emailsarr = array_column($newStudents, 8);
		if(containsDuplicates($emailsarr))
		{
			return (object)array("error"=>"can't upload multiple students with the same email");
		}
		foreach($newStudents as $newStudent)
		{
			$tznumber = $newStudent[4];
			$email = $newStudent[8];
			$password = $newStudent[10];
			/*
				if(!isset($tznumber) || $tznumber=="")
				{
				return (object)array("error"=>"tznumber is a required field for all students");
			}*/
			if(!isset($email) || !isset($password))
			{
				return (object)array("error"=>"email and password can't be empty");
			}
			
			$ErrorPassword = checkPassword($password);
			if($ErrorPassword!==true)
			{
				return (object)array("error"=>("invalid password encountered: ".$password." - ".$ErrorPassword));
			}
			if($User->getUserIdByEmail($email)!=null)
			{
				return (object)array("error"=>"the email address ".$email." already exists in the system");
			}
		}
		foreach($newStudents as $newStudent)
		{
			$firstname = $newStudent[0];
			$firstnameinarabic = $newStudent[1];
			$lastname = $newStudent[2];
			$lastnameinarabic = $newStudent[3];
			$tznumber = $newStudent[4];
			$phone = $newStudent[5];
			$adress = $newStudent[6];
			$birthday = $newStudent[7];
			$email = $newStudent[8];
			$password = hash('sha256', $newStudent[10]);
			$cityid = $newStudent[11];
			$image = '';
			$Studentid = $db->getUUID();
			$genderid='';
			$religionid='';
			$phone2='0';
			$status=1;
			$registerdate=date('Y-m-d H:i:s', time());
			
			$Studentid = $db->getUUID();
			
			$result=$db->smartQuery(array(
			'sql' => "INSERT INTO `student` (`studentid`,`firstname`,`firstnameinarabic`,`lastname`,`lastnameinarabic`,`tznumber`,`phone`,`phone2`,`adress`,`birthday`,`email`,`image`,`genderid`,`religionid`,`registerdate`,`status`,`cityid`) VALUES (:studentid,:firstname,:firstnameinarabic,:lastname,:lastnameinarabic,:tznumber,:phone,:phone2,:adress,:birthday,:email,:image,:genderid,:religionid,:registerdate,:status,:cityid)",
			'par' => array('firstname' => ''.$firstname,'studentid' => $Studentid,'firstnameinarabic' => ''.$firstnameinarabic,'lastname' => ''.$lastname,'lastnameinarabic' => ''.$lastnameinarabic,'tznumber' => ''.$tznumber,'phone' => ''.$phone,'phone2' => ''.$phone2,'adress' => ''.$adress,'birthday' => $birthday,'email' => ''.$email,'image' => ''.$image,'genderid' => ''.$genderid,'religionid' => ''.$religionid,'registerdate' => ''.$registerdate,'status' => ''.$status,'cityid' => ''.$cityid),					
			'ret' => 'result'
			));
							
			$result=$db->smartQuery(array(
			'sql' => "INSERT INTO `appuser` (`appuserid`,`email`,`password`,`type`) VALUES (:appuserid,:email,:password,:type)",
			'par' => array('appuserid' => $Studentid,'email' => ''.$email,'password' => ''.$password,'type' => 'student'),					
			'ret' => 'result'
			));
		}
		return true;
	}		
	function GetStudentById($id)
	{
		global $db;
		$student = $db->smartQuery(array(
		'sql' => "SELECT * FROM `student` WHERE `studentid` =:studentid",
		'par' => array('studentid'=>$id),
		'ret' => 'all'
		));
		if(isset($student[0]))
		{	
			return $student[0];
		}else
		{
			return null;
		}
	}
	function GetMyStudents()
	{
		global $db;
		global $me;
		global $myid;
		
		$type = $me['type'];
		
		if($type=='admin')
		{
			$students = $db->smartQuery(array(
			'sql' => "SELECT studentid FROM `student`",
			'par' => array(),
			'ret' => 'all'
			));
		}
		else
		{
			$mySubStaff = getManagedUsers();
			array_push($mySubStaff, $myid);
			$params = array();
			$sql = "
				SELECT s.studentid
				FROM student AS s
				JOIN student_course as sc ON sc.studentid = s.studentid
				JOIN course AS c ON sc.courseid = c.courseid
				WHERE c.madrichid IN (";
			foreach ($mySubStaff AS $index=>$staffid)
			{
				$sql.=":staffid".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($mySubStaff)-1)?",":"";
				//add coresponding parameter to the array
				$params['staffid'.$index]=$staffid;
			}
			$sql.=")";
			//fetch students
			$students = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
			));
		}
		//return into indexed array (lose 'studentid' key wrap): [{'studentid':0},{'studentid':1}...]->[0, 1...]
		return array_column($students, "studentid");;
	}
	/**
	 * Gets a list of search perimeters, and returns a list of students according to said perimeters, filtered by
	 * whether or not the user who makes the request is authorized to view them,
	 * along side the number of pages filled by the full results set
	 * @param String $search - the search term to use
	 * @param String $sorting - based on which field to sort the results
	 * @param boolean $desc - whether to order the results in a descending order
	 * @param int $userstatus - which user status to filter by
	 * @param int $page - which page of the results to return
	 * @return results[]:
	 * {
	 * "students":
	 * [{
	 * "studentid,
	 * "firstname","lastname",
	 * "firstnameinarabic","lastnameinarabic",
	 * "tznumber","phone",
	 * "birthday",
	 * "email",
	 * "cityname","gendername","religionname"
	 * }],
	 * pages:208
	 * }
	 */
	function SearchStudents($search, $sorting, $desc, $userstatus, $page)
	{
		global $db;
		$ITEMS_PER_PAGE=15;
		$sortByField='studentid';
		//permit only certain ORDER BY values to avoid injection
		in_array($sorting, array(
				'firstname', 'lastname', 'firstnameinarabic', 'lastnameinarabic',
				'tznumber', 'phone', 'birthday', 'email', 'cityname'
		), true)?$sortByField=$sorting:'';
		$sortingDirection = $desc?"DESC":"ASC";
		//get the ids of student the user is allowed to access
		$studentsids = $this->GetMyStudents();
		if(count($studentsids)==0)
		{
			$ans = array('students'=>array(), 'pages'=>0);
			return $ans;
		}
		//construct a query template which includes all of the student ids
		//and populate the parameter array with the ids themselves
		$params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
		$sql = "
			SELECT
				s.studentid, s.firstname, s.lastname, s.firstnameinarabic, s.lastnameinarabic, s.tznumber, s.phone, s.birthday, s.email,
				city.name AS cityname, gender.name AS gendername, religion.name AS religionname
			FROM `student` AS s
			LEFT JOIN gender AS gender ON gender.genderid = s.genderid
			LEFT JOIN religion AS religion ON religion.religionid = s.religionid
			LEFT JOIN city AS city ON city.cityid = s.cityid
			WHERE
				`status`=:status
				AND `studentid` IN (";
		foreach ($studentsids AS $index=>$sid)
		{
			$sql.=":studentid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($studentsids)-1)?",":"";
			//add coresponding parameter to the array
			$params['studentid'.$index]=$sid;
		}
		$sql.=")
			AND CONCAT(`firstname`,' ',`lastname`,' ',`firstnameinarabic`,' ',`lastnameinarabic`,' ',`tznumber`,' ', IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ',`email`, ' ', city.name) LIKE :search
			ORDER BY ".$sortByField." ".$sortingDirection;
		//fetch students
		$students = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
		));
		return cutPage($students, 'students', $page);
	}
	function GetStudentProfileById($id)
	{
		global $db;
		$student = $db->smartQuery(array(
		'sql' => "
			SELECT student.*, appuser.needacceptregister
			FROM `student` AS student
			JOIN appuser AS appuser ON appuser.appuserid=student.studentid
			WHERE
				`studentid`=:studentid",
		'par' => array('studentid'=>$id),
		'ret' => 'all'
		));
		if(isset($student[0]))
		{
			$student[0]["birthday"]=date("d/m/Y", strtotime($student[0]["birthday"]));
			$student[0]["status"]=$student[0]["status"]==1?true:false;
			return $student[0];
		}
		else
		{
			return null;
		}
	}
	function GetCoursesLearntByStudent($studentid)
	{
		global $db;
		return $db->smartQuery(array(
			'sql' => "
			SELECT
				CONCAT(c.name, ' (', p.name, ')') AS name,
				c.courseid AS courseid
			FROM student_course AS sc
            JOIN course AS c ON c.courseid = sc.courseid
			JOIN project AS p ON c.projectid=p.projectid
			WHERE sc.studentid LIKE :studentid AND c.status=1",
			'par' => array('studentid'=>$studentid),
			'ret' => 'all'
		));
	}
	function UpdateStudentProfilePic ($studentid, $image)
	{
		global $db;
		$result=$db->smartQuery(array(
		'sql' => "UPDATE `student` SET `image`=:img WHERE `studentid`=:studentid",
		'par' => array('img' => $image, 'studentid' => $studentid),
		'ret' => 'result'
		));
		return true;
	}
	function UpdateUserGender ($studentid, $genderid)
	{
		global $db;
		$result=$db->smartQuery(array(
		'sql' => "UPDATE `student` SET `genderid`=:gender WHERE `studentid`=:studentid",
		'par' => array('gender' => $genderid, 'studentid' => $studentid),
		'ret' => 'result'
		));
		return true;
	}
	function UpdateUserReligion ($studentid, $religionid)
	{
		global $db;
		$result=$db->smartQuery(array(
		'sql' => "UPDATE `student` SET `religionid`=:religion WHERE `studentid`=:studentid",
		'par' => array('religion' => $religionid, 'studentid' => $studentid),
		'ret' => 'result'
		));
		return true;
	}
	function UpdateActiveDate($studentid)
	{
		global $db;
		$lastactivedate = date('Y-m-d', time());
		$result=$db->smartQuery(array(
		'sql' => "UPDATE `student` SET `lastactivedate`=:lastactivedate WHERE `studentid`=:studentid",
		'par' => array('lastactivedate' => $lastactivedate, 'studentid' => $studentid),
		'ret' => 'result'
		));
		return $result;
	}
}