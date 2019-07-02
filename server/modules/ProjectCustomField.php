<?php

class ProjectCustomField{
	function GetProjectCustomFields($projectid)
	{
		global $db;
		$fields =  $db->smartQuery(array(
			'sql' => "
				SELECT
					*
				FROM
					project_enrollment_fields
				WHERE projectid = :projectid
			",
			'par' => array("projectid"=>$projectid),
			'ret' => 'all'
		));
		return $fields;
	}
	function SaveProjectCustomFields($projectid, $fields)
	{
		global $db;
		$result=false;
		foreach($fields as $field)
		{
			$params=isset($field->fieldParams)?$field->fieldParams:null;
			if(isset($field->enrollment_field_id))
			{
				$result =  $db->smartQuery(array(
					'sql' => "UPDATE project_enrollment_fields SET projectid=:projectid, field=:field, fieldtype=:fieldtype, params=:params WHERE enrollment_field_id=:enrollment_field_id",
					'par' => array('projectid'=>$projectid, 'field'=>$field->field, 'fieldtype'=>$field->fieldtype, 'params'=>$params, 'enrollment_field_id'=>$field->enrollment_field_id),
					'ret' => 'result'
				));
			}else
			{
				$result =  $db->smartQuery(array(
					'sql' => "INSERT INTO project_enrollment_fields (projectid, field, fieldtype, params) VALUES (:projectid, :field, :fieldtype, :params)",
					'par' => array('projectid'=>$projectid, 'field'=>$field->field, 'fieldtype'=>$field->fieldtype, 'params'=>$params),
					'ret' => 'result'
				));
			}
		}
		return $result;
	}
}