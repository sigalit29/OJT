<?php
use Aws\Sns\MessageValidator\Message;

class notificationCron{
	//TODO - fix hardcoding of enrollmentroleid
	function CheckActivationReminderNotification()
	{
		global $db;
		global $FireBaseFCM;
		//$Course -> getCourseNameByLessonId(1);
		$timeend = "".(time() + 3600)."000";// an hour from now
		//lessons that are about to start
		$lessons =  $db->smartQuery(array(
				'sql' => "
				SELECT
					ls.lessonid AS lessonid, ls.courseid AS courseid, ls.num AS lessonIndex, u.fbtokenid AS fbToken, c.subname AS courseName
				FROM lesson AS ls
				LEFT JOIN user AS u ON u.userid=ls.createdby
				JOIN course AS c ON c.courseid=ls.courseid
				WHERE
					ls.checkin IS NULL
					AND ls.beginningdate<:timeend
					AND sentActivationReminderNotification='0'",
				'par' => array('timeend'=>$timeend),
				'ret' => 'all'
		));
		echo "activation: ".json_encode($lessons)."\n";
		
		if(count($lessons)>0)
		{
			$type = "activationReminder";
			$message = "לא לשכוח להפעיל אותו!";
			$result = true;
			foreach($lessons as $lesson)
			{
				$title= "המפגש שלך בקורס ".$lesson["courseName"]." יתחיל עוד שעה";
				if($lesson["fbToken"])
				{
					$FireBaseFCM->sendMessage(
						$title,
						$message,
						array($lesson["fbToken"]),
						$lesson["courseid"],
						$lesson["lessonid"],
						$type
					);
				}
				$result =  $db->smartQuery(array(
					'sql' => "
						UPDATE lesson
						SET sentActivationReminderNotification=:sendingtime
						WHERE lessonid=:lessonid",
					'par' => array('lessonid'=>$lesson['lessonid'], 'sendingtime'=>time()),
					'ret' => 'result'
				));
			}
			return $result;
		}
		return null;
	}
	
	function CheckClosingReminderNotification()
	{
		global $db;
		global $FireBaseFCM;
		$timeend = time() - 60000;// ten hourse ago
		//lessons that are active for more than 10 hours
		$lessons =  $db->smartQuery(array(
				'sql' => "
					SELECT
						ls.lessonid AS lessonid, ls.courseid AS courseid, ls.num AS lessonIndex, u.fbtokenid AS fbToken, c.subname AS courseName
					FROM lesson AS ls
					LEFT JOIN user AS u ON u.userid=ls.activatedby
					JOIN course AS c ON c.courseid=ls.courseid
					WHERE
						ls.checkin IS NOT NULL AND
						ls.checkin<:timeend AND
						ls.checkout IS NULL AND
						sentClosingReminderNotification='0'",
				'par' => array('timeend'=>$timeend),
				'ret' => 'all'
		));
		if(count($lessons)>0)
		{
			$type = "closingReminder";
			$message = "אם המפגש הסתיים, לא לשכוח לסגור אותו!";
			foreach($lessons as $lesson)
			{
				$title = "האם המפגש שלך ב-".$lesson["courseid"]." כבר הסתיים?";
				if($lesson["fbToken"])
				{
					$FireBaseFCM->sendMessage(
						$title,
						$message,
						array($lesson["fbToken"]),
						$lesson["courseid"],
						$lesson["lessonid"],
						$type
					);
				}
				$result =  $db->smartQuery(array(
						'sql' => "
							UPDATE lesson
							SET sentClosingReminderNotification=:sendingtime
							WHERE lessonid=:lessonid",
						'par' => array('lessonid'=>$lesson['lessonid'], 'sendingtime'=>time()),
						'ret' => 'result'
				));
			}
			return $result;
		}
		return null;
	}
	function CheckTeacherFeedbackReminderNotification()
	{
		global $db;
		global $FireBaseFCM;
		//$Course -> getCourseNameByLessonId(1);
		$timeend = "".(time() - 1800);// half an hour ago
		$timestart = "".(time() - 3600);// an hour ago
		//lessons that are about to start
		$lessons =  $db->smartQuery(array(
				'sql' => "
				SELECT
					ls.lessonid AS lessonid, ls.courseid AS courseid, ls.num AS lessonIndex, u.fbtokenid AS fbToken, c.subname AS courseName
				FROM lesson AS ls
				LEFT JOIN user AS u ON u.userid=ls.closedby
				LEFT JOIN madrich_generalfeedback AS f ON f.lessonid= ls.lessonid
				JOIN course AS c ON c.courseid=ls.courseid
				WHERE
					ls.checkout IS NOT NULL
					AND ls.checkout>:timestart
					AND ls.checkout<:timeend
					AND sentTeacherFeedbackReminderNotification='0'",
				'par' => array('timeend'=>$timeend, 'timestart'=>$timestart),
				'ret' => 'all'
		));
		echo "CheckTeacherFeedbackReminderNotification ".json_encode($lessons)."\n";
		if(count($lessons)>0)
		{
			$type = "teacherFeedbackReminder";
			$message = "איך התרשמת מהמפגש?";
			$result = true;
			foreach($lessons as $lesson)
			{
				$title= "המפגש שלך בקורס ".$lesson["courseName"]." נסגר, אבל לא כתבת משוב";
				if($lesson["fbToken"])
				{
					$FireBaseFCM->sendMessage(
						$title,
						$message,
						array($lesson["fbToken"]),
						$lesson["courseid"],
						$lesson["lessonid"],
						$type
					);
				}
				$result =  $db->smartQuery(array(
					'sql' => "
						UPDATE lesson
						SET sentTeacherFeedbackReminderNotification=:sendingtime
						WHERE lessonid=:lessonid",
					'par' => array('lessonid'=>$lesson['lessonid'], 'sendingtime'=>time()),
					'ret' => 'result'
				));
			}
			return $result;
		}
		return null;
	}

