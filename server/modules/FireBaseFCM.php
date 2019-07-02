<?php
class FireBaseFCM{
	public $serverkey;
	private $notification;
	
	function __construct(){
		global $conf;
		$this->serverkey=$conf->firebase->serverKey;
	}
	/**
	* send Message through fcm service
    * @param $title (string) - message title
    * @param $text (string) - message body
    * @param $to (array) - array of token ids
	* return (object) FCM result
	*/
	function sendMessage($title,$text,$to, $courseid,$lessonid,$type){
		$notification=new Notification($title,$text,$to,$courseid,$lessonid,$type);
		return $this->sendToFB($notification);
	}
	/**
	*send Message through fcm service
	*@param objToSend (object) - { "notification":{"title":string,"message":string,"to":array}}
	*return (object) FCM result
	*/
	function sendToFB($objToSend){
		global $conf;
		$post=$objToSend;
		//print_r($objToSend);
		
		$header=array('Content-Type: application/json',
		"Authorization: key=".$conf->firebase->serverKey);
		try{
		$ch = curl_init("https://fcm.googleapis.com/fcm/send");  
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
		
		$output=curl_exec($ch);
		curl_close($ch);
		 if (FALSE ===  $output)
            throw new Exception(curl_error($ch), curl_errno($ch));		
	    }catch(Exception $e) {
            trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
        }	
		return json_decode($output);
	}
}

class Notification{
	
	public $notification;
	public $registration_ids;
	
	public function __construct($title,$text,$to,$courseid,$lessonid,$type){
	
		$this->notification=new stdClass();
		$this->notification->title=$title;
		$this->notification->text=$text;
		$this->notification->click_action="FCM_PLUGIN_ACTIVITY";
		$this->notification->icon="fcm_push_icon";
		$this->notification->color="#3bc0ab";
		$this->registration_ids=$to;
		$this->data=new stdClass();
		$this->data->courseid = $courseid;
		$this->data->lessonid = $lessonid;
		$this->data->type = $type;
		$this->data->title = $title;
		$this->data->text = $text;
		
	}
}