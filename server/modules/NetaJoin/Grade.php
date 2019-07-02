<?php
/**
 * Created by PhpStorm.
 * User: yulia
 * Date: 3/21/2018
 * Time: 02:09 PM
 */
require SERVERROOT."/config.php";

class Grade
{
    function GetClasses()
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        $Classes = $ndb->smartQuery(array(
            'sql' => "Select * FROM class Order By classname",
            'par' => array(),
            'ret' => 'all'
        ));
        return $Classes;
    }

    function AddClass($data)
    {
		global $conf;
		$ndb = new Db($conf->DB->NJhost,$conf->DB->NJDBName,$conf->DB->NJuserName,$conf->DB->NJpass,$conf->DB->logError);
        foreach($data as $Grade)
        {
            $ArabicClassName = isset($Grade->ArabicClassName)?$Grade->ArabicClassName :'';
            if(isset($Grade->classid))
            {

                $result = $ndb->smartQuery(array(
                    'sql' => "UPDATE `class` SET  `ArabicClassName` =:ArabicClassName, `classname= :classname` where `classid`=:id",
                    'par' => array('ArabicClassName'=>$Grade->ArabicClassName,'classname'=>$Grade->classname,'classid'=>$Grade->classid),
                    'ret' => 'result'
                ));
            }else
            {
                $result = $ndb->smartQuery(array(
                    'sql' => "INSERT INTO class (ArabicClassName,classname)VALUES(:ArabicClassName,:name)",
                    'par' => array('ArabicClassName'=>$Grade->ArabicClassName,'name'=>$Grade->classname),
                    'ret' => 'result'
                ));
            }
        }
        return $result;
    }
}