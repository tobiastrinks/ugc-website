<?php
	
	//dbconnect
	
	$servername	= "mariadb";
	$username	= "root";
	$password	= "1234";
	$dbname		= "unigrow-course_livechat";
	
	$mysqli_livechat = new mysqli($servername, $username, $password, $dbname);
	
	
	//check connection
	
	if(mysqli_connect_errno()){
		echo 'dbconnect failed: '.mysqli_connect_error();
		exit();
	}
	
	//set charset
	
	if( !$mysqli_livechat->set_charset("utf8") )
		echo 'set_charset failed: '.$mysqli_livechat->error;


	//temporary_users
	
	$lc_temporary_countdown = 86400; //(sec)
	
	
	//rights
	//required fct: lc_check_rights( action, chatroom_id, user_key, user_key_action )
	$rights_file = "../temp/rights.php"; //relative to livechat-home-dir
	
?>
