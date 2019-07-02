<?php
class Clientcode{
	
	function GetClientcodeById($cid)
	{
		global $db;
		$Clientcode =  $db->smartQuery(array(
			'sql' => "Select * FROM clientcode where clientcodeid = :clientcodeid",
			'par' => array('clientcodeid'=>$cid),
			'ret' => 'fetch-assoc'
		));
		return $Clientcode;
	}
	
	function GetClientCodes()
	{
		global $db;
		$Clientcodes = $db->smartQuery(array(
			'sql' => "Select * FROM clientcode",
			'par' => array(),
			'ret' => 'all'
		));
		return $Clientcodes;
	}
	
	function AddClientCodes($data)
	{
		global $db;
		foreach($data as $clientcode)
		{
			if(isset($clientcode->clientcodeid))
			{
				$id = $clientcode->clientcodeid;
				$result = $db->smartQuery(array(
					'sql' => "update clientcode set code= :code, IsShow =:IsShow  where clientcodeid=:id",
					'par' => array('code'=>$clientcode->code,'IsShow'=>$clientcode->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into clientcode (code,IsShow)values(:code,:IsShow)",
					'par' => array('code'=>$clientcode->code, 'IsShow'=>$clientcode->IsShow),
					'ret' => 'result'
				));
			}
		}
		
		return $result;
	}
	
}