<html>
	<head>
		<meta charset="utf-8" />
	</head>
<?php
define ('SERVERROOT',__DIR__);
require SERVERROOT."/config.php";
require SERVERROOT."/db.php";
$db = new Db($conf->DB->host,$conf->DB->DBName,$conf->DB->userName,$conf->DB->pass,$conf->DB->logError);

if(isset($_GET['id']) && $_GET['id']!='')
{
	$user = $db->smartQuery(array(
		'sql' => "SELECT userid FROM user WHERE needacceptregister=:needacceptregister",
		'par' => array('needacceptregister'=>$_GET['id']),
		'ret' => 'fetch-assoc'
	));
	
	if(isset($user['userid']))
	{
		$userid = $user['userid'];
		$db->smartQuery(array(
			'sql' => "UPDATE `user` SET needacceptregister='' WHERE userid=:userid;",
			'par' => array('userid' => $userid),
			'ret' => 'result'
		));
		echo 'הרשמתך למערכת הושלמה בהצלחה - חזרו לאפליקציה ולחצו על כפתור סיום כדי להתחיל את השימוש בה';
	}else
	{
		echo 'המשתמש שלך אושר, ניתן להשתמש בו לכניסה לאפליקציה';
	}
}
else if(isset($_GET['chMail']) && $_GET['chMail']!='')
{
	$user = $db->smartQuery(array(
		'sql' => "SELECT userid, tempNextEmail FROM user WHERE userid=:userid",
		'par' => array('userid'=>$_GET['chMail']),
		'ret' => 'fetch-assoc'
	));
	
	if(isset($user['userid']))
	{
		$userid = $user['userid'];
		$tempNextEmail = $user['tempNextEmail'];
		$db->smartQuery(array(
			'sql' => "UPDATE `user` SET tempNextEmail='', email=:email WHERE userid=:userid;",
			'par' => array('userid' => $userid, 'email' => $tempNextEmail),
			'ret' => 'result'
		));
		
		$db->smartQuery(array(
			'sql' => "UPDATE `user_profile` SET email=:email WHERE userid=:userid;",
			'par' => array('userid' => $userid, 'email' => $tempNextEmail),
			'ret' => 'result'
		));
		echo 'your new email is '.$tempNextEmail;
	}
	else
	{
		echo 'error';
	}
}
else
{
	echo 'error';
}
?>
</html>