<?php
class EnrollmentTag{	
	function GetEnrollmentTags()
	{
		global $db;
		$tags= $db->smartQuery(array(
			'sql' => "SELECT * FROM enrollmenttag WHERE IsShow='1'",
			'par' => array(),
			'ret' => 'all'
		));
		return $tags;
	}

    function GetEnrollmentTagsForStudents()
    {
        global $db;
        $tags = $db->smartQuery(array(
            'sql' => "SELECT * FROM enrollmenttag WHERE IsShow='1'",
            'par' => array(),
            'ret' => 'all'
        ));
        return $tags;
    }

    function GetEnrollmentTagsForTeachers()
    {
        global $db;
        $tags = $db->smartQuery(array(
            'sql' => "SELECT * FROM enrollmenttag WHERE IsShow='1' ",
            'par' => array(),
            'ret' => 'all'
        ));
        return $tags;
    }
}