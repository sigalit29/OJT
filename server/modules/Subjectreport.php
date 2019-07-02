<?php
class Subjectreport{
	
	function GetSubjectreportById($cid)
	{
		global $db;
		$Subjectreport =  $db->smartQuery(array(
			'sql' => "SELECT * FROM reportsubject WHERE reportsubjectid = :reportsubjectid",
			'par' => array('reportsubjectid'=>$cid),
			'ret' => 'fetch-assoc'
		));
		return $Subjectreport;
	}
	
	function GetReportSubjects()
	{
		global $db;
		$reportsubjects = $db->smartQuery(array(
			'sql' => "SELECT * FROM reportsubject",
			'par' => array(),
			'ret' => 'all'
		));
		return $reportsubjects;
	}
	
	function AddReportSubjects($data)
	{
		global $db;
		foreach($data as $reportsubject)
		{
			if(isset($reportsubject->reportsubjectid))
			{
				$id = $reportsubject->reportsubjectid;
				$result = $db->smartQuery(array(
					'sql' => "update reportsubject set subject=:subject,subjectnum=:subjectnum, IsShow =:IsShow  where reportsubjectid=:id",
					'par' => array('subject'=>$reportsubject->subject,'subjectnum'=>$reportsubject->subjectnum,'IsShow'=>$reportsubject->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into reportsubject (subject,subjectnum,IsShow)values(:subject,:subjectnum,:IsShow)",
					'par' => array('subject'=>$reportsubject->subject,'subjectnum'=>$reportsubject->subjectnum, 'IsShow'=>$reportsubject->IsShow),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
}