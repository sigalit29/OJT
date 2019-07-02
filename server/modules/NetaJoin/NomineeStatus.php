
<?php
/**
 * Created by PhpStorm.
 * User: yulia
 * Date: 3/21/2018
 * Time: 05:02 PM
 */
require SERVERROOT."/config.php";

class NomineeStatus
{
    function GetNomineeStatuses()
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $Statuses = $ndb->smartQuery(array(
            'sql' => "Select * FROM nomineestatus ORDER BY `nomineestatusid`",
            'par' => array(),
            'ret' => 'all'
        ));
        return $Statuses;
    }

    function AddNomineeStatus($data)
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        foreach($data as $NomineeStatus)
        {
            if(isset($NomineeStatus->nomineestatusid))
            {

                $result = $ndb->smartQuery(array(
                    'sql' => "
                  UPDATE `nomineestatus` 
                  SET   `nomineestatus` =:nomineestatus,         
                  WHERE `nomineestatusid`=:nomineestatusid",
                    'par' => array(
                        'nomineestatus'=>$NomineeStatus->nomineestatus,
                        'nomineestatusid'=>$NomineeStatus->nomineestatusid),
                    'ret' => 'result'
                ));
            }else
            {
                $result = $ndb->smartQuery(array(
                    'sql' => "INSERT INTO nomineestatus (nomineestatus)VALUES(:nomineestatus)",
                    'par' => array('nomineestatus'=>$NomineeStatus->nomineestatus),
                    'ret' => 'result'
                ));
            }
        }
        return $result;
    }

}