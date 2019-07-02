<?php
/**
 * Created by PhpStorm.
 * User: yulia
 * Date: 3/21/2018
 * Time: 12:24 PM
 */
require SERVERROOT."/config.php";

class NetaCity
{
    function GetNetaCities()
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $Cities = $ndb->smartQuery(array(
            'sql' => "Select * FROM netacity Order By CityName",
            'par' => array(),
            'ret' => 'all'
        ));
        return $Cities;
    }

    function AddNetaCities($data)
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        foreach ($data as $netacity) {
            if (isset($netacity->CityId)) {
                $result = $ndb->smartQuery(array(
                    'sql' => "UPDATE `netacity` 
                              SET `CityName`=:CityName,`ArabicCityName`=:ArabicCityName
                              WHERE `CityId`=:CityId",
                    'par' => array(
                        'CityName' => $netacity->CityName,
                        'ArabicCityName' => $netacity->ArabicCityName,
                        'CityId' => $netacity->CityId),
                    'ret' => 'result'
                ));
            } else {
                $result = $ndb->smartQuery(array(
                    'sql' => "INSERT INTO netacity (CityName,ArabicCityName)VALUES(:CityName,:ArabicCityName)",
                    'par' => array('CityName' => $netacity->CityName, 'ArabicCityName' => $netacity->ArabicCityName),
                    'ret' => 'result'
                ));
            }
        }

        return $result;
    }
}


