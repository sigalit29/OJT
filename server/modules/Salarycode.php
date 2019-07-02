<?php
class Salarycode{
	
	function GetSalarycodeById($cid)
	{
		global $db;
		$salarycode =  $db->smartQuery(array(
			'sql' => "Select * FROM salarycode where salarycodeid = :salarycodeid",
			'par' => array('salarycodeid'=>$cid),
			'ret' => 'fetch-assoc'
		));
		return $salarycode;
	}
	
	function GetSalarycodes()
	{
		global $db;
		$salarycodes = $db->smartQuery(array(
			'sql' => "Select * FROM salarycode",
			'par' => array(),
			'ret' => 'all'
		));
		return $salarycodes;
	}
	
	function AddSalarycodes($data)
	{
		global $db;
		foreach($data as $salarycode)
		{
			if(isset($salarycode->salarycodeid))
			{
				$id = $salarycode->salarycodeid;
				$result = $db->smartQuery(array(
					'sql' => "update salarycode set code= :code, IsShow =:IsShow  where salarycodeid=:id",
					'par' => array('code'=>$salarycode->code,'IsShow'=>$salarycode->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into salarycode (code,IsShow)values(:code,:IsShow)",
					'par' => array('code'=>$salarycode->code, 'IsShow'=>$salarycode->IsShow),
					'ret' => 'result'
				));
			}
		}
		
		return $result;
	}
	
}