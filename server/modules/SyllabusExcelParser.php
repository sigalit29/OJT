<?php
class SyllabusExcelParser{
	function UploadSyllabusFile($file)
	{
		$subjects = array();
		$xlsx = new XLSXReader($file['tmp_name'][0]);
		$sheetNames = $xlsx->getSheetNames();
		foreach($sheetNames as $sheetName)
		{
			$sheet = $xlsx->getSheet($sheetName);
			$sheetRows = $sheet->getData();
			$index=0;
			foreach($sheetRows as $key1=>$sheetRow)
			{
				foreach($sheetRow as $key2=>$cell)
				{
					if($cell)
					{
						$subject = array(
							"subject"=>$cell,
							"subjectinarabic"=>$cell,
							"subjectid"=>null,
							"subsubjects"=>array()
						);
						$subjects = $this->recursivelySetSubject($subjects, $key2, $subject);
					}
				}
			}
		}
		return $subjects;
	}
	function recursivelySetSubject($root, $depth, $subject){
		if($depth==0)
		{
			$root[]=$subject;
		}
		else
		{
			$root[count($root)-1]["subsubjects"]=$this->recursivelySetSubject($root[count($root)-1]["subsubjects"], $depth-1, $subject);
		}
		return $root;
	}
}