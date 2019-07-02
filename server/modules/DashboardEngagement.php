<?php
class DashboardEngagement{
	function SaveDashboardEngagement($lessonid, $engagement) {
		global $db;
		global $myid;
		$usageid = $this -> GetDashboardEngagement($lessonid, $myid)["usageid"];
		if(!isset($usageid)){
			$result = $db->smartQuery ( array (
				'sql' => "
				INSERT INTO meetingengagement (
					`userid`,
					`lessonid`,
					`dashboarddisplayduration`,
					`dashboardmeetingcommentsdisplay`,
					`dashboardsubjectscommentsdisplay`,
					`dashboardsubjectsfeedbackdisplay`
				)
				VALUES(
					:userid,
					:lessonid,
					:displayTime,
					:meetingComments,
					:subjectsComments,
					:subjectsFeedback
					)",
				'par' => array (
					'userid' => $myid,
					'lessonid' => $lessonid,
					'displayTime' => $engagement->dashboarddisplayduration,
					'meetingComments' => $engagement->dashboardmeetingcommentsdisplay,
					'subjectsComments' => $engagement->dashboardsubjectscommentsdisplay,
					'subjectsFeedback' => $engagement->dashboardsubjectsfeedbackdisplay
				),
				'ret' => 'result' 
			));
		}
		else
		{
			$result = $db->smartQuery ( array (
				'sql' => "
				UPDATE meetingengagement
				SET
					dashboarddisplayduration=dashboarddisplayduration+:displayTime,
					dashboardmeetingcommentsdisplay=GREATEST(dashboardmeetingcommentsdisplay, :meetingComments),
					dashboardsubjectscommentsdisplay=GREATEST(dashboardsubjectscommentsdisplay, :subjectsComments),
					dashboardsubjectsfeedbackdisplay=GREATEST(dashboardsubjectsfeedbackdisplay, :subjectsFeedback)
				WHERE usageid=:usageid",
				'par' => array (
					'usageid' => $usageid,
					'displayTime' => $engagement->dashboarddisplayduration,
					'meetingComments' => $engagement->dashboardmeetingcommentsdisplay,
					'subjectsComments' => $engagement->dashboardsubjectscommentsdisplay,
					'subjectsFeedback' => $engagement->dashboardsubjectsfeedbackdisplay
				),
				'ret' => 'result' 
			));
		}
		
		return $result;
	}
	function GetDashboardEngagement($lessonid, $userid) {
		global $db;
		$engagement = $db->smartQuery ( array (
				'sql' => "SELECT * FROM meetingengagement WHERE lessonid=:lessonid AND userid=:userid",
				'par' => array (
					'lessonid' => $lessonid,
					'userid' => $userid 
				),
				'ret' => 'fetch-assoc' 
		));
		if (isset($engagement['usageid'])) {
			return $engagement;
		} else {
			return array (
				"usageid" => null,
				"dashboarddisplayduration" => "0",
				"dashboardmeetingcommentsdisplay" => "false",
				"dashboardsubjectscommentsdisplay" => "false",
				"dashboardsubjectsfeedbackdisplay" => "false" 
			);
		}
	}
}