<?php
class Course{
	function AddCourse($course)
	{
		global $db;
		$fullcoursename = $course->name;
		$shortcoursenamear = $course->subnameinarabic;
		$shortcoursenamehe = $course->subname;
		$cityid = $course->cityid;
		$projectid = $course->projectid;
		$yearbudgetid = $course->yearbudgetid;
		$status = $course->status;
		$tags = $course->tags;
		$syllabus = $course->subjects;
		$primaryTeacherId = $course->primaryTeacherId;

		$code = $this->GetCodeForCourse();

		$result = $db->smartQuery(array(
			'sql' => "INSERT INTO `course` (`code`, `name`, `subname`, `subnameinarabic`, `projectid`, `cityid`,  `yearbudgetid`, `status`) VALUES (:code, :name, :subname, :subnameinarabic, :projectid, :cityid, :yearbudgetid, :status);",
			'par' => array('name' => $fullcoursename, 'subname' => $shortcoursenamehe, 'subnameinarabic'=>$shortcoursenamear, 'cityid' => $cityid, 'code' => $code, 'projectid'=>$projectid, 'yearbudgetid'=>$yearbudgetid, 'status' => $status),
			'ret' => 'result'
		));
		$courseid = $db->getLastInsertId();

		foreach($tags as $tag)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `course_projecttags` (`courseid`, `projecttagid`) VALUES (:courseid, :projecttagid);",
				'par' => array('courseid' => $courseid, 'projecttagid' => $tag),
				'ret' => 'result'
			));
		}
		
		global $Syllabus;
		$Syllabus->AddSyllabus($syllabus,$courseid);
		global $Enrollment;
		//TODO - fix hardcoding of enrollmentroleid
		$Enrollment->EnrollUsers(array($primaryTeacherId), $courseid, 2);
		$Enrollment->SetPrimaryTeacher($primaryTeacherId, $courseid);
		return (object)array("courseid"=>$courseid);
	}

	function UpdateCourse($course)
	{
		global $db;
		$courseid = $course->courseid;
		$fullcoursename = $course->name;
		$shortcoursenamear = $course->subnameinarabic;
		$shortcoursenamehe = $course->subname;
		$cityid = $course->cityid;
		$projectid = $course->projectid;
		$yearbudgetid = $course->yearbudgetid;
		$status = $course->status;
		$tags = $course->tags;
		$syllabus = $course->subjects;
		$removeFromSyllabus = $course->subjectsToDelete;
		$primaryTeacherId = $course->primaryTeacherId;
      //  $statusesAreEqual=$this->checkstatus($status,$courseid);

		$result = $db->smartQuery(array(
			'sql' => "UPDATE `course` SET `subnameinarabic`=:subnameinarabic, `name`=:name, `subname`=:subname, `cityid`=:cityid, `projectid`=:projectid, `yearbudgetid`=:yearbudgetid, `status`=:status WHERE `courseid`=:courseid",
			'par' => array('name' => $fullcoursename, 'subname' => $shortcoursenamehe, 'subnameinarabic' => $shortcoursenamear, 'cityid' => $cityid, 'projectid'=>$projectid, 'yearbudgetid'=>$yearbudgetid, 'status' => $status, 'courseid'=>$courseid),
			'ret' => 'result'
		));

		$result = $db->smartQuery(array(
			'sql' => "DELETE FROM `course_projecttags` WHERE courseid=:courseid;",
			'par' => array('courseid' => $courseid),
			'ret' => 'result'
		));

		foreach($tags as $tag)
		{
			$result = $db->smartQuery(array(
				'sql' => "INSERT INTO `course_projecttags` (`courseid`, `projecttagid`) VALUES (:courseid, :projecttagid);",
				'par' => array('courseid' => $courseid, 'projecttagid' => $tag),
				'ret' => 'result'
			));
		}
		global $Syllabus;
		$Syllabus->RemoveFromSyllabus($removeFromSyllabus);
		$Syllabus->AddSyllabus($syllabus,$courseid);
		global $Enrollment;
		//TODO - fix hardcoding of enrollmentroleid
		$Enrollment->EnrollUsers(array($primaryTeacherId), $courseid, 2);
		$Enrollment->SetPrimaryTeacher($primaryTeacherId, $courseid);
		//if(!$statusesAreEqual)
        $this->UpdateEnrollmentsStatuses($status,$courseid);
		return (object)array("courseid"=>$courseid);
	}

    /****
     * @param $status - course status
     * @param $courseid
     *
     * if the course status changes to 0:
     * first query:
     * - all active student will change to status=0, and enrollment tag=סיים (4)
     * seconde query:
     * -- all active teachers will change to status=0
     *
     * if the course status changes to 1:
     * irst query:
     * - all inactive student will change to status=1, and enrollment tag=פעיל (1)
     * seconde query:
     * -- all inactive teachers will change to status=1
     *@return queries answers

     */

	function UpdateEnrollmentsStatuses($status,$courseid)
    {
        global $db;

        if ($status == 0) {
            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` SET 	`enrollmenttagid`=:enrollmenttagid, `status`=:status  WHERE `courseid`=:courseid and `enrollmentroleid`=:enrollmentroleid and `status`=:status1 and `enrollmenttagid`=:enrollmenttagid1",
                'par' => array('enrollmenttagid' => 2, 'enrollmentroleid' => 1, 'status' => $status, 'courseid' => $courseid,'status1'=>1,'enrollmenttagid1'=>1),
                'ret' => 'result'
            ));

            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` SET 	`status`=:status  WHERE `courseid`=:courseid and `enrollmentroleid`=:enrollmentroleid and `status`=:status1",
                'par' => array('enrollmentroleid' => 2, 'status' => $status, 'courseid' => $courseid ,'status1'=>1),
                'ret' => 'result'
            ));

        } else {
            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` SET 	`enrollmenttagid`=:enrollmenttagid, `status`=:status  WHERE `courseid`=:courseid and `enrollmentroleid`=:enrollmentroleid and `status`=:status1 and `enrollmenttagid`=:enrollmenttagid1",
                'par' => array('enrollmenttagid' => 1, 'enrollmentroleid' => 1, 'status' => $status, 'courseid' => $courseid,'status1'=>0,'enrollmenttagid1'=>2),
                'ret' => 'result'
            ));

            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` SET 	`status`=:status  WHERE `courseid`=:courseid and `enrollmentroleid`=:enrollmentroleid and `status`=:status1",
                'par' => array('enrollmentroleid' => 2, 'status' => $status, 'courseid' => $courseid,'status1'=>0),
                'ret' => 'result'
            ));
        }
        //fix return value - see if there is a 'false' answer from any query in this method
        return $result;


    }

    /***
     * THIS METHOD NOT IN USE
     * @param $status
     * @param $courseid
     * @return bool
     * check if the status in the DB is equal to the new status
     */

    function checkstatus($status,$courseid)
    {
        global $db;
        $statusfromdb =  $db->smartQuery(array(
            'sql' => "SELECT `status` FROM `course` WHERE `courseid` = :courseid",
            'par' => array('courseid'=>$courseid),
            'ret' => 'fetch-all'
        ));

        if($statusfromdb==$status)
            return true;
        return false;
    }
	
	function GetCodeForCourse()
	{
		 global $db;
		 $codeLength=4;
		 $maxTries=20;
		 $proposedCode = "";
		 $chars1 = array('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
		 for ($uniqueGenerationAttempt = 0; $uniqueGenerationAttempt<= $maxTries; $uniqueGenerationAttempt++) {
		 	$proposedCode="";
		 	for ($charIndex = 0; strlen($proposedCode)<$codeLength; $charIndex++)
		 	{
		 		$index = rand(0, count($chars1)-1);
		 		$proposedCode.=$chars1[$index];
		 	}
		 	$alreadyUsed =  $db->smartQuery(array(
		 			'sql' => "SELECT courseid FROM course WHERE code=:code",
		 			'par' => array('code'=>$proposedCode),
		 			'ret' => 'fetch-assoc'
		 	));
		 	if(!isset($alreadyUsed['courseid']))
		 	{
		 		return $proposedCode;
		 	}
		 }
		 return (object)array("error"=>"too many tries before an unused course code was found");
	}
	
	function DeleteCourse($courseid)
	{
		global $db;
		$result = $db->smartQuery(array(
			'sql' => "
			DELETE FROM `subject` WHERE courseid=:courseid;
			DELETE FROM `tagproject_course` WHERE courseid=:courseid;
			DELETE FROM `lesson` WHERE courseid=:courseid;
			DELETE FROM `enrollment` WHERE courseid=:courseid;
			DELETE FROM `course` WHERE courseid=:courseid;
			",
			'par' => array('courseid' => $courseid),
			'ret' => 'result'
		));
		return $result;
	}
	
	/**
		 * Gets a list of search perimeters, and returns a list of students according to said perimeters, filtered by
		 * whether or not the user who makes the request is authorized to view them,
		 * along side the number of pages filled by the full results set
		 * @param String $search - the search term to use
		 * @param String $sorting - based on which field to sort the results
		 * @param boolean $desc - whether to order the results in a descending order
		 * @param int $coursestatus - which user status to filter by
		 * @param int $page - which page of the results to return
		 * @return results[]:
		 * {
		 * "courses":
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

	function SearchCourses($search, $sorting, $desc, $coursestatus, $page)
	{

	   // return $sorting;
		global $db;
		$sortByField='courseid';
		//permit only certain ORDER BY values to avoid injection
        $os= array(
            'c.code', 'c.name', 'c.subname','city.name', 'teachers', 'studentnum','project.name',',year.year'
        );
		if(in_array($sorting,$os,true)== true)
        {

            $sortByField=$sorting;
           // return true;
        }
		$sortingDirection = $desc?"DESC":"ASC";
		$coursesids = GetAccessibleCourses();
		if(count($coursesids)==0)
		{
			$ans = array('courses'=>array(), 'pages'=>0);
			return $ans;
		}
		//construct a query template which includes all of the student ids
		//and populate the parameter array with the ids themselves
		$params = array('status'=>$coursestatus, 'search'=>'%'.$search.'%');
		$sql =
		"SELECT DISTINCT 
			c.courseid, c.code,
			c.name, c.subname, c.subnameinarabic,
			city.name AS cityname,
			year.year AS year, project.name AS project,
			COUNT(DISTINCT students.userid) AS studentnum,
			GROUP_CONCAT(distinct teachers.fullname separator ', ') AS teachers
		FROM `course` AS c
		LEFT JOIN city AS city ON city.cityid = c.cityid
		LEFT JOIN project AS project ON project.projectid = c.projectid
		LEFT JOIN yearbudget AS year ON year.yearbudgetid = c.yearbudgetid
		
		left JOIN (
			SELECT DISTINCT enrollment.* 
			FROM enrollment, user_profile 
			WHERE
				enrollment.enrollmentroleid = 1 
				AND enrollment.status = :status AND user_profile.status=1 AND user_profile.userid=enrollment.userid
		) AS students ON students.courseid = c.courseid 
		
		left JOIN (
			SELECT CONCAT(teacher.firstname, ' ', teacher.lastname) AS fullname, enrollment.courseid
			FROM enrollment, user_profile AS teacher  
			WHERE
				enrollment.enrollmentroleid = 2 AND
				enrollment.status = :status AND
				teacher.status=1 AND teacher.userid = enrollment.userid
		) AS teachers ON teachers.courseid = c.courseid
		
		WHERE
			c.status=:status
			AND c.courseid IN (";
		foreach ($coursesids AS $index=>$cid)
		{
			$sql.=":courseid".$index;
			//add a comma to seperate values, unless working on the last value
			$sql.=($index<count($coursesids)-1)?",":"";
			//add coresponding parameter to the array
			$params['courseid'.$index]=$cid;
		}
		$sql.=")
			AND CONCAT(c.code,' ',c.name,' ',c.subname,' ',c.subnameinarabic,' ',city.name,' ',project.name,year.year) LIKE :search
		GROUP BY c.courseid
		ORDER BY c.".$sortByField." ".$sortingDirection;//here->>trying to sort by value from course table
		//fetch students
		$courses = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'all'
		));
        //for excel export usage
        if($page==-1)
            return $courses;
        ////////////////////////
        else
            return cutPage($courses, 'courses', $page);

	}
	
	function GetCourseById($courseid)
	{
		global $db;
		global $Syllabus;
		$course = $db->smartQuery(array(
				'sql' => "
					SELECT * FROM course
					WHERE courseid = :courseid",
				'par' => array('courseid'=>$courseid),
				'ret' => 'fetch-assoc'
		));
		if (!isset($course["courseid"]))
		{
			return (object)array("error"=>"course id not found"); 
		}
		$primaryTeacher = $this->GetPrimaryTeacherByCourseId($courseid);
		$course["primaryTeacherId"] = isset($primaryTeacher["primaryTeacherId"])?$primaryTeacher["primaryTeacherId"]: null;
		$course["primaryTeacherName"] = isset($primaryTeacher["primaryTeacherName"])?$primaryTeacher["primaryTeacherName"]:null;
		$course["tags"] = $this->GetTagsByCourseId($courseid);
		$course["subjects"] = $Syllabus->GetSyllabusSubjectsByCourseId($courseid);
        $course["status"]=$course["status"]==1?true:false;
		return $course;
	}

	function GetPrimaryTeacherByCourseId($courseid)
	{
		global $db;
		$teacher = $db->smartQuery(array(
			'sql' => "
				SELECT p.userid AS primaryTeacherId, CONCAT(p.firstname, ' ', p.lastname) AS primaryTeacherName
				FROM enrollment AS e
				JOIN user_profile AS p ON p.userid = e.userid
				WHERE
					courseid = :courseid
					AND enrollmentroleid=2
					AND isPrimary=1",
			'par' => array('courseid'=>$courseid),
			'ret' => 'fetch-assoc'
		));
		return $teacher;
	}

	function GetTagsByCourseId($courseid)
	{
		global $db;
		$tags =  $db->smartQuery(array(
			'sql' => "SELECT projecttagid FROM course_projecttags WHERE courseid = :courseid",
			'par' => array('courseid'=>$courseid),
			'ret' => 'fetch-all'
		));
		$tags = array_column($tags, "projecttagid");
		return $tags;
	}
	
	/**
	 * returns basic data that has to be displayed in the course page in the app: course name in both he and ar, instructor name, and my classroom notifications 
	 * @param int $courseid - the unique id of the course
	 * @return array {code:"I4G2", name:"some course name 2017 ramala", subname:"some course name", subnameinarabic:"self explanatory",
	 * madrichname:"ploni shemtov", myClassroomNotificationCount:3}
	 */

	function GetCourseDataById($courseid)
	{
		global $db;
		global $Statistic;
		$course = $db->smartQuery(array(
				'sql' => "
				SELECT c.courseid, code, name, subname, subnameinarabic
				FROM `course` AS c
				WHERE c.`courseid` = :courseid",
				'par' => array('courseid'=>$courseid),
				'ret' => 'fetch-assoc'
		));
		//if a course with the supplied id is found
		if(isset($course['courseid']))
		{
			//get the number of students who had either a low attendance streak of 2 or more
			//or a a low understanding streak of 2 or more
			$course['nStudentAlerts'] = 0;//$Statistic->GetStudentStatsSummary($courseid);
			return $course;
		}else
		{
			return (object)array("error"=>"course id not found");
		}
	}
	
	/**
	 * returns frequently updated data about the course - the lessonid of the next lesson, and the lesson id and user status of the last/current lesson
	 * @param int $courseid - the unique id of the course
	 * @param String $token - the unique user token for the session
	 * @return array {nextlesson: 13, lastlesson: {lessonid:12, closed:true, status:{gaveFeedback:true, approvedAttendance:false...}}
	 */

	function GetUserFlowPosInCourse($courseid)
	{
		global $db;
		global $Lesson;
		$course = array();
		$course['nextlesson'] = $this->GetNextLessonByCourseId($courseid);
		$course['lastlesson'] = $this->GetCurrentLessonByCourseId($courseid);
		if(isset($course['lastlesson']))
		{
			$course['lastlesson']['checkoutProgress'] = $Lesson->GetUserFlowPosInLesson($course['lastlesson']['lessonid']);
		}
		return $course;
	}
	
	/**
	 * returns the lessonid of the next (i.e. created but not yet opened) lesson in the course
	 * @param int $courseid - the unique id of the course
	 * @return int lessonid - the unique id of next lesson if one exists
	 */

	function GetNextLessonByCourseId($courseid)
	{
		global $db;
		$nextLesson = $db->smartQuery(array(
				'sql' => "SELECT lessonid FROM `lesson` WHERE `courseid`=:courseid AND `checkout`IS NULL AND `checkin` IS NULL",
				'par' => array( 'courseid' => $courseid),
				'ret' => 'fetch-assoc'
		));
		return $nextLesson['lessonid'];
	}
	
	/**
	 * returns the lessonid of the current (last opened) lesson in the course
	 * @param int $courseid - the unique id of the course
	 * @return int lessonid - the unique id of next lesson if one exists
	 */

	function GetCurrentLessonByCourseId($courseid)
	{
		global $db;
		$currLesson= $db->smartQuery(array(
				'sql' => "SELECT lessonid, checkout FROM `lesson` WHERE `courseid`=:courseid AND `checkin` IS NOT NULL ORDER BY lessonid DESC LIMIT 1",
				'par' => array('courseid' => $courseid),
				'ret' => 'fetch-assoc'
		));
		if(isset($currLesson['lessonid']))
		{
			$currLesson["closed"] = $currLesson["checkout"]!=null;
			unset($currLesson['checkout']);
		}
		else {
			$currLesson=null;
		}
		return $currLesson;
	}
	
	function GetCoursesIdByStudentId($studentid)
	{
		global $db;
		if(!isset($studentid) || $studentid=="")
		{
			return (object)array("error" => "studentid not exist");
		}
		
		$coursesid = $db->smartQuery(array(
			'sql' => "Select courseid FROM `student_course` Where `studentid`=:studentid",
			'par' => array( 'studentid' => $studentid),
			'ret' => 'fetch-assoc'
		));
		if( $coursesid['courseid']=="")
		{
			return (object)array("error" => "there are no course for this token");
		}else
		{
			$myArray = explode(',', $coursesid['courseid']);
			return (object)array("ids" => $myArray);
		}
	}
	
	function GetCourseByCode($code)
	{
		global $db;
		$course = $db->smartQuery(array(
			'sql' => "SELECT * FROM course WHERE `code`=:code",
			'par' => array( 'code' => $code),
			'ret' => 'fetch-assoc'
		));
		return $course;
	}
	
	function getCourseNameByLessonId($lessonid)
	{
		global $db;
		$course = $db->smartQuery(array(
				'sql' => "SELECT course.subname AS subname FROM `lesson` AS ls JOIN `course` AS course WHERE ls.lessonid=:lessonid",
				'par' => array( 'lessonid' => $lessonid),
				'ret' => 'fetch-assoc'
		));
		return $course["subname"];
	}

	//notifications related functions

	function sendNotificationToStudentOnMeetingCreation($courseid,$lessonid,$beginningdate, $isUpdate)
	{
		global $db;
		$course = $db->smartQuery(array(
		'sql' => "SELECT subname FROM `course` WHERE `courseid`=:courseid",
		'par' => array( 'courseid' => $courseid),
		'ret' => 'fetch-assoc'
		));
		$beginningdate = substr($beginningdate,0,10);
		$beginningdate = date('d/m/Y H:i', (int)$beginningdate);
		$message=  $beginningdate;
		if(!$isUpdate)
			$title= "נוצר מפגש חדש בקורס ".$course['subname'];
		else 
			$title= "עודכנו פרטי המפגש בקורס ".$course['subname'];
		$type = 'newLesson';
		$this -> sendNotificationToStudentByCourseid($courseid,$lessonid,$message, $title, $type);
	}
	
	function sendNotificationToStudentOnMeetingActivation($courseid,$lessonid)
	{
		global $db;
		$course = $db->smartQuery(array(
		'sql' => "SELECT subname FROM `course` WHERE `courseid`=:courseid",
		'par' => array( 'courseid' => $courseid),
		'ret' => 'fetch-assoc'
		));
		$message=  "נראה אותך?";
		$title= "המפגש שלך בקורס ".$course['subname']." תיכף מתחיל";
		$type = 'lessonActivated';
		$this -> sendNotificationToStudentByCourseid($courseid,$lessonid,$message, $title, $type);
	}
	
	function sendNotificationToStudentByCourseid($courseid,$lessonid,$message, $title, $type)
	{
		global $db;
		global $FireBaseFCM;
		//TODO - fix hardcoding of enrollmentroleid
		$students = $db->smartQuery(array(
		'sql' => "
		SELECT u.userid, u.fbtokenid AS token FROM
			`enrollment` AS e
			JOIN user AS u ON u.userid = e.userid
		WHERE
			e.`courseid`=:courseid
			AND e.status=1
			AND e.enrollmentroleid=1
			AND u.status=1
			AND u.fbtokenid<>''",
		'par' => array( 'courseid' => $courseid),
		'ret' => 'all'
		));
		if(isset($students)&&count($students)>0)
		{
			$tokens = array_column($students, 'token');
			$FireBaseFCM->sendMessage($title,$message,$tokens,$courseid,$lessonid,$type);
		}
	}
}	