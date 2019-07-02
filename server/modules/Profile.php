<?php
class Profile{
    function AddUser($data)
    {
        global $db;
        global $User;
        $email = $data->email;
        $firstname = $data->firstname;
        $lastname = $data->lastname;
        $firstnameinarabic = $data->firstnameinarabic;
        $lastnameinarabic = $data->lastnameinarabic;
        $tznumber = $data->tznumber;
        $phone = $data->phone;
        $phone2 = isset($data->phone2)?$data->phone2:null;
        $phone2owner = isset($data->phone2owner)?$data->phone2owner:null;
        $address = $data->address;
        $birthday = $data->birthday;
        $genderid = $data->genderid;
        $religionid = $data->religionid;
        $cityid = $data->cityid;
        $managerid = isset($data->managerid)?$data->managerid:null;
        $password = $data->password;
        $image = $data->image;
        $status = $data->status;

        $languages = $data->languages;
        $professions = $data->professions;
        $certificates = $data->certificates;
        $reportSubjects = $data->reportSubjects;
        $projects = $data->projects;
        $registerdate =  date('Y-m-d H:i:s', time());

        if($birthday!='')
        {
            $pieces = explode("/", $birthday);
            if(count($pieces)>2)
                $birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
        }

        $passwordErrorCheck = checkPassword($password);

        if(isset($passwordErrorCheck['error']))
        {
            return $passwordErrorCheck;
        }

        if($User->getUserIdByEmail($email)!=null)
        {
            return (object)array("error"=>"email already exists");
        }

        if($User->GetUserIdByTz($tznumber))
        {
            return (object)array("error"=>"tz exist in the system");
        }

        $password = hash('sha256', $password);

        $result = $db->smartQuery(array(
            'sql' => "INSERT INTO `user` (`email`,`password`,`needacceptregister`,`logintimestamp`, `passtry`, status) VALUES (:email, :password, '', 0, 0, :status);",
            'par' => array('email' => $email,'password' => $password, 'status'=>$status),
            'ret' => 'result'
        ));

        $userid = $db->getLastInsertId();

        $result = $db->smartQuery(array(
            'sql' => "INSERT INTO `user_profile` (userid, email, `firstname`,`firstnameinarabic`, `lastname`,`lastnameinarabic`,`tznumber`,`phone`, phone2, phone2owner, `address`,`birthday`, `genderid`, `religionid`, `managerid`,`registerdate`,`image`,`cityid`,`status`) VALUES (:userid, :email, :firstname,:firstnameinarabic, :lastname,:lastnameinarabic, :tznumber, :phone, :phone2, :phone2owner, :address,:birthday, :genderid, :religionid, :managerid, :registerdate, :image, :cityid,:status);",
            'par' => array('userid' => $userid, 'email' => $email, 'firstname' => $firstname, 'firstnameinarabic' => $firstnameinarabic,'lastname' => $lastname,'lastnameinarabic' => $lastnameinarabic,'tznumber' => $tznumber,'phone' => $phone,'phone2' => $phone2,'phone2owner' => $phone2owner,'address'=>$address,'birthday'=>$birthday, 'genderid' => $genderid, 'religionid' => $religionid, 'managerid' => $managerid, 'registerdate' => $registerdate, 'image' => $image, 'cityid' => $cityid, 'status' => $status),
            'ret' => 'result'
        ));

        if(count($projects)>0)
            $this->InsertUserProjects($userid,$projects);

        if(count($languages)>0)
            $this->InsertUserLanguages($userid,$languages);

        if(count($professions)>0)
            $this->InsertUserProfessions($userid,$professions);

        if(count($certificates)>0)
            $this->InsertUserCertificates($userid,$certificates);


        foreach($reportSubjects as $reportSubject)
        {
            //TODO: this calls the DB repeatedly - could be optimized into 2 queries - one for edits, one for inserts
            $this->SaveStaffReport($reportSubject,$userid);
        }

        return (object)array("userId"=>$userid);
    }

