<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
define ('SERVERROOT',__DIR__);
date_default_timezone_set( "Asia/Jerusalem" );
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require SERVERROOT."/config.php";
require SERVERROOT."/modules/notificationCron.php";
require SERVERROOT."/modules/FireBaseFCM.php";
require SERVERROOT."/modules/Course.php";
require SERVERROOT."/modules/Statistic.php";
require SERVERROOT."/db.php";

$db = new Db($conf->DB->host,$conf->DB->DBName,$conf->DB->userName,$conf->DB->pass,$conf->DB->logError);
$Course = new Course();
$Statistic = new Statistic();
$notificationCron = new notificationCron();
$FireBaseFCM = new FireBaseFCM();
$hour=date("H",time());
if($hour>8&&$hour<23)
{
$ans1 = $notificationCron->CheckTeacherFeedbackReminderNotification();
echo 1;
$ans2 = $notificationCron->CheckCheckoutNotification();
echo 2;
$ans3 = $notificationCron->CheckActivationReminderNotification();
echo 3;
$ans4 = $notificationCron->CheckClosingReminderNotification();
echo 4;
$ans5 = $notificationCron->CheckDashboardReminderNotification();
echo 5;

$ans = array('ans1'=>$ans1, 'ans2'=>$ans2, 'ans3'=>$ans3, 'ans4'=>$ans4, 'ans5'=>$ans5);
echo json_encode($ans);
}
echo time()."    ";
?>	
