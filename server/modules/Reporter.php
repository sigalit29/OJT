<?php
class Reporter{

    function DeleteReportById($reportid)
    {
        global $db;
        $report = $db->smartQuery(array(
            'sql' => "SELECT `reportcopyid`, `reportid` FROM `report` WHERE reportid=:reportid;",
            'par' => array('reportid' => $reportid),
            'ret' => 'fetch-assoc'
        ));

        $result = $db->smartQuery(array(
            'sql' => "DELETE FROM `report` WHERE reportid=:reportid;",
            'par' => array('reportid' => $reportid),
            'ret' => 'result'
        ));

        $result = $db->smartQuery(array(
            'sql' => "DELETE FROM `reportcopy` WHERE reportcopyid=:reportcopyid;",
            'par' => array('reportcopyid' => $report['reportcopyid']),
            'ret' => 'result'
        ));

        return $result;
    }

    function GetAllReporters($month,$year)
    {
        global $db;
        global $myid;
        global $me;
        $mySubStaff = getManagedUsers();
        array_push($mySubStaff, $myid);
        $users = $db->smartQuery(array(
            'sql' => "
				SELECT ra.approverid, p.userid, p.firstname, p.lastname, p.managerid, u.status
				FROM user_profile AS p
				JOIN user AS u ON u.userid = p.userid
				LEFT JOIN reportapprover AS ra ON ra.userid = p.userid
				WHERE p.managerid IS NOT NULL",
            'par' => array(),
            'ret' => 'all'
        ));
        $users = nestArray($users, 'userid', array(
            array('nestIn'=>'approvers', 'nestBy'=>'approverid', 'fieldsToNest'=>array('approverid'))
        ));
        $reporters = array();
        if($me['isAdmin'])
        {
            foreach($users as $user)
            {
                $user['reports'] = $this->GetReports($year, $month, $user['userid']);
                $user['reportingPerimeter'] = $this->GetReporterPerimeter($user['userid']);
                $reporters[] = $user;
            }
        }else
        {
            foreach($users as $user)
            {
                if($user['managerid'] === $myid || in_array($myid, array_column($user["approvers"], "approverid")))
                {
                    $user['reports'] = $this->GetReports($year, $month, $user['userid']);
                    $user['reportingPerimeter'] = $this->GetReporterPerimeter($user['userid']);
                    $reporters[] = $user;
                }
            }
        }
        return $reporters;
    }

    function GetReports($year, $month, $userid=null)
    {
        global $db;
        global $myid;
        global $Course;

        if(!isset($userid))
        {
            $userid=$myid;
        }
        $dateRangeMin=$year."-".$month."-01";
        $nextMonthMonth=($month+1)%13;
        $nextMonthYear=$month+1==13?$year+1:$year;
        $dateRangeMax=$nextMonthYear."-".$nextMonthMonth."-01";
        $reports = $db->smartQuery(array(
            'sql' => "
			SELECT r.*,
			rc.projectid AS copyProject,
			rc.courseid AS copyCourse,
			rc.actionid AS copyAction,
			rc.cost AS copyCost,
			rc.carkm AS copyCar,
			rc.starthour AS copyStart,
			rc.finishhour AS copyFinish,
			rc.comment AS copyComment,
			rc.date AS copyDate
			FROM report AS r
			LEFT JOIN reportcopy AS rc ON rc.reportcopyid = r.reportcopyid
			WHERE
				r.userid=:userid
				AND r.date BETWEEN :dateRangeMin AND :dateRangeMax
				AND r.date < :dateRangeMax
			ORDER BY
				r.approval, r.missingreportsubject, r.date, r.starthour",
            'par' => array('userid'=>$userid, 'dateRangeMin'=>$dateRangeMin, 'dateRangeMax'=>$dateRangeMax),
            'ret' => 'all'
        ));
        $index=0;
        foreach($reports as $index=>$report)
        {
            if(isset($report['finishhour']) && isset($report['starthour']))
            {
                $report['finishhour'] = date("H:i", strtotime($report['finishhour']));
                $report['starthour'] = date("H:i", strtotime($report['starthour']));
            }
            else
            {
                $report['finishhour'] = '';
                $report['starthour'] = '';
            }
            $report['date'] = date("d/m/Y", strtotime($report['date']));
            $report=$this->nestReportCopy($report);
            $reports[$index] = $report;
        }
        $user['reports'] = $reports;

        return $reports;
    }

