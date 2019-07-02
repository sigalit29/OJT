<?php
class Statistic {
	function GetStatistic($lessonid, $courseid, $useThreshold) {
		$statistic = array ();
		//a meeting's feedback is only displayed if this percent of the students who checked in have already provided their feedback
		//otherwise, a list of students who haven't provided their feedback is displayed
		$cooking_threshold=0.6;
		//get data about how many students of those who attended haven't given any feedback
		$students = $this->GetStudentsDetailsForLesson($lessonid);
		$statistic ['students']=$students;
		//the number of students who have attended (late or not) the meeting
		$attendanceCount=0;
		//the number of students who have supplied any feedback about the meeting
		$feedbackCount=0;
		//iterate through students and aggregate feedback count and attendance count
		for($i=0; $i<count($students); $i++)
		{
			if($students[$i]['attendanceStatus']==1||$students[$i]['attendanceStatus']==0)
			{
				$attendanceCount++;
			}
			if($students[$i]['givenFeedback']>0)
			{
				$feedbackCount++;
			}
		}
		global $Course;
		//get the id of the last opened lesson in that course
		$lastLessonId = $Course -> GetCurrentLessonByCourseId($courseid)['lessonid'];
		//check if that lesson id is identical to the lesson id for the lesson which's statistics are to be provided
		$isLastLesson = $lastLessonId == $lessonid;
		if($isLastLesson&&$useThreshold)
		{
			$isCooking = $attendanceCount>0&&($feedbackCount)/$attendanceCount<$cooking_threshold;
		}
		else {
			$isCooking = false;
		}
		if($isCooking)
		{
			$statistic ['cooking'] = true;
			$statistic ['generalCloseQuestions']=array();
			$statistic ['specificCloseQuestions']=array();
			$statistic ['generalOpenQuestions']=array();
			$statistic ['specificOpenQuestions']=array();
		}
		else {
			$statistic ['cooking'] = false;
			//rating feedback
			//general questions
			$generalCloseQuestions = $this->GetGeneralCloseQuestionsSummary(array($lessonid));
			$statistic ['generalCloseQuestions'] = empty($generalCloseQuestions)?array():$generalCloseQuestions[0];
			//syllabus question
			$specificCloseQuestions = $this->GetSpecificCloseQuestionsSummary(array($lessonid));
			$statistic ['specificCloseQuestions'] = empty($specificCloseQuestions)?array():$specificCloseQuestions[0];
			//open feedback
			//general questions
			$generalOpenQuestions = $this->GetGeneralOpenQuestionsSummary(array($lessonid));
			$statistic ['generalOpenQuestions'] = empty($generalOpenQuestions)?array():$generalOpenQuestions[0];
			//syllabus questions
			$specificOpenQuestions = $this->GetSpecificOpenQuestionsSummary(array($lessonid));
			$statistic ['specificOpenQuestions'] = empty($specificOpenQuestions)?array():$specificOpenQuestions[0];
			//usage
			global $DashboardEngagement;
			global $myid;
			$statistic ['wasViewed'] = isset($DashboardEngagement->GetDashboardEngagement($lessonid, $myid)["usageid"]);
		}
		return $statistic;
	}
	function GetGeneralCloseQuestionsSummary($lessonids) {
		if(!isset($lessonids)||count($lessonids)==0)
		{
			return array();
		}
		global $db;
		$params=array();
		$sql =
			"SELECT cs.lessonid, q.question, FLOOR(AVG(fb.answer)*25) AS avg, COUNT(fb.answer) AS responseCount
			FROM `checkstudent` AS cs
			JOIN student_generalfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			JOIN question AS q ON q.questionid = fb.questionid
			WHERE
				cs.lessonid IN (";
			foreach ($lessonids AS $index=>$lid)
				{
				$sql.=":lessonid".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($lessonids)-1)?",":"";
				//add coresponding parameter to the array
				$params['lessonid'.$index]=$lid;
				}
			$sql.=")AND
					(cs.status=1
					OR cs.status=0)
			GROUP BY cs.lessonid, q.question";
		$generalCloseQuestions = $db->smartQuery ( array (
				'sql' =>$sql,
				'par' => $params,
				'ret' => 'all' 
		) );
		$lessons = nestArray(
			$generalCloseQuestions, 'lessonid',
			array(
				array('nestBy'=>'question', 'nestIn'=>'questions', 'fieldsToNest'=>array('question', 'avg', 'responseCount'))
			));
		return array_column($lessons, 'questions');
	}
	function GetSpecificCloseQuestionsSummary($lessonids) {
		if(!isset($lessonids)||count($lessonids)==0)
		{
			return array();
		}
		global $db;
		$params=array();
		//get data about course syllabus subjects
		$sql =
			"SELECT cs.lessonid, s.subject, FLOOR(AVG(fb.answer)*25) AS avg, COUNT(fb.answer) AS responseCount
			FROM `checkstudent` AS cs
			JOIN student_subjectfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			JOIN subject AS s
				ON s.subjectid = fb.subjectid 
			WHERE
				fb.CustomSubject=0 AND cs.lessonid IN (";
			foreach ($lessonids AS $index=>$lid)
				{
				$sql.=":lessonid".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($lessonids)-1)?",":"";
				//add coresponding parameter to the array
				$params['lessonid'.$index]=$lid;
				}
			$sql.=")
				AND 
					(cs.status=1
					OR cs.status=0)
			GROUP BY cs.lessonid, s.subject";
		$specificCloseQuestions = $db->smartQuery ( array (
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all' 
		) );
		$params=array();
		//get data, in the same format, about the custom lesson subject
		$sql =
            "SELECT cs.lessonid, s.subject, FLOOR(AVG(fb.answer)*25) AS avg, COUNT(fb.answer) AS responseCount
			FROM `checkstudent` AS cs
			JOIN student_subjectfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			JOIN lesson_custom_subjects AS s
				ON s.subjectid = fb.subjectid
			WHERE
				fb.CustomSubject=1 AND cs.lessonid IN (";
        foreach ($lessonids AS $index=>$lid)
        {
            $sql.=":lessonid".$index;
            //add a comma to seperate values, unless working on the last value
            $sql.=($index<count($lessonids)-1)?",":"";
            //add coresponding parameter to the array
            $params['lessonid'.$index]=$lid;
        }
        $sql.=")
				AND 
					(cs.status=1
					OR cs.status=0)
			GROUP BY cs.lessonid, s.subject";
		$customSubjectQuestions = $db->smartQuery ( array (
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all' 
		) );
		$specificCloseQuestions=array_merge($specificCloseQuestions,$customSubjectQuestions);
		$lessons = nestArray(
			$specificCloseQuestions, 'lessonid',
			array(
				array('nestBy'=>'subject', 'nestIn'=>'subjects', 'fieldsToNest'=>array('subject', 'avg', 'responseCount'))
			));
		return array_column($lessons, 'subjects');
	}
	function GetGeneralOpenQuestionsSummary($lessonids) {
		if(!isset($lessonids)||count($lessonids)==0)
		{
			return array();
		}
		global $db;
		$params=array();
		$sql =
			"SELECT cs.lessonid, comments.answer 
			FROM `checkstudent` AS cs
			JOIN student_comments AS comments
				ON comments.checkstudentid=cs.checkstudentid
			WHERE
				comments.type=0
				AND cs.lessonid IN (";
			foreach ($lessonids AS $index=>$lid)
				{
				$sql.=":lessonid".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($lessonids)-1)?",":"";
				//add coresponding parameter to the array
				$params['lessonid'.$index]=$lid;
				}
			$sql.=")
				AND
					(cs.status=1
					OR cs.status=0)";
		$generalOpenQuestions = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
		));
		$lessons = nestArray(
			$generalOpenQuestions, 'lessonid',
			array(
				array('nestBy'=>'answer', 'nestIn'=>'comments', 'fieldsToNest'=>array('answer'))
			));
		return array_column($lessons, 'comments');
	}
	function GetSpecificOpenQuestionsSummary($lessonids) {
		if(!isset($lessonids)||count($lessonids)==0)
		{
			return array();
		}
		global $db;
		$params=array();
		$sql =
			"SELECT cs.lessonid, comments.answer 
			FROM `checkstudent` AS cs
			JOIN student_comments AS comments
				ON comments.checkstudentid=cs.checkstudentid
			WHERE
				comments.type=1
				AND cs.lessonid IN (";
			foreach ($lessonids AS $index=>$lid)
				{
				$sql.=":lessonid".$index;
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($lessonids)-1)?",":"";
				//add coresponding parameter to the array
				$params['lessonid'.$index]=$lid;
				}
			$sql.=")
				AND
					(cs.status=1
					OR cs.status=0)";
		$specificOpenQuestions = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all' 
		));
		$lessons = nestArray(
			$specificOpenQuestions, 'lessonid',
			array(
				array('nestBy'=>'answer', 'nestIn'=>'comments', 'fieldsToNest'=>array('answer'))
			));
		return array_column($lessons, 'comments');
	}
	function GetStudentsDetailsForLesson($lessonid)
	{
		global $db;
		$missingStudents = $db->smartQuery(array(
				'sql' => "
					SELECT
						p.firstname AS firstname,
						p.lastname AS lastname,
						p.image AS image,
						p.userid AS userid,
						cs.status AS attendanceStatus,
						cs.checkstudentid AS checkstudentid,
						CASE
							WHEN COUNT(fb.feedbackid)>0
								THEN 1
								ELSE 0
						END
						AS givenFeedback
					FROM `user_profile` AS p
					JOIN checkstudent AS cs
						ON cs.userid = p.userid
					LEFT JOIN student_generalfeedback as fb
						ON cs.checkstudentid = fb.checkstudentid
					WHERE 
						cs.lessonid = :lessonid
					GROUP BY cs.checkstudentid",
				'par' => array (
						'lessonid' => $lessonid
				),
				'ret' => 'all'
		));
		return $missingStudents;
	}
	// all statistic for course Summary page//
	function GetCourseStatistic($courseid) {
		$SummaryCourse['GeneralCloseQuestions'] = $this->GetCourseGeneralFeedbackAverage($courseid);
		$SummaryCourse['AvgCourseUnderstanding'] = $this->GetCourseUnderstandingAverage($courseid);
		$SummaryCourse['dropouts']=$this->GetNumOfDropouts($courseid);
		$SummaryCourse['lessons']=$this->GetCourseTrends($courseid);
		return $SummaryCourse;
	}
	function GetCourseGeneralFeedbackAverage($courseid){
		global $db;
		$params=array('courseid'=>$courseid);
		$sql =
			"SELECT q.question, FLOOR(AVG(fb.answer)*25) AS avg, COUNT(fb.answer) AS responseCount
			FROM `checkstudent` AS cs
			JOIN student_generalfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			JOIN question AS q ON q.questionid = fb.questionid
			JOIN lesson AS l ON l.lessonid = cs.lessonid
			WHERE
				l.courseid = :courseid
				AND l.ignoreMe = 0
				AND
					(cs.status=1
					OR cs.status=0)
			GROUP BY q.question";
		$generalCloseQuestions = $db->smartQuery ( array (
				'sql' =>$sql,
				'par' => $params,
				'ret' => 'all' 
		));
		return $generalCloseQuestions;
	}
	function GetCourseUnderstandingAverage($courseid){
		global $db;
		$params=array('courseid'=>$courseid);
		$sql =
			"SELECT ROUND(AVG(fb.answer)*25) AS avg
			FROM `checkstudent` AS cs
			JOIN student_subjectfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			JOIN lesson AS l ON l.lessonid = cs.lessonid
			WHERE
				l.courseid = :courseid
				AND l.ignoreMe = 0
				AND
					(cs.status=1
					OR cs.status=0)";
		$generalCloseQuestions = $db->smartQuery ( array (
				'sql' =>$sql,
				'par' => $params,
				'ret' => 'fetch-assoc' 
		));
		return $generalCloseQuestions['avg'];
	}
	function GetCourseTrends($courseid){
		global $db;
		$params=array('courseid'=>$courseid);
		$sql =
			"SELECT
				cs.lessonid,
				FLOOR(AVG(CASE WHEN cs.status = 0 OR cs.status = 1 THEN fb.answer ELSE null END)*25) AS understanding,
				SUM(CASE WHEN cs.status = 0 OR cs.status = 1 THEN 1 ELSE 0 END) AS exist,
				SUM(CASE WHEN cs.status = 1 THEN 1 ELSE 0 END) AS late,
				COUNT(cs.checkstudentid) AS 'from'
			FROM lesson AS l
			LEFT JOIN `checkstudent` AS cs ON cs.lessonid = l.lessonid
			LEFT JOIN student_subjectfeedback AS fb
				ON fb.checkstudentid=cs.checkstudentid
			WHERE
				l.courseid = :courseid AND
				l.ignoreMe = 0 AND
				cs.lessonid IS NOT NULL
			GROUP BY cs.lessonid";
		$trends = $db->smartQuery ( array (
				'sql' =>$sql,
				'par' => $params,
				'ret' => 'all' 
		));
		return $trends;
	}
	function GetNumOfDropouts($courseid)
	{
		global $db;
		$dropouts = $db->smartQuery ( array (
				'sql' => "SELECT  COUNT(*) AS count
					FROM enrollment AS e
					WHERE
						e.courseid=:courseid
						AND e.status=0",
				'par' => array (
					'courseid' => $courseid
				),
				'ret' => 'fetch-assoc'
		) );
		return $dropouts['count'];
	}

	function GetStudentStatsSummary($courseid){
		global $db;
		global $Course;
		$students =  $Course->GetStudentsInCourse($courseid);
		$studentAlerts = 0;
		foreach ($students AS $student) {
			
		}
		return $studentAlerts;
	}
	//TODO - fix hardcoding of enrollmentroleid
	function GetStudentStats($courseid) {
		global $db;
		$students = $db->smartQuery ( array (
			'sql' => "
				SELECT
					p.userid, p.firstname, p.lastname, p.image,
					e.status, e.enrollmenttagid,
					attendance.attendanceRate, attendance.attendanceLessonCount,
					understanding.understanding, understanding.feedbackLessonCount,
					mentoring.sessionList AS mentoringSessions
				FROM enrollment AS e
				LEFT JOIN user_profile AS p ON p.userid = e.userid
				LEFT JOIN user AS u ON u.userid = p.userid
				LEFT JOIN (
					SELECT
						e.userid AS userid,
						AVG(CASE WHEN cs.status=0 THEN 1 WHEN cs.status=1 THEN 0.5  WHEN cs.status IS NULL THEN NULL ELSE 0 END) AS attendanceRate, COUNT(DISTINCT cs.lessonid) AS attendanceLessonCount
					FROM lesson AS l
					LEFT JOIN enrollment AS e ON e.courseid = l.courseid
					LEFT JOIN checkstudent AS cs ON cs.lessonid=l.lessonid AND cs.userid = e.userid
					WHERE
						l.courseid = :courseid
						AND l.ignoreMe = 0
						AND e.enrollmentroleid = 1
					GROUP BY e.userid) AS attendance ON attendance.userid = p.userid
				LEFT JOIN (
					SELECT
						e.userid AS userid,
						AVG(f.answer * 1) AS understanding, COUNT(DISTINCT f.checkstudentid) AS feedbackLessonCount
					FROM lesson AS l
					LEFT JOIN enrollment AS e ON e.courseid = l.courseid
					LEFT JOIN checkstudent AS cs ON cs.lessonid=l.lessonid AND cs.userid = e.userid
					LEFT JOIN student_subjectfeedback AS f ON f.checkstudentid = cs.checkstudentid
					WHERE
						l.courseid = :courseid
						AND l.ignoreMe = 0
						AND e.enrollmentroleid = 1
					GROUP BY e.userid) AS understanding ON understanding.userid = e.userid
				LEFT JOIN 
					(SELECT
						mss.userid AS userid,
						CONCAT('[', GROUP_CONCAT(
							CONCAT(
								'{',
								'\"mentoringsessionid\": ', ms.mentoringsessionid, ', ',
								'\"mentoringSessionDate\": \"', ms.scheduleddate, '\", ',
								'\"mentoringSessionHe\": \"', mst.nameinhebrew, '\", ',
								'\"mentoringSessionAr\": \"', mst.nameinarabic, '\"',
								'}'
							)
						), ']') AS sessionList
					FROM
						mentoringsession AS ms 
						LEFT JOIN `mentoringsession_student` AS mss ON mss.mentoringsessionid = ms.mentoringsessionid
						LEFT JOIN mentoringsessiontype AS mst ON mst.mentoringsessiontypeid = ms.mentoringsessiontypeid
					WHERE ms.courseid = :courseid
					GROUP BY mss.userid) AS mentoring ON mentoring.userid = e.userid
				WHERE
					e.courseid = :courseid
					AND e.enrollmentroleid = 1
					AND u.status = 1
				ORDER BY e.status DESC, CONCAT(p.firstname, ' ', p.lastname) ASC",
				'par' => array (
					'courseid' => $courseid
				),
				'ret' => 'all' 
		) );
		foreach($students as $sindex=>$student)
		{
			$students[$sindex]['mentoringSessions']=json_decode($students[$sindex]['mentoringSessions']);
			$students[$sindex]['attendance'] = array ();
			$students[$sindex]['understanding'] = array ();
			$students[$sindex]['attendance']['average']['rate'] = floor($student["attendanceRate"] * 100);
			$students[$sindex]['attendance']['average']['numOfMeetings'] = $student["attendanceLessonCount"];
			$students[$sindex]['understanding']['average']['rate'] = floor($student["understanding"] * 25);
			$students[$sindex]['understanding']['average']['numOfMeetings'] = $student["feedbackLessonCount"];
			//unset($students[$sindex]['lessons']);
		}
		return $students;
	}
}
?>