<?php
class User{
	//student user signup
	function signup($email, $pass1, $pass2, $googleid, $firstname, $lastname, $phone, $phone2, $genderid, $cityid, $image, $tz, $birthday, $address)//$image not requierd// tz check if not exist
	{
		if(!$googleid)
		{
			if($pass1!= $pass2)
			{
				return (object)array("error"=>"password1 != password2");
			}
			$ErrorPassword = checkPassword($pass1);
			if(isset($ErrorPassword['error']))
			{
				return $ErrorPassword;
			}
			$password = hash('sha256', $pass1);
			$googleid = null;
		}
		else
		{
			$password = "usingGoogle";
			$client = new Google_Client(['client_id' => "748175266771-qqffesbrp2qvjjhmsiiqdgfcvqd1i08f.apps.googleusercontent.com"]);  // Specify the CLIENT_ID of the app that accesses the backend
			$payload = $client->verifyIdToken($googleid);
			if ($payload) {
				$googleid = $payload['sub'];
				$email = $payload['email'];
			} else {
				$googleid = null;
				return (object)array("error"=>"google signup failed");
			}
		}
		global $db;
		$userIdByTz = $this->GetUserIdByTz($tz);
		if($userIdByTz)
		{
			return (object)array("error"=>"tz exist in the system");
		}
		else if($this -> getUserIdByEmail($email)!=null)
		{
			return (object)array("error"=>"email exist in the system");
		}
		else
		{
			$registerdate =  date('Y-m-d H:i:s', time());
			if($birthday!="")
			{
				$pieces = explode("/", $birthday);
				if(count($pieces)>2)
				$birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
			}
			$result=$db->smartQuery(array(
			'sql' => "INSERT INTO `user` (email, password, needacceptregister, status, googleid) VALUES (:email,:password,:needacceptregister, 1, :googleid)",
					'par' => array('email' => ''.$email, 'password' => ''.$password, 'needacceptregister' => "xxx", 'googleid' => $googleid),					
			'ret' => 'result'
			));
			$userId = $db->getLastInsertId();
			$result=$db->smartQuery(array(
			'sql' => "INSERT INTO `user_profile` (
				userid,
				firstname,
				lastname,
				firstnameinarabic,
				lastnameinarabic,
				tznumber,
				phone,
				phone2,
				genderid,
				cityid,
				address,
				birthday,
				email,
				image,
				registerdate,
				status
			) VALUES (
				:userid,
				:firstname,
				:lastname,
				:firstname,
				:lastname,
				:tznumber,
				:phone,:phone2,
				:genderid,
				:cityid,
				:address,
				:birthday,
				:email,
				:image,
				:registerdate,
				:status
			)",
			'par' => array('userid' => $userId,'firstname' => ''.$firstname,'lastname' => ''.$lastname,'tznumber' => ''.$tz,'phone' => ''.$phone,'phone2' => ''.$phone2,'genderid' => ''.$genderid,'cityid' => ''.$cityid,'address' => ''.$address,'birthday' => $birthday,'email' => ''.$email,'image' => ''.$image,'registerdate' => ''.$registerdate,'status' => 1),
			'ret' => 'result'
			));
			return true;
		}
	}
	//mail verification management
	function sendSignupMail($email)
	{
		global $db;
		global $mail;
		if($this -> getUserIdByEmail($email)!=null)
		{
			if($this -> isEmailApproved($email))
			{
				return (object) array("error" => "email was already approved");
			}
		}
		else {
			return (object) array("error" => "couldn't find a user with this email");
		}
		//create a random registration token
		$registerid = md5(uniqid(rand(), true));
		//give that token to the user with the corresponding email
		$result=$db->smartQuery(array(
				'sql' => "UPDATE `user` SET `needacceptregister`=:needacceptregister WHERE `email`=:email",
				'par' => array('email' => ''.$email, 'needacceptregister' => $registerid),
				'ret' => 'result'
		));
		
		$mail->setFrom('noreply@dc.appleseeds.org.il', 'Digital Classroom');
		$mail->addAddress($email);     // Add a recipient
		$mail->addReplyTo('leet@appleseeds.org.il', 'Information');
		
		//Set email format to HTML
		$mail->isHTML(true);
		$mail->CharSet = 'UTF-8';
		$subject = 'אפליקצית הכיתה הדיגיטלית - הפעלת חשבון';
		$subject = "=?UTF-8?B?".base64_encode($subject)."?=";
		$mail->Subject = $subject;
		$link = 'https://'.$_SERVER['SERVER_NAME'].'/server/acceptregister.php?id='.$registerid;
		$message = "<span dir='rtl' style='text-align:right'><p> נא ללחוץ על הלינק על מנת לאשר את כתובת המייל הזו: <a href=\"".$link."\">".$link."</a></p><p>זהו מייל אוטומטי שנשלח ממערכת הכיתה הדיגיטלית.</p></span>";
		$mail->Body    = $message;
		$message = "נא ללחוץ על הלינק על מנת לאשר את כתובת המייל הזו: ".$link." זהו מייל אוטומטי שנשלח ממערכת הכיתה הדיגיטלית.";
		$mail->AltBody = $message;
		if(!$mail->send()) {
			return false;
		}
		else
			return true;
	}
	
	function reg_ChangeEmail($email1, $email2)
	{
		global $db;
		if($email2!=$email1&&$this->getUserIdByEmail($email2)!=null)
		{
			return (object)array("error"=>"email exist in the system");
		}
		if($this -> getUserIdByEmail($email1)!=null)
		{
			if(!$this -> isEmailApproved($email1))
			{
				if($email2!=$email1)
				{
					$result=$db->smartQuery(array(
						'sql' => "UPDATE `user` SET `email`=:email2 WHERE `email`=:email1",
						'par' => array('email1' => ''.$email1, 'email2' => ''.$email2),
						'ret' => 'result'
					));
				}
				return $this -> sendSignupMail($email2);
			}
			else
			{
				return (object) array("error" => "email to replace was already approved");
			}
		}
		else
		{
			return (object) array("error" => "email to replace wasn't found");
		}
	}

	function isEmailApproved ($email)
	{
		global $db;
		$regitrationToken = $db->smartQuery(array(
				'sql' => "SELECT `needacceptregister` FROM user WHERE email=:email",
				'par' => array('email'=>$email),
				'ret' => 'fetch-assoc'
		));
		if(isset($regitrationToken['needacceptregister']) && $regitrationToken['needacceptregister']=="")
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	function approveUserEmail ($userid)
	{
		global $db;
		return $db->smartQuery(array(
			'sql' => "UPDATE `user` SET needacceptregister='' WHERE userid=:userid;",
			'par' => array('userid' => $userid),
			'ret' => 'result'
		));
	}
	//login
	function login($pass, $email, $clientType){
		if(!$this->isNonRepetitiveLoginAttempt($email))
		{
			return (object)array("error"=>"too many failed login attempts - please try again later");
		}
		$pass = hash('sha256', $pass);
		$user = $this->getUserByCredentials($pass,$email);
		if(!$user)
		{
			$this->incrementLoginAttemptDelay($email);
			return (object)array("error" => "incorrect credentials");
		}
		if(!$this->isEmailApproved($email))
		{
			return (object)array("error"=>"need to accept register");
		}
		if(!$user['status']==1)
		{
			return (object)array("error"=>"the user is inactive");
		}
		$token=$user["userid"].md5(uniqid(rand(), true));
		$this->startUserSession($user["userid"], $token, $clientType);
		return (object)array("token" => $token, "isAdmin" => $user["isAdmin"]);
	}
	
	function isNonRepetitiveLoginAttempt($email)
	{
		global $db;
		$user=$db->smartQuery(array(
				'sql' => "SELECT `logintimestamp` FROM `user` WHERE `email`=:email",
				'par' => array('email'=>$email),
				'ret' => 'fetch-assoc'
		));
		if(isset($user['logintimestamp']))
		{
			return $user['logintimestamp'] < time();
		}
		return true;
	}
	
	function getUserByCredentials($pass,$email){
		global $db;
		$user=$db->smartQuery(array(
		'sql' => "SELECT `userid`, isAdmin, status FROM `user` WHERE `password`=:pass AND `email`=:email",
		'par' => array('pass' => $pass, 'email' => $email),
		'ret' => 'fetch-assoc'
		));
		if(isset($user['userid']))
		{
			return $user;
		}else
		{
			return null;
		}
	}
	
	function incrementLoginAttemptDelay($email)
	{
		global $db;
		$user=$db->smartQuery(array(
				'sql' => "SELECT `logintimestamp`, `passtry` FROM `user` WHERE `email`=:email",
				'par' => array('email'=>$email),
				'ret' => 'fetch-assoc'
		));
		$passtry = $user['passtry'] + 1;
		$logintimestamp = time() + $passtry;
		$db->smartQuery(array(
				'sql' => "UPDATE `user` SET `logintimestamp`=:logintimestamp, `passtry`=:passtry   WHERE `email`=:email",
				'par' => array( 'logintimestamp' => $logintimestamp,'passtry' => $passtry,'email'=>$email),
				'ret' => 'result'
		));
	}
	
	function removeOverflowingToken($userid, $clientType)
	{
		$maxTokens = 3;
		global $db;
		$existingTokens = $db->smartQuery(array(
				'sql' => "SELECT * FROM `user_session` WHERE `userid`=:userid AND client_type=:clientType ORDER BY `createtime`",
				'par' => array('userid' => $userid, 'clientType' => $clientType),
				'ret' => 'all'
		));
		if(count($existingTokens)>=$maxTokens)
		{
			for ($i=0; $i<=count($existingTokens)-$maxTokens;$i++)
			{
				$this->logout($existingTokens[$i]['token']);
			}
		}
	}

	function startUserSession ($userid, $token, $clientType){
		$this -> removeOverflowingToken($userid, $clientType);
		global $db;
		$now = date("Y-m-d H:i:s");
		$db->smartQuery(array(
				'sql' => "
					UPDATE `user` SET passtry=0
					WHERE userid=:userid;
					INSERT INTO `user_session`
					(`token`, `userid`, `createtime`, `client_type`) VALUES 
					(:token, :userid, :now, :clientType);",
				'par' => array('userid' => $userid,'token'=>$token, 'now'=>$now, 'clientType'=>$clientType),
				'ret' => 'result'
		));
	}
	
	function saveFireBaseToken($fbtoken){
		global $db;
		global $myid;
		$ans = $db->smartQuery(array(
			'sql' => "
				UPDATE user SET fbtokenid='' WHERE fbtokenid=:fbtokenid;
				UPDATE `user` SET fbtokenid=:fbtokenid  WHERE `userid`=:userid;",
			'par' => array( 'fbtokenid' => $fbtoken,'userid'=>$myid),
			'ret' => 'result'
		));
		return $ans;
	}
	/**
	 * gets a login token generated by google, and verifies it.
	 * if the token is valid, checks whether the corresponding token exists in out db.
	 * if it doesnt, sends an error. If it does, generates a token, and returns it.
	 * @param String $token - a token from the client to identify the session
	 * @return Array - an object containing basic properties of the user who has a matching token
	*/
	function loginWithGoogle($id_token){
		$client = new Google_Client(['client_id' => "748175266771-qqffesbrp2qvjjhmsiiqdgfcvqd1i08f.apps.googleusercontent.com"]);  // Specify the CLIENT_ID of the app that accesses the backend
		$payload = $client->verifyIdToken($id_token);
		if ($payload) {
			$googleid = $payload['sub'];
			$userid = $this->getUserIdByGoogleId($googleid);
			if(!$userid)
				return (object)array("error" => "incorrect credentials");
			$token=$userid.md5(uniqid(rand(), true));
			$this->startUserSession($userid, $token);
			return (object)array("token" => $token, "isAdmin" => false);
		} else {
			// Invalid ID token
			return false;
		}
	}

	function getUserIdByGoogleId($google_id)
	{
		global $db;
		$user = $db->smartQuery(array(
			'sql' => "SELECT userid FROM `user` WHERE `googleid`=:googleid;",
			'par' => array('googleid' => $google_id),
			'ret' => 'fetch-assoc'
		));
		return $user["userid"];
	}
	/**
	 * gets data about a user who has a currently active session using their session token
	 * @param String $token - a token from the client to identify the session
	 * @return Array - an object containing basic properties of the user who has a matching token
	 */
	function getLoggedInUser($token)
	{
		if(!isset($token)||$token=="")
		{
			return (object)array("error" => "user not found");
		}
		global $db;
		$userId = $this->GetUserIdByToken($token);
		if(isset($userId))
		{
			$user = $db->smartQuery(array(
				'sql' => "SELECT userid, email, isAdmin, passChangeRequired FROM `user` WHERE `userid`=:userId;",
				'par' => array('userId' => $userId),
				'ret' => 'fetch-assoc'
			));
			return $user;
		}
		return (object)array("error" => "user not found");
	}

	/**
	 * logs out of a particular session, according to a session token sent from a client
	 * @param String $token - the token of the session that should be terminated
	 * @return boolean|StdClass - true if all went well, an object with error details otherwise
	 */
	function logout($token){
		global $db;
		$userid = $this->GetUserIdByToken($token);
		if(isset($userid)){
			$result = $db->smartQuery(array(
					'sql' => "DELETE FROM `user_session` WHERE token=:token;",
					'par' => array('token' => $token),
					'ret' => 'result'
			));
			return true;
		}
		else
		{
			return (object)array("error" => "token ".$userid." not found");
		}
	}

	function GetUserIdByTz($tz)
	{
		global $db;
		if($tz=="")
			return false;
		$user = $db->smartQuery(array(
			'sql' => "
				SELECT tznumber, userid
				FROM user_profile
				WHERE tznumber = :tznumber",
			'par' => array( 'tznumber' => $tz),
			'ret' => 'fetch-assoc'
		));
		if(isset($user['userid']))
			return $user['userid'];
		return false;
	}

	function GetUserIdByToken($token){
		global $db;
		if(!isset($token) || $token=='')
		{
			return null;
		}
		$userid = $db->smartQuery(array(
		'sql' => "SELECT userid, createtime, client_type FROM `user_session` WHERE `token`=:token",
		'par' => array( 'token' => $token),
		'ret' => 'fetch-assoc'
		));
		//expire portal tokens after 12 hours
		$tokenCreationDate = $userid['createtime'];
		$tokenCreationTimestamp = strtotime($tokenCreationDate);
		$now = date("Y-m-d H:i:s");
		$tokenExpirationTimestamp = strtotime($now)+60*60*12;
		if($userid['client_type']=="PORTAL"&&($tokenCreationTimestamp>$tokenExpirationTimestamp))
			return null;
		return isset($userid['userid'])?$userid['userid']:null;
	}

	function getUserIdByEmail($email)
	{
		global $db;
		$user = $db->smartQuery(array(
				'sql' => "SELECT userid FROM user WHERE email=:email",
				'par' => array('email'=>$email),
				'ret' => 'fetch-assoc'
		));
		if(isset($user['userid']))
		{
			return $user['userid'];
		}else
		{
			return null;
		}
	}

	function InitPassApp($email)
	{
		global $db;
		$user = $this->getUserIdByEmail($email);
		if($user!=null)
		{
			$missPassToken = md5(uniqid(rand(), true));
			
			$db->smartQuery(array(
			'sql' => "UPDATE `user` SET missPassToken=:missPassToken WHERE email=:email",
					'par' => array('missPassToken' => $missPassToken, 'email'=>$email),
			'rel' => 'result'
			));
			
			global $mail;
			$mail->setFrom('noreply@dc.appleseeds.org.il', 'Digital Classroom');
			$mail->addAddress($email);     // Add a recipient
			$mail->addReplyTo('analyst@appleseeds.org.il', 'Information');
			
			//Set email format to HTML
			$mail->isHTML(true);
			$mail->CharSet = 'UTF-8';
			$subject = 'אפליקצית הכיתה הדיגיטלית - החלפת סיסמה באפליקציה';
			$subject = "=?UTF-8?B?".base64_encode($subject)."?=";
			$mail->Subject = $subject;
			$link = 'https://'.$_SERVER['SERVER_NAME'].'/app/?suffix=#/changePassword/forget/'.$missPassToken;
			$message = "<span dir='rtl' style='text-align:right'><p>"."נא ללחוץ על הלינק על מנת ליצור סיסמה חדשה:<br> <a href=\"".$link."\">".$link."</a></p><p>זהו מייל אוטומטי שנשלח ממערכת הכיתה הדיגיטלית.</p></span>";
			$mail->Body    = $message;
			$message = "נא ללחוץ על הלינק על מנת ליצור סיסמה חדשה: ".$link." זהו מייל אוטומטי שנשלח ממערכת הכיתה הדיגיטלית.";
			$mail->AltBody = $message;
			
			$mail->send();
			return (object)array("success"=>"password sent to this email");
		}else
		{
			return (object)array("error"=>"email not exist");
		}
	}

	function ChangeMisPass($token,$pass1,$pass2)
	{
		global $db;
		if($pass1!= $pass2)
		{
			return (object)array("error"=>"password1 != password2");
		}
		if($token=='')
		{
			return (object)array("error"=>"token can't be empty");
		}
		$ErrorPassword = checkPassword($pass1);
		if(isset($ErrorPassword['error']))
		{
			return $ErrorPassword;
		}
		if($this->MissPassTokenExists($token))
		{
			$pass1 = hash('sha256', $pass1);
			$db->smartQuery(array(
			'sql' => "UPDATE `user` SET password=:password, missPassToken='', passtry=0, passChangeRequired=0, lastPassChange=:lastPassChange WHERE missPassToken=:missPassToken;",
			'par' => array('password' => $pass1,'missPassToken'=>$token, 'lastPassChange'=>time()),
			'ret' => 'result'
			));
			return (object)array("success"=>"password updated");
		}else
		{
			return (object)array("token"=>"token not found");
		}
	}

	function MissPassTokenExists($missPassToken)
	{
		global $db;
		if(!isset($missPassToken) || $missPassToken=='')
		{
			return false;
		}
		$userid = $db->smartQuery(array(
		'sql' => "SELECT userid FROM `user` WHERE `missPassToken`=:missPassToken",
		'par' => array( 'missPassToken' => $missPassToken),
		'ret' => 'fetch-assoc'
		));
		return isset($userid['userid']);
	}

	function ChangeMyPassword($pass,$newpass1,$newpass2)
	{
		global $db;
		global $myid;
		$userPass = $this->GetUserPassById($myid);
		$pass = hash('sha256', $pass);
		if($userPass != $pass)
		{
			return (object)array("error"=>"pass not exist");
		}
		
		if($newpass1 != $newpass2)
		{
			return (object)array("error"=>"newpass not equals");
		}
		
		$ErrorPassword = checkPassword($newpass1);
		if(isset($ErrorPassword['error']))
		{
			return $ErrorPassword;
		}
		
		$newpass = hash('sha256', $newpass1);
		$db->smartQuery(array(
		'sql' => "UPDATE `user` SET password=:password, passChangeRequired=0, lastPassChange=:lastPassChange WHERE userid=:userid;",
				'par' => array('password' => $newpass, 'userid'=>$myid, 'lastPassChange'=>time()),
		'ret' => 'result'
		));
		return (object)array("success"=>"password updated");
	}
	
	function GetUserPassById($userid)
	{
		global $db;
		$user = $db->smartQuery(array(
			'sql' => "SELECT password FROM `user` WHERE `userid`=:userid",
			'par' => array('userid' => $userid),
			'ret' => 'fetch-assoc'
		));
		return $user['password'];
	}
	
	function GetUser($pass,$email)
	{
		global $db;
		$User=$db->smartQuery(array(
		'sql' => "SELECT userid, needacceptregister FROM `user` WHERE password=:pass AND email=:email",
		'par' => array('pass' => $pass, 'email' => $email),
		'ret' => 'fetch-assoc'
		));
		
		if(isset($User['userid']) && $User['userid']!="")
		{
			return $User;
		}else
		{
			return null;
		}
	}

	function GetUserByid($id){
		global $db;
		$user = $db->smartQuery(array(
		'sql' => "SELECT userid, email, type FROM `user` WHERE `userid`=:userid",
		'par' => array( 'userid' => $id),
		'ret' => 'fetch-assoc'
		));
		return $user;
	}

}