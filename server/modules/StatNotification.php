<?php
class StatNotification {
    function getMyStatNotifications($courseid) {
        $stats = array();
        $attendanceStat = $this->getAttendanceStat($courseid);
        if($attendanceStat)
            $stats[]=$attendanceStat;
        $commentsStat = $this->getWordCountStat($courseid);
        if($commentsStat)
            $stats[]=$commentsStat;
        return $stats;
    }
    function getAttendanceStat($courseid){
        $record = $this->getAttendanceRecord($courseid);
        if(count($record)==0)
            return false;
        $attendanceSummary = $this->getAttendanceSummary($record);
        $block = array(
            "title"=>array("ar"=>"my attendance", "he"=>"הנוכחות שלי במקצוע"),
            "val1"=>$attendanceSummary["attendanceCount"],
            "label1"=>array("ar"=>"meetings", "he"=>"שיעורים"),
            "val2"=>$attendanceSummary["lessonCount"],
            "label2"=>array("ar"=>"meetings so far", "he"=>"שיעורים עד כה"),
            "preposition"=>array("ar"=>"of", "he"=>"מתוך"),
        );
        //check if the student was absent in the last two meetings
        $consecutiveNonAttendance = $this->checkConsecutiveNonAttendance($record);
        if($consecutiveNonAttendance)
        {
            return $this->getBlockDetails($block, "consecutiveNonAttendance", array());
        }
        //check if the student has a 80% or higher overall attendance record (and the record contains at least 3 meetings)
        $highAttendance = $this->checkHighAttendance($record);
        if($highAttendance)
        {
            return $this->getBlockDetails($block, "highAttendance", array());
        }
        //check if the student has a 60% or less attendance on the last 3 meetings
        $lowAttendanceLately = $this->checkLowAttendanceLately($record);
        if($lowAttendanceLately)
        {
            return $this->getBlockDetails($block, "lowAttendanceLately", array());
        }
        //check if the student has a 80% or higher attendance on the last 3 meetings, and less than 80% overall
        $highAttendanceLately = $this->checkHighAttendanceLately($record)&&!$highAttendance;
        if($highAttendanceLately)
        {
            return $this->getBlockDetails($block, "highAttendanceLately", array());
        }
        //return default block
        return $this->getBlockDetails($block, "defaultAttendance", array());
    }
    function getAttendanceRecord($courseid){
        global $db;
        global $myid;
        $record = $db->smartQuery(array(
            'sql' => "
				SELECT l.num, cs.status
				FROM checkstudent AS cs
				JOIN lesson AS l ON l.lessonid = cs.lessonid
				WHERE
					l.courseid = :courseid
					AND l.ignoreMe = 0
					AND cs.userid = :userid
				ORDER BY l.num
			",
            'par' => array('courseid'=>$courseid, 'userid'=>$myid),
            'ret' => 'all'
        ));
        return $record;
    }
    function getAttendanceSummary($record){
        $attendanceCount = 0;
        $lessonCount = 0;
        for($i=0; $i<count($record); $i++)
        {
            if($record[$i]['status']==1||$record[$i]['status']==0)
            {
                $attendanceCount++;
            }
            $lessonCount++;
        }
        return array("attendanceCount"=>$attendanceCount, "lessonCount"=>$lessonCount);
    }
    function checkConsecutiveNonAttendance($record){
        $consecutiveNonAttendance = 0;
        $threshold = 2;
        for($i=count($record)-1; $i>=0; $i--)
        {
            if($record[$i]["status"]==2||$record[$i]["status"]==3)
                $consecutiveNonAttendance++;
            else
                break;
        }
        return $consecutiveNonAttendance>=$threshold?$consecutiveNonAttendance:false;
    }
    function checkHighAttendance($record){
        //if there haven't been many meetings yet, no user will have "high attendance rate"
        if(count($record)<3)
            return false;
        $attendanceCount = 0;
        $lessonCount = 0;
        for($i=0; $i<count($record); $i++)
        {
            if($record[$i]['status']==1||$record[$i]['status']==0)
            {
                $attendanceCount++;
            }
            $lessonCount++;
        }
        return ($attendanceCount/$lessonCount)>=0.8;
    }
    function checkLowAttendanceLately($record){
        //if there haven't been many meetings yet, no user will have "high attendance rate"
        if(count($record)<3)
            return false;
        $attendanceCount = 0;
        $lessonCount = 0;
        for($i=count($record)-1; $i>=count($record)-3; $i--)
        {
            if($record[$i]['status']==1||$record[$i]['status']==0)
            {
                $attendanceCount++;
            }
            $lessonCount++;
        }
        return ($attendanceCount/$lessonCount)<=0.6;
    }
    function checkHighAttendanceLately($record){
        //if there haven't been many meetings yet, no user will have "high attendance rate"
        if(count($record)<3)
            return false;
        $attendanceCount = 0;
        $lessonCount = 0;
        for($i=count($record)-1; $i>=count($record)-3; $i--)
        {
            if($record[$i]['status']==1||$record[$i]['status']==0)
            {
                $attendanceCount++;
            }
            $lessonCount++;
        }
        return ($attendanceCount/$lessonCount)>=0.8;
    }
    function getWordCountStat($courseid){
        $record = $this->getWordCountRecord($courseid);
        if(count($record)==0)
            return false;
        $wordCountSummary = $this->getWordCountSummary($record);
        $block = array(
            "title"=>array("ar"=>"my attendance", "he"=>"רמת המעורבות שלי"),
            "val1"=>$wordCountSummary["lastMeetingWordCount"],
            "label1"=>array("ar"=>"meetings", "he"=>"מילים"),
            "val2"=>$wordCountSummary["courseWordCount"],
            "label2"=>array("ar"=>"meetings so far", "he"=>"מילים סך הכל"),
            "preposition"=>array("ar"=>"of", "he"=>"מתוך"),
        );
        //check if the student has a 80% or higher attendance on the last 3 meetings, and less than 80% overall
        $highlightedFeedback = $this->checkHighlightedFeedback($courseid);
        if($highlightedFeedback)
        {
            return $this->getBlockDetails($block, "highlightedFeedback", array());
        }
        //check if the student has a 80% or higher attendance on the last 3 meetings, and less than 80% overall
        $consecutiveNoFeedback = $this->checkConsecutiveNoFeedback($record);
        if($consecutiveNoFeedback)
        {
            return $this->getBlockDetails($block, "consecutiveNoFeedback", array());
        }
        //check if the student has a 80% or higher attendance on the last 3 meetings, and less than 80% overall
        $betterFeedbackThanLastMeeting = $this->checkBetterFeedbackThanLastMeeting($record);
        if($betterFeedbackThanLastMeeting)
        {
            return $this->getBlockDetails($block, "betterFeedbackThanLastMeeting", array());
        }
        //check if the student has a 80% or higher attendance on the last 3 meetings, and less than 80% overall
        $worseWordCountThanClassAvg = $this->checkWorseWordCountThanClassAvg($record);
        if($worseWordCountThanClassAvg)
        {
            return $this->getBlockDetails($block, "worseWordCountThanClassAvg", array("classAvg"=>$worseWordCountThanClassAvg));
        }
        //return default block
        return $this->getBlockDetails($block, "defaultEngagement", array());
    }
    function getWordCountRecord($courseid){
        global $db;
        global $myid;
        $record = $db->smartQuery(array(
            'sql' => "
				SELECT l.num, GROUP_CONCAT(c.answer SEPARATOR ' ') AS comment
				FROM checkstudent AS cs
				LEFT JOIN student_comments AS c ON cs.checkstudentid = c.checkstudentid
				JOIN lesson AS l ON l.lessonid = cs.lessonid
				WHERE
					l.courseid = :courseid
					AND l.ignoreMe = 0
					AND cs.userid = :userid
				GROUP BY l.lessonid
				ORDER BY l.num
			",
            'par' => array('courseid'=>$courseid, 'userid'=>$myid),
            'ret' => 'all'
        ));
        $wordCounts = array();
        for($i=0; $i<count($record); $i++){
            $wordCounts[]=array('num'=>$record[$i]["num"], "wordCount"=>isset($record[$i]["comment"])?(substr_count($record[$i]["comment"], " ")+1):0);
        }
        return $wordCounts;
    }
    function getWordCountSummary($record){
        $lastMeetingWordCount = 0;
        $courseWordCount = 0;
        for($i=0; $i<count($record); $i++)
        {
            $courseWordCount+=$record[$i]["wordCount"];
            if($i+1==count($record))
                $lastMeetingWordCount+=$record[$i]["wordCount"];
        }
        return array("lastMeetingWordCount"=>$lastMeetingWordCount, "courseWordCount"=>$courseWordCount);
    }
    function checkHighlightedFeedback($courseid){
        global $db;
        global $myid;
        global $Course;
        $lastMeetingInCourse=$Course->GetCurrentLessonByCourseId($courseid);
        if(!isset($lastMeetingInCourse))
            return false;
        $lastMeetingId = $lastMeetingInCourse['lessonid'];
        $highlightedFeedbacks = $db->smartQuery(array(
            'sql' => "
				SELECT c.answer AS comment
				FROM lesson_highlighted_stats AS stats
				JOIN student_comments AS c ON stats.stat = c.answer
				JOIN checkstudent AS cs ON cs.checkstudentid = c.checkstudentid
				WHERE
					cs.lessonid =:lastMeetingId
					AND cs.userid = :userid
			",
            'par' => array('lastMeetingId'=>$lastMeetingId, 'userid'=>$myid),
            'ret' => 'all'
        ));
        return count($highlightedFeedbacks)>0;
    }
    function checkConsecutiveNoFeedback($record){
        $consecutiveNoFeedback = 0;
        $threshold = 2;
        for($i=count($record)-1; $i>=0; $i--)
        {
            if($record[$i]["wordCount"]==0)
                $consecutiveNoFeedback++;
            else
                break;
        }
        return $consecutiveNoFeedback>=$threshold?$consecutiveNoFeedback:false;
    }
    function checkBetterFeedbackThanLastMeeting($record){
        //by how much does the word count have to improve for the condition to be fulfilled
        $improvementThreshold = 4;
        if(count($record)<2)
            return false;
        return ($record[(count($record)-1)]["wordCount"]-$record[(count($record)-2)]["wordCount"])>=$improvementThreshold;
    }
    function checkWorseWordCountThanClassAvg($record){
        //by how much does the word count have to improve for the condition to be fulfilled
        $averageWordCount = 0;
        for($i=0; $i<count($record); $i++)
            $averageWordCount +=$record[$i]["wordCount"];
        $averageWordCount = floor($averageWordCount/count($record));
        //todo
        return false;
    }
    function getBlockDetails($base, $type, $params){
        $blocks = array(
            "defaultAttendance"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"Looking forward to seeing you in the next meeting!",
                        "he"=>"מצפים לראות אותך בשיעור הבא!"
                    ),
                    array(
                        "ar"=>"Don't forget to check out the meeting details before we start",
                        "he"=>"לא לשכוח לבדוק את פרטי השיעור הבא"
                    ),
                    array(
                        "ar"=>"Did you fill out your profile yet?",
                        "he"=>"האם מילאת את פרטי הפרופיל שלך?"
                    )
                ),
                "icon"=>array("peace_man.svg", "snorkel.svg", "snap.svg",)
            ),
            "consecutiveNonAttendance"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"we missed you! wev'e noticed you haven't showed up for the last two meeting. you can let your teacher know about any problem",
                        "he"=>"התגעגענו אליך! שמנו לב שלא הגעת לשני השיעורים האחרונים בכל בעיה ניתן לפנות למורה שלך"
                    )
                ),
                "icon"=>array("shocked_artik.svg")
            ),
            "highAttendance"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"we missed you! wev'e noticed you haven't showed up for the last two meeting. you can let your teacher know about any problem",
                        "he"=>"!איזה כיף לראות אותך בכל השיעורים"
                    ),
                    array(
                        "ar"=>"we missed you! wev'e noticed you haven't showed up for the last two meeting. you can let your teacher know about any problem",
                        "he"=>"כל הכבוד על ההתמדה! נתראה בשיעור הבא! (:"
                    )
                ),
                "icon"=>array("happy_artik.svg", "peace_man.svg")
            ),
            "lowAttendanceLatelyAttendance"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"we missed you! wev'e noticed you haven't showed up for the last two meeting. you can let your teacher know about any problem",
                        "he"=>"נעלמת לנו בזמן האחרון!"
                    ),
                    array(
                        "ar"=>"we missed you! wev'e noticed you haven't showed up for the last two meeting. you can let your teacher know about any problem",
                        "he"=>"הנוכחות שלך במגמת ירידה מומלץ לפנות למורה בכל בעיה!"
                    )
                ),
                "icon"=>array("sad_artik.svg", "down.svg")
            ),
            "highAttendanceLately"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"Awesome work - we see you've been attending more in the last few meetings. Keep going!",
                        "he"=>"התגעגענו אליך! שמנו לב שלא הגעת לשני השיעורים האחרונים בכל בעיה ניתן לפנות למורה שלך"
                    ),
                    array(
                        "ar"=>"Awesome work - we see you've been attending more in the last few meetings. Keep going!",
                        "he"=>"עוד דחיפה קטנה! שמנו לב שרמת הנוכחות שלך עלתה בתקופה האחרונה"
                    ),
                    array(
                        "ar"=>"Awesome work - we see you've been attending more in the last few meetings. Keep going!",
                        "he"=>"עבודה טובה! לרצף שיעורים חשיבות גדולה. לא לוותר על השיעור הבא (:"
                    )
                ),
                "icon"=>array("surfer_2.svg", "surf_waves.svg", "surfer.svg")
            ),
            "defaultEngagement"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"We want to hear from you!",
                        "he"=>"אנחנו רוצים לשמוע ממך!"
                    ),
                    array(
                        "ar"=>"How was your learning experience? Make sure to let your madrich know.",
                        "he"=>"איך הייתה חוויית הלמידה? הקפידו לדווח למורה"
                    ),
                    array(
                        "ar"=>"Give us some examples of what works and what doesn't, so that we can do even better next time.",
                        "he"=>"תנו לנו כמה דוגמאות למה עובד ומה לא, ומה נוכל לשפר בפעם הבאה"
                    ),
                    array(
                        "ar"=>"The more you share, the more we care!",
                        "he"=>"תמשיך לשתף! דעתך חשובה לנו :)"
                    )
                ),
                "icon"=>array("hang_loose.svg", "sun_wink.svg", "sun_shocked.svg")
            ),
            "highlightedFeedback"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"We want to hear from you!",
                        "he"=>"ואו! המורה שיתפ/ה את המשוב שכתבת עם הכיתה! תודה רבה על המשוב המועיל :)"
                    )
                ),
                "icon"=>array("trophy.svg")
            ),
            "consecutiveNoFeedback"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"We want to hear from you!",
                        "he"=>"לא שמענו ממך הרבה זמן! המשובים הם המקום להביע את דעתך ואת הרגשתך לגבי השיעור והמורים. נשמח לקרוא את התגובות שלך במשוב הבא (:"
                    )
                ),
                "icon"=>array("sun_surprised.svg")
            ),
            "betterFeedbackThanLastMeeting"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"We want to hear from you!",
                        "he"=>"עבודה מעולה! הפידבקים שלך משתפרים כל הזמן! מחכים למשוב הבא שלך :)"
                    ),
                    array(
                        "ar"=>"We want to hear from you!",
                        "he"=>"כל הכבוד! השתפרת! המעורבות שלך במשובים טובה יותר מפעמים קודמות! מחכים למשוב הבא ממך (:"
                    )
                ),
                "icon"=>array("perfect.svg")
            ),
            "worseWordCountThanClassAvg"=>array(
                "commentary"=> array(
                    array(
                        "ar"=>"Hey - we want to hear from you a little more! Your peers write an average of X words every time they check out, can you give it a try next time?",
                        "he"=>"היי! אנחנו רוצים לשמוע ממך קצת יותר "
                    )
                ),
                "icon"=>array("shocked_artik.svg", "idea.svg", "sun_wink.svg", "peace_man.svg")
            ),
        );
        $props = $blocks[$type];
        if(!isset($props))
            return $base;
        $finalBlock = $base;
        $finalBlock["commentary"]=$props["commentary"][floor(rand(0, count($props["commentary"])-1))];
        $finalBlock["icon"]=$props["icon"][floor(rand(0, count($props["icon"])-1))];
        return $finalBlock;
    }
}
?>