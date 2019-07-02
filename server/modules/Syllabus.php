<?php
class Syllabus {
	function AddSyllabus($syllabus,$courseid)
	{
		
		global $db;
		$subjects=TreesToArray(array(), $syllabus, null, 'subsubjects', 'nodeId', 'nodeParentId');
		$indexedSubjects=indexObjectArrayByAttribute($subjects, 'nodeId');
		$updateSql = "";
		$updateParams = array();
		/*
		in order not to execute an empty query that results in an error,
		track whether any subjects require update, and use it to determine whether to run the query.
		*/
		$toUpdate = false;
		foreach($subjects as $subject)
		{
			$supersubjectid = null;
			if(isset($subject->nodeParentId))
			{
				$supersubjectid=$indexedSubjects[$subject->nodeParentId]->subjectid;
			}
			if(!isset($subject->subjectid))
			{
				$result = $db->smartQuery(array(
					'sql' => "
						INSERT INTO `subject`
							(`courseid`, `subject`,`subjectinarabic`, supersubjectid, `position`)
							VALUES
							(:courseid, :subject, :subjectinarabic, :supersubjectid, :index);",
					'par' => array(
						'courseid' => $courseid,
						'subject' => $subject->subject,
						'subjectinarabic' => $subject->subjectinarabic,
						'supersubjectid' => $supersubjectid,
						'index' => $subject->nodeId
					),
					'ret' => 'result'
				));
				$subjectid=$db->getLastInsertId();
				$indexedSubjects[$subject->nodeId]->subjectid=$subjectid;
			}
			else
			{
				$toUpdate=true;
				$sid=$subject->subjectid;
				$updateSql.="UPDATE subject SET ".
				"position=:position_".$sid.", ".
				"subject=:subject_".$sid.", ".
				"subjectinarabic=:subjectinarabic_".$sid.", ".
				"courseid=:courseid_".$sid.", ".
				"supersubjectid=:supersubjectid_".$sid.
				" WHERE subjectid=:subjectid_".$sid."; ";
				$updateParams["subject_".$sid]=$subject->subject;
				$updateParams["subjectinarabic_".$sid]=$subject->subjectinarabic;
				$updateParams["courseid_".$sid]=$courseid;
				$updateParams["supersubjectid_".$sid]=$subject->supersubjectid;
				$updateParams["subjectid_".$sid]=$subject->subjectid;
				$updateParams["position_".$sid]=$subject->nodeId;
			}
		}
		if($toUpdate)
		{
			$result = $db->smartQuery(array(
				'sql' => $updateSql,
				'par' => $updateParams,
				'ret' => 'result'
			));
		}
	}
	function RemoveFromSyllabus($subjects){
		if(count($subjects)==0)
			return;
		global $db;
		$deleteQuery = "DELETE FROM `subject` WHERE `subjectid` IN (";
		$deleteParams = array();
		foreach ($subjects AS $index=>$sid)
		{
			$deleteQuery.=":subjectid".$index;
			//add a comma to seperate values, unless working on the last value
			$deleteQuery.=($index<count($subjects)-1)?",":"";
			//add coresponding parameter to the array
			$deleteParams['subjectid'.$index]=$sid;
		}
		$deleteQuery.=")";
		$result=$db->smartQuery(array(
			'sql' => $deleteQuery,
			'par' => $deleteParams,
			'ret' => 'result'
		));
		return true;
	}
	function GetSyllabusSubjectsByCourseId($courseid)
{
    global $db;
    $subjects = $db->smartQuery(array(
        'sql' => "
			SELECT
				subjectid, subject, subjectinarabic, supersubjectid
			FROM subject
			WHERE courseid=:courseid
			ORDER BY position",
        'par' => array('courseid' => $courseid),
        'ret' => 'all'
    ));
    return arrayToTrees($subjects, 'subjectid','supersubjectid', 'subsubjects');
}
    function GetSubjectsByCourseIdNotInTree($courseid)
    {
        global $db;
        $subjects = $db->smartQuery(array(
            'sql' => "
			SELECT
				subjectid
			FROM subject
			WHERE courseid=:courseid
			",
            'par' => array('courseid' => $courseid),
            'ret' => 'fetch-all'
        ));
        return $subjects;
    }
	function getSyllabusSubjectsLearntByCourseId($courseid)
	{
		global $db;
		$subjects = $db->smartQuery(array(
			'sql' => "
			SELECT
				s.subjectid, subject, subjectinarabic, supersubjectid, CASE WHEN count(st.lessonid)>0 THEN 1 ELSE 0 END AS wasLearnt
			FROM subject AS s
			LEFT JOIN subjectstaught AS st ON st.subjectid = s.subjectid
			WHERE courseid=:courseid
			GROUP BY s.subjectid
			ORDER BY position",
			'par' => array('courseid' => $courseid),
			'ret' => 'all'
		));
		return arrayToTrees($subjects, 'subjectid','supersubjectid', 'subsubjects');
	}
}
?>