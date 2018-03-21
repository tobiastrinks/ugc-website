<?php @session_start();
	
	$servername	= "mariadb";
	$username	= "root";
	$password	= "1234";
	$dbname		= "unigrow-course_cms";
	
	$mysqli = new mysqli($servername, $username, $password, $dbname);
	
	
	/* check connection */
	
	if(mysqli_connect_errno()){
		echo 'dbconnect failed: '.mysqli_connect_error();
		exit();
	}
	
	/*set charset*/
	
	if( !$mysqli->set_charset("utf8") )
		echo 'set_charset failed: '.$mysqli->error;
	
	//get project_id
	$cms_ergebnis = $mysqli->query("SELECT * FROM project WHERE domain='".$_SERVER["HTTP_HOST"]."' OR domain='www.".$_SERVER["HTTP_HOST"]."'");
	if(mysqli_num_rows($cms_ergebnis) > 0){
		while($cms_row = $cms_ergebnis->fetch_assoc()){
			$project_id = $cms_row["ID"];
		}
	}
	$project_id = 1;
	
	//desktop/mobile dir
	$cms_desktop_dir = "/";
	$cms_mobile_dir = "/mobile/";
	
	//language
	if(!isset($_SESSION["cms_lang"]))
		$_SESSION["cms_lang"] = "ger";
?>
