<?php
class Enrollment{
	function GetEnrolledUsersIds($courseid)
	{
		global $db;
		$userids = $db->smartQuery(array(
		'sql' => "SELECT userid FROM `enrollment` WHERE courseid=:courseid",
		'par' => array('courseid' => $courseid),
		'ret' => 'all'
		));
		return array_column($userids, "userid");
	}

	function GetActiveEnrollmentsInCourse($courseid)
	{
		global $db;
		$users = $db->smartQuery(array(
		'sql' => "
			SELECT *
			FROM `enrollment` AS e
			JOIN user_profile AS p ON e.userid = p.userid
			JOIN user AS u ON u.userid = p.userid
			WHERE e.courseid=:courseid AND e.status=1 AND u.status=1",
		'par' => array('courseid' => $courseid),
		'ret' => 'all'
		));
		return $users;
	}

    function GetEnrollmentTags()
    {
        global $db;
        $tags = $db->smartQuery(array(
            'sql' => "SELECT * FROM enrollmenttag where IsShow='1'",
            'par' => array(),
			'ret' => 'all'
        ));
        return $tags;
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
	 * "students":
	 * [{"studentid","studentinfo"}],
	 * pages:208
	 * }
	 */

	function SearchUsersToEnroll($courseid, $search, $sorting, $desc, $page)
	{
		global $db;
		//fetch unenrolled students
		$unenrolled = $db->smartQuery(array(
				'sql' =>
				"SELECT u.userid, CONCAT(u.firstname, ' ', u.lastname) AS userinfo
				FROM `user_profile` AS u
				JOIN user ON user.userid = u.userid
				WHERE
					CONCAT(u.firstname, ' ', u.lastname) LIKE :search
					AND user.status = 1
					AND u.userid NOT IN(
						SELECT userid
						FROM enrollment
						WHERE courseid=:courseid
					)",
				'par' => array('courseid'=>$courseid, 'search'=>'%'.$search.'%'),
				'ret' => 'all'
		));
		return cutPage($unenrolled, 'users', $page);
	}

