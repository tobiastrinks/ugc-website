<?php

	//dbconnect

	$servername	= $_ENV["DB_HOST"];
	$username	= $_ENV["DB_USER"];
	$password	= $_ENV["DB_PW"];
	$dbname		= $_ENV["DB_PROJECT_NAME"];

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
