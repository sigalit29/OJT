<?php
define ('SERVERROOT',__DIR__);
require SERVERROOT."/config.php";
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
//error_reporting(E_ALL);

$server_name   = $conf->DB->host;
$username      = $conf->DB->userName;
$password      = $conf->DB->pass;
$database_name = $conf->DB->DBName;
$date_string   = date("Y-m-d-H-i-s");
//$dir=SERVERROOT.'/backups';
$dir='backups/';
$maxDBInstances = 5;


//$cmd = 'C:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump.exe --host='.$server_name.' --user='.$username.' --password="'.$password.'" '.$database_name.' > ' .$dir. '\\'.$date_string.'_'.$database_name.'.sql';
//echo $cmd;
//$return = array();
//exec($cmd);
/*foreach($return as $result) {
	echo 'output - '.$result['type'], '<br>';
}*/
// Grab all files from the desired folder
//$files = glob( './backups/*.*' );


// Sort files by modified time, earliest to latest
// Use SORT_DESC in place of SORT_ASC for latest to earliest
/*array_multisort(
		array_map('filemtime', $files),
		SORT_NUMERIC,
		SORT_ASC,
		$files
		);
if(count($files)>$maxDBInstances)
{
	unlink($files[0]);
}*/

backup_tables($server_name,$username,$password,$database_name);

/* backup the db OR just a table */
function backup_tables($host,$user,$pass,$name,$tables = '*')
{
	
	$link = mysqli_connect($host,$user,$pass);
	if (!$link->set_charset("utf8")) {
		printf("Error loading character set utf8: %s\n", $link->error);
		exit();
	} else {
		printf("Current character set: %s\n", $link->character_set_name());
	}
	mysqli_select_db($link, $name);
	$return='';
	//get all of the tables
	if($tables == '*')
	{
		$tables = array();
		$result = mysqli_query($link, 'SHOW TABLES');
		while($row = mysqli_fetch_row($result))
		{
			$tables[] = $row[0];
		}
	}
	else
	{
		$tables = is_array($tables) ? $tables : explode(',',$tables);
	}
	
	//cycle through
	foreach($tables as $table)
	{
		$result = mysqli_query($link, 'SELECT * FROM '.$table);
		$num_fields = mysqli_num_fields($result);
		$return.= 'DROP TABLE IF EXISTS '.$table.';';
		$row2 = mysqli_fetch_row(mysqli_query($link, 'SHOW CREATE TABLE '.$table));
		$return.= "\n\n".$row2[1].";\n\n";
		for ($i = 0; $i < $num_fields; $i++)
		{
			while($row = mysqli_fetch_row($result))
			{
				$return.= 'INSERT INTO '.$table.' VALUES(';
				for($j=0; $j < $num_fields; $j++)
				{
					$row[$j] = addslashes($row[$j]);
					//$row[$j] = preg_replace('\\n','\\\\n',$row[$j]);
					if (isset($row[$j])) { $return.= '"'.$row[$j].'"' ; } else { $return.= '""'; }
					if ($j < ($num_fields-1)) { $return.= ','; }
				}
				$return.= ");\n";
			}
		}
		$return.="\n\n\n";
		
	}
	$link->close();
	//save file
	global $dir;
	global $date_string;
	echo $dir.'\\'.$date_string.'_'.$name.'.sql';
	$handle = fopen($dir.'/'.$date_string.'_'.$name.'.sql', "w");
	if($handle==FALSE)
	{
		printf("file not open\n");
	}
	$ans=fwrite($handle,$return);
	fclose($handle);
	clearOldBackups();
}
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