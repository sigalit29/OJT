apple.controller('studentSignup', ['$scope', '$rootScope', '$state', '$timeout','$interval', 'server', '$filter', 'login', 'Upload', 'profile', '$stateParams',
function($scope, $rootScope, $state, $timeout, $interval, server, $filter, login, Upload, profile, $stateParams) {
	// $scope.genders = getGenders();
	// $scope.cities = getCities();
	$scope.user = {
		email : '',
		password : '',
		passcheck : '',
		firstname : '',
		lastname : '',
		phone : '',
		phone2 : '',
		tznumber : '',
		birthday : '',
		address : '',
		image : '',
		status : 1
	};
	$scope.google = {idToken:false};
	$scope.genderList = [];
	$scope.cityList = [];
	getCities();
	getGenders();

    $scope.choosePicSelected = false;
    $scope.approvedMail = false;
    //if the user has accidently input a wrong email address, they caninput a new one into this parameter,
    //to replace occurance of the old email in the db and resend the confirmation mail
    $scope.emailFix={newEmail:""};
    var checkUserEmailVerificationInterval;

	$rootScope.$broadcast('setHeaderTitle', {
		title : $rootScope.dictionary.signupStep1Title
	});
	$state.transitionTo("studentSignup");
	$scope.initializeSwiper = function() {
		// initialize swiper when document ready
		$scope.mySwiper = new Swiper('.swiper-container', {
			// Optional parameters
			direction : 'vertical',
			speed : 1000,
			onlyExternal : true,
			// Navigation arrows
			//nextButton : '.next-signup-step',
			onSlideChangeStart : slideChange
		});
		function hideAllNonActiveSlides() {
			for (var i = 0; i < $scope.mySwiper.slides.length; i++) {
				$scope.mySwiper.slides[i].className = $scope.mySwiper.slides[i].className.replace(' swiper-slide-transition', '');
			}
		}

		function showAllSlides() {
			for (var i = 0; i < $scope.mySwiper.slides.length; i++) {
				$scope.mySwiper.slides[i].className += ' swiper-slide-transition';
			}
			$scope.$applyAsync();
		}

		function slideChange(event) {
			showAllSlides();
			$rootScope.$broadcast('setHeaderTitle', {
				title : getTitle(event.activeIndex)
			});
			$scope.$applyAsync();
			setTimeout(hideAllNonActiveSlides, 1000);
		}

	};
    $scope.init = function () {
        window.setTimeout(function () {renderButton();}, 200);
    };
	$scope.init();
	function getGenders() {
		console.log($rootScope.regCode);
		var data = {};
		data.type = "post";
		data.regCode = $rootScope.regCode;
		server.requestPhp(data, "reg_GetGenders").then(function(data) {
			console.log(data);
			if (data && !data.error) {
				$scope.genderList = data;
			}
		});
	}

	function getCities() {
		var data = {};
		data.type = "post";
		data.regCode = $rootScope.regCode;
		server.requestPhp(data, "reg_GetCities").then(function(data) {
			//console.log(data);
			if (data && !data.error) {
				$scope.cityList = data;
			}
		});
	}


	$scope.setGender = function(genderid) {
		$scope.user.genderid = genderid;
	};
	$scope.setCity = function(cityid) {
		$scope.user.cityid = cityid;
	};

	function getTitle(step) {
		switch (step) {
		case 0:
			return $rootScope.dictionary.signupStep1Title;
		case 1:
			return $rootScope.dictionary.signupStep2Title;
		case 2:
			return $rootScope.dictionary.signupStep3Title;
		default:
			return $rootScope.dictionary.signupStep1Title;
		}
	}


	$scope.changeLanguage = function() {
		$rootScope.isArabic = !$rootScope.isArabic;
		if ($rootScope.isArabic == true) {
			// save the lang in localStorage
			localStorage.setItem('lang', 'arabic');
			$rootScope.dictionary = arabic;
		} else {
			// save the lang in localStorage
			localStorage.setItem('lang', 'hebrew');
			$rootScope.dictionary = hebrew;
		}

		// close the menu -for refresh data in the page
		$state.transitionTo('studentSignup');
		$rootScope.$broadcast('setHeaderTitle', {
			title : getTitle($scope.mySwiper.activeIndex)
		});
		$scope.$applyAsync();
	};
	$scope.nextStage = function() {
		console.log("here");
	};
    $scope.cancel = function () {
        $state.transitionTo('login');
    }
	$scope.$on('backButton', function(event, data) {
		if ($scope.mySwiper.activeIndex != 0)
			$scope.mySwiper.slidePrev();
		else
			$state.transitionTo("login");
	});

	$scope.validateStep1 = function() {
		return $scope.google.idToken||($scope.validatePassCheck() && $scope.validatePass() && $scope.validateEmail($scope.user.email));
	};
	$scope.validateEmail = function(email) {
		var val = email;
		//checks for example@example.example, such that [example] doesn't contain a '@'
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	};
	$scope.validatePass = function() {
		var val = $scope.user.password;
		//checks that the string length is higher than 12
		var checkPassLength = /^(.{12,})$/;
		//checks that the string contains at least one digit
		var containsDigits = /.*[0-9].*/;
		//checks that the string contains at least one lower case letter and one higher case letter
		var containsLetters = /^(?=.*[a-z])(?=.*[A-Z]).*$/;
		//checks that the string contains at least one special character
		var containsSpecialChars = /^.*[~`"'!@#$%^&*()[\]{}'/<>|;:+=.\\\-]+.*$/;
		//checks that the length condition, and at least 2 of the 3 remaining conditions, are met.
		return (checkPassLength.test(val) && (containsDigits.test(val) + containsLetters.test(val) + containsSpecialChars.test(val) >= 2));
	};
	$scope.validatePassCheck = function() {
		//checks that the two password fields contain the same string
		return $scope.user.password === $scope.user.passcheck;
	};
	/*function onSuccess(googleUser) {
		$scope.google.idToken = googleUser.getAuthResponse().id_token;
		$scope.google.img = googleUser.getBasicProfile().getImageUrl();
		//$scope.user.image = $scope.google.img;
		$scope.$apply();
    }
    function onFailure(error) {
      console.log(error);
    }
    function renderButton() {
		if(!gapi)
			return;
		gapi.signin2.render('my-signin2', {
			'scope': 'profile email',
			'width': 240,
			'height': 50,
			'longtitle': true,
			'theme': 'dark',
			'onsuccess': onSuccess,
			'onfailure': onFailure
		});
	}*/
	$scope.validateStep2 = function() {
		return $scope.validateFirstName() && $scope.validateLastName() && $scope.validatePhone1();
	};
	$scope.onImageSelect = function($files) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; $files && i < $files.length; i++) {
			$scope.imageUpload = true;
			var $file = $files[i];
			Upload.upload({
				url : $rootScope.phpDomain + 'datagate.php?type=regUploadDoc&regCode=' + $rootScope.regCode,
				file : $file,
				progress : function(e) {
				}
			}).then(function(data, status, headers, config) {
				$scope.closePicSelected();
				// file is uploaded successfully
				if (data.data.fileUrl) {
					var imgurl = data.data.fileUrl;
					$scope.user.image = imgurl;
				} else if (data.data.error)
					alert(data.data.error);
				else
					alert("תקלה בהעלאת קובץ");
				$scope.imageUpload = false;
			});
		}
	};
                                        
	$scope.onFail =function(e){
		console.log('fail' + e)
	}
	$scope.onCapturePhoto = function(fileURI) {
	    $scope.imageUpload = true;
	    var win = function(data) {
	        /* if (JSON.parse(data.response)) {
	             var imgurl = JSON.parse(data.response).fileUrl;*/
	        if (data.response) {
	            var imgurl;
	            if (!$scope.isIos) {
	                var replaceBackslashes = data.response.replace(/\\\//g, "/");
	                replaceBackslashes = JSON.parse(replaceBackslashes.substring(1, replaceBackslashes.length))
	                // data.response=JSON.parse(data.response);
	                imgurl = replaceBackslashes.fileUrl;
	            } else {
	                imgurl = JSON.parse(data.response).fileUrl;
	            }
	            $timeout(function() {
	            	$scope.user.image = imgurl;
	            }, 0)
	        }
	        else if (JSON.parse(data.response).error)
	            alert(JSON.parse(data.response).error);
	        else
	            alert("תקלה בהעלאת קובץ");
	        $scope.imageUpload = false;
	    }

	    var fail = function(error) {
	        console.log('error' + error)
	    }

	    var options = new FileUploadOptions();
	    options.fileKey = "file";
	    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
	    options.mimeType = "image/jpeg";
	    options.params = {}; // if we need to send parameters to the server request
	    options.chunkedMode = false;
	    var ft = new FileTransfer();
	    console.log(fileURI, encodeURI($rootScope.phpDomain + 'datagate.php?type=regUploadDoc&regCode=' + $rootScope.regCode), win, fail, options);
		ft.upload(fileURI, encodeURI($rootScope.phpDomain + 'datagate.php?type=regUploadDoc&regCode=' + $rootScope.regCode), win, fail, options);
		//$scope.onImageSelect(ft);
		$scope.closePicSelected();
	}
	
	$scope.openGallery =function(){
		navigator.camera.getPicture($scope.onCapturePhoto, $scope.onFail, {
			quality: 100,sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,correctOrientation:true
		});
	}
	
	$scope.openImageOptions = function()
	{
		 $scope.choosePicSelected = true;
	};

	$scope.openCamera = function() {
		navigator.camera.getPicture($scope.onCapturePhoto, $scope.onFail, {
				quality: 50,sourceType: Camera.PictureSourceType.FILE_URI,correctOrientation:true
		});
	};

	$scope.closePicSelected = function() {
		$scope.choosePicSelected = false;
	};
	
	$scope.validateFirstName = function() {
		//checks that the first name is in a name format
		return validateName($scope.user.firstname);
	};
	$scope.validateLastName = function() {
		//checks that the last name is in a name format
		return validateName($scope.user.lastname);
	};
	function validateName(n) {
		//checks that the string is made out only of Arabic, Hebrew, or English letters, plus white spaces and hyphens
		return /^[\u0590-\u05FFa-zA-Z\u0621-\u064A\s-'.]{2,}$/.test(n);
	}

	$scope.validatePhone1 = function() {
		//checks that the first phone number is in a phone format
		return validatePhoneNum($scope.user.phone);
	};
	$scope.validatePhone2 = function() {
		//checks that the second phone number is in a phone format
		return validatePhoneNum($scope.user.phone2);
	};
	function validatePhoneNum(n) {
		//strips the input string of all hyphens, parentheses, and white spaces
		var num = n.replace(/([-()\s])/g, '');
		//checks that the result is composed entirely of digits, and is between 9 and 11 chars long.
		return /^[0-9]{9,11}$/g.test(num);
	}


	$scope.validateStep3 = function() {
		return $scope.validateId() && $scope.validateGender() && $scope.validateCity() && $scope.validateDate() && $scope.validateAddress();
	};
	$scope.validateId = function() {
		//checks that the input string is at least 8 chars long, and contains only digits
		return /^[0-9]{8,}$/g.test($scope.user.tznumber);
	};
	$scope.validateGender = function() {
		return $scope.user.genderid != null;
	};
	$scope.getGenderById = function(id) {
		for (var i = 0; i < $scope.genderList.length; i++) {
			if ($scope.genderList[i].genderid == id)
				return $scope.genderList[i];
		}
		return [];
	};
	$scope.validateCity = function() {
		return $scope.user.cityid != null;
	};

	$scope.getCityById = function(id) {
		for (var i = 0; i < $scope.cityList.length; i++) {
			if ($scope.cityList[i].cityid == id)
				return $scope.cityList[i];
		}
		return [];
	};
	$scope.validateDate = function() {
		var arr = $scope.user.birthday.split(/[/\-.]/);
		if (arr.length == 3) {
			var d = parseInt(arr[0]);
			var m = parseInt(arr[1]);
			var y = parseInt(arr[2]);
			if ([1, 3, 5, 7, 8, 10, 12].indexOf(m) != -1) {
				if (d > 31)
					return false;
			} else if ([4, 6, 9, 11].indexOf(m) != -1) {
				if (d > 30)
					return false;
			} else if (m == 2) {
				if (y % 4 == 0 && (y % 25 != 0 || y % 400 == 0)) {
					if (d > 29) {
						return false;
					}
				} else if (d > 28) {
					return false;
				}
			} else {
				return false;
			}
			if (y > new Date().getFullYear() || y < 1900) {
				return false;
			}
			return true;
		}

		return false;
	};
	$scope.validateAddress = function() {
		return true;///^[0-9\u0590-\u05FFa-zA-Z\u0621-\u064A\s-'./\\]{2,}$/.test($scope.user.address);
	};
	$scope.postUser = function() {
		var data = $scope.user;
		var arr = $scope.user.birthday.split(/[/\-.]/);
		data.birthday = arr[0] + "/" + arr[1] + "/" + arr[2];
		data.pass1 = $scope.user.password;
		data.pass2 = $scope.user.passcheck;
		data.regCode = $rootScope.regCode;
		data.googleid = $scope.google.idToken;
		data.type = "POST";
		server.requestPhp(data, "signup").then(function(data) {
			if($scope.google.idToken)
			{
				$scope.loginAsGoogleUser();
				return;
			}
			//if there is login data
			if (data && !data.error) {
				sendVerificationEmail();
				$scope.emailVerificationPending=true;
				checkUserEmailVerificationInterval=$interval(checkUserEmailVerification, 5000);
				$scope.emailFix.newEmail = $scope.user.email;
			} else {
				if (data.error == "email exist in the system") {
					alert($rootScope.dictionary.emailAlreadyExists);
				}
				if (data.error == "tz exist in the system") {
					alert($rootScope.dictionary.TZAlreadyExists);
				}
			}
		});
	};
	
	function checkUserEmailVerification()
	{
		var data = {};
		data.email = $scope.user.email;
		data.regCode = $rootScope.regCode;
		data.type = "POST";
		server.requestPhp(data, "checkEmailApproval").then(function(data) {
			if (data && !data.error) {
				$scope.approvedMail=true;
				$interval.cancel(checkUserEmailVerificationInterval);
			}
		});
	}
	
	function sendVerificationEmail()
	{
		var data = {};
		data.email = $scope.user.email;
		data.regCode = $rootScope.regCode;
		data.type = "POST";
		server.requestPhp(data, "reg_sendVerificationEmail").then(function(data){});
	}
	
	$scope.replaceEmail = function()
	{
		var data = {};
		data.email1 = $scope.user.email;
		data.email2 = $scope.emailFix.newEmail;
		data.regCode = $rootScope.regCode;
		data.type = "POST";
		server.requestPhp(data, "reg_ChangeEmail").then(function(data) {
			if (data) {
				if(!data.error && data)
				{
					$scope.user.email = $scope.emailFix.newEmail;
					failedSendingCount = 0;
					alert($rootScope.dictionary.finishRegistrationViaEmail);
				}
				else
				{
					if(data.error=="email exist in the system")
					{
						alert($rootScope.dictionary.emailAlreadyExists);
					}
				}
			}
		});
	}
	
	$scope.loginAsUser = function()
	{
		login.login($scope.user.email, $scope.user.password).then(function (data) {
            if (data.token) {
				profile.getMyProfile();
                $state.transitionTo('courses');
            } else if (data.error) {
                if (data.error == "user not found") {
                    alert($rootScope.dictionary.errorUsername);
                }
                if (data.error == "Inactive Student") {
                    alert($rootScope.dictionary.errorUserStatus);
                }
                if (data.error == "Inactive Teacher") {
                    alert($rootScope.dictionary.errorTeacherStatus);
                }
                if (data.error == "need to accept register") {
                    alert($rootScope.dictionary.finishRegistrationViaEmail);
                }
            } else {
                alert($rootScope.dictionary.errorTryAgainLater);
            }
        });
	}
	$scope.loginAsGoogleUser = function()
	{
		login.googleLogin($scope.google.idToken).then(function (data) {
            if (data.token) {
				profile.getMyProfile();
                $state.transitionTo('courses');
            } else if (data.error) {
                if (data.error == "incorrect credentials") {
                    alert($rootScope.dictionary.errorUsername);
					if(!gapi.auth2){
						gapi.load('auth2', function() {
							gapi.auth2.init();
						});
					}
					gapi.auth2.getAuthInstance().disconnect();
					var auth2 = gapi.auth2.getAuthInstance();
					auth2.signOut().then(function () {
						console.log('User signed out.');
					});
					gapi.auth2.getAuthInstance().disconnect();
                }
                if (data.error == "the user is inactive") {
                    alert($rootScope.dictionary.errorUserStatus);
                }
                if (data.error == "need to accept register") {
                    alert($rootScope.dictionary.finishRegistrationViaEmail);
                }
            } else {
                alert($rootScope.dictionary.errorTryAgainLater);
            }
        });
	}
	
	$scope.$on('$destroy', function() {
		$interval.cancel(checkUserEmailVerificationInterval);
	});
	
}]);