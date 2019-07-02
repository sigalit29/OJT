<?php
class Religion{
	
	function GetReligionById($rid)
	{
		global $db;
		$religion =  $db->smartQuery(array(
				'sql' => "Select * FROM religion where religionid = :religionid",
				'par' => array('religionid'=>$rid),
				'ret' => 'fetch-assoc'
		));
		return $religion;
	}
	
	function GetReligions()
	{
		global $db;
		$religions = $db->smartQuery(array(
			'sql' => "Select * FROM religion",
			'par' => array(),
			'ret' => 'all'
		));
		return $religions;
	}
	
	function AddReligion($data)
	{
		global $db;
		foreach($data as $religion)
		{
			$nameinarabic = isset($religion->nameinarabic)?$religion->nameinarabic:'';
			if(isset($religion->religionid))
			{
				$id = $religion->religionid;
				$result = $db->smartQuery(array(
					'sql' => "update religion set name= :name,nameinarabic=:nameinarabic, IsShow= :IsShow where religionid=:id",
					'par' => array('name'=>$religion->name,'nameinarabic'=>$nameinarabic,'IsShow'=>$religion->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into religion (name,nameinarabic,IsShow)values(:name,:nameinarabic,:IsShow)",
					'par' => array('name'=>$religion->name,'nameinarabic'=>$nameinarabic,'IsShow'=>$religion->IsShow),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
	
}