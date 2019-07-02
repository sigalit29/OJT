<?php
date_default_timezone_set ( "Asia/Jerusalem" );

class Lesson{
	function AddLesson($courseid, $lesson)
	{
		global $db;
		global $Course;
		global $myid;

        $ToUpdate=0;

		$comments=isset($lesson->comments)?$lesson->comments:null;
		$resources=isset($lesson->resourceLinks)?$lesson->resourceLinks:null;
		$linkComments=isset($lesson->linkComments)?$lesson->linkComments:null;
		$statsComments=isset($lesson->statsComments)?$lesson->statsComments:null;

		$lastLesson = $db->smartQuery(array(
			'sql' => "SELECT * FROM lesson WHERE courseid=:courseid AND checkout IS NULL",
			'par' => array('courseid' => $courseid),
			'ret' => 'all'
		));
		if(isset($lastLesson) && count($lastLesson)>0)
		{
			return (object)array("error" => "you must close the previous meeting before scheduling a new one");
		}
		$createdate = date("Y-m-d H:i:s");
		$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `lesson` 
				(`courseid`,`num`,`beginningdate`, `createdate`, createdby, `comments`,`linkComments`, `statsComments`)
				VALUES 
				( :courseid, :num, :beginningdate, :createdate, :userid, :comments,:linkComments, :statsComments);",
			'par' => array(
				'courseid' => $courseid, 'num' => $lesson->num, 'beginningdate' => $lesson->scheduleDate, 'createdate' => $createdate, 'userid' => $myid,
				'comments' => $comments,'linkComments' => $linkComments, 'statsComments' => $statsComments),
			'ret' => 'result'
		));
		if($result==true)
		{
			$lid=$db->getLastInsertId();

            if (count($lesson->customSubjects)!=0)
                $this->SetCustomSubjectsInLesson($lid, $lesson,$ToUpdate);

            else {
                        $this->SetSubjectsToBeTaughtInLesson($lid, $lesson->subjectsTaught,0);
                }

            if (count($resources)!=0)
                $this->SetLinksInLesson($lid, $resources);

//			$res=$this->SetHighlightedStatsForLesson($lid, $lesson->highlightedStats);
            $this->SetHighlightedStatsForLesson($lid, $lesson->highlightedStats);

			$Course->sendNotificationToStudentOnMeetingCreation($courseid, $lid, $lesson->scheduleDate, false);

			return (object)array("lessonid" => $lid);
		}

		else
        {
            return false;
        }
	}

	function SetLinksInLesson($lessonid, $resources)
    {
        global $db;

        $resourcesInsertParams=array('lessonid' => $lessonid);
        $resourcesInsertQuery="
		DELETE FROM lesson_resource WHERE lessonid=:lessonid;
		INSERT INTO `lesson_resource` (`lessonid`, `link`, `title`) VALUES ";
        foreach($resources AS $key=>$resource)
        {
            $resourcesInsertQuery.="(:lessonid, :link_".$key."_id, :title_".$key."_id),";
            $resourcesInsertParams["link_".$key."_id"]=$resource->link;
			$resourcesInsertParams["title_".$key."_id"]=$resource->title;
        }
        $resourcesInsertQuery=substr($resourcesInsertQuery, 0, -1).";";
        $result = $db->smartQuery(array(
            'sql' => $resourcesInsertQuery,
            'par' => $resourcesInsertParams,
            'ret' => 'result'
        ));
        return $result;
    }

    function SetCustomSubjectsInLesson($lessonid,$lesson,$ToUpdate)
    {
        global $db;
        $customSubjects = $lesson->customSubjects;
        $customSubjectsInsertParams = array('lessonid' => $lessonid);
        $customSubjectsInserQuery = "
        DELETE FROM lesson_custom_subjects WHERE lessonid=:lessonid;";

        if (count($lesson->customSubjects)!=0)
        {
            $customSubjectsInserQuery .= "INSERT INTO `lesson_custom_subjects` (`lessonid`,`subject`) VALUES ";
            foreach ($customSubjects AS $key => $customSubject)
            {
                $customSubjectsInserQuery .= "(:lessonid, :subject_" . $key . "_id),";
                $customSubjectsInsertParams["subject_" . $key . "_id"] = $customSubject->subject;
            }
            $customSubjectsInserQuery = substr($customSubjectsInserQuery, 0, -1) . ";";
        }
        $result = $db->smartQuery(array(
            'sql' => $customSubjectsInserQuery,
            'par' => $customSubjectsInsertParams,
            'ret' => 'result'
        ));

        if ($result)
            $CustomSubjectIds = $this->GetCustomSubjectIds($lessonid);

        $result = $this->SetSubjectsToBeTaughtInLesson($lessonid, $lesson->subjectsTaught, 0);
        $result = $this->SetSubjectsToBeTaughtInLesson($lessonid, $CustomSubjectIds, 1);

        return $result;
    }

    function GetCustomSubjectIds($lessonid)
    {
        global $db;
        $ids = $db->smartQuery(array(
            'sql' => "
			SELECT
				subjectid
			FROM lesson_custom_subjects
			WHERE lessonid=:lessonid
			",
            'par' => array('lessonid' => $lessonid),
            'ret' => 'fetch-all'
        ));

        $ids = array_column($ids, "subjectid");
        return $ids;
    }

	function SetSubjectsToBeTaughtInLesson($lessonid, $subjects,$kind)
	{
        global $db;
		$subjectsInsertParams=array('lessonid' => $lessonid,'is_custom'=>$kind);
		$subjectsInsertQuery="DELETE FROM `subjectstaught` WHERE lessonid=:lessonid and is_custom=:is_custom;";

		//insert subjects

        if(count($subjects) > 0) {
            $subjectsInsertQuery .= "INSERT INTO `subjectstaught` (`is_custom`,`lessonid`, `subjectid`) VALUES ";
            foreach ($subjects as $key => $subject) {
                $subjectsInsertQuery .= "(:is_custom,:lessonid, :subject_" . $key . "_id),";
                $subjectsInsertParams["subject_" . $key . "_id"] = $subject;
            }
            $subjectsInsertQuery = substr($subjectsInsertQuery, 0, -1) . ";";
        }

		$result = $db->smartQuery(array(
            'sql' => $subjectsInsertQuery,
            'par' => $subjectsInsertParams,
            'ret' => 'result'
        ));
		return $result;
	}
	
	function UpdateSubjectsTaughtInLesson($lessonid, $subjects)
	{
		global $db;
		$this->SetSubjectsToBeTaughtInLesson($lessonid, $subjects);
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `lesson` SET `updatesubjectlesson`='1' WHERE `lessonid`=:lessonid",
			'par' =>array('lessonid' => $lessonid),
			'ret' => 'result'
		));
		return $result;
	}
	
	function SetHighlightedStatsForLesson($lessonid, $stats){
		global $db;
		$statsInsertParams=array('lessonid' => $lessonid);
       // echo $lessonid;
		$statsInsertQuery="DELETE FROM `lesson_highlighted_stats` WHERE lessonid=:lessonid;";
		//insert stats
		if(count($stats)>0)
		{
		   // echo count($stats);
			$statsInsertQuery.="INSERT INTO `lesson_highlighted_stats` (`lessonid`, `stat`) VALUES ";
			foreach($stats as $key=>$stat)
			{
				$statsInsertQuery.="(:lessonid, :stat".$key."),";
				$statsInsertParams["stat".$key]=$stat;
               //echo $stat;
			}
			$statsInsertQuery=substr($statsInsertQuery, 0, -1).";";
		}
		$result = $db->smartQuery(array(
			'sql' => $statsInsertQuery,
			'par' => $statsInsertParams,
			'ret' => 'result'
		));
		return $result;
	}
	
	function UpdateLesson($lesson)
	{
		global $db;
		global $Course;
		$kind=0;
		$ToUpdate=1;
		$comments=isset($lesson->comments)?$lesson->comments:null;
		$linkComments=isset($lesson->linkComments)?$lesson->linkComments:null;
		$statsComments=isset($lesson->statsComments)?$lesson->statsComments:null;
        $resourceLinks=isset($lesson->resourceLinks)?$lesson->resourceLinks:null;

        $result = $db->smartQuery(array(
			'sql' => "
				UPDATE `lesson` SET
					`beginningdate`=:beginningdate,
					`comments`=:comments,
					`linkComments`=:linkComments,
					`statsComments`=:statsComments
				WHERE lessonid = :lessonid",
			'par' => array(
				'lessonid' => $lesson->lessonid, 'comments' => $lesson->comments, 'beginningdate' => $lesson->scheduleDate,
				'comments' => $comments, 'linkComments' => $linkComments, 'statsComments' => $statsComments),
			'ret' => 'result'
		));
		if($result==true)
		{
		    $this->SetCustomSubjectsInLesson($lesson->lessonid, $lesson,$ToUpdate);
		   // $this->SetSubjectsToBeTaughtInLesson($lesson->lessonid, $lesson->subjectsTaught, $kind);

			$this->SetHighlightedStatsForLesson($lesson->lessonid, $lesson->highlightedStats);
			$this->SetLinksInLesson($lesson->lessonid, $resourceLinks);


			if($lesson->notifyStudents)
			{
				$Course->sendNotificationToStudentOnMeetingCreation($lesson->courseid, $lesson->lessonid, $lesson->scheduleDate, true);
			}
			return true;
		}else
		{
			return false;
		}
	}

	function GetLessonsOfCourse($courseid)
	{
		global $db;
		$lessons = $db->smartQuery(array(
			'sql' => "
			SELECT lessonid, checkin, num, ignoreMe,beginningdate
			FROM lesson
			WHERE
				courseid=:courseid
				AND checkout IS NOT NULL",
			'par' => array('courseid' => $courseid),
			'ret' => 'all'
		));
		return $lessons;
	}
	
	function GetLessonById($lessonid)
	{
		global $db;
		$lesson = $db->smartQuery(array(
				'sql' => "
				SELECT l.*, c.name AS coursename, c.subname AS coursesubname, c.subnameinarabic AS coursenameinarabic, CONCAT(p.firstname, ' ', p.lastname) AS creatorName, p.image as creatorImage
				FROM `lesson` AS l
				JOIN course AS c ON c.courseid = l.courseid
				JOIN user_profile AS p ON p.userid = l.createdby
				WHERE `lessonid`=:lessonid",
				'par' => array( 'lessonid' => $lessonid),
				'ret' => 'fetch-assoc'
		));
		
		if(isset($lesson['lessonid']))
		{
			$lesson['syllabus'] = $this->GetSubjectsToBeTaughtInLesson($lessonid);
			$lesson['subjectsTaught'] = array_column($lesson['syllabus'],'subjectid');
           // $lesson['subjectsTaught'] =
			$lesson['highlightedStats'] = $this->GetHighlightedStatsOfLesson($lessonid);
			$lesson['resourceLinks'] = $this->GetResourceLinksOfLesson($lessonid);
            $lesson['customSubjects'] = $this->GetCustomSubjectsOfLesson($lessonid);
            $lesson['teacherComment'] = $this->GetTeacherCommentsOfLesson($lessonid);
            return (object)array("lesson"=> $lesson);
		}else
		{
			return array();
		}
	}
	
	function GetSubjectsToBeTaughtInLesson($lessonid)
	{
		global $db;
		$kind=0;
		$subjects = $db->smartQuery(array(
			'sql' => "
			SELECT st.subjectid, s.subject, s.subjectinarabic
			FROM `subjectstaught` AS st	,subject AS s
			WHERE s.subjectid = st.subjectid and st.lessonid=:lessonid and st.is_custom=:is_custom",
			'par' => array( 'lessonid' => $lessonid,'is_custom'=>$kind),
			'ret' => 'all'
		));
		return $subjects;
	}

    function GetNodeSubjectsToBeTaughtInLesson($lessonid)
    {
        global $db;
        $subjects = $db->smartQuery(array(
            'sql' => "
			SELECT st.subjectid, s.subject, s.subjectinarabic, s.supersubjectid
			FROM `subjectstaught` AS st
			JOIN subject AS s ON s.subjectid = st.subjectid
			WHERE `lessonid`=:lessonid",
            'par' => array( 'lessonid' => $lessonid),
            'ret' => 'all'
        ));
        return $subjects;
    }

	function GetHighlightedStatsOfLesson($lessonid)
	{
		global $db;
		$stats = $db->smartQuery(array(
			'sql' => "
			SELECT stat
			FROM `lesson_highlighted_stats`
			WHERE `lessonid`=:lessonid",
			'par' => array( 'lessonid' => $lessonid),
			'ret' => 'all'
		));
		return array_column($stats, 'stat');
	}

	function GetResourceLinksOfLesson($lessonid)
	{
		global $db;
		$resources = $db->smartQuery(array(
			'sql' => "
				SELECT title, link
				FROM `lesson_resource`
				WHERE `lessonid`=:lessonid",
			'par' => array( 'lessonid' => $lessonid),
			'ret' => 'all'
		));
		return $resources;
	}

    function GetCustomSubjectsOfLesson($lessonid)
    {
        global $db;
        $CustomSubjects = $db->smartQuery(array(
            'sql' => "
				SELECT *
				FROM `lesson_custom_subjects`
				WHERE `lessonid`=:lessonid",
            'par' => array( 'lessonid' => $lessonid),
            'ret' => 'all'
        ));
        return $CustomSubjects;
}

    function GetTeacherCommentsOfLesson($lessonid)
    {
        global $db;
        $TeacherComments = $db->smartQuery(array(
            'sql' => "
				SELECT answer
				FROM `madrich_comments`
				WHERE `lessonid`=:lessonid",
            'par' => array( 'lessonid' => $lessonid),
            'ret' => 'all'
        ));
        return $TeacherComments;
    }
	
	function GetNumberOfLessonsByCourseId($courseid)
	{
		global $db;
		$lessons = $db->smartQuery(array(
			'sql' => "SELECT count(*) AS count FROM `lesson` WHERE `courseid`=:courseid AND ignoreMe=0",
			'par' => array( 'courseid' => $courseid),
			'ret' => 'fetch-assoc'
		));
		return (object)array("LessonCount"=>$lessons['count']);
	}

	function GetLessonOfCourseByNumber($courseid, $num){
		global $db;
		$lesson = $db->smartQuery(array(
			'sql' => "SELECT lessonid FROM `lesson` WHERE num=:num AND `courseid`=:courseid AND ignoreMe=0",
			'par' => array( 'courseid' => $courseid, 'num' => $num),
			'ret' => 'fetch-assoc'
		));
		return $lesson['lessonid'];
	}
	
	function ActivateMeeting($lessonid)
	{
		global $Course;
		global $db;
		global $myid;
		$courseid = $this -> getCourseIdByLessonId($lessonid);
		$date = date("Y-m-d H:i:s");
		$timestamp = strtotime($date);
		
		$lessonActivationDate =  $db->smartQuery(array(
			'sql' => "SELECT * FROM `lesson` WHERE `lessonid`=:lessonid",
			'par' => array( 'lessonid' => $lessonid ),
			'ret' => 'fetch-assoc'
		));
		if(isset($lessonActivationDate) && $lessonActivationDate['checkin']!=null)
		{
			return (object)array("error" => "the lesson was already activated -> lessonid = ".$lessonActivationDate['lessonid']);
		}
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `lesson` SET checkin=:checkin, activatedby=:userid WHERE lessonid=:lessonid",
			'par' => array('lessonid' => $lessonid, 'checkin' => $timestamp, 'userid' => $myid),
			'ret' => 'result'
		));
		$Course->sendNotificationToStudentOnMeetingActivation($courseid,$lessonid);
		return $result;
	}
	
	function closeMeeting($lessonid)
	{
		global $CheckStudent;
		global $db;
		global $myid;
		
		$date = date("Y-m-d H:i:s");
		$timestamp = strtotime($date);
		
		$lesson =  $db->smartQuery(array(
			'sql' => "SELECT checkin, checkout, courseid FROM `lesson` Where `lessonid`=:lessonid",
			'par' => array( 'lessonid' => $lessonid),
			'ret' => 'fetch-assoc'
		));
		
		if(!isset($lesson) || $lesson=="")
		{
			return (object)array("error" => "no lesson corresponds to the given id - ".$lessonid);
		}
		if($lesson['checkin']==null)
		{
			return (object)array("error" => "the lesson isn't activated yet");
		}
		if($lesson['checkout']!=null)
		{
			return (object)array("error" => "the lesson is already closed");
		}
		$result = $db->smartQuery(array(
			'sql' => "UPDATE `lesson` SET `checkout`=:checkout, closedby=:userid WHERE `lessonid`=:lessonid",
			'par' =>array('checkout' => $timestamp, 'lessonid' => $lessonid, 'userid' => $myid),
			'ret' => 'result'
		));
		if($result==true)
		{
			$course =  $db->smartQuery(array(
				'sql' => "SELECT projectid FROM `course` WHERE `courseid`=:courseid",
				'par' => array('courseid' => $lesson['courseid']),
				'ret' => 'fetch-assoc'
			));
			global $myid;
			$courseid = $lesson['courseid'];
			$projectid = $course['projectid'];
			$endtimestamp = $timestamp;
			$enddate = date('Y-m-d', $endtimestamp);
			
			$reportsubject = $db->smartQuery(array(
				'sql' => "SELECT reportsubjectid FROM user_reportsubject WHERE userid=:userid AND projectid=:projectid AND status=1 AND reportsubjectid=1",
				'par' => array('userid'=>$myid, 'projectid'=>$projectid),
				'ret' => 'fetch-assoc'
			));
			
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `reportcopy` (`date`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`) VALUES ( :date, :courseid, :actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment);",
				'par' => array( 'date' => $enddate, 'courseid' => $courseid, 'actionid' => 1, 'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => 0, 'cost' => 0, 'comment' => ''),
				'ret' => 'result'
				));
			
			$rid=$db->getLastInsertId();
			
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `report`
				(`date`,`userid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`reportcopyid`,`automatic`, approval, missingreportsubject)
				VALUES
				( :date, :userid, :courseid, :actionid, :projectid, :starthour, :finishhour, :carkm, :cost, :comment, :reportcopyid, 1, 0, :missingreportsubject);",
				'par' => array( 'date' => $enddate, 'userid' => $myid, 'courseid' => $courseid, 'actionid' => 1,'projectid' => $projectid, 'starthour' => null, 'finishhour' => null, 'carkm' => 0, 'cost' => 0, 'comment' => '', 'reportcopyid' => $rid, 'missingreportsubject' => isset($reportsubject)?0:1),
				'ret' => 'result'
			));
		}
		return $result;
	}

	function GetOpenOrNextLessonByCourseId($courseid,$token)
	{
		global $db;
		global $User;
		
		$lesson = $db->smartQuery(array(
			'sql' => "Select * FROM `lesson` Where `courseid`=:courseid and `checkout`='' and `checkin`!=''",
			'par' => array( 'courseid' => $courseid),
			'ret' => 'fetch-assoc'
		));
		if(isset($lesson) && $lesson!=""){
			
			if(isset($token))
			{
				$studentid = $User->GetUserIdByToken($token);
				$studentstatus = $db->smartQuery(array(
					'sql' => "Select studentlessonstatus FROM `checkstudent` Where `studentid`=:studentid and `lessonid`=:lessonid",
					'par' => array( 'lessonid' => $lesson['lessonid'],'studentid' => $studentid ),
					'ret' => 'fetch-assoc'
				));
				if(isset($studentstatus['studentlessonstatus'])){
					$lesson['studentstatus'] = $studentstatus['studentlessonstatus'];
				}
			}
				
			return $lesson;
		}
		else
		{
			//$datenow = date("Y-m-d h:i:sa");
			$datenow = round(microtime(true) * 1000);
			
			$lesson = $db->smartQuery(array(
				'sql' => "Select * FROM `lesson` Where `courseid`=:courseid and `checkout`='' and `checkin`=''  order by beginningdate limit 1", //and beginningdate>:datenow
				'par' => array( 'courseid' => $courseid),//, 'datenow' => $datenow
				'ret' => 'fetch-assoc'
			));
			if(isset($lesson) && $lesson!="")
			{	
				if(isset($token))
				{
					$studentid = $User->GetUserIdByToken($token);
					$studentstatus = $db->smartQuery(array(
						'sql' => "Select studentlessonstatus FROM `checkstudent` Where `studentid`=:studentid and `lessonid`=:lessonid",
						'par' => array( 'lessonid' => $lesson['lessonid'],'studentid' => $studentid ),
						'ret' => 'fetch-assoc'
					));
					
						if(isset($studentstatus['studentlessonstatus'])){
							$lesson['studentstatus'] = $studentstatus['studentlessonstatus'];
						}
				}
			
				return $lesson;
			}else
			{
				return array();
			}
		}
	}
	
	function postTeacherLessonFeedback($lessonid, $ratings, $comments)
	{
		global $db;
		$insertParams = array('lessonid'=>$lessonid);
		$sql = "
		INSERT INTO `madrich_generalfeedback` (`lessonid`,`question`,`answer`)
		VALUES ";
		foreach($ratings as $key=>$feedback)
		{
			$sql.="(:lessonid, :question_".$key."_id, :answer_".$key."_id),";
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
            $insertParams = array('lessonid'=>$lessonid);
            $sql = "
            INSERT INTO `madrich_comments` (`lessonid`,`answer`)
            VALUES ";
            foreach($comments as $key=>$comment)
            {
                $sql.="(:lessonid, :comment_".$key."_id),";
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
		return $result;
	}
		
	function GetLessonStatusById($lessonid)
	{
		global $db;
		$lesson = $db->smartQuery(array(
			'sql' => "SELECT lessonid, checkout FROM `lesson` WHERE `lessonid`=:lessonid",
			'par' => array( 'lessonid' => $lessonid),
			'ret' => 'fetch-assoc'
		));
		if(isset($lesson['lessonid']))
		{
			return array("status"=>$lesson['checkout']!=null);
		}else
		{
			return false;
		}
	}
	
	function getCourseIdByLessonId ($lessonid)
	{
		global $db;
		$courseid = $db->smartQuery(array(
				'sql' => "SELECT courseid FROM `lesson` WHERE `lessonid`=:lessonid",
				'par' => array( 'lessonid' => $lessonid),
				'ret' => 'fetch-assoc'
		));
		if($courseid['courseid'])
			return $courseid['courseid'];
		else
			return null;
	}
	
	function GetUserFlowPosInLesson($lessonid)
	{
		global $db;
		global $Enrollment;
		global $myid;
		$flowChecklist = array();
		$lesson = $db->smartQuery(array(
				'sql' => "SELECT lessonid, courseid, updatestudentstatus, updatesubjectlesson FROM `lesson` WHERE `lessonid`=:lessonid limit 1",
				'par' => array( 'lessonid' => $lessonid),
				'ret' => 'fetch-assoc'
		));
		if(isset($lesson['lessonid']))
		{
			$UserType = $Enrollment->GetEnrollmentRoleOfUserInCourse($lesson['courseid'], $myid);
			//TODO - fix hardcoding of enrollmentroleid
			if($UserType==2)
			{
				$madrichfeedback = $db->smartQuery(array(
						'sql' => "SELECT lessonid FROM `madrich_generalfeedback` WHERE `lessonid`=:lessonid",
						'par' => array( 'lessonid' => $lesson['lessonid']),
						'ret' => 'fetch-assoc'
				));
				$flowChecklist['gaveFeedback'] = isset($madrichfeedback['lessonid'])?true:false;
				$flowChecklist['approvedAttendance'] = (isset($lesson['updatestudentstatus']) && $lesson['updatestudentstatus']=='1')?true:false;
				$flowChecklist['updatedSyllabusProgress'] = (isset($lesson['updatesubjectlesson']) && $lesson['updatesubjectlesson']=='1')?true:false;
				return $flowChecklist;
			}
			else if($UserType==1)
			{
				$subjectsFeedback = $db->smartQuery(array(
						'sql' => "
							SELECT feedbackid
							FROM `student_subjectfeedback` AS sf
							JOIN checkstudent AS cs ON cs.checkstudentid = sf.checkstudentid
							WHERE cs.`userid`=:userid AND cs.`lessonid`=:lessonid",
						'par' => array( 'lessonid' => $lesson['lessonid'], 'userid' => $myid),
						'ret' => 'fetch-assoc'
				));
				$subjectsCount = $this->GetSubjectsToBeTaughtInLesson($lesson['lessonid']);
				$flowChecklist['gaveSubjectsFeedback']= isset($subjectsFeedback['feedbackid'])?true:count($subjectsCount)==0;
				
				$studentfeedbackgeneral = $db->smartQuery(array(
						'sql' => "
							SELECT feedbackid
							FROM `student_generalfeedback` AS gf
							JOIN checkstudent AS cs ON cs.checkstudentid = gf.checkstudentid
							WHERE `userid`=:userid AND `lessonid`=:lessonid",
						'par' => array( 'lessonid' => $lesson['lessonid'], 'userid' => $myid),
						'ret' => 'fetch-assoc'
				));
				$flowChecklist['gaveGeneralFeedback']= isset($studentfeedbackgeneral['feedbackid'])?true:false;
				
				$attendanceStatus = $db->smartQuery(array(
						'sql' => "SELECT status FROM checkstudent WHERE `userid`=:userid AND `lessonid`=:lessonid",
						'par' => array( 'lessonid' => $lesson['lessonid'], 'userid' => $myid),
						'ret' => 'fetch-assoc'
				));
				$flowChecklist['attendanceStatus'] = $attendanceStatus['status'];
			}
			return $flowChecklist;
		}
		else {
			return (object)array("error"=>"couldn't find a lesson with the requested id");
		}
	}
	/**
		returns a number between 0 and 1, signifying how many of the students who attended the meeting have provided feedback
		@param - lesson id of the relevant lesson
	**/
	function GetLessonFeedbackRate($lessonid)
	{
		global $db;
		$result = $db->smartQuery(array(
			'sql' => "
				SELECT SUM(r.givenFeedback)/COUNT(r.givenFeedback) AS rate
				FROM(
				SELECT (CASE WHEN COUNT(feedbackid)>0 THEN 1 ELSE 0 END) AS givenFeedback
				FROM checkstudent AS cs
				LEFT JOIN student_generalfeedback AS f ON cs.checkstudentid = f.checkstudentid
				WHERE
					(cs.status=1 OR cs.status=0)
					AND cs.lessonid=:lessonid
				GROUP BY cs.checkstudentid) AS r
			",
			'par' => array('lessonid' => $lessonid),
			'ret' => 'fetch-assoc'
		));
		return $result['rate'];
	}
	/**
		sets the "ignore me" property of a lesson to the supplied value, and changes the lesson idexes of other lessons in the course accordingly.
		@param courseid - the identifier of the relevant course, used to adjust the indexes of subsequent meetings
		@param lessonid - the identifier of the lesson which's status is to be changed
		@param ignoreMe - the new lesson status
	**/
	function ToggleLessonIgnore($courseid, $lessonid, $ignoreMe)
	{
		global $db;
		$result = $db->smartQuery(array(
			'sql' => "UPDATE lesson SET ignoreMe=:ignoreMe WHERE `lessonid`=:lessonid",
			'par' => array('lessonid' => $lessonid, 'ignoreMe' => $ignoreMe),
			'ret' => 'result'
		));
		$result = $db->smartQuery(array(
			'sql' => "UPDATE lesson SET num=(num+:dir) WHERE `courseid`=:courseid AND lessonid > :lessonid",
			'par' => array('courseid' => $courseid, 'lessonid' => $lessonid, 'dir' => ($ignoreMe?-1:1)),
			'ret' => 'result'
		));
		return $result;
	}
}

	