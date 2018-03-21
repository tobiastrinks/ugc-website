<?php
	
	//dbconnect
	
	$servername	= "mariadb";
	$username	= "root";
	$password	= "1234";
	$dbname		= "unigrow-course_project";
	
	$mysqli_project = new mysqli($servername, $username, $password, $dbname);
	
	
	/* check connection */
	
	if(mysqli_connect_errno()){
		echo 'dbconnect failed: '.mysqli_connect_error();
		exit();
	}
	
	/*set charset*/
	
	if( !$mysqli_project->set_charset("utf8") )
		echo 'set_charset failed: '.$mysqli_project->error;
	
?>