	function GetCourseEnrollmentProfiles($courseid, $roleid, $page, $search)
	{
		global $db;
		//fetch enrolled users
		$enrolled = $db->smartQuery(array(
				'sql' => "
				SELECT
					u.userid, u.firstname, u.lastname, u.firstnameinarabic, u.lastnameinarabic, u.tznumber, u.phone, u.birthday, user.email, u.address,
					u.genderid, u.religionid, u.cityid, city.name AS cityname,
					e.status, e.enrollmenttagid, e.enrollmentid,e.enrollmentroleid,e.isPrimary,
					ecf.enrollment_field_id AS enrollmentFieldId, ecf.value AS enrollmentFieldValue
				FROM
				`user_profile` AS u
				JOIN `user` AS user ON user.userid = u.userid
				JOIN enrollment AS e ON e.userid = u.userid
				LEFT JOIN `city` AS city ON city.cityid = u.cityid
				LEFT JOIN enrollment_custom_fields AS ecf ON ecf.enrollmentid = e.enrollmentid
				WHERE
				
					e.courseid = :courseid
					AND e.enrollmentroleid = :roleid
					AND CONCAT(`firstname`,' ',`lastname`,' ',IFNULL(`firstnameinarabic`,''),' ',IFNULL(`lastnameinarabic`,''),' ',`tznumber`,' ',IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ', IFNULL(city.name, '')) LIKE :search
					/*AND user.status=1*/
				ORDER BY u.firstname",
			'par' => array('courseid' => $courseid, 'search' => '%'.$search.'%', 'roleid' => $roleid),
			'ret' => 'all'
		));
		$enrolled=nestArray($enrolled, 'userid', array(
			array('nestIn'=>'enrollmentFields', 'nestBy'=>'enrollmentFieldId', 'fieldsToNest'=>array('enrollmentFieldId', 'enrollmentFieldValue'))
		));
		$enrolled1=cutPage($enrolled, 'enrolled', $page);
		foreach($enrolled1["enrolled"] AS $index=>$enrollment)
		{
			$enrolled1["enrolled"][$index]["enrollmentFields"] = indexArrayByAttribute($enrollment["enrollmentFields"], 'enrollmentFieldId');
		}
		//for excel export usage
        if($page==-1)
            return $enrolled;
        ////////////////////////
        else
		    return $enrolled1;
	}

	function GetCoursesWithUserEnrolledAsRole($userid, $roleid, $page, $search)
	{
		global $db;
		//fetch enrolled users
		$enrolled = $db->smartQuery(array(
				'sql' => "
				SELECT
					c.name AS coursename,
					c.subname AS shortcoursename,
					c.subnameinarabic AS shortarabiccoursename,
					p.name AS projectname,
					c.courseid AS courseid
				FROM
				course AS c
				JOIN enrollment AS e ON e.courseid = c.courseid
				JOIN project AS p ON c.projectid=p.projectid
				WHERE
					e.userid = :userid
					AND e.enrollmentroleid = :roleid
					AND c.status=1
					AND e.status=1
					AND CONCAT(c.name, ' ', p.name) LIKE :search
				ORDER BY c.courseid DESC",
			'par' => array('userid' => $userid, 'search' => '%'.$search.'%', 'roleid' => $roleid),
			'ret' => 'all'
		));
        if($page==-1)
            return $enrolled;
        ////////////////////////
        else
		    return cutPage($enrolled, 'enrolled', $page);
	}

	function GetCoursesOfProject($pid,$userid=null){
		global $db;
		global $myid;
		
		if(!isset($userid))
		{
			$userid=$myid;
		}
		//TODO - fix hardcoding of enrollmentroleid
		$courses = $db->smartQuery(array(
			'sql' => "
			SELECT DISTINCT c.courseid, name, code
			FROM course AS c
			JOIN enrollment AS e ON e.courseid = c.courseid
			WHERE
				e.enrollmentroleid=2 AND
				e.userid=:userid AND
				projectid=:projectid",
			'par' => array('userid'=>$userid, 'projectid'=>$pid),
			'ret' => 'all'
		));
		return $courses;
	}

	function GetMyEnrollments(){
		global $db;
		global $myid;
		//update the db with the client version that made the request
		global $Profile;
		$Profile->UpdateUserAppVersion();
		//fetch enrolled users
		$enrolled = $db->smartQuery(array(
				'sql' => "
				SELECT
					c.name AS coursename,
					c.subname AS shortcoursename,
					c.subnameinarabic AS shortarabiccoursename,
					c.courseid AS courseid,
					e.enrollmentroleid AS enrollmentrole,
					c.status AS status
				FROM
				course AS c
				JOIN enrollment AS e ON e.courseid = c.courseid
				WHERE
					e.userid = :userid
					AND e.status = 1
				ORDER BY c.status DESC, c.courseid DESC",
			'par' => array('userid' => $myid),
			'ret' => 'all'
		));
		$enrollments = indexArrayByAttribute(nestArray($enrolled, 'enrollmentrole', array(
			array('nestIn'=>'courses', 'nestBy'=>'courseid', 'fieldsToNest'=>array('courseid', 'coursename', 'shortcoursename', 'shortarabiccoursename', 'status'))
		)),
		'enrollmentrole');
		if(!isset($enrollments[1]))
			$enrollments[1]=array("enrollmentrole"=>1, "courses"=>array());
		return $enrollments;
	}

	function EnrollUsers($userids, $courseid, $roleid)
	{
		$defaultStatus=1;
		$time = date("Y-m-d H:i:s");
		$existingStudents = $this -> GetEnrolledUsersIds($courseid);
		global $db;
		$params = array('courseid' => $courseid, 'time' => $time, 'status'=>$defaultStatus, 'roleid'=>$roleid);
		$sql = "INSERT INTO enrollment (`status`,`courseid`,`userid`, `laststatuschange`, enrollmentroleid) VALUES ";
		$newEnrollmentCount = 0;
		foreach ($userids AS $index=>$sid)
		{
			//don't insert a student who is already enrolled
			if(!in_array($sid, $existingStudents, true))
			{
				$newEnrollmentCount++;
				$sql.="(:status, :courseid, :userid".$index.", :time, :roleid)";
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($userids)-1)?",":"";
				//add coresponding parameter to the array
				$params['userid'.$index]=$sid;
			}
		}
		if($newEnrollmentCount==0)
		{
			return (object)array("error"=>"the users are already enrolled");
		}
		//enroll users
		$users = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'result'
		));
		return $users;
	}

	function SetPrimaryTeacher($userid, $courseid)
	{
		global $db;
		//fetch enrolled users
		$enrolled = $db->smartQuery(array(
				'sql' => "
				DELETE FROM enrollment
				WHERE
					isPrimary=1
					AND courseid=:courseid
					AND enrollmentroleid = 2
					AND userid<>:userid;
				UPDATE enrollment
				SET isPrimary =1
				WHERE
					userid =:userid
					AND courseid =:courseid;",
			'par' => array('userid' => $userid, 'courseid' => $courseid),
			'ret' => 'result'
		));
	}

	function EnrollToCourseByCode($code)
	{
		global $db;
		global $Course;
		global $myid;
		$course = $Course->GetCourseByCode($code);
		if(!isset($course['courseid']))
		{
			return (object)array("error"=>"courseDoesntExist");
		}
		if($course['status']==0)
		{
			return (object)array("error"=>"courseIsntActive");
		}
		if($this->IsUserEnrolledInCourse($course['courseid'], $myid))
		{
			return (object)array("error"=>"alreadyEnrolledInCourse");
		}
		$time = date("Y-m-d H:i:s");
		//TODO - fix hardcoding of enrollmentroleid
		$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `enrollment`(`courseid`,`userid`, `status`, `laststatuschange`, enrollmentroleid) VALUES ( :courseid, :userid, 1, :time, 1);",
			'par' => array( 'courseid' => $course['courseid'], 'userid' => $myid, 'time' => $time),
			'ret' => 'result'
		));
		return (object)array("coursename"=>$course['subname']);
	}

	function IsUserEnrolledInCourse($courseid, $userid)
	{
		global $db;
		$enrollment = $db->smartQuery(array(
			'sql' => "SELECT * FROM enrollment WHERE `courseid`=:courseid AND `userid`=:userid",
			'par' => array( 'courseid' => $courseid,'userid' => $userid),
			'ret' => 'fetch-assoc'
		));
		return isset($enrollment['userid']);
	}

	function GetEnrollmentRoleOfUserInCourse($courseid, $userid){
		global $db;
		$enrollment = $db->smartQuery(array(
			'sql' => "
			SELECT enrollmentroleid
			FROM enrollment
			WHERE `courseid`=:courseid AND `userid`=:userid",
			'par' => array( 'courseid' => $courseid,'userid' => $userid),
			'ret' => 'fetch-assoc'
		));
		if(isset($enrollment['enrollmentroleid']))
			return $enrollment['enrollmentroleid'];
		else
			return null;
	}

	function UpdateUserStatus ($courseid, $userid, $status){
		global $db;
		$time = date("Y-m-d H:i:s");
		$result= $db->smartQuery(array(
			'sql' => "UPDATE `enrollment` SET status=:status, laststatuschange=:time WHERE courseid=:courseid AND userid=:userid",
			'par' => array( 'courseid' => $courseid, 'userid' => $userid, 'status' => $status, 'time' => $time),
			'ret' => 'result'
		));
		return $result;
	}

	function UpdateEnrollmentTag ($courseid, $userid, $enrollmenttagid){
		global $db;
		$time = date("Y-m-d H:i:s");
		$result= $db->smartQuery(array(
			'sql' => "
				UPDATE `enrollment`
				SET enrollmenttagid=:enrollmenttagid, laststatuschange=:time
				WHERE courseid=:courseid AND userid=:userid;
				UPDATE enrollment AS e
				INNER JOIN enrollmenttag AS t ON t.enrollmenttagid = e.enrollmenttagid
				SET e.status = IFNULL(t.changestatusto, e.status)
				WHERE courseid=:courseid AND userid=:userid;",
			'par' => array( 'courseid' => $courseid, 'userid' => $userid, 'enrollmenttagid' => $enrollmenttagid, 'time' => $time),
			'ret' => 'result'
		));
		return $result;
	}

	function UpdateUserEnrollmentField ($enrollmentId, $fieldId, $value){
		global $db;
		$result= $db->smartQuery(array(
			'sql' => "
				INSERT INTO
					enrollment_custom_fields (enrollmentid, enrollment_field_id, value)
					VALUES (:enrollmentid, :fieldid, :value)
				ON DUPLICATE KEY
					UPDATE value=:value;",
			'par' => array( 'enrollmentid' => $enrollmentId, 'fieldid' => $fieldId, 'value' => $value),
			'ret' => 'result'
		));
		return $result;
	}

	function DeleteFromEnrollment ($userid, $courseid, $enrollmentroleid){
		global $db;

			$result = $db->smartQuery(array(
			'sql' => "DELETE FROM `enrollment` WHERE userid=:userid AND courseid=:courseid AND enrollmentroleid=:enrollmentroleid;",
			'par' => array('userid' => $userid ,'courseid'=>  $courseid ,'enrollmentroleid'=> $enrollmentroleid),
			'ret' => 'result'
			));
			
			return $result;
	}
}