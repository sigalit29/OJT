<?php
define ('SERVERROOT',__DIR__);
require SERVERROOT."/config.php";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

$server_name   = $conf->DB->host;
$username      = $conf->DB->userName;
$password      = $conf->DB->pass;
$database_name = $conf->DB->DBName;
$date_string   = date("Y-m-d-H-i-s");
//$dir=SERVERROOT.'/backups';
//$dir=SERVERROOT.'backups/';
$dir='backups/';
$maxDBInstances = 48;

include('db_backup_library.php');
$dbbackup = new db_backup($server_name ,$username,$password,$database_name);
$dbbackup->connect();
$dbbackup->backup();
$dbbackup->save($dir,$name=$date_string.'_'.$database_name);

clearOldBackups();

function clearOldBackups()
{
	// Grab all files from the desired folder
	$files = glob( './backups/*.*' );
	
	
	// Sort files by modified time, earliest to latest
	// Use SORT_DESC in place of SORT_ASC for latest to earliest
	array_multisort(
        array_map('filemtime', $files),
        SORT_NUMERIC,
        SORT_ASC,
        $files
	);
	global $maxDBInstances;
	if(count($files)>$maxDBInstances)
	{
	    unlink($files[0]);
	}
}
?>