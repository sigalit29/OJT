<?php
require SERVERROOT."/config.php";

class School
{

    function GetSchoolsByNetaCityId($ncid)
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $schools = $ndb->smartQuery(array(
            'sql' => "Select * FROM school where CityId = :cityid",
            'par' => array('cityid' => $ncid),
            'ret' => 'all'
        ));
        return $schools;
    }

    function GetSchools()
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $Schools = $ndb->smartQuery(array(
            'sql' => "Select * FROM school Order By schoolname",
            'par' => array(),
            'ret' => 'all'
        ));
        return $Schools;
    }
}