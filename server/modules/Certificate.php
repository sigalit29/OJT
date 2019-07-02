<?php
class Certificate{
	
	function GetCertificateById($cid)
	{
		global $db;
		$certificateid =  $db->smartQuery(array(
			'sql' => "Select * FROM certificate where certificateid = :certificateid",
			'par' => array('certificateid'=>$cid),
			'ret' => 'fetch-assoc'
		));
		return $certificateid;
	}
	
	function GetCertificates()
	{
		global $db;
		$certificate = $db->smartQuery(array(
			'sql' => "Select * FROM certificate",
			'par' => array(),
			'ret' => 'all'
		));
		return $certificate;
	}
	
	function AddCertificates($data)
	{
		global $db;
		foreach($data as $certificate)
		{
			if(isset($certificate->certificateid))
			{
				$id = $certificate->certificateid;
				$result = $db->smartQuery(array(
					'sql' => "update certificate set name= :name, IsShow =:IsShow  where certificateid=:id",
					'par' => array('name'=>$certificate->name,'IsShow'=>$certificate->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into certificate (name,IsShow)values(:name,:IsShow)",
					'par' => array('name'=>$certificate->name, 'IsShow'=>$certificate->IsShow),
					'ret' => 'result'
				));
			}
		}
		
		return $result;
	}
	
}