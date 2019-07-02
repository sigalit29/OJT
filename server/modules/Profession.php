<?php
class Profession{
	
	function GetProfessionById($pid)
	{
		global $db;
		$profession =  $db->smartQuery(array(
			'sql' => "Select * FROM profession where professionid = :professionid",
			'par' => array('professionid'=>$pid),
			'ret' => 'fetch-assoc'
		));
		return $profession;
	}
	
	function GetProfessions()
	{
		global $db;
		$profession = $db->smartQuery(array(
			'sql' => "Select * FROM profession",
			'par' => array(),
			'ret' => 'all'
		));
		return $profession;
	}
	
	function AddProfessions($data)
	{
		global $db;
		foreach($data as $profession)
		{
			if(isset($profession->professionid))
			{
				$id = $profession->professionid;
				$result = $db->smartQuery(array(
					'sql' => "update profession set name= :name, IsShow =:IsShow  where professionid=:id",
					'par' => array('name'=>$profession->name,'IsShow'=>$profession->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into profession (name,IsShow)values(:name,:IsShow)",
					'par' => array('name'=>$profession->name, 'IsShow'=>$profession->IsShow),
					'ret' => 'result'
				));
			}
		}
		
		return $result;
	}
	
}