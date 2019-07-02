<?php
/**
 * Created by PhpStorm.
 * User: yulia
 * Date: 3/21/2018
 * Time: 02:49 PM
 */
require SERVERROOT."/config.php";

class HearAboutUs
{
    function GetHearAboutUsOptions()
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $HearAboutUs = $ndb->smartQuery(array(
            'sql' => "Select * FROM hearabout Order By hearaboutoption",
            'par' => array(),
            'ret' => 'all'
        ));
        return $HearAboutUs;
    }
    function AddHearAbout($data)
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        foreach($data as $HearAboutUs)
        {
            if(isset($HearAboutUs->hearaboutid))
            {

                $result = $ndb->smartQuery(array(
                    'sql' => "
                  UPDATE `hearabout` 
                  SET   `hearaboutoption` =:hearaboutoption, 
                        `ArabicHearAbout` =:ArabicHearAbout
                  WHERE `hearaboutid`=:hearaboutid",
                    'par' => array(
                        'hearaboutoption'=>$HearAboutUs->hearaboutoption,
                        'ArabicHearAbout'=>$HearAboutUs->ArabicHearAbout,
                        'hearaboutid'=>$HearAboutUs->hearaboutid),
                    'ret' => 'result'
                ));
            }else
            {
                $result = $ndb->smartQuery(array(
                    'sql' => "INSERT INTO hearabout (hearaboutoption,ArabicHearAbout)VALUES(:hearaboutoption,:ArabicHearAbout)",
                    'par' => array('hearaboutoption'=>$HearAboutUs->hearaboutoption,'ArabicHearAbout'=>$HearAboutUs->ArabicHearAbout),
                    'ret' => 'result'
                ));
            }
        }
        return $result;
    }
}
