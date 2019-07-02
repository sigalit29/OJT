<?php
date_default_timezone_set ( "Asia/Jerusalem" );

class CheckStudent{
	
	function getCheckstudentId($lessonid, $userid){
		global $db;
		$checkstudent = $db->smartQuery(array(
			'sql' => "SELECT checkstudentid FROM `checkstudent` WHERE `lessonid`=:lessonid AND userid =:userid",
			'par' => array('lessonid' => $lessonid, 'userid' => $userid),
			'ret' => 'fetch-assoc'
		));
		if(isset($checkstudent['checkstudentid']))
		{
			return $checkstudent['checkstudentid'];
		}
		else
		{
			return null;
		}
	}
	
	function ReportAttendance($lessonid, $status){
		global $db;
		global $myid;
		$date = date("Y-m-d H:i:s");
		$timestamp = strtotime($date);
		
		$result = $db->smartQuery(array(
				'sql' => "
				INSERT INTO
					`checkstudent` (`userid`,`lessonid`,`checkin`,`status`)
					VALUES ( :userid,:lessonid, :checkin, :status)
				ON DUPLICATE KEY UPDATE
					`status`=:status
					;",
				'par' => array( 'userid' => $myid, 'lessonid' => $lessonid, 'checkin' => $timestamp, 'status'=>$status),
				'ret' => 'result'
		));
		return $result;
	}
	
