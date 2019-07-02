<?php
//require SERVERROOT."/functions.php";

class Project{
	
	function GetAllProjects()
	{
		global $db;
		$projects =  $db->smartQuery(array(
			'sql' => "
			SELECT
				project.projectid AS projectid, project.name AS projectname, project.IsShow AS activeProject,
				tag.projecttagid AS projecttagid, tag.name AS projecttagname, tag.IsShow AS activeProjectTag,
				paf.enrollment_field_id, paf.field, paf.fieldtype, paf.params AS fieldParams
			FROM
				project
				LEFT JOIN projecttag AS tag ON tag.projectid = project.projectid
				LEFT JOIN project_enrollment_fields AS paf ON paf.projectid = project.projectid
			",
			'par' => array(),
			'ret' => 'all'
		));
		return nestArray($projects, 'projectid', array(
			array('nestIn'=>'projecttags', 'nestBy'=>'projecttagid', 'fieldsToNest'=>array('projecttagid', 'projecttagname', 'activeProjectTag')),
			array('nestIn'=>'customFields', 'nestBy'=>'enrollment_field_id', 'fieldsToNest'=>array('enrollment_field_id', 'field', 'fieldtype', 'fieldParams'))
		));
	}
	
	function GetProjectById($id)
	{
		global $db;
		$project =  $db->smartQuery(array(
			'sql' => "SELECT * FROM project WHERE projectid = :projectid",
			'par' => array('projectid'=>$id),
			'ret' => 'fetch-assoc'
		));
		return $project;
	}
	
	function GetProjects()
	{
		global $db;
		$projects =  $db->smartQuery(array(
			'sql' => "
			SELECT
				project.projectid AS projectid, project.name AS projectname,
				tag.projecttagid AS projecttagid, tag.name AS projecttagname
			FROM
				project
				LEFT JOIN (SELECT * FROM projecttag WHERE isShow=1) AS tag ON tag.projectid = project.projectid
			WHERE project.isShow=1",
			'par' => array(),
			'ret' => 'all'
		));
		return nestArray($projects, 'projectid', array(
		array('nestIn'=>'projecttags', 'nestBy'=>'projecttagid', 'fieldsToNest'=>array('projecttagid', 'projecttagname'))
		));
	}
	
	function AddProject($data)
	{
		$result=true;
		global $db;
		foreach($data as $project)
		{
			if(isset($project->projectid))
			{
				if(isset($project->changed))
				{
					$result =  $db->smartQuery(array(
						'sql' => "UPDATE project SET name=:name,IsShow=:IsShow WHERE projectid=:projectid",
						'par' => array('name'=>$project->projectname,'IsShow'=>$project->activeProject, 'projectid'=>$project->projectid),
						'ret' => 'result'
					));
				}
				$projectid = $project->projectid;
			}else
			{
				$result =  $db->smartQuery(array(
					'sql' => "INSERT INTO project (name,IsShow) VALUES (:name,:IsShow)",
					'par' => array('name'=>$project->projectname,'IsShow'=>$project->activeProject),
					'ret' => 'result'
				));
				$projectid = $db->getLastInsertId();
			}
			if(isset($project->projecttags) && count($project->projecttags)>0)
			{
				foreach($project->projecttags as $tag)
				{
					if(isset($tag->projecttagid))
					{
						if(isset($tag->changed))
						{
							$projecttagid = $tag->projecttagid;
							$result =  $db->smartQuery(array(
								'sql' => "UPDATE projecttag SET name=:name,IsShow=:IsShow WHERE projecttagid=:projecttagid",
								'par' => array('name'=>$tag->projecttagname,'projecttagid'=>$projecttagid,'IsShow'=>$tag->activeProjectTag),
								'ret' => 'result'
							));
						}
					}else
					{
						$result =  $db->smartQuery(array(
							'sql' => "INSERT INTO projecttag (name,projectid,IsShow) VALUES (:name,:projectid,:IsShow)",
							'par' => array('name'=>$tag->projecttagname,'projectid'=>$projectid,'IsShow'=>$tag->activeProjectTag),
							'ret' => 'result'
						));
					}
				}
			}
		}
		return $result;
	}

    function SearchProjects( $search, $page){
//add join to the once the user already enrolled in - so they wont be in the list and picked again
        global $db;
        $projects = $db->smartQuery(array(
            'sql' =>
                "SELECT name ,projectid
				FROM `project` 
				WHERE
					IsShow=1 AND name LIKE :search
					",
            'par' => array( 'search'=>'%'.$search.'%'),
            'ret' => 'all'
        ));
        return cutPage($projects, 'projects', $page);

    }

//    function AddprojectsToUser($projectids, $userid)
//    {
//        $Profile=new profile();
//        $existingProjects = array_column($Profile -> GetUserProjects($userid));
//        global $db;
//        $params = array('userid' => $userid);
//        $sql = "INSERT INTO user_project (`userid`,`projectid`) VALUES ";
//        $newProjectsCount = 0;
//        foreach ($projectids AS $index=>$sid)
//        {
//            //don't insert a project who is already assign
//            if(!in_array($sid, $existingProjects, true))
//            {
//                $newProjectsCount++;
//                $sql.="(userid".$index.", :userid)";
//                //add a comma to seperate values, unless working on the last value
//                $sql.=($index<count($projectids)-1)?",":"";
//                //add coresponding parameter to the array
//                $params['projectid'.$index]=$sid;
//            }
//        }
//        if($existingProjects==0)
//        {
//            return (object)array("error"=>"the projects are already assigned");
//        }
//        //assign projects
//        $projects = $db->smartQuery(array(
//            'sql' => $sql,
//            'par' => $params,
//            'ret' => 'result'
//        ));
//        return $projects;
//    }

}