<?php
class Staff{
	function DeleteStaff($staffid)
	{
		global $db;
		$result = $db->smartQuery(array(
		'sql' => "delete from `staff_language` where staffid=:staffid;",
		'par' => array('staffid' => $staffid),
		'ret' => 'result'
		));
				
		$result = $db->smartQuery(array(
		'sql' => "delete from `staff` where staffid=:staffid;",
		'par' => array('staffid' => $staffid),
		'ret' => 'result'
		));
		
		$result = $db->smartQuery(array(
		'sql' => "delete from `appuser` where appuserid=:staffid;",
		'par' => array('staffid' => $staffid),
		'ret' => 'result'
		));
		
		return $result;
	}
	function AddUser($data)
	{
		global $db;
		global $User;
		$firstname = $data->firstname;
		$lastname = $data->lastname;
		$firstnameinarabic = $data->firstnameinarabic;
		$lastnameinarabic = $data->lastnameinarabic;
		$tznumber = $data->tznumber;
		$phone = $data->phone;
		$adress = $data->adress;
		$birthday = $data->birthday;
		$genderid = $data->genderid;
		$religionid = $data->religionid;
		$cityid = $data->cityid;
		$email = $data->email;
		$managerid = $data->managerid;
		$type = $data->type;
		$password = $data->password;
		$image = $data->image;
		$status = $data->status;
		
		$languages = $data->languages;
		$professions = $data->professions;
		$certificates = $data->certificates;
		$reportSubjects = $data->reportSubjects;
        $registerdate =  date('Y-m-d H:i:s', time());

		if($birthday!='')
		{
			$pieces = explode("/", $birthday);
			if(count($pieces)>2)
			$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
		}
		$passwordErrorCheck = checkPassword($password);
		
		if($passwordErrorCheck!==true)
		{
			return $passwordErrorCheck;
		}
		if($User->getUserIdByEmail($email)!=null)
		{
			return (object)array("error"=>"email already exists");
		}
		if($User->GetUserIdByTz($tznumber))
		{
			return (object)array("error"=>"tz exist in the system");
		}

		$password = hash('sha256', $password);

		$staffid = $db->getUUID();

		$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `staff` (staffid,`firstname`,`firstnameinarabic`, `lastname`,`lastnameinarabic`,`tznumber`,`phone`,`adress`,`birthday`, `genderid`, `religionid`, `email`, `managerid`, `type`,`registerdate`,`image`,`status`,`cityid`) VALUES (:staffid,:firstname,:firstnameinarabic, :lastname,:lastnameinarabic, :tznumber, :phone,:adress,:birthday, :genderid, :religionid, :email, :managerid, :type, :registerdate, :image, :status, :cityid);",
				'par' => array('firstname' => $firstname,'staffid' => $staffid,'firstnameinarabic' => $firstnameinarabic,'lastname' => $lastname,'lastnameinarabic' => $lastnameinarabic,'tznumber' => $tznumber,'phone' => $phone,'adress'=>$adress,'birthday'=>$birthday, 'genderid' => $genderid, 'religionid' => $religionid, 'email' => $email, 'managerid' => $managerid, 'type' => $type, 'registerdate' => $registerdate, 'image' => $image, 'status' => $status, 'cityid' => $cityid),
				'ret' => 'result'
			));

		$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `appuser` (`appuserid`, `email`,`password`,`type`, `needacceptregister`,`logintimestamp`, `passtry`) VALUES (:appuserid, :email, :password, :type, '', 0, 0);",
			'par' => array('appuserid' => $staffid,'email' => $email,'password' => $password,'type' => $type),
			'ret' => 'result'
		));
		foreach($languages as $language)
		{
			$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `staff_language` (`languageid`, `staffid`) VALUES (:languageid, :staffid);",
			'par' => array('languageid' => $language,'staffid' => $staffid),
			'ret' => 'result'
			));
		}				
		foreach($professions as $professionid)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `staff_profession` (`professionid`, `staffid`) VALUES (:professionid, :staffid);",
				'par' => array('professionid' => $professionid,'staffid' => $staffid),
				'ret' => 'result'
				));
		}
		
		foreach($certificates as $certificateid)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `staff_certificate` (`certificateid`, `staffid`) VALUES (:certificateid, :staffid);",
				'par' => array('certificateid' => $certificateid,'staffid' => $staffid),
				'ret' => 'result'
			));
		}

		foreach($reportSubjects as $reportSubject)
		{
			//TODO: this calls the DB repeatedly - could be optimized into 2 queries - one for edits, one for inserts
			 $this->SaveStaffReport($reportSubject,$staffid);
		}
		return (object)array("staffid"=>$staffid);
	}
	function SaveStaffReport($reportSubject, $staffid)
	{
		global $db;
		$id = $reportSubject->reportsubjectid;
		$status = $reportSubject->reportSubjectStatus;
		$proid = $reportSubject->projectid;
		$subid = $reportSubject->subjectreportid;
		$clid = $reportSubject->clientcodeid;
		
		//if the combination is active, open up rows that use it for editing and approval (retroactively)
		if($status==1)
		$this->UpdateReportHoursStaff($staffid,$subid,$proid);
		
		if($id!='')
		{
			//if the row came with an id, update appropriately (under the restriction that the staff associated with the data can't change
			$result = $db->smartQuery(array(
				'sql' => "UPDATE `staffreportsubject`
				SET
					status=:status,
					clientcodeid=:clientcodeid,
					subjectreportid=:subjectreportid,
					projectid=:projectid
				WHERE
					reportsubjectid=:reportsubjectid
					AND staffid = :staffid",
				'par' => array( 'staffid' => $staffid, 'status' => $status, 'clientcodeid' => $clid, 'subjectreportid' => $subid, 'projectid' => $proid, 'reportsubjectid' => $id),
				'ret' => 'result'
			));
		}else
		{
			//if no id is present, i.e. the combination is new, insert it into the table
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `staffreportsubject`
				(`staffid`,`clientcodeid`,`subjectreportid`,`projectid`,`status`)
				VALUES
				(:staffid, :clientcodeid, :subjectreportid, :projectid, :status);",
				'par' => array( 'staffid' => $staffid, 'clientcodeid' => $clid, 'subjectreportid' => $subid, 'projectid' => $proid, 'status' => $status),
				'ret' => 'result'
			));
		}
		
		return $result;
	}
	function UpdateReportHoursStaff($staffid,$subid,$proid)
	{
		global $db;
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `report` SET status='' WHERE staffid=:staffid AND projectid=:projectid AND status='specialapproval' AND actionid=:actionid",
			'par' => array( 'actionid' => $subid,'staffid' => $staffid, 'projectid' => $proid),
			'ret' => 'result'
		));
		
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `reportcopy` SET status='' WHERE staffid=:staffid AND projectid=:projectid AND status='specialapproval' AND actionid=:actionid",
			'par' => array( 'actionid' => $subid,'staffid' => $staffid, 'projectid' => $proid),
			'ret' => 'result'
		));
	}
	function UpdateUser($data)
	{
		global $db;
		global $User;
		$staffid = $data->staffid;
		$firstname = $data->firstname;
		$lastname = $data->lastname;
		$firstnameinarabic = $data->firstnameinarabic;
		$lastnameinarabic = $data->lastnameinarabic;
		$tznumber = $data->tznumber;
		$phone = $data->phone;
		$adress = $data->adress;
		$birthday = $data->birthday;
		$genderid = $data->genderid;
		$religionid = $data->religionid;
		$cityid = $data->cityid;
		$email = $data->email;
		$managerid = $data->managerid;
		$type = $data->type;
		$image = $data->image;
		$status = $data->status;
		
		$languages = $data->languages;
		$professions = $data->professions;
		$certificates = $data->certificates;
		$reportSubjects = $data->reportSubjects;
        $registerdate =  date('Y-m-d H:i:s', time());

		if($birthday!='')
		{
			$pieces = explode("/", $birthday);
			if(count($pieces)>2)
			$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
		}
		$useridByTz = $User->GetUserIdByTz($tznumber);
		if($useridByTz&&$useridByTz!=$staffid)
		{
			return (object)array("error"=>"tz exist in the system");
		}
		$useridByEmail = $User->getUserIdByEmail($email);
		if($useridByEmail&&$useridByEmail!=$staffid)
		{
			return (object)array("error"=>"email exist in the system");
		}

		$result = $db->smartQuery(array(
			'sql' => "UPDATE `staff` SET status=:status, cityid=:cityid, firstname=:firstname, firstnameinarabic=:firstnameinarabic, lastname=:lastname, lastnameinarabic=:lastnameinarabic, tznumber=:tznumber, phone=:phone, adress=:adress, birthday=:birthday, genderid=:genderid, religionid=:religionid, email=:email, managerid=:managerid, type=:type, registerdate=:registerdate, image=:image, cityid=:cityid  WHERE staffid=:staffid;",
			'par' => array('firstname' => $firstname,'cityid' => $cityid,'status' => $status,'firstnameinarabic' => $firstnameinarabic,'lastname' => $lastname,'lastnameinarabic' => $lastnameinarabic,'tznumber' => $tznumber,'phone' => $phone,'adress'=>$adress,'birthday'=>$birthday, 'genderid' => $genderid, 'religionid' => $religionid, 'email' => $email, 'managerid' => $managerid, 'type' => $type, 'registerdate' => $registerdate, 'image' => $image, 'staffid' => $staffid, 'cityid' => $cityid),
			'ret' => 'result'
		));
		
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `appuser` SET email=:email, type=:type WHERE appuserid=:appuserid;",
			'par' => array('appuserid' => $staffid,'email' => $email,'type' => $type),
			'ret' => 'result'
		));

		$result = $db->smartQuery(array(
			'sql' => "
				DELETE FROM `staff_language` WHERE staffid=:staffid;
				DELETE FROM `staff_profession` WHERE staffid=:staffid;
				DELETE FROM `staff_certificate` WHERE staffid=:staffid;",
			'par' => array('staffid' => $staffid),
			'ret' => 'result'
		));

		foreach($languages as $language)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `staff_language` (`languageid`, `staffid`) VALUES (:languageid, :staffid);",
				'par' => array('languageid' => $language,'staffid' => $staffid),
				'ret' => 'result'
			));
		}

		foreach($professions as $professionid)
		{
			$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `staff_profession` (`professionid`, `staffid`) VALUES (:professionid, :staffid)
				ON DUPLICATE KEY 
				UPDATE professionid=:professionid,staffid=:staffid;",
			'par' => array('professionid' => $professionid,'staffid' => $staffid),
			'ret' => 'result'
			));
		}

		foreach($certificates as $certificateid)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `staff_certificate` (`certificateid`, `staffid`) VALUES (:certificateid, :staffid)
					ON DUPLICATE KEY 
					UPDATE certificateid=:certificateid,staffid=:staffid;",
				'par' => array('certificateid' => $certificateid,'staffid' => $staffid),
				'ret' => 'result'
			));
		}

		foreach($reportSubjects as $reportSubject)
		{
			 $this->SaveStaffReport($reportSubject,$staffid);
		}
		
		return (object)array("staffid"=>$staffid);
	}
	function GetStaffById($id)
	{
		global $db;
		$staff = $db->smartQuery(array(
			'sql' => "SELECT * FROM staff where staffid=:staffid",
			'par' => array('staffid'=>$id),
			'ret' => 'all'
		));
		if(isset($staff[0]))
		{
			$gender = $db->smartQuery(array(
			'sql' => "Select * FROM gender where genderid=:genderid",
			'par' => array('genderid'=>$staff[0]['genderid']),
			'ret' => 'fetch-assoc'
			));
			if(isset($gender['name']))
			{
				$staff[0]['genderid'] = $gender['name'];
			}else
			{
				$staff[0]['genderid'] = "";
			}
		}
		if(isset($staff[0]))
		{
			return $staff[0];
		}else
		{
			return array();
		}
	}
	function GetUserProfileById($id)
	{
		global $db;
		$staff = $db->smartQuery(array(
				'sql' => "
				SELECT s.*, manager.staffid AS managerid, CONCAT(manager.firstname, ' ', manager.lastname) AS superstaffname , sc.certificateid AS certificateid, sl.languageid, sp.professionid,
				srs.reportsubjectid, srs.clientcodeid, srs.subjectreportid, srs.projectid, srs.status AS reportSubjectStatus
				FROM staff AS s
				LEFT JOIN staff_certificate AS sc ON sc.staffid = s.staffid
				LEFT JOIN staff_language AS sl ON sl.staffid = s.staffid
				LEFT JOIN staff_profession AS sp ON sp.staffid = s.staffid
				LEFT JOIN staffreportsubject AS srs ON srs.staffid = s.staffid
				LEFT JOIN staff AS manager ON manager.staffid = s.managerid
				WHERE
					s.staffid=:staffid",
				'par' => array('staffid'=>$id),
				'ret' => 'all'
		));
		//nest certificates, languages, professions,report subjects 
		$staff = nestArray(
		$staff, 'staffid',
		array(
			array('nestBy'=>'certificateid', 'nestIn'=>'certificates', 'fieldsToNest'=>array('certificateid')),
			array('nestBy'=>'languageid', 'nestIn'=>'languages', 'fieldsToNest'=>array('languageid')),
			array('nestBy'=>'professionid', 'nestIn'=>'professions', 'fieldsToNest'=>array('professionid')),
			array('nestBy'=>'reportsubjectid', 'nestIn'=>'reportSubjects', 'fieldsToNest'=>array('reportsubjectid', 'clientcodeid', 'subjectreportid', 'projectid', 'reportSubjectStatus'))
		));
		if(isset($staff[0]))
		{
			$staff[0]['certificates'] = array_column($staff[0]['certificates'], 'certificateid');
			$staff[0]['languages'] = array_column($staff[0]['languages'], 'languageid');
			$staff[0]['professions'] = array_column($staff[0]['professions'], 'professionid');
			$staff[0]["birthday"]=date("d/m/Y", strtotime($staff[0]["birthday"]));
			$staff[0]["status"]=$staff[0]["status"]==1?true:false;
			return $staff[0];
		}
		else
		{
			return null;
		}
	}
	function GetCoursesTaughtByUser($staffid)
	{
		global $db;
		return $db->smartQuery(array(
			'sql' => "SELECT
			CONCAT(c.name, ' (', p.name, ')') AS name,
			c.courseid AS courseid
			FROM course AS c
			JOIN project AS p ON c.projectid=p.projectid
			WHERE c.madrichid=:staffid
			AND c.status=1",
			'par' => array('staffid'=>$staffid),
			'ret' => 'all'
		));
	}
	function GetManagedUsersByUserId($staffid)
	{
		global $db;
		$substaffids = getAccessibleStaff($staffid);
		$params = array();
		$sql = "
			SELECT
				s.staffid AS staffid,
				CONCAT(s.firstname, ' ', s.lastname) AS name
			FROM `staff` AS s
			WHERE
				`status`=1
				AND `managerid` LIKE :staffid";
		//fetch staff
		return $db->smartQuery(array(
				'sql' => $sql,
				'par' => array('staffid'=>$staffid),
				'ret' => 'all'
		));
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
	 * "staff":
	 * [{
	 * "staffid,
	 * "firstname","lastname",
	 * "firstnameinarabic","lastnameinarabic",
	 * "tznumber", "phone",
	 * "birthday",
	 * "email",
	 * "cityname","gendername","religionname"
	 * }],
	 * pages:208
	 * }
	 */
	function SearchUsers($search, $sorting, $desc, $userstatus, $page)
	{
		global $db;
		$ITEMS_PER_PAGE=15;
		$sortByField='staffid';
		//permit only certain ORDER BY values to avoid injection
		in_array($sorting, array(
				'firstname', 'lastname', 'firstnameinarabic', 'lastnameinarabic',
				'tznumber', 'phone', 'birthday', 'email', 'cityname'
		), true)?$sortByField=$sorting:'';
		$sortingDirection = $desc?"DESC":"ASC";
		//get the ids of student the user is allowed to access
		$mySubStaff = getManagedUsers();
		if(count($mySubStaff)==0)
		{
			$ans = array('staff'=>array(), 'pages'=>0);
			return $ans;
		}
		//construct a query template which includes all of the student ids
		//and populate the parameter array with the ids themselves
		$params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
		$sql = "
			SELECT
				s.staffid, s.firstname, s.lastname, s.firstnameinarabic, s.lastnameinarabic, s.tznumber, s.phone, s.birthday, s.email,
				city.name AS cityname, gender.name AS gendername, religion.name AS religionname
			FROM `staff` AS s
			LEFT JOIN gender AS gender ON gender.genderid = s.genderid
			LEFT JOIN religion AS religion ON religion.religionid = s.religionid
			LEFT JOIN city AS city ON city.cityid = s.cityid
			WHERE
				`status`=:status
				AND `staffid` IN (";
		foreach ($mySubStaff AS $index=>$sid)
			{
			$sql.=":staffid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($mySubStaff)-1)?",":"";
			//add coresponding parameter to the array
			$params['staffid'.$index]=$sid;
			}
		$sql.=")
			AND CONCAT(`firstname`,' ',`lastname`,' ',`firstnameinarabic`,' ',`lastnameinarabic`,' ',`tznumber`,' ',IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ',`email`, ' ', IFNULL(city.name, '')) LIKE :search
			ORDER BY ".$sortByField." ".$sortingDirection;
		//fetch staff
		$staff = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
		));
		return cutPage($staff, 'staff', $page);;
	}
	/**
		 * Gets a list of search perimeters, and returns a list of staff according to said perimeters, filtered by
		 * whether or not the user who makes the request is authorized to view them,
		 * along side the number of pages filled by the full results set
		 * @param String $search - the search term to use
		 * @param String $sorting - based on which field to sort the results
		 * @param boolean $desc - whether to order the results in a descending order
		 * @param int $userstatus - which user status to filter by
		 * @param int $page - which page of the results to return
		 * @return results[]:
		 * {
		 * "staff":
		 * [{"staffid":1,"staffname":"atlas"}],
		 * pages:208
		 * }
		 */
	function SearchUserToAssignAsManager($search, $sorting, $desc, $userstatus, $page, $excludeids=null)
	{
		global $db;
		$ITEMS_PER_PAGE=15;
		$sortByField='staffid';
		$sortingDirection = $desc?"DESC":"ASC";
		//fetch staff
		$params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
		$sql =
		"SELECT s.staffid, CONCAT(s.firstname, ' ', s.lastname) AS staffname
		FROM `staff` AS s
		WHERE
			CONCAT(s.firstname, ' ', s.lastname) LIKE :search
			AND s.status = :status";
		if($excludeids!=null&&count($excludeids)>0)
		{
			$sql.=" AND s.staffid NOT IN (";
			foreach ($excludeids AS $index=>$esid)
			{
				$sql.=":excludeStaff".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($excludeids)-1)?",":"";
				//add coresponding parameter to the array
				$params['excludeStaff'.$index]=$esid;
			}
			$sql.=")";
		}
		$sql.=" ORDER BY s.firstname";
		//fetch students
		$staff = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
		));
		return cutPage($staff, 'staff', $page);
	}
	function UpdateActiveDate($date,$myid)
	{
		global $db;
		$result = $db->smartQuery(array(
					'sql' => "update `staff` set lastactivedate=:lastactivedate where staffid=:staffid;",
					'par' => array('lastactivedate' => $date, 'staffid' => $myid),
					'ret' => 'result'
				));
				
		return $result;
	}
	function UpdateUserProfilePic ($staffid, $image)
	{
		global $db;
		$result=$db->smartQuery(array(
				'sql' => "UPDATE `staff` SET `image`=:img WHERE `staffid`=:staffid",
				'par' => array('img' => $image, 'staffid' => $staffid),
				'ret' => 'result'
		));
		return true;
	}
	function GetStaffsByType($type)
	{
		global $db;
		$staffs = $db->smartQuery(array(
			'sql' => "SELECT * FROM staff WHERE type=:type ORDER BY CONCAT(staff.firstname, staff.lastname)",
			'par' => array('type'=>$type),
			'ret' => 'all'
		));
		
		return $staffs;
	}
	function batchUploadStaff($newStaff)
	{
		global $db;
		global $User;
		foreach($newStaff as $newStaffMember)
		{
			$tznumber = $newStaffMember[5];
			$email = $newStaffMember[0];
			$password = $newStaffMember[12];
			/*
			 if(!isset($tznumber) || $tznumber=="")
			 {
			 return (object)array("error"=>"tznumber is a required field for all students");
			 }*/
			$ErrorPassword = checkPassword($password);
			if($ErrorPassword!==true)
			{
				return (object)array("error"=>$ErrorPassword);
			}
			
			if(!isset($email) || !isset($password))
			{
				return (object)array("error"=>"email and password is a required field for all students");
			}
			
		}
		
		foreach($newStaff as $newStaffMember)
		{
			//$id = $newStaffMember[0];
			$email = $newStaffMember[0];
			$firstname = $newStaffMember[1];
			$firstnameinarabic = $newStaffMember[2];
			$lastname = $newStaffMember[3];
			$lastnameinarabic = $newStaffMember[4];
			$tznumber = $newStaffMember[5];
			$phone = $newStaffMember[6];
			$adress = $newStaffMember[7];
			$cityid = $newStaffMember[8];
			$birthday = $newStaffMember[9];
			$genderid= $newStaffMember[10];
			$religionid= $newStaffMember[11];
			$password = hash('sha256', $newStaffMember[12]);
			if($birthday!="")
			{
				$pieces = explode("/", $birthday);
				if(count($pieces)>2)
					$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
			}
			$staffid = $db->getUUID();
			$image = '';
			$status=1;
			$registerdate='2017-07-05 17:00:00';
			
			$user = $User->GetUserId($email,$password);
			if(isset($user))
			{
				return (object)array("error"=>"email and password already exist: not able to add new student with tznumber: ".$tznumber);
			}
			
			$result=$db->smartQuery(array(
					'sql' => "INSERT INTO `staff` (`staffid`,`firstname`,`firstnameinarabic`,`lastname`,`lastnameinarabic`,`tznumber`,`phone`, `adress`,`birthday`,`email`,`image`,`genderid`,`religionid`,`registerdate`,`status`,`cityid`,`type`) VALUES (:staffid,:firstname,:firstnameinarabic,:lastname,:lastnameinarabic,:tznumber,:phone,:adress,:birthday,:email,:image,:genderid,:religionid,:registerdate,:status,:cityid, :type)",
					'par' => array('firstname' => ''.$firstname,'staffid' => $staffid,'firstnameinarabic' => ''.$firstnameinarabic,'lastname' => ''.$lastname,'lastnameinarabic' => ''.$lastnameinarabic,'tznumber' => ''.$tznumber,'phone' => ''.$phone, 'adress' => ''.$adress,'birthday' => $birthday,'email' => ''.$email,'image' => ''.$image,'genderid' => ''.$genderid,'religionid' => ''.$religionid,'registerdate' => ''.$registerdate,'status' => ''.$status,'cityid' => ''.$cityid, 'type' => 'madrich'),
					'ret' => 'result'
			));
			
			//$Studentid=$db->getLastInsertId();
			
			$result=$db->smartQuery(array(
					'sql' => "INSERT INTO `appuser` (`appuserid`,`email`,`password`,`type`) VALUES (:appuserid,:email,:password,:type)",
					'par' => array('appuserid' => $staffid,'email' => ''.$email,'password' => ''.$password,'type' => 'madrich'),
					'ret' => 'result'
			));
		}
		return true;
	}
	function GetUserReportActivities($staffid=null)
	{
		global $db;
		global $myid;
		
		if(!isset($staffid))
		{
			$staffid=$myid;
		}
		
			$Actions = $db->smartQuery(array(
				'sql' => "Select subjectreportid,projectid FROM staffreportsubject where staffid=:staffid",
				'par' => array('staffid'=>$staffid),
				'ret' => 'all'
			));
			
			$subjects = array();
			foreach($Actions as $Action)
			{
				$subject = $db->smartQuery(array(
					'sql' => "Select subject FROM subjectreport where subjectreportid=:subjectreportid",
					'par' => array('subjectreportid'=>$Action['subjectreportid']),
					'ret' => 'fetch-assoc'
				));
				
				$Action['subject'] = $subject['subject'];
				$subjects[] = $Action; 
			}
		return $subjects;
	}
	
}