	function postStudentLessonFeedback($lessonid, $ratings, $comments){
		global $db;
		global $myid;
		$checkstudentid = $this->getCheckstudentId($lessonid, $myid);
		if(!isset($checkstudentid))
		{
			return (object)array("error" => "no attendance record for user in lesson");
		}
		$insertParams = array('checkstudentid'=>$checkstudentid);
		//insert ratings
		$sql = "
		INSERT INTO `student_generalfeedback` (`checkstudentid`,`questionid`,`answer`)
		VALUES ";
		foreach($ratings as $key=>$feedback)
		{
			$sql.="(:checkstudentid, :question_".$key."_id, :answer_".$key."_id),";
			$insertParams["question_".$key."_id"]=$feedback->questionid;
			$insertParams["answer_".$key."_id"]=$feedback->responseid;
		}
		$sql=substr($sql, 0, -1).";";
		$sql.=")";
		$result = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $insertParams,
			'ret' => 'result'
		));
		//insert comments
		if(count($comments)>0)
		{
		$insertParams = array('checkstudentid'=>$checkstudentid);
		$sql = "
		INSERT INTO `student_comments` (`checkstudentid`,`answer`,`type`)
		VALUES ";
		foreach($comments as $key=>$comment)
		{
			$sql.="(:checkstudentid, :comment_".$key."_id, 0),";
			$insertParams["comment_".$key."_id"]=$comment;
		}
		$sql=substr($sql, 0, -1).";";
		$sql.=")";
		$result = $db->smartQuery(array(
			'sql' => $sql,
			'par' => $insertParams,
			'ret' => 'result'
		));
		}
		return true;
	}

	function postStudentSubjectFeedback($lessonid, $ratings, $comments){
		global $db;
		global $myid;
		$checkstudentid = $this->getCheckstudentId($lessonid, $myid);
		if(!isset($checkstudentid))
		{
			return (object)array("error" => "no attendance record for user:".$myid." in lesson: ".$lessonid);
		}
		//insert ratings
		if(count($ratings)>0)
		{
			$insertParams = array('checkstudentid'=>$checkstudentid);
			$sql = "
			INSERT INTO `student_subjectfeedback` (`checkstudentid`,`subjectid`,`answer`, `CustomSubject`)
			VALUES ";
			foreach($ratings as $key=>$feedback)
			{
				$sql.="(:checkstudentid, :subject_".$key."_id, :answer_".$key."_id,:CustomSubject_".$key."_id),";
				$insertParams["subject_".$key."_id"]=$feedback->subjectid;
				$insertParams["answer_".$key."_id"]=$feedback->responseid;
                $insertParams["CustomSubject_".$key."_id"]=$feedback->customSubject;
			}
			$sql=substr($sql, 0, -1).";";
			$sql.=")";
			$result = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $insertParams,
				'ret' => 'result'
			));
		}
		//insert comments
		if(count($comments)>0)
		{
			$insertParams = array('checkstudentid'=>$checkstudentid);
			$sql = "
			INSERT INTO `student_comments` (`checkstudentid`,`answer`,`type`)
			VALUES ";
			foreach($comments as $key=>$comment)
			{
				$sql.="(:checkstudentid, :comment_".$key."_id, 1),";
				$insertParams["comment_".$key."_id"]=$comment;
			}
			$sql=substr($sql, 0, -1).";";
			$sql.=")";
			$result = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $insertParams,
				'ret' => 'result'
			));
		}
		//insert custom subject ratings
		/*if(isset($customSubjectRating))
		{
			$result = $db->smartQuery(array(
				'sql' => "
					UPDATE checkstudent SET customSubjectRating = :rating WHERE checkstudentid =:checkstudentid",
				'par' => array('rating'=>$customSubjectRating, 'checkstudentid'=>$checkstudentid),
				'ret' => 'result'
			));
		}*/
		return true;
	}
	
	function GetStudentsAttendance($lessonid){
		global $db;
		//TODO - fix hardcoding of enrollmentroleid
		$students = $db->smartQuery(array(
			'sql' => "
			SELECT p.firstname, p.lastname, p.image, p.userid, cs.checkstudentid, IFNULL(cs.status, 3) AS attendanceStatus
			FROM lesson AS l
			JOIN enrollment AS e ON e.courseid = l.courseid
			LEFT JOIN checkstudent AS cs ON cs.lessonid = l.lessonid AND cs.userid = e.userid
			JOIN user_profile AS p ON p.userid = e.userid
			JOIN user AS u ON u.userid = p.userid
			WHERE
				l.`lessonid`=:lessonid
				AND e.status=1
				AND e.enrollmentroleid=1
				AND u.status=1",
			'par' => array('lessonid'=>$lessonid),
			'ret' => 'all'
		));
		return $students;
	}
	
	function UpdateStudentAttendance($lessonid, $students){
		global $db;
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `lesson` SET `updatestudentstatus`='1' WHERE `lessonid`=:lessonid",
			'par' =>array('lessonid' => $lessonid),
			'ret' => 'result'
		));
		
		$date = date("Y-m-d H:i:s");
		$timestamp = strtotime($date);
		
		//determine which attendance records need to be updated and which inserted
		$toUpdate = array();
		$toInsert = array();
		foreach($students as $student)
		{
			if(isset($student->checkstudentid))
			{
				$toUpdate[]=$student;
			}
			else
			{
				$toInsert[]=$student;
			}
		}
		$attendanceInsertParams=array('timestamp' =>$timestamp);
		$attendanceInsertQuery="";
		//insert subjects
		if(count($toInsert)>0)
		{
			$attendanceInsertParams["lessonid"]=$lessonid;
			$attendanceInsertQuery.="INSERT INTO `checkstudent` (`lessonid`, checkin, `userid`, status) VALUES ";
			foreach($toInsert as $key=>$attendance)
			{
				$attendanceInsertQuery.="(:lessonid, :timestamp, :user_".$key."_id, :status_".$key."_id),";
				$attendanceInsertParams["user_".$key."_id"]=$attendance->userid;
				$attendanceInsertParams["status_".$key."_id"]=$attendance->attendanceStatus;
			}
			$attendanceInsertQuery=substr($attendanceInsertQuery, 0, -1).";";
		}
		if(count($toUpdate)>0)
		{
			foreach($toUpdate as $key=>$attendance)
			{
				$attendanceInsertQuery.="UPDATE checkstudent
				SET
					checkin=:timestamp,
					userid=:user_update_".$key."_id,
					status=:status_update_".$key."_id
				WHERE checkstudentid=:check_update_".$key."_id;";
				$attendanceInsertParams["user_update_".$key."_id"]=$attendance->userid;
				$attendanceInsertParams["status_update_".$key."_id"]=$attendance->attendanceStatus;
				$attendanceInsertParams["check_update_".$key."_id"]=$attendance->checkstudentid;
			}
		}
		$result = $db->smartQuery(array(
			'sql' => $attendanceInsertQuery,
			'par' => $attendanceInsertParams,
			'ret' => 'result'
		));
	}

	function GetMyActivity($lessonid){
		global $db;
		global $myid;
		$activity = array();
		$attendance = $db->smartQuery(array(
			'sql' => "
				SELECT status FROM checkstudent WHERE lessonid=:lessonid && userid=:userid",
			'par' => array('lessonid'=>$lessonid, 'userid'=>$myid),
			'ret' => 'fetch-assoc'
		));
		if(!isset($attendance)||!isset($attendance["status"]))
			return array("error"=>"couldn't find any relevant activity");
		$activity["attendance"]=$attendance["status"];
		$feedback = $db->smartQuery(array(
			'sql' => "
				SELECT f.answer
				FROM
					student_comments AS f
					JOIN checkstudent AS cs ON cs.checkstudentid = f.checkstudentid
				WHERE
					lessonid=:lessonid && userid=:userid",
			'par' => array('lessonid'=>$lessonid, 'userid'=>$myid),
			'ret' => 'all'
		));
		$activity["comments"]=array_column($feedback, "answer");
		return $activity;
	}

	function GetAttendanceStatuses()
    {
        global $db;
        $statuses = $db->smartQuery(array(
            'sql' => "
			SELECT * FROM checkstudent_status WHERE`IsShow`=1",
            'par' => array(),
            'ret' => 'all'
        ));
        return $statuses;
    }

    function UpdateCheckStudentStatus($student,$lessonid)
    {
        global $db;
        $userid = $student->userid;
        $status=$student->attendanceStatus;
        $result = $db->smartQuery(array(
            'sql' => "UPDATE `checkstudent` SET `status`=:status WHERE `userid`=:userid AND `lessonid`=:lessonid",
            'par' => array('status' => $status, 'userid' => $userid,'lessonid'=>$lessonid),
            'ret' => 'result'
        ));
        return array($status,$userid,$lessonid);
    }
}
