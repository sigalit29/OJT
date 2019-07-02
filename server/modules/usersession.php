<?php
class UserSession{
	
	
	/*function GetUserIdByToken($token)
	{
		global $db;
		$userid = $db->smartQuery(array(
			'sql' => "Select * FROM `usersession` Where `token`=:token",
			'par' => array( 'token' => $token),
			'ret' => 'fetch-assoc'
		));
		return $userid['useid'];
	}/
		
		
	/*function StartUserSession($uid, $type,$token){
		global $db;
		session_regenerate_id(); 
		$sessionID= session_id();
		$db->smartQuery(array(
			'sql' => "INSERT INTO `usersession` (`sessionid`, `useid`, `type`,`token`) VALUES ( :sessionID, :uid, :type,:token);",
			'par' => array( 'sessionID' => $sessionID, 'uid' => $uid, 'type' => $type,'token'=>$token),
			'rel' => 'result'
		));	
	}*/
	
	/*function logout(){
		global $db;
		$sessionID= session_id();
		$result = $db->smartQuery(array(
			'sql' => "DELETE from `usersession` where `sessionid`=:sessionID ;",
			'par' => array('sessionID' => $sessionID),
			'ret' => 'result'
		));
		return $result;
	}*/	
	
	/*function isLogin(){
		$sessionID= session_id();
		global $db;
		$session = $db->smartQuery(array(
			'sql' => "SELECT * FROM `usersession` WHERE `sessionid`=:sessionID ;",
			'par' => array('sessionID' => $sessionID),
			'ret' => 'all'
		));
		if($session)return true;
		else return false;
	}
	
	function logoutApi($token){
		global $db;
		$userid = $this->GetUserIdByToken($token);
		if(isset($userid) && $userid > 0){
			$result = $db->smartQuery(array(
				'sql' => "DELETE from `usersession` where `token`=:token ;",
				'par' => array('token' => $token),
				'ret' => 'result'
			));
			return true;
		}else
		{
			return (object)array("error" => "token not exist");
		}
	}	
	
	function isLoginApi($token){
		global $db;
		$session = $db->smartQuery(array(
			'sql' => "SELECT * FROM `usersession` WHERE `token`=:token ;",
			'par' => array('token' => $token),
			'ret' => 'all'
		));
		if($session)return true;
		else return (object)array("error" => "token not exist");
	}*/
}