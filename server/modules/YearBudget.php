<?php
class YearBudget{
	
	function GetYearbudgetById($yid)
	{
		global $db;
		$year =  $db->smartQuery(array(
			'sql' => "Select * FROM yearbudget where yearbudgetid = :yearbudgetid",
			'par' => array('yearbudgetid'=>$yid),
			'ret' => 'fetch-assoc'
		));
		return $year;
	}
	
	function GetYearsBudget()
	{
		global $db;
		$yearbudget = $db->smartQuery(array(
			'sql' => "Select * FROM yearbudget",
			'par' => array(),
			'ret' => 'all'
		));
		return $yearbudget;
	}
	
	function AddYearsBudget($data)
	{
		global $db;
		foreach($data as $yearbudget)
		{
			if(isset($yearbudget->yearbudgetid))
			{
				$id = $yearbudget->yearbudgetid;
				$result = $db->smartQuery(array(
					'sql' => "update yearbudget set year= :year, IsShow=:IsShow where yearbudgetid=:id",
					'par' => array('year'=>$yearbudget->year,'IsShow'=>$yearbudget->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into yearbudget (year,IsShow)values(:year,:IsShow)",
					'par' => array('year'=>$yearbudget->year,'IsShow'=>$yearbudget->IsShow),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
	
}