	function CheckDashboardReminderNotification()
	{
		global $db;
		global $FireBaseFCM;
		$lessons =  $db->smartQuery(array(
			'sql' => "
				SELECT ls.lessonid AS lessonid, ls.courseid AS courseid, u.fbtokenid AS fbToken, c.subname AS courseName
				FROM lesson AS ls
				JOIN course AS c ON c.courseid=ls.courseid
				JOIN user AS u ON u.userid=ls.closedby
				LEFT JOIN meetingengagement AS me ON me.userid = ls.closedby AND me.lessonid = ls.lessonid
				WHERE
					me.usageid IS NULL
					AND ls.checkout IS NOT NULL
					AND sentDashboardReminderNotification='0'",
			'par' => array(),
			'ret' => 'all'
		));
		
		if(count($lessons)>0)
		{
			$title = "הדאשבוארד שלך מוכן!";
			$message = "סקרו את הנתונים מהמפגש האחרון";
			$type = "dashboardReminder";
			foreach($lessons as $lesson)
			{
				if($lesson["fbToken"])
				{
					$FireBaseFCM->sendMessage(
						$title,
						$message,
						array($lesson["fbToken"]),
						$lesson["courseid"],
						$lesson["lessonid"],
						$type
					);
				}
				$result =  $db->smartQuery(array(
					'sql' => "
						UPDATE lesson
						SET sentDashboardReminderNotification=:sendingtime
						WHERE lessonid=:lessonid",
					'par' => array('lessonid'=>$lesson['lessonid'], 'sendingtime'=>time()),
					'ret' => 'result'
				));
			}
			return $result;
		}
		return null;
	}
	
