<?php
date_default_timezone_set ( "Asia/Jerusalem" );

class MentoringSession{

	function AddMentoringSession($courseid, $scheduleddate, $comments, $type, $students)
	{
		global $db;
		global $Course;
			$creationdate = date("Y-m-d H:i:s");
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `mentoringsession` (`courseid`,`scheduleddate`,`creationdate`,`comments`,`mentoringsessiontypeid`) VALUES ( :courseid, :scheduleddate, :creationdate, :comments,:mentoringsessiontypeid);",
				'par' => array( 'courseid' => $courseid, 'scheduleddate' => $scheduleddate, 'creationdate' => $creationdate, 'comments' => $comments, 'mentoringsessiontypeid' => $type),
				'ret' => 'result'
			));
		if($result==true)
		{
			$msid=$db->getLastInsertId();
			if($msid==0)
			{
				$msid = $id[0]['mentoringsessionid'];
			}
			$this->AssignStudents($msid,$students);
			/*$this -> addAutoReport($courseid, $scheduleddate);*/
			return (object)array("mentoringsessionid" => $msid);
		}else
		{
			return $result;
		}
		
	}
	
	function addAutoReport($courseid, $scheduleddate)
	{
		$scheduleddate= date("Y-m-d H:i:s", $scheduleddate/1000);
		global $db;
		$course =  $db->smartQuery(array(
				'sql' => "Select projectid FROM `course` Where `courseid`=:courseid",
				'par' => array( 'courseid' => $courseid),
				'ret' => 'fetch-assoc'
		));
		
		$madrichid = $myid;
		
		if(isset($course['projectid']))
		{
			$projectid = $course['projectid'];
		}else
		{
			$projectid='';
		}
		
		$Actions = $db->smartQuery(array(
				'sql' => "Select subjectreportid FROM staffreportsubject where staffid=:staffid and status=:status and projectid=:projectid",
				'par' => array('staffid'=>$madrichid, 'status'=>true, 'projectid'=>$projectid),
				'ret' => 'all'
		));
		
		if(isset($Actions) && count($Actions)>0)
		{
			foreach($Actions as $Action)
			{
				
				$subject = $db->smartQuery(array(
						'sql' => "Select subject FROM subjectreport where subjectreportid=:subjectreportid and IsShow=:IsShow",
						'par' => array('subjectreportid'=>$Action['subjectreportid'], 'IsShow'=>true),
						'ret' => 'fetch-assoc'
				));
				
				if($subject['subject']=='הנחייה אישית/קבוצתית משתתפים')
				{
					$actionid=$Action['subjectreportid'];
					break;
				}
			}
		}
		
		if(isset($actionid))
		{
			$result = $db->smartQuery(array(
					'sql' => "INSERT INTO `reportcopy` (`date`,`staffid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`status`) VALUES ( :date, :staffid, :courseid, :actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :status);",
					'par' => array( 'date' => $scheduleddate, 'staffid' => $madrichid, 'courseid' => $courseid, 'actionid' => $actionid,'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => '', 'cost' => '', 'comment' => '', 'status' => ''),
					'ret' => 'result'
			));
			
			$rid=$db->getLastInsertId();
			
			$result = $db->smartQuery(array(
					'sql' => "INSERT INTO `report` (`date`,`staffid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`status`,`reportcopyid`,`automatic`) VALUES ( :date, :staffid, :courseid,:actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :status, :reportcopyid, :automatic);",
					'par' => array( 'date' => $scheduleddate, 'staffid' => $madrichid, 'courseid' => $courseid, 'actionid' => $actionid,'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => '', 'cost' => '', 'comment' => '', 'status' => '', 'reportcopyid' => $rid, 'automatic' => true),
					'ret' => 'result'
			));
		}else
		{
			$result = $db->smartQuery(array(
					'sql' => "INSERT INTO `reportcopy` (`date`,`staffid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`status`) VALUES ( :date, :staffid, :courseid, :actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :status);",
					'par' => array( 'date' => $scheduleddate, 'staffid' => $madrichid, 'courseid' => $courseid, 'actionid' => 48,'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => '', 'cost' => '', 'comment' => '', 'status' => 'specialapproval'),
					'ret' => 'result'
			));
			
			$rid=$db->getLastInsertId();
			
			$result = $db->smartQuery(array(
					'sql' => "INSERT INTO `report` (`date`,`staffid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`status`,`reportcopyid`,`automatic`) VALUES ( :date, :staffid, :courseid,:actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :status, :reportcopyid, :automatic);",
					'par' => array( 'date' => $scheduleddate, 'staffid' => $madrichid, 'courseid' => $courseid, 'actionid' => 48,'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => '', 'cost' => '', 'comment' => '', 'status' => 'specialapproval', 'reportcopyid' => $rid, 'automatic' => true),
					'ret' => 'result'
			));
			return $result;
		}
		return false;
	}
	
	function AssignStudents($mentoringsessionid,$students)
	{
		global $db;
		global $User;
		$result = true;
		foreach($students as $student)
		{
			$result = $result && $db->smartQuery(array(
				'sql' => "INSERT INTO `mentoringsession_student` (`userid`,`mentoringsessionid`) VALUES ( :userid, :mentoringsessionid);",
				'par' => array( 'userid' => $student, 'mentoringsessionid' => $mentoringsessionid),
				'ret' => 'result'
			));
		}
		return $result;
	}
	
	function GetSessionTypes ()
	{
		global $db;
		$genders = $db->smartQuery(array(
			'sql' => "Select mentoringsessiontypeid AS id, nameinhebrew AS he, nameinarabic as ar FROM `mentoringsessiontype` WHERE `isShow` = 1",
			'par' => array(),
			'ret' => 'all'
		));
		return $genders;
	}

}

	