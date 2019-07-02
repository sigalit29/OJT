<?php
class ReportApprover{
	function GetHoursApprovers($userid)
	{
		global $db;
		$approvers = $db->smartQuery(array(
				'sql' => "
					SELECT p.userid, p.firstname, p.lastname
					FROM reportapprover AS ra
					JOIN user_profile AS p ON p.userid = ra.approverid
					WHERE ra.userid=:userid
				",
				'par' => array('userid' => $userid),
				'ret' => 'all'
		));
		return $approvers;
	}

	/**
	 * Gets a list of search perimeters, and returns a list of users who can serve as report approvers base on them, filtered by
	 * whether or not the user who makes the request is authorized to view them,
	 * along side the number of pages filled by the full results set
	 * @param String $search - the search term to use
	 * @param String $sorting - based on which field to sort the results
	 * @param boolean $desc - whether to order the results in a descending order
	 * @param int $userstatus - which user status to filter by
	 * @param int $page - which page of the results to return
	 * @return results[]:
	 * {
	 * "users":
	 * [{"userid","userinfo"}],
	 * pages:208
	 * }
	 */
	function SearchHoursApprovers($userid, $search, $sorting, $desc, $page)
	{
		global $db;
		$users = $db->smartQuery(array(
				'sql' =>
				"SELECT u.userid, CONCAT(u.firstname, ' ', u.lastname) AS userinfo
				FROM `user_profile` AS u
				JOIN user ON user.userid = u.userid
				WHERE
					u.managerid IS NOT NULL
					AND CONCAT(u.firstname, ' ', u.lastname) LIKE :search
					AND user.status = 1
					AND u.userid NOT IN(
						SELECT approverid
						FROM reportapprover
						WHERE userid=:userid
					)",
				'par' => array('userid'=>$userid, 'search'=>'%'.$search.'%'),
				'ret' => 'all'
		));
		return cutPage($users, 'users', $page);
	}

	function AddHoursApprovers($userids, $userid)
	{
		$existingApprovers = array_column($this -> GetHoursApprovers($userid), "userid");
		global $db;
		$params = array('userid' => $userid);
		$sql = "INSERT INTO reportapprover (`approverid`,`userid`) VALUES ";
		$newApproversCount = 0;
		foreach ($userids AS $index=>$sid)
		{
			//don't insert a student who is already enrolled
			if(!in_array($sid, $existingApprovers, true))
			{
				$newApproversCount++;
				$sql.="(:userid".$index.", :userid)";
				//add a comma to seperate values, unless working on the last value
				$sql.=($index<count($userids)-1)?",":"";
				//add coresponding parameter to the array
				$params['userid'.$index]=$sid;
			}
		}
		if($newApproversCount==0)
		{
			return (object)array("error"=>"the users are already enrolled");
		}
		//enroll users
		$users = $db->smartQuery(array(
				'sql' => $sql,
				'par' => $params,
				'ret' => 'result'
		));
		return $users;
	}

	function DeleteReportApprovers($userid, $userids){
    //     global $db;
    //     $subjectsInsertParams=array('userid' => $userid);
    //     $subjectsInsertQuery="DELETE FROM `reportapprover` WHERE ";

	// 	foreach($userids as $key=>$approverid)
	// 	{
	// 		$subjectsInsertQuery.=":approverid".$key."_id),";
	// 		$subjectsInsertParams["approverid".$key."_id"]=$approverid;
	// 	}
	// 	$subjectsInsertQuery=substr($subjectsInsertQuery, 0, -1);
	// 	$subjectsInsertQuery.=" AND userid=:userid;";
        
    //     $result = $db->smartQuery(array(
    //         'sql' => $subjectsInsertQuery,
    //         'par' => $subjectsInsertParams,
    //         'ret' => 'result'
    //     ));
	//     return $result;
	if(count($userids)==0)
			return;
		global $db;
		$deleteQuery = "DELETE FROM `reportapprover` WHERE `approverid` IN (";
		$deleteParams = array('userid' => $userid);
		foreach ($userids AS $index=>$approverid)
		{
			$deleteQuery.=":approverid".$index;
			//add a comma to seperate values, unless working on the last value
			$deleteQuery.=($index<count($userids)-1)?",":"";
			//add coresponding parameter to the array
			$deleteParams['approverid'.$index]=$approverid;
		}
		$deleteQuery.=") AND userid=:userid";
		$result=$db->smartQuery(array(
			'sql' => $deleteQuery,
			'par' => $deleteParams,
			'ret' => 'result'
		));
		return true;
	 }

    function GetUsersWhoHoursApprovedByMe($userid)
    {
        global $db;
        $users = $db->smartQuery(array(
            'sql' => "
			SELECT p.userid, CONCAT(p.firstname, ' ', p.lastname) AS name
			FROM reportapprover AS ra
			JOIN user_profile AS p ON p.userid = ra.userid and p.status=:status
			WHERE ra.approverid = :userid",
            'par' => array('userid'=>$userid,'status'=>1),
            'ret' => 'all'
        ));
        return $users;

    }
}