	function CheckCheckoutNotification()
	{
		global $db;
		$timestart = time() - 15400; // a little more than 4 hours ago
		$timeend = time() - 14400; //4 hours ago
		
		$checkstudents =  $db->smartQuery(array(
				'sql' => "
					SELECT 
						cs.checkstudentid, cs.userid, l.* 
					FROM checkstudent AS cs 
					JOIN lesson AS l 
						ON cs.lessonid = l.lessonid
					JOIN student_generalfeedback AS f
						ON f.checkstudentid = cs.checkstudentid
					WHERE 
						(cs.status=0 OR cs.status=1)
						AND l.checkin IS NOT NULL
						AND l.checkout IS NOT NULL
						AND l.checkout<:timeend 
						AND l.checkout>:timestart
						AND cs.CheckoutNotification='0'
					GROUP BY cs.checkstudentid
					HAVING COUNT(f.feedbackid)>0
						",
				'par' => array('timeend'=>$timeend, 'timestart'=>$timestart),
				'ret' => 'all'
		));
		if(count($checkstudents)>0)
		{
			$type = "checkout";
			$title = "נא לעשות צ'קאאוט בקורס";
			$message = "נשמח לשמוע איך היה לכם";
			$ans = $this->sendNotificationToStudentByCheckStudents($checkstudents, $type,$title, $message);
			if($ans==true)
			{
				foreach($checkstudents as $checkstudent)
				{
					$result =  $db->smartQuery(array(
							'sql' => "UPDATE checkstudent SET CheckoutNotification='1' WHERE checkstudentid=:checkstudentid",
							'par' => array('checkstudentid'=>$checkstudent['checkstudentid']),
							'ret' => 'result'
					));
				}
				
				return $result;
				
			}else
			{
				return false;
			}
		}else
		{
			return null;
		}
	}
	
	function sendNotificationToStudentByCheckStudents($checkstudents, $type,$title, $message)
	{
		global $db;
		global $FireBaseFCM;
		
		$tokens = array();
		foreach($checkstudents as $student)
		{
			$fbtoken = $db->smartQuery(array(
					'sql' => "SELECT fbtokenid FROM `user` WHERE `userid`=:userid",
					'par' => array( 'userid' => $student['userid']),
					'ret' => 'fetch-assoc'
			));
			$tokens = array();
			$tokens[] = $fbtoken['fbtokenid'];
			if(isset($fbtoken['fbtokenid']) && $fbtoken['fbtokenid']!='')
			{
				$course = $db->smartQuery(array(
						'sql' => "SELECT subname FROM `course` WHERE`courseid`=:courseid",
						'par' => array( 'courseid' => $student['courseid']),
						'ret' => 'fetch-assoc'
				));
				
				$title= " $title ".$course['subname'];
				$lessonid = $student['lessonid'];
				$courseid = $student['courseid'];
				$FireBaseFCM->sendMessage($title,$message,$tokens,$courseid,$lessonid,$type);
			}
		}
		return true;
	}
	
	function sendNotificationToStudentBylessons($lessons,$type,$title, $message)
	{
		global $db;
		global $FireBaseFCM;
		
		foreach($lessons as $lesson)
		{
			$students = $db->smartQuery(array(
					'sql' => "
						SELECT userid
						FROM `enrollment`
						WHERE
							`courseid`=:courseid AND
							status='1' AND
							enrollmentroleid = 1",
					'par' => array( 'courseid' => $lesson['courseid']),
					'ret' => 'all'
			));
			
			
			$tokens = array();
			foreach($students as $student)
			{
				$fbtoken = $db->smartQuery(array(
						'sql' => "SELECT fbtokenid FROM `appuser` WHERE `appuserid`=:appuserid",
						'par' => array( 'appuserid' => $student['userid']),
						'ret' => 'fetch-assoc'
				));
				if(isset($fbtoken['fbtokenid']) && $fbtoken['fbtokenid']!='')
				{
					$tokens[] = $fbtoken['fbtokenid'];
				}
			}
			
			$course = $db->smartQuery(array(
					'sql' => "SELECT subname FROM `course` WHERE`courseid`=:courseid",
					'par' => array( 'courseid' => $lesson['courseid']),
					'ret' => 'fetch-assoc'
			));
			
			$title= " $title ".$course['subname'];
			
			$lessonid = $lesson['lessonid'];
			$courseid = $lesson['courseid'];
			
			$FireBaseFCM->sendMessage($title,$message,$tokens,$courseid,$lessonid,$type);
			return true;
		}
	}
}