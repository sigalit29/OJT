<?php
class Gender{
	
	function GetGenderById($gid)
	{
		global $db;
		$gender =  $db->smartQuery(array(
				'sql' => "Select * FROM gender where genderid = :genderid",
				'par' => array('genderid'=>$gid),
				'ret' => 'fetch-assoc'
		));
		return $gender;
	}
	
	function GetGenders()
	{
		global $db;
		$genders = $db->smartQuery(array(
			'sql' => "Select * FROM gender",
			'par' => array(),
			'ret' => 'all'
		));
		return $genders;
	}
	
	function AddGender($data)
	{
		global $db;
		foreach($data as $gender)
		{
			$nameinarabic = isset($gender->nameinarabic)?$gender->nameinarabic :''; 
			if(isset($gender->genderid))
			{
				$id = $gender->genderid;
				$result = $db->smartQuery(array(
					'sql' => "update gender set name= :name, nameinarabic =:nameinarabic, IsShow= :IsShow where genderid=:id",
					'par' => array('name'=>$gender->name,'nameinarabic'=>$nameinarabic,'IsShow'=>$gender->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into gender (name,IsShow,nameinarabic)values(:name,:IsShow,:nameinarabic)",
					'par' => array('name'=>$gender->name,'nameinarabic'=>$nameinarabic,'IsShow'=>$gender->IsShow),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
	
}