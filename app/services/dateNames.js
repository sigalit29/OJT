apple.factory('dateNames', [function () {
	var months = {
		"he":["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
		"ar":["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "تشرين أول", "نوفمبر", "ديسمبر"]
	};
	var days = {
		"he":["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
		"ar":["الأحد", "اثنين", "ثلث", "الأربعاء", "الخميس", "الجمعة", "سبت"]
	};
	var dayLetters = {
		"he":["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'"],
		"ar":["الأحد", "اثنين", "ثلث", "الأربعاء", "الخميس", "الجمعة", "سبت"]
	};
	return {
		getMonthName: function (monthIndex, lang) {
			if(months[lang][monthIndex])
				return months[lang][monthIndex];
			return "";
		},
		getDayName: function (dayIndex, lang) {
			if(days[lang][dayIndex])
				return days[lang][dayIndex];
			return "";
		},
		getDayLetter: function (dayIndex, lang) {
			if(dayLetters[lang][dayIndex])
				return dayLetters[lang][dayIndex];
			return "";
		}
	}
} ]);