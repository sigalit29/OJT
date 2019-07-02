<?php
class EnrollmentRole{
	function GetEnrollmentRoles()
	{
		global $db;
		$Roles = $db->smartQuery(array(
			'sql' => "SELECT * FROM enrollmentrole",
			'par' => array(),
			'ret' => 'all'
		));
		return $Roles;
	}
}