    function nestReportCopy($report)
    {
        $report['copyreport']=array(
            "date"=>$report['copyDate'],
            "projectid"=>$report['copyProject'],
            "actionid"=>$report['copyAction'],
            "courseid"=>$report['copyCourse'],
            "starthour"=>$report['copyStart'],
            "finishhour"=>$report['copyFinish'],
            "cost"=>$report['copyCost'],
            "carkm"=>$report['copyCar'],
            "comment"=>$report['copyComment']
        );
        if(isset($report['copyreport']['finishhour']) && isset($report['copyreport']['starthour']))
        {
            $report['copyreport']['finishhour'] = date("H:i", strtotime($report['copyreport']['finishhour']));
            $report['copyreport']['starthour'] = date("H:i", strtotime($report['copyreport']['starthour']));
        }
        else
        {
            $report['copyreport']['finishhour'] = '';
            $report['copyreport']['starthour'] = '';
        }
        $report['copyreport']['date'] = date("d/m/Y", strtotime($report['copyreport']['date']));
        unset($report['copyDate'],$report['copyProject'],$report['copyAction'],$report['copyCourse'],
            $report['copyStart'],$report['copyFinish'],$report['copyCost'],$report['copyCar'],$report['copyComment']
        );
        return $report;
    }

    function GetReporterPerimeter($userid)
    {
        global $db;
        $projects = $db->smartQuery(array(
            'sql' => "
				SELECT
					p.projectid, p.name AS projectName,
					s.reportsubjectid, s.subject AS subject,
					c.courseid, c.name AS courseName
				FROM user_reportsubject AS rs
				JOIN project AS p ON p.projectid = rs.projectid
				JOIN reportsubject AS s ON s.reportsubjectid = rs.reportsubjectid
				LEFT JOIN (
					SELECT c.courseid, c.name, c.projectid
					FROM course AS c
					JOIN enrollment AS e ON e.courseid = c.courseid
					WHERE
						e.userid=:userid
						AND e.enrollmentroleid=2) AS c ON c.projectid = p.projectid
				WHERE
					rs.userid=:userid AND
					rs.status=1",
            'par' => array('userid'=>$userid),
            'ret' => 'all'
        ));
        return indexArrayByAttribute(nestArray(
            $projects, 'projectid',
            array(
                array('nestBy'=>'courseid', 'nestIn'=>'courses', 'fieldsToNest'=>array('courseid', 'courseName')),
                array('nestBy'=>'reportsubjectid', 'nestIn'=>'subjects', 'fieldsToNest'=>array('reportsubjectid', 'subject'))
            )), 'projectid');
    }

    function SaveReports($data)
    {
        global $Staff;
        global $myid;
        $lastactivedate = "";
        foreach($data as $report)
        {
            if(isset($report->status) && $report->status=='accept'){

            }
            else{
                $this->SaveReport($report);
            }
        }
    }

    function SaveReport($report)
    {
        global $db;
        global $User;
        global $myid;
        $userid = $myid;

        $pieces = explode("/", $report->date);
        $date = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];

        $reportid = isset($report->reportid) ? $report->reportid : null;
        $courseid = isset($report->courseid) ? $report->courseid : null;
        $projectid = isset($report->projectid) ? $report->projectid : null;
        $starthour = (isset($report->starthour) && $report->starthour) ? $report->starthour : null;
        $finishhour = (isset($report->finishhour) && $report->finishhour) ? $report->finishhour : null;
        $carkm = isset($report->carkm) ? $report->carkm : null;
        $cost = isset($report->cost) ? $report->cost : null;
        $comment = isset($report->comment) ? $report->comment : "";
        $status = isset($report->status) ? $report->status : "";
        $reportcopyid = isset($report->reportcopyid) ? $report->reportcopyid : "";
        $actionid = isset($report->actionid) ? $report->actionid : "";
        $automatic = isset($report->automatic)?$report->automatic:0;
        //	$time = date("Y-m-d H:i:s");

