<?php
class CelebrationEvents {
	function getCourseCelebrationEvents($courseid) {
		$events = array ();
		$studentBirthdays = $this -> getBirthdayStudents ( $courseid );
		foreach ( $studentBirthdays as $bornToday ) {
			$newEvent = array();
			$newEvent["he"] = "יום הולדת שמח ל" . $bornToday ["firstname"] . " " . $bornToday ["lastname"]."!";
			$newEvent["ar"] = "happy birthday to " . $bornToday ["firstnameinarabic"] . " " . $bornToday ["lastnameinarabic"];
			$events [] = $newEvent;
		}
		$hebrewHolidays = $this->getCurrentHebrewHolidays();
		foreach ( $hebrewHolidays as $holiday ) {
			$newEvent = array();
			$newEvent["he"] = $holiday["name"]["he"]." שמח";
			$newEvent["ar"] = "happy ".$holiday["name"]["ar"];
			$events [] = $newEvent;
		}
		return $events;
	}
	
	function getBirthdayStudents ($courseid)
	{
		global $Enrollment;
		$students = $Enrollment -> GetActiveEnrollmentsInCourse($courseid);
		$birthdayToday = array ();
		//this date in the year 2000
		$today = strtotime(date("2000-m-d"));
		foreach ($students as $s)
		{
			//date of student's birthday on the year 2000
			$studentBirthday=strtotime(date("2000-m-d", strtotime($s["birthday"])));
			$delta= intval($today) - intval($studentBirthday);
			if ($delta<=(4*24*3600)&&$delta>=-(4*24*3600))
				$birthdayToday[] = $s;
		}
		return $birthdayToday;
	}
	
	function getCurrentHebrewHolidays ()
	{
		//implementation of code from https://github.com/xmattus/php-jewish-holidays/blob/master/holidays.php
		$today_jd = unixtojd();
		$jewish = jdtojewish($today_jd);
		list($jmonth, $jday, $jyear) = explode('/', $jewish);
		function is_heb_leap_year($year) {
			$year = (int)$year;
			if ($year % 19 == 0 || $year % 19 == 3 || $year % 19 == 6 || $year % 19 == 8 || $year % 19 == 11 || $year % 19 == 14 || $year % 19 == 17) {
				return TRUE;
			}
			return FALSE;
		}
		$holidays = array(
				array('name' => array('en'=>'Rosh Hashanah', 'he'=>'ראש השנה', 'ar'=>'Rosh Hashanah'), 'month' => 1, 'day' => 1, 'duration' => 2),  //Tishrei 1st
				array('name' => array('en'=>'Sukot', 'he'=>'סוכות', 'ar'=>'Sukot'), 'month' => 1, 'day' => 15, 'duration' => 7),  //Tishrei 15th
				array('name' => array('en'=>'Hanuka', 'he'=>'חנוכה', 'ar'=>'Hanuka'), 'month' => 3, 'day' => 25, 'duration' => 8),  //Kislev 25th
				array('name' => array('en'=>'Tu BiShvat', 'he'=>'טו בשבט', 'ar'=>'Tu BiShvat'), 'month' => 5, 'day' => 15, 'duration' => 1), //Shvat 15th
				array('name' => array('en'=>'Purim', 'he'=>'פורים', 'ar'=>'Purim'), 'month' => is_heb_leap_year($jyear) ? 7 : 6, 'day' => 14, 'duration' => 1), //Adar B 14th during a leap year, Adar 14th otherwise
				array('name' => array('en'=>'Passover', 'he'=>'פסח', 'ar'=>'Passover'), 'month' => 8, 'day' => 15, 'duration' => 8), //Nisan 15th
				array('name' => array('en'=>'Shavuot', 'he'=>'שבועות', 'ar'=>'Shavuot'), 'month' => 10, 'day' => 6, 'duration' => 2) //Sivan 6th
		);
		function getCurrHolidays($holidays, $today_jd, $jyear)
		{
			$currHolidays = array();
			foreach ($holidays as $holiday) {
				// The nature of the JewishToJD() function is such that the JD returned corresponds to the Gregorian day on which the Jewish date begins at sundown,
				// e.g. 1 Tishrei, 5774 = September 4, 2013; Rosh Hashanah beings at sundown on September 4, 2013.
				// Note that many (Gregorian) calendars will note the date of Rosh Hashanah in this case as "September 5, 2013" since that's the first full day of it.
				$jd = JewishToJD($holiday['month'], $holiday['day'], $jyear);
				$end_jd = $jd + $holiday['duration'];
				if ($today_jd+4>=$jd && $today_jd-4<=$end_jd) {
					$currHolidays[] = $holiday;
				}
			}
			return $currHolidays;
		}
		$currHolidays = getCurrHolidays($holidays, $today_jd, $jyear);
		return $currHolidays;
	}
	
}
?>