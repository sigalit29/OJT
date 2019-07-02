<?php
class Language{
	
	function GetLanguages()
	{
		global $db;
		$languages = $db->smartQuery(array(
			'sql' => "Select * FROM language",
			'par' => array(),
			'ret' => 'all'
		));
		return $languages;
	}
	
	function AddLanguage($data)
	{
		global $db;
		foreach($data as $language)
		{
			if(isset($language->languageid))
			{
				$id = $language->languageid;
				$result = $db->smartQuery(array(
					'sql' => "update language set name= :name,IsShow= :IsShow where languageid=:id",
					'par' => array('name'=>$language->name,'IsShow'=>$language->IsShow, 'id'=>$id),
					'ret' => 'result'
				));
			}else
			{
				$result = $db->smartQuery(array(
					'sql' => "insert into language (name,IsShow)values(:name,:IsShow)",
					'par' => array('name'=>$language->name,'IsShow'=>$language->IsShow),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
	
}