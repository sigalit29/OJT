<?php
/**
 * Created by IntelliJ IDEA.
 * User: yulia
 * Date: 10/22/2018
 * Time: 01:42 PM
 */

class Hour
{
    function GetHours()
    {
        global $db;
        $hours = $db->smartQuery(array(
            'sql' => "Select * FROM hour",
            'par' => array(),
            'ret' => 'all'
        ));
        return $hours;
    }
}