        if($reportid==-1)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `reportcopy` (`date`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`) VALUES ( :date, :courseid, :actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment);",
                'par' => array( 'date' => $date, 'courseid' => $courseid,'actionid' => $actionid,'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment),
                'ret' => 'result'
            ));

            $rid=$db->getLastInsertId();

            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `report` (`date`, `userid`, `courseid`, `actionid`,`projectid`, `starthour`, `finishhour`, `carkm`, `cost`, `comment`, `approval`, `automatic`, `reportcopyid`) VALUES (:date, :userid, :courseid, :actionid, :projectid, :starthour, :finishhour, :carkm, :cost, :comment, :status, :auto, :reportcopyid);",
                'par' => array( 'date' => $date, 'userid' => $userid, 'courseid' => $courseid,'actionid' => $actionid,'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment, 'status' => 0, 'auto' => $automatic, 'reportcopyid' => $rid),
                'ret' => 'result'
            ));

        }else
        {
            $result = $db->smartQuery(array(
                'sql' => "UPDATE reportcopy SET date=:date, courseid=:courseid,actionid=:actionid,projectid=:projectid, starthour=:starthour, finishhour=:finishhour, carkm=:carkm, cost=:cost, comment=:comment WHERE reportcopyid=:reportcopyid",
                'par' => array( 'date' => $date, 'courseid' => $courseid,'actionid' => $actionid,'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment, 'reportcopyid' => $reportcopyid),
                'ret' => 'result'
            ));

            $result = $db->smartQuery(array(
                'sql' => "UPDATE report SET date=:date, userid=:userid, courseid=:courseid,actionid=:actionid,projectid=:projectid, starthour=:starthour, finishhour=:finishhour, carkm=:carkm, cost=:cost, comment=:comment WHERE reportid=:reportid",
                'par' => array( 'date' => $date, 'userid' => $userid, 'courseid' => $courseid, 'actionid' => $actionid, 'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment,'reportid' => $reportid),
                'ret' => 'result'
            ));
        }
    }

    function SaveReportofUnderstaff($report)
    {
        global $db;

        $pieces = explode("/", $report->date);
        $date = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];

        $reportid = $report->reportid;
        $userid = $report->userid;
        $courseid = isset($report->courseid) ? $report->courseid : null;
        $projectid = isset($report->projectid) ? $report->projectid : null;
        $actionid = isset($report->actionid) ? $report->actionid : null;
        $starthour = (isset($report->starthour) && $report->starthour!='') ? $report->starthour : null;
        $finishhour = (isset($report->finishhour) && $report->finishhour!='') ? $report->finishhour : null;
        $carkm = isset($report->carkm) ? $report->carkm : null;
        $cost = isset($report->cost) ? $report->cost : null;
        $comment = isset($report->comment) ? $report->comment : "";
        $approval = isset($report->approval) ? $report->approval : 0;
        $reportcopyid = isset($report->reportcopyid) ? $report->reportcopyid : null;
        $checkdate2=isset($report->checkdate2)?$report->checkdate2 : null;

        $time = null;

        if($reportid=="-1" && $checkdate2==false)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `report` (`date`,`userid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`approval`, `automatic`, `reportcopyid`) VALUES ( :date, :userid, :courseid,:actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :approval, :auto, :reportcopyid);",
                'par' => array( 'date' => $date, 'userid' => $userid, 'courseid' => $courseid,'actionid' => $actionid,'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment, 'approval' => $approval,'auto' => 0, 'reportcopyid' => null),
                'ret' => 'result'
            ));
            return $result;
        }
        else if($reportid=="-1" && $checkdate2==true)
        {
            $time = date("Y-m-d H:i:s");
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `report` (`date`,`userid`,`courseid`,`actionid`,`projectid`,`starthour`,`finishhour`,`carkm`,`cost`,`comment`,`approval`,`checkdate`, `automatic`, `reportcopyid`) VALUES ( :date, :userid, :courseid,:actionid,:projectid, :starthour, :finishhour, :carkm, :cost, :comment, :approval,:checkdate, :auto, :reportcopyid);",
                'par' => array( 'date' => $date, 'userid' => $userid, 'courseid' => $courseid,'actionid' => $actionid,'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment, 'approval' => $approval,'checkdate' => $time ,'auto' => 0, 'reportcopyid' => null),
                'ret' => 'result'
            ));
        }
        else
        {
            $time = date("Y-m-d H:i:s");
            $result = $db->smartQuery(array(
                'sql' => "UPDATE report SET date=:date, userid=:userid, courseid=:courseid,actionid=:actionid,projectid=:projectid, starthour=:starthour, finishhour=:finishhour, carkm=:carkm, cost=:cost, comment=:comment, approval=:approval,checkdate=:checkdate  WHERE reportid=:reportid",
                'par' => array( 'date' => $date, 'userid' => $userid, 'courseid' => $courseid, 'actionid' => $actionid, 'projectid' => $projectid, 'starthour' => $starthour, 'finishhour' => $finishhour, 'carkm' => $carkm, 'cost' => $cost, 'comment' => $comment, 'approval' => $approval,'checkdate' => $time, 'reportid' =>  $reportid),
                'ret' => 'result'
            ));
        }
        if($result)
            return $time;
        else
            return $result;
    }

    function SetReportApproval($reportids, $status){
        global $db;
        $result="no ids supplied";
        $time = date("Y-m-d H:i:s");
        foreach ($reportids as $reportid)
        {
            $result = $db->smartQuery(array(
                'sql' => "UPDATE report SET approval=:status, checkdate=:_checkdate WHERE reportid=:reportid",
                'par' => array('reportid' => $reportid, 'status' => $status,'_checkdate'=> $time),
                'ret' => 'result'
            ));
        }
        if($result)
            return $time;
        return $result;
    }
}