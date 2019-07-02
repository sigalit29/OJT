<?php
class Studentstatus{
	
	function GetStudentstatusById($cid)
	{
		global $db;
		$Studentstatus =  $db->smartQuery(array(
			'sql' => "Select * FROM studentstatus where studentstatusid = :studentstatusid",
			'par' => array('studentstatusid'=>$cid),
			'ret' => 'fetch-assoc'
		));
		return $Studentstatus;
	}
	
	function GetStudentstatus()
	{
		global $db;
		$Studentstatus = $db->smartQuery(array(
			'sql' => "Select * FROM studentstatus where IsShow='1'",
			'par' => array(),
			'ret' => 'all'
		));
		return $Studentstatus;
	}
	
	function AddStudentstatus($data)
	{
		global $db;
		foreach($data as $studentstatus)
		{
			if(isset($studentstatus->studentstatusid))
			{
				$id = $studentstatus->studentstatusid;
				$result = $db->smartQuery(array(
					'sql' => "update studentstatus set status= :status, IsShow =:IsShow  where studentstatusid=:id",
					'par' => array('status'=>$studentstatus->status,'IsShow'=>$studentstatus->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into studentstatus (status,IsShow)values(:status,:IsShow)",
					'par' => array('status'=>$studentstatus->status, 'IsShow'=>$studentstatus->IsShow),
					'ret' => 'result'
				));
			}
		}
		
		return $result;
	}
	
}