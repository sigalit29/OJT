<?php
class UserExcelParser{
	function GetUsersFromFile($file)
	{
		$rows = $this->ParseFile($file);
		$users = $this->ConstructUsers($rows);
		return $this->ValidateUsers($users);
	}
	function ParseFile($file){
		$usersCSV = array();
		$xlsx = new XLSXReader($file['tmp_name'][0]);
		$sheetNames = $xlsx->getSheetNames();
		foreach($sheetNames as $sheetName) 
		{
			$sheet = $xlsx->getSheet($sheetName);
			$sheetRows = $sheet->getData();
			$index=0;
			foreach($sheetRows as $sheetRow) 
			{
				if($index!=0)
				{
					$usersCSV[] =  $sheetRow;
				}
				$index++;
			}
		}
		return $usersCSV;
	}
	function ConstructUsers($rows){
		$users = array();
		foreach($rows as $row){
			$user=array(
				"firstname"=> $row[0],
				"lastname"=> $row[1],
				"email"=> preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $row[2]),
				"password"=> preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $row[3]),
				"tz"=> $row[4],
				"phone"=> $row[5],
				"birthday"=> $row[6],
				"city"=> $row[7],
				"gender"=> $row[8],
				"religion"=> $row[9],
				"studentInCode"=> $row[10]
			);
			if($user['birthday']!='')
			{
				$pieces = explode("/", $user['birthday']);
				if(count($pieces)>2)
					$user['birthday'] = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
			}
			$users[]=$user;
		}
		return $users;
	}
	function ValidateUsers($users){
		global $db;
		global $Gender;
		$genders = indexArrayByAttribute($Gender -> GetGenders(), "name");
		global $Religion;
		$religions = indexArrayByAttribute($Religion -> GetReligions(), "name");
		global $City;
		$cities = indexArrayByAttribute($City -> GetCities(), "name");
		$courses =  $db->smartQuery(array(
				'sql' => "SELECT code, courseid FROM course WHERE status = 1",
				'par' => array(),
				'ret' => 'all'
		));
		$courses=indexArrayByAttribute($courses, "code");
		$uniqueTzVerificationSql = "";
		$uniqueEmailVerificationSql = "";
		$uniqueTzVerificationParams = array();
		$uniqueEmailVerificationParams = array();
		foreach($users as $index=>$user){
			//check required fields
			if(
				!isset($user["email"])||
				!isset($user["password"])||
				!isset($user["firstname"])||
				!isset($user["lastname"])||
				!isset($user["city"])||
				!isset($user["phone"])||
				!isset($user["birthday"])
			)
			{
				return array("error"=>"cancelling upload - one of the users is missing required information - ".$user["email"]);
			}
			//construct query and params for unique fields check
			$uniqueTzVerificationSql.=":tz_".$index.", ";
			$uniqueEmailVerificationSql.=":email_".$index.", ";
			$uniqueTzVerificationParams["tz_".$index]=$user["tz"];
			$uniqueEmailVerificationParams["email_".$index]=$user["email"];
			//validate password
			$passCheck=checkPassword($user["password"]);
			if(isset($passCheck["error"]))
			{
				return array("error"=>"The password ".$user["password"]." is invalid - ".$passCheck["error"]);
			}
			//match course codes to id, notify if no match is detected
			if(isset($user["studentInCode"])&&$user["studentInCode"]!="")
			{
				if(!isset($courses[$user["studentInCode"]]))
				{
					return array("error"=>"cancelling upload - the registration code ".$user["studentInCode"]." doesn't exist in our db");
				}
				$users[$index]["studentInCourseId"] = $courses[$user["studentInCode"]]["courseid"];
			}
			//match religions to id, notify if no match is detected
			if(isset($user["religion"])&&$user["religion"]!="")
			{
				if(!isset($religions[$user["religion"]]))
				{
					return array("error"=>"cancelling upload - the religion ".$user["religion"]." doesn't exist in our db");
				}
				$users[$index]["religionid"] = $religions[$user["religion"]]["religionid"];
			}
			//match genders to id, notify if no match is detected
			if(isset($user["gender"])&&$user["gender"]!="")
			{
				if(!isset($genders[$user["gender"]]))
				{
					return array("error"=>"cancelling upload - the gender ".$user["gender"]." doesn't exist in our db");
				}
				$users[$index]["genderid"] = $genders[$user["gender"]]["genderid"];
			}
			//match cities to id, notify if no match is detected
			if(!isset($cities[$user["city"]]))
			{
				return array("error"=>"cancelling upload - the city ".$user["city"]." doesn't exist in our db");
			}
			$users[$index]["cityid"] = $cities[$user["city"]]["cityid"];
		}
		//check for non unique emails within the new users
		$emailsArr = array_column($users, "email");
		if(containsDuplicates($emailsArr))
		{
			return array("error"=>"cancelling upload - can't upload multiple users with the same email");
		}
		//check for non unique tzs within the new users
		$tzsArr = array_column($users, "tz");
		if(containsDuplicates($tzsArr))
		{
			return array("error"=>"cancelling upload - can't upload multiple users with the same tz");
		}
		//check for non unique emails against db
		$allEmailsUnique = $db->smartQuery(array(
				'sql' => "SELECT * FROM user WHERE email IN(".rtrim($uniqueEmailVerificationSql, ", ").")",
				'par' => $uniqueEmailVerificationParams,
				'ret' => 'fetch-assoc'
		));
		if(isset($allEmailsUnique)&&isset($allEmailsUnique["email"]))
		{
			return array("error"=>"cancelling upload - the email ".$allEmailsUnique["email"]." already exists in our db");
		}
		//check for non unique tzs against db
		$allTzsUnique = $db->smartQuery(array(
				'sql' => "SELECT * FROM user_profile WHERE tznumber IN(".rtrim($uniqueTzVerificationSql, ", ").")",
				'par' => $uniqueTzVerificationParams,
				'ret' => 'fetch-assoc'
		));
		if(isset($allTzsUnique)&&isset($allTzsUnique["tznumber"]))
		{
			return array("error"=>"cancelling upload - the tz ".$allTzsUnique["tznumber"]." already exists in our db");
		}
		return $users;
	}
}