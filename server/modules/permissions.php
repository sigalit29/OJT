<?php
class permissions{
	
	function CheckMadrichLesson($madrichid, $lessonid)
	{
		global $db;
		$mySubStaff = getManagedUsers();
		array_push($mySubStaff, $madrichid);
		$params = array("lessonid"=>$lessonid);
		//TODO - fix hardcoding of enrollmentroleid
		$sql = "
			SELECT l.courseid
			FROM lesson AS l
			JOIN enrollment AS e ON e.courseid = l.courseid
			WHERE
			enrollmentroleid=2
			AND e.userid IN (";
		foreach ($mySubStaff AS $index=>$staffid)
		{
			$sql.=":staffid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($mySubStaff)-1)?",":"";
			//add coresponding parameter to the array
			$params['staffid'.$index]=$staffid;
		}
		$sql.=")
			AND l.lessonid=:lessonid";
		//fetch courses
		$exist = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $params,
			'ret' => 'fetch-assoc'
		));
		if(isset($exist['courseid']))
		{
			return true;
		}else
		{
			return false;
		}
	}
	
	function CheckMadrichCourse($madrichid, $courseid)
	{
		global $db;
		$mySubStaff = getManagedUsers();
		array_push($mySubStaff, $madrichid);
		$params = array("courseid"=>$courseid);
		//TODO - fix hardcoding of enrollmentroleid
		$sql = "
			SELECT e.courseid
			FROM enrollment AS e
			WHERE
			enrollmentroleid=2
			AND e.userid IN (";
		foreach ($mySubStaff AS $index=>$staffid)
		{
			$sql.=":staffid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($mySubStaff)-1)?",":"";
			//add coresponding parameter to the array
			$params['staffid'.$index]=$staffid;
		}
		$sql.=")
			AND e.courseid=:courseid";
		//fetch courses
		$exist = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $params,
			'ret' => 'fetch-assoc'
		));
		if(isset($exist['courseid']))
		{
			return true;
		}else
		{
			return false;
		}
	}
	
	function AccessUserProfile($userid)
	{
		global $db;
		global $me;
		global $myid;
		//whether the user requests information about themselves
		if($myid === $userid)
		{
			return array(
			"watch"=>true,
			"edit"=>true,
			"changePassword"=>true,
			"resetPassword"=>true,
			"approveRegistration"=>false,
//			"hideFields"=>array("notes", "religionid"));
            "hideFields"=>array());
		}
		//if the user requesting the information is an admin
		if($me["isAdmin"])
		{
			return array(
			"watch"=>true,
			"edit"=>true,
			"changePassword"=>false,
			"resetPassword"=>true,
			"approveRegistration"=>true,
			"hideFields"=>array());
		}
		//get a list of users managed by the user making the request
		$mySubStaff = getManagedUsers();
		//and add the user to that list
		array_push($mySubStaff, $myid);
		//construct a query that gets all students who participate in a course taught by one of the above teachers
		$params = array("userid"=>$userid);
		//TODO - fix hardcoding of enrollmentroleid
		$sql = "
			SELECT * FROM (SELECT e.courseid
			FROM enrollment AS e
			WHERE
			enrollmentroleid=2
			AND e.userid IN (";
		foreach ($mySubStaff AS $index=>$staffid)
		{
			$sql.=":staffid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($mySubStaff)-1)?",":"";
			//add coresponding parameter to the array
			$params['staffid'.$index]=$staffid;
		}
		$sql.=")) AS teachers
			JOIN enrollment AS e ON e.courseid = teachers.courseid
			WHERE e.userid=:userid";
		//fetch courses
		$studentInCourses = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $params,
			'ret' => 'fetch-assoc'
		));
		$newUserCheck = $db->smartQuery(array(
			'sql' => "
			SELECT COUNT(e.courseid) AS numOfCourses, p.managerid
			FROM user_profile AS p
			JOIN enrollment AS e ON e.userid=p.userid
			WHERE
				p.userid=:userid",
			'par' => array('userid'=>$userid),
			'ret' => 'fetch-assoc'
		));
		//whether the requested user is a subtaff of the user making the request
		$isASubStaff = in_array($userid, $mySubStaff);
		//whether the requested user is a student in a course taught by the user making the request, or one of their substaff
		$isAStudent = isset($studentInCourses['courseid']);
		$isNewUser = !isset($newUserCheck['managerid'])&&$newUserCheck['numOfCourses']==0;
		return array(
		"watch"=>$isASubStaff||$isAStudent||$isNewUser,
		"edit"=>$isAStudent||$isNewUser,
		"changePassword"=>$isAStudent||$isNewUser,
		"resetPassword"=>false,
		"approveRegistration"=>$isAStudent||$isNewUser,
		"hideFields"=>array());
	}
}