    function InsertUserProjects($userid,$projects)
    {
        global $db;
        foreach($projects as $project)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user_project` (`userid`,`projectid`) VALUES (:userid,:projectid);",
                'par' => array('projectid' => $project,'userid' => $userid),
                'ret' => 'result'
            ));
        }
        return $result;
    }

    function InsertUserLanguages($userid,$languages){

        global $db;

        foreach($languages as $language)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user_language` (`languageid`, `userid`) VALUES (:languageid, :userid);",
                'par' => array('languageid' => $language,'userid' => $userid),
                'ret' => 'result'
            ));
        }
        return $result;
    }

    function InsertUserProfessions($userid,$professions){

        global $db;

        foreach($professions as $profession)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user_profession` (`professionid`, `userid`) VALUES (:professionid, :userid);",
                'par' => array('professionid' => $profession,'userid' => $userid),
                'ret' => 'result'
            ));
        }
        return $result;
    }

    function InsertUserCertificates($userid,$certificates){

        global $db;

        foreach($certificates as $certificateid)
        {
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user_certificate` (`certificateid`, `userid`) VALUES (:certificateid, :userid);",
                'par' => array('certificateid' => $certificateid,'userid' => $userid),
                'ret' => 'result'
            ));
        }
        return $result;
    }

    function SaveStaffReport($reportSubject, $userid)
    {
        global $db;
        $id = $reportSubject->userreportsubjectid;
        $status = $reportSubject->reportSubjectStatus;
        $proid = $reportSubject->projectid;
        $subid = $reportSubject->reportsubjectid;
        $clid = $reportSubject->clientcodeid;

        //if the combination is active, open up rows that use it for editing and approval (retroactively)
        if($status==1)
            $this->UpdateReportHoursStaff($userid,$subid,$proid);

        if($id!='')
        {
            //if the row came with an id, update appropriately (under the restriction that the staff associated with the data can't change
            $result = $db->smartQuery(array(
                'sql' => "UPDATE
					`user_reportsubject`
				SET
					status=:status,
					clientcodeid=:clientcodeid,
					reportsubjectid=:reportsubjectid,
					projectid=:projectid
				WHERE
					userreportsubjectid=:id",
                'par' => array('status' => $status, 'clientcodeid' => $clid, 'reportsubjectid' => $subid, 'projectid' => $proid, 'id' => $id),
                'ret' => 'result'
            ));
        }else
        {
            //if no id is present, i.e. the combination is new, insert it into the table
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user_reportsubject`
				(`userid`,`clientcodeid`,`reportsubjectid`,`projectid`,`status`)
				VALUES
				(:userid, :clientcodeid, :reportsubjectid, :projectid, :status);",
                'par' => array('userid' => $userid, 'clientcodeid' => $clid, 'reportsubjectid' => $subid, 'projectid' => $proid, 'status' => $status),
                'ret' => 'result'
            ));
        }

        return $result;
    }

    function UpdateReportHoursStaff($userid,$subid,$proid)
    {
        global $db;
        $result = $db->smartQuery(array(
            'sql' => "UPDATE `report` SET missingreportsubject=0 WHERE userid=:userid AND projectid=:projectid AND missingreportsubject=0 AND actionid=:actionid",
            'par' => array( 'actionid' => $subid, 'userid' => $userid, 'projectid' => $proid),
            'ret' => 'result'
        ));
    }

    function UpdateUser($data)
    {
        global $db;
        global $User;
        $userid = $data->userid;
        $updatePassword = $data->updatePassword;
        $password = isset($data->password)?$data->password:'';
        $email = $data->email;
        $firstname = $data->firstname;
        $lastname = $data->lastname;
        $firstnameinarabic = $data->firstnameinarabic;
        $lastnameinarabic = $data->lastnameinarabic;
        $tznumber = $data->tznumber;
        $phone = $data->phone;
        $phone2 = isset($data->phone2)?$data->phone2:null;
        $phone2owner = isset($data->phone2owner)?$data->phone2owner:null;
        $address = $data->address;
        $birthday = $data->birthday;
        $genderid = $data->genderid;
        $religionid = $data->religionid;
        $cityid = $data->cityid;
        $managerid = isset($data->managerid)?$data->managerid:null;
        $image = $data->image;
        $notes = $data->notes;
        $status = $data->status;
        $languages = $data->languages;
        $professions = $data->professions;
        $certificates = $data->certificates;
        $reportSubjects = $data->reportSubjects;
        $projects =  $data->projects;
        $registerdate =  date('Y-m-d H:i:s', time());

        if($birthday!='')
        {
            $pieces = explode("/", $birthday);

            if(count($pieces)>2)
                $birthday = $pieces[2].'-'.$pieces[1].'-'.$pieces[0];
        }

        $useridByTz = $User->GetUserIdByTz($tznumber);

        if($useridByTz&&$useridByTz!=$userid)
        {
            return (object)array("error"=>"someone else in the system already has this tz");
        }

        $useridByEmail = $User->getUserIdByEmail($email);

        if($useridByEmail&&$useridByEmail!=$userid)
        {
            return (object)array("error"=>"someone else in the system already has this email");
        }

        if($updatePassword)
        {
            $passCheck = checkPassword($password);

            if(isset($passCheck['error']))
            {
                return $passCheck;
            }

            $password = hash('sha256', $password);
        }

        $userInsertQuery="";

        $userInsertParams=array(
            'userid' => $userid,
            'email' => $email,
            'status' => $status,
            'firstname' => $firstname,
            'firstnameinarabic' => $firstnameinarabic,
            'lastname' => $lastname,
            'lastnameinarabic' => $lastnameinarabic,
            'tznumber' => $tznumber,
            'phone' => $phone,
            'phone2' => $phone2,
            'phone2owner' => $phone2owner,
            'address'=>$address,
            'birthday'=>$birthday,
            'genderid' => $genderid,
            'religionid' => $religionid,
            'cityid' => $cityid,
            'managerid' => $managerid,
            'image' => $image,
            'notes' => $notes);

        //update profile
        $userInsertQuery.="UPDATE `user_profile` SET email=:email, firstname=:firstname, firstnameinarabic=:firstnameinarabic, lastname=:lastname, lastnameinarabic=:lastnameinarabic, tznumber=:tznumber, phone=:phone, phone2=:phone2, phone2owner=:phone2owner, address=:address, birthday=:birthday, genderid=:genderid, religionid=:religionid, cityid=:cityid, managerid=:managerid, status=:status, image=:image, notes=:notes WHERE userid=:userid;";
        //update email (and password if needed)
        $userInsertQuery.="UPDATE `user` SET email=:email, status=:status";
        if($updatePassword)
        {
            $userInsertQuery.=", password=:password, passChangeRequired=:passChangeRequired, lastPassChange=:lastPassChange";

            $userInsertParams["password"]=$password;

            $userInsertParams["passChangeRequired"]=0;

            $userInsertParams["lastPassChange"]=time();
        }

        $userInsertQuery.=" WHERE userid=:userid;";

        //truncate language, professions, certificates
        $userInsertQuery.="
                 DELETE FROM `user_language` WHERE userid=:userid;
                 
                 DELETE FROM `user_profession` WHERE userid=:userid;
                 
                 DELETE FROM `user_certificate` WHERE userid=:userid;";

        //insert languages
        if(count($languages)>0)
        {
            $userInsertQuery.="INSERT INTO `user_language` (`languageid`, `userid`) VALUES ";

            foreach($languages as $key=>$language)
            {
                $userInsertQuery.="(:language_".$key."_id, :userid),";

                $userInsertParams["language_".$key."_id"]=$language;
            }
            $userInsertQuery=substr($userInsertQuery, 0, -1).";";
        }
        //insert professions
        if(count($professions)>0)
        {
            $userInsertQuery.="INSERT INTO `user_profession` (`professionid`, `userid`) VALUES ";

            foreach($professions as $key=>$profession)
            {
                $userInsertQuery.="(:profession".$key."_id, :userid),";

                $userInsertParams["profession".$key."_id"]=$profession;
            }
            $userInsertQuery=substr($userInsertQuery, 0, -1).";";
        }
        //insert certificates
        if(count($certificates)>0)
        {
            $userInsertQuery.="INSERT INTO `user_certificate` (`certificateid`, `userid`) VALUES ";

            foreach($certificates as $key=>$certificate)
            {
                $userInsertQuery.="(:certificate".$key."_id, :userid),";

                $userInsertParams["certificate".$key."_id"]=$certificate;
            }
            $userInsertQuery=substr($userInsertQuery, 0, -1).";";
        }
        $result = $db->smartQuery(array(

            'sql' => $userInsertQuery,

            'par' => $userInsertParams,

            'ret' => 'result'
        ));

        foreach($reportSubjects as $reportSubject)
        {
            $this->SaveStaffReport($reportSubject,$userid);
        }

        $this->UpdateEnrollmentStatus($userid,$status);

       $this->UpdateUserProjects($userid,$projects);

        return (object)array("userId"=>$userid);
    }

    function UpdateEnrollmentStatus($userid,$status)
    {
        global $db;
        $result=0;
        if ($status == 0) {
            //courses you teach
            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` as e , `course` as co SET e.`enrollmenttagid`=:enrollmenttagid, e.`status`=:status  WHERE e.`enrollmentroleid`=:enrollmentroleid and e.`userid`=:userid and co.`status`=:courseStatus and co.courseid=e.courseid",
                'par' => array('enrollmenttagid' => 4, 'enrollmentroleid' => 2, 'status' => $status,'userid'=>$userid,'courseStatus'=> 1),
                'ret' => 'result'
            ));

            //inactive courses you learn
            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` as e, `course` as co SET e.`enrollmenttagid`=:enrollmenttagid,e.`status`=:status  WHERE co.`status`=:courseStatus and co.courseid=e.courseid and co.courseid=e.courseid and e.`enrollmentroleid`=:enrollmentroleid and e.`userid`=:userid",
                'par' => array('enrollmentroleid' => 1, 'status' => $status, 'enrollmenttagid' => 2 ,'userid'=>$userid,'courseStatus'=> 0),
                'ret' => 'result'
            ));
            //active courses you learn
            $result = $db->smartQuery(array(
                'sql' => "UPDATE `enrollment` as e, `course` as co SET e.`enrollmenttagid`=:enrollmenttagid,e.`status`=:status  WHERE co.`status`=:courseStatus and co.courseid=e.courseid and e.`enrollmentroleid`=:enrollmentroleid and e.`userid`=:userid",
                'par' => array('enrollmentroleid' => 1, 'status' => $status, 'enrollmenttagid' => 3 ,'userid'=>$userid,'courseStatus'=>1),
                'ret' => 'result'
            ));
        }
        return $result;
    }

    function GetUserProfileById($id)
    {
        global $db;
        $user = $db->smartQuery(array(
            'sql' => "
                 SELECT p.*, p.email, u.status, u.needacceptregister, manager.userid AS managerid, CONCAT(manager.firstname, ' ', manager.lastname) AS superstaffname , sc.certificateid AS certificateid, sl.languageid, sp.professionid,
                  srs.userreportsubjectid, srs.reportsubjectid, srs.clientcodeid, srs.projectid, srs.status AS reportSubjectStatus
                 FROM user AS u
                 JOIN user_profile AS p ON p.userid=u.userid
                 LEFT JOIN user_certificate AS sc ON sc.userid = u.userid
                 LEFT JOIN user_language AS sl ON sl.userid = u.userid
                 LEFT JOIN user_profession AS sp ON sp.userid = u.userid
                 LEFT JOIN user_reportsubject AS srs ON srs.userid = u.userid
                 LEFT JOIN user_profile AS manager ON manager.userid = p.managerid
                 LEFT JOIN user_project AS project ON project.userid = p.userid
                 WHERE
                     u.userid=:userid",
            'par' => array('userid'=>$id),
            'ret' => 'all'
        ));
        //nest certificates, languages, professions,report subjects
        $user = nestArray(
            $user, 'userid',
            array(
                array('nestBy'=>'certificateid', 'nestIn'=>'certificates', 'fieldsToNest'=>array('certificateid')),
                array('nestBy'=>'projectid', 'nestIn'=>'projects', 'fieldsToNest'=>array('projectid')),
                array('nestBy'=>'languageid', 'nestIn'=>'languages', 'fieldsToNest'=>array('languageid','name')),
                array('nestBy'=>'professionid', 'nestIn'=>'professions', 'fieldsToNest'=>array('professionid')),
                array('nestBy'=>'userreportsubjectid', 'nestIn'=>'reportSubjects', 'fieldsToNest'=>array('userreportsubjectid', 'reportsubjectid', 'clientcodeid', 'subjectreportid', 'projectid', 'reportSubjectStatus'))
            ));
        if(isset($user[0]))
        {
            $user[0]['certificates'] = array_column($user[0]['certificates'], 'certificateid');
            $user[0]['languages'] = array_column($user[0]['languages'], 'languageid');
            $user[0]['professions'] = array_column($user[0]['professions'], 'professionid');
            $user[0]["birthday"]=date("d/m/Y", strtotime($user[0]["birthday"]));
            $user[0]["status"]=$user[0]["status"]==1?true:false;
            $user[0]["projects"]=array_column($user[0]['projects'], 'projectid');
            return $user[0];
        }
        else
        {
            return null;
        }
    }

    function GetManagedUsersByUserId($userid)
    {
        global $db;
        $params = array();
        $sql = "
             SELECT
                 p.userid AS userid,
                 CONCAT(p.firstname, ' ', p.lastname) AS name
             FROM  `user_profile` AS p
             JOIN user AS u ON u.userid = p.userid
             WHERE
                 u.`status`=1
                 AND p.`managerid` LIKE :userid";
        //fetch user
        return $db->smartQuery(array(
            'sql' => $sql,
            'par' => array('userid'=>$userid),
            'ret' => 'all'
        ));
    }
    /**
     * users under me for excel
     * **/
    function SearchStaffUnderMeForExcel($search, $sorting, $desc, $userstatus, $page)
    {
        return SearchStaffUnderMe($search, $sorting, $desc, $userstatus, $page);
    }

    /**
     * Gets a list of search perimeters, and returns a list of staff according to said perimeters, filtered by
     * whether or not the user who makes the request is authorized to view them,
     * along side the number of pages filled by the full results set
     * @param String $search - the search term to use
     * @param String $sorting - based on which field to sort the results
     * @param boolean $desc - whether to order the results in a descending order
     * @param int $userstatus - which user status to filter by
     * @param int $page - which page of the results to return
     * @return results[]:
     * {
     * "staff":
     * [{
     * "userid,
     * "firstname","lastname",
     * "firstnameinarabic","lastnameinarabic",
     * "tznumber", "phone",
     * "birthday",
     * "email",
     * "cityname","gendername","religionname"
     * }],
     * pages:208
     * }
     */

    function SearchStaffUnderMe($search, $sorting, $desc, $userstatus, $page)
    {
        global $db;
        $ITEMS_PER_PAGE=15;
        $sortByField='userid';
        //permit only certain ORDER BY values to avoid injection
        in_array($sorting, array(
            'firstname', 'lastname', 'firstnameinarabic', 'lastnameinarabic',
            'tznumber', 'phone', 'birthday', 's.email', 'cityname'
        ), true)?$sortByField=$sorting:'';
        $sortingDirection = $desc?"DESC":"ASC";
        //get the ids of student the user is allowed to access
        $mySubStaff = getManagedUsers();
        if(count($mySubStaff)==0)
        {
            $ans = array('users'=>array(), 'pages'=>0);
            return $ans;
        }
        //construct a query template which includes all of the student ids
        //and populate the parameter array with the ids themselves
        $params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
        $sql = "
			SELECT
				s.userid, s.firstname, s.lastname, s.firstnameinarabic, s.lastnameinarabic, s.tznumber, s.phone, s.birthday, s.email,
				city.name AS cityname, gender.name AS gendername, religion.name AS religionname
			FROM `user_profile` AS s
			JOIN user AS u ON u.userid=s.userid
			LEFT JOIN gender AS gender ON gender.genderid = s.genderid
			LEFT JOIN religion AS religion ON religion.religionid = s.religionid
			LEFT JOIN city AS city ON city.cityid = s.cityid
			WHERE
				u.status=:status
				AND u.`userid` IN (";
        foreach ($mySubStaff AS $index=>$sid)
        {
            $sql.=":userid".$index;
            //add a comma to seperate values, unless working on the last value
            $sql.=($index<count($mySubStaff)-1)?",":"";
            //add coresponding parameter to the array
            $params['userid'.$index]=$sid;
        }
        $sql.=")
			AND CONCAT(`firstname`,' ',`lastname`,' ',IFNULL(`firstnameinarabic`,''),' ',IFNULL(`lastnameinarabic`,''),' ',`tznumber`,' ',IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ',s.`email`, ' ', IFNULL(city.name, '')) LIKE :search
			ORDER BY ".$sortByField." ".$sortingDirection;
        //fetch users
        $users = $db->smartQuery(array(
            'sql' => $sql,
            'par' => $params,
            'ret' => 'all'
        ));
        if($page==-1)
            return $users;
        else
            return cutPage($users, 'users', $page);
    }

    /**
     * Gets a list of search perimeters, and returns a list of students according to said perimeters, filtered by
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
     * [{
     * "userid,
     * "firstname","lastname",
     * "firstnameinarabic","lastnameinarabic",
     * "tznumber", "phone",
     * "birthday",
     * "email",
     * "cityname","gendername","religionname"
     * }],
     * pages:208
     * }
     */

    function SearchStudentsUnderMe($search, $sorting, $desc, $userstatus, $page)
    {
        global $db;
        $ITEMS_PER_PAGE=15;
        $sortByField='userid';
        //permit only certain ORDER BY values to avoid injection
        in_array($sorting, array(
            'firstname', 'lastname', 'firstnameinarabic', 'lastnameinarabic',
            'tznumber', 'phone', 'birthday', 's.email', 'cityname'
        ), true)?$sortByField=$sorting:'';
        $sortingDirection = $desc?"DESC":"ASC";
        //get the ids of student the user is allowed to access
        $mySubStudents = GetMyStudents();
        if(count($mySubStudents)==0)
        {
            $ans = array('users'=>array(), 'pages'=>0);
            return $ans;
        }
        //construct a query template which includes all of the student ids
        //and populate the parameter array with the ids themselves
        $params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
        $sql = "
			SELECT
				s.userid, s.firstname, s.lastname, s.firstnameinarabic, s.lastnameinarabic, s.tznumber, s.phone, s.birthday, s.email,
				city.name AS cityname, gender.name AS gendername, religion.name AS religionname
			FROM `user_profile` AS s
			JOIN user AS u ON u.userid=s.userid
			LEFT JOIN gender AS gender ON gender.genderid = s.genderid
			LEFT JOIN religion AS religion ON religion.religionid = s.religionid
			LEFT JOIN city AS city ON city.cityid = s.cityid
			WHERE
				u.status=:status
				AND u.`userid` IN (";
        foreach ($mySubStudents AS $index=>$sid)
        {
            $sql.=":userid".$index;
            //add a comma to seperate values, unless working on the last value
            $sql.=($index<count($mySubStudents)-1)?",":"";
            //add coresponding parameter to the array
            $params['userid'.$index]=$sid;
        }
        $sql.=")
			AND CONCAT(`firstname`,' ',`lastname`,' ',IFNULL(`firstnameinarabic`,''),' ',IFNULL(`lastnameinarabic`,''),' ',`tznumber`,' ',IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ', s.`email`, ' ', IFNULL(city.name, '')) LIKE :search
			ORDER BY ".$sortByField." ".$sortingDirection;
        //fetch users
        $users = $db->smartQuery(array(
            'sql' => $sql,
            'par' => $params,
            'ret' => 'all'
        ));
        if($page==-1)
            return $users;
        else
            return cutPage($users, 'users', $page);;
    }

    /**
     * Gets a list of search perimeters, and returns a list of "new users" according to said perimeters, filtered by
     * whether or not the user who makes the request is authorized to view them,
     * along side the number of pages filled by the full results set - and every admin and staff has access to them
     * new users are defined as users who have no manager, and aren't enrolled in any course
     * @param String $search - the search term to use
     * @param String $sorting - based on which field to sort the results
     * @param boolean $desc - whether to order the results in a descending order
     * @param int $userstatus - which user status to filter by
     * @param int $page - which page of the results to return
     * @return results[]:
     * {
     * "users":
     * [{
     * "userid,
     * "firstname","lastname",
     * "firstnameinarabic","lastnameinarabic",
     * "tznumber", "phone",
     * "birthday",
     * "email",
     * "cityname","gendername","religionname"
     * }],
     * pages:208
     * }
     */

    function SearchNewUsers($search, $sorting, $desc, $userstatus, $page)
    {
        global $db;
        $ITEMS_PER_PAGE=15;
        $sortByField='userid';
        //permit only certain ORDER BY values to avoid injection
        in_array($sorting, array(
            'firstname', 'lastname', 'firstnameinarabic', 'lastnameinarabic',
            'tznumber', 'phone', 'birthday', 's.email', 'cityname'
        ), true)?$sortByField=$sorting:'';
        $sortingDirection = $desc?"DESC":"ASC";
        //get the ids of student the user is allowed to access
        $mySubStudents = GetMyStudents();
        if(count($mySubStudents)==0)
        {
            $ans = array('users'=>array(), 'pages'=>0);
            return $ans;
        }
        //construct a query template which includes all of the student ids
        //and populate the parameter array with the ids themselves
        $params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
        $sql = "
			SELECT
				s.userid, s.firstname, s.lastname, s.firstnameinarabic, s.lastnameinarabic, s.tznumber, s.phone, s.birthday, s.email,
				city.name AS cityname, gender.name AS gendername, religion.name AS religionname
			FROM 
			(
				SELECT up.*
				FROM `user_profile` AS up
				LEFT JOIN enrollment AS e ON up.userid = e.userid
				WHERE up.managerid IS NULL
				GROUP BY up.userid
				HAVING COUNT(e.courseid) = 0
			) AS s
			JOIN user AS u ON u.userid=s.userid
			LEFT JOIN gender AS gender ON gender.genderid = s.genderid
			LEFT JOIN religion AS religion ON religion.religionid = s.religionid
			LEFT JOIN city AS city ON city.cityid = s.cityid
			WHERE
				u.status=:status
			AND CONCAT(`firstname`,' ',`lastname`,' ',IFNULL(`firstnameinarabic`,''),' ',IFNULL(`lastnameinarabic`,''),' ',`tznumber`,' ',IFNULL(`phone`,''),' ',IFNULL(`birthday`, ''),' ',s.`email`, ' ', IFNULL(city.name, '')) LIKE :search
			ORDER BY ".$sortByField." ".$sortingDirection;
        //fetch users
        $users = $db->smartQuery(array(
            'sql' => $sql,
            'par' => $params,
            'ret' => 'all'
        ));
        if($page==-1)
            return $users;
        else
            return cutPage($users, 'users', $page);;
    }

    /**
     * Gets a list of search perimeters, and returns a list of staff according to said perimeters, filtered by
     * whether or not the user who makes the request is authorized to view them,
     * along side the number of pages filled by the full results set
     * @param String $search - the search term to use
     * @param String $sorting - based on which field to sort the results
     * @param boolean $desc - whether to order the results in a descending order
     * @param int $userstatus - which user status to filter by
     * @param int $page - which page of the results to return
     * @return results[]:
     * {
     * "staff":
     * [{"userid":1,"staffname":"atlas"}],
     * pages:208
     * }
     */

    function SearchUserToAssignAsManager($search, $sorting, $desc, $userstatus, $page, $excludeids=null)
    {
        global $db;
        $ITEMS_PER_PAGE=15;
        $sortByField='userid';
        $sortingDirection = $desc?"DESC":"ASC";
        //fetch staff
        $params = array('status'=>$userstatus, 'search'=>'%'.$search.'%');
        $sql =
            "SELECT u.userid, CONCAT(u.firstname, ' ', u.lastname) AS fullname
		FROM `user_profile` AS u
		JOIN user AS user ON user.userid=u.userid
		WHERE
			u.managerid IS NOT NULL
			AND CONCAT(u.firstname, ' ', u.lastname) LIKE :search
			AND user.status = :status";
        if($excludeids!=null&&count($excludeids)>0)
        {
            $sql.=" AND u.userid NOT IN (";
            foreach ($excludeids AS $index=>$esid)
            {
                $sql.=":excludeUser".$index;
                //add a comma to seperate values, unless working on the last value
                $sql.=($index<count($excludeids)-1)?",":"";
                //add coresponding parameter to the array
                $params['excludeUser'.$index]=$esid;
            }
            $sql.=")";
        }
        $sql.=" ORDER BY u.firstname";
        //fetch students
        $users = $db->smartQuery(array(
            'sql' => $sql,
            'par' => $params,
            'ret' => 'all'
        ));
        return cutPage($users, 'users', $page);
    }

    function UpdateUserAppVersion()
    {
        global $myid;
        global $version;
        global $db;
        $result=$db->smartQuery(array(
            'sql' => "UPDATE `user_profile` SET `latest_client`=:version WHERE `userid`=:userid",
            'par' => array('version' => $version, 'userid' => $myid),
            'ret' => 'result'
        ));
    }

    function UpdateUserProfilePic($userid, $image)
    {
        global $db;
        $result=$db->smartQuery(array(
            'sql' => "UPDATE `user_profile` SET `image`=:img WHERE `userid`=:userid",
            'par' => array('img' => $image, 'userid' => $userid),
            'ret' => 'result'
        ));
        return true;
    }

    function BatchUploadUsers($file)
    {
        //echo ("yuli");
        global $db;
        global $UserExcelParser;
        global $Enrollment;
        $newUsers = $UserExcelParser->GetUsersFromFile($file);
        if(isset($newUsers['error']))
        {
            return $newUsers;
        }
        $registerdate =  date('Y-m-d H:i:s', time());
        foreach($newUsers as $user){
            //hash password
            $password = hash('sha256', $user['password']);
            $result = $db->smartQuery(array(
                'sql' => "INSERT INTO `user` (`email`,`password`,`needacceptregister`,`logintimestamp`, `passtry`, `status`) VALUES (:email, :password, '', 0, 0, :status);",
                'par' => array('email' => $user['email'],'password' => $password, 'status'=>1),
                'ret' => 'result'
            ));
            $userid = $db->getLastInsertId();
            $result = $db->smartQuery(array(
                'sql' => "
				INSERT INTO `user_profile`
				(userid, email, `firstname`, `lastname`, `tznumber`,`phone`, `birthday`, `genderid`, `religionid`, `cityid`, `registerdate`, `status`)
				VALUES
				(:userid, :email, :firstname, :lastname, :tznumber, :phone, :birthday, :genderid, :religionid, :cityid, :registerdate, :status);",
                'par' => array(
                    'userid' => $userid,
                    'email' => $user['email'],
                    'firstname' => $user['firstname'],
                    'lastname' => $user['lastname'],
                    'tznumber' => $user['tz'],
                    'phone' => $user['phone'],
                    'birthday'=>$user['birthday'],
                    'genderid' => $user['genderid'],
                    'religionid' => $user['religionid'],
                    'cityid' => $user['cityid'],
                    'registerdate' => $registerdate,
                    'status'=>1),
                'ret' => 'result'
            ));
            if(isset($user["studentInCourseId"])&&$user["studentInCourseId"])
            {
                $Enrollment->EnrollUsers(array($userid), $user["studentInCourseId"], 1);
            }
        }
        return $result;
    }

    function UpdateUserGender ($userid, $genderid)
    {
        global $db;
        $result=$db->smartQuery(array(
            'sql' => "UPDATE `user_profile` SET `genderid`=:gender WHERE `userid`=:userid",
            'par' => array('gender' => $genderid, 'userid' => $userid),
            'ret' => 'result'
        ));
        return $result;
    }

    function UpdateUserEnrollmentRole ($userid, $enrollmentroleid)
    {
        global $db;
        $result=$db->smartQuery(array(
            'sql' => "UPDATE `enrollment` SET `enrollmentroleid`=:enrollmentroleid WHERE `userid`=:userid",
            'par' => array('enrollmentroleid' => $enrollmentroleid, 'userid' => $userid),
            'ret' => 'result'
        ));
        return $result;
    }

    function UpdateUserReligion ($userid, $religionid)
    {
        global $db;
        $result=$db->smartQuery(array(
            'sql' => "UPDATE `user_profile` SET `religionid`=:religion WHERE `userid`=:userid",
            'par' => array('religion' => $religionid, 'userid' => $userid),
            'ret' => 'result'
        ));
        return $result;
    }

    function GetMyProfile()
    {
        global $db;
        global $myid;
        $user = $db->smartQuery(array(
            'sql' => "
				SELECT p.firstname, p.lastname, p.image, u.email, u.userid
				FROM user AS u
				JOIN user_profile AS p ON p.userid=u.userid
				WHERE
					u.userid=:userid",
            'par' => array('userid'=>$myid),
            'ret' => 'fetch-assoc'
        ));
        return $user;
    }

    function GetUserExtendedProfile()
    {
        global $db;
        global $myid;
        $user = $db->smartQuery(array(
            'sql' => "
				SELECT p.*, p.email, u.status, u.needacceptregister, manager.userid AS managerid, CONCAT(manager.firstname, ' ', manager.lastname) AS superstaffname , sc.certificateid AS certificateid, sl.languageid, sp.professionid,
				 srs.userreportsubjectid, srs.reportsubjectid, srs.clientcodeid, srs.projectid, srs.status AS reportSubjectStatus
				FROM user AS u
				JOIN user_profile AS p ON p.userid=u.userid
				LEFT JOIN user_certificate AS sc ON sc.userid = u.userid
				LEFT JOIN user_language AS sl ON sl.userid = u.userid
				LEFT JOIN user_profession AS sp ON sp.userid = u.userid
				LEFT JOIN user_reportsubject AS srs ON srs.userid = u.userid
				LEFT JOIN user_profile AS manager ON manager.userid = p.managerid
				WHERE
					u.userid=:userid",
            'par' => array('userid'=>$myid),
            'ret' => 'all'
        ));
        //nest certificates, languages, professions,report subjects
        $user = nestArray(
            $user, 'userid',
            array(
                array('nestBy'=>'certificateid', 'nestIn'=>'certificates', 'fieldsToNest'=>array('certificateid')),
                array('nestBy'=>'languageid', 'nestIn'=>'languages', 'fieldsToNest'=>array('languageid')),
                array('nestBy'=>'professionid', 'nestIn'=>'professions', 'fieldsToNest'=>array('professionid')),
                array('nestBy'=>'userreportsubjectid', 'nestIn'=>'reportSubjects', 'fieldsToNest'=>array('userreportsubjectid', 'reportsubjectid', 'clientcodeid', 'subjectreportid', 'projectid', 'reportSubjectStatus'))
            ));
        if(isset($user[0]))
        {
            $user[0]['certificates'] = array_column($user[0]['certificates'], 'certificateid');
            $user[0]['languages'] = array_column($user[0]['languages'], 'languageid');
            $user[0]['professions'] = array_column($user[0]['professions'], 'professionid');
            $user[0]["birthday"]=date("d/m/Y", strtotime($user[0]["birthday"]));
            $user[0]["status"]=$user[0]["status"]==1?true:false;
            return $user[0];
        }
        else
        {
            return null;
        }
    }

    function GetUserProjects($userid){
        global $db;
        $projects = $db->smartQuery(array(
            'sql' => "
				SELECT p.name as projectname, p.projectid
				FROM user_project AS u,project AS p
				WHERE
					u.userid=:userid and p.projectid=u.projectid",
            'par' => array('userid'=>$userid),
            'ret' => 'all'
        ));
        return $projects;

    }

    function UpdateUserProjects($userid,$projects)
    {
        global $db;
        $statsInsertParams=array('userid' => $userid);

        // echo $lessonid;
        $statsInsertQuery="DELETE FROM `user_project` WHERE userid=:userid;";
        //insert stats
        if(count($projects)>0)
        {
            // echo count($stats);
            $statsInsertQuery.="INSERT INTO `user_project` (`userid`, `projectid`) VALUES ";
            foreach($projects as $key=>$project)
            {
                $statsInsertQuery.="(:userid, :project_".$key."_id),";
                $statsInsertParams["project_".$key."_id"]=$project;
            }
            $statsInsertQuery=substr($statsInsertQuery, 0, -1).";";
        }
        $result = $db->smartQuery(array(
            'sql' => $statsInsertQuery,
            'par' => $statsInsertParams,
            'ret' => 'result'
        ));
        return $result;
    }
}
