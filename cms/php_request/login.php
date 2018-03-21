<?php session_start();
	
	include("../dbconnect.php");
	
	include("../basic/php_fct.php");
	$post = html_encode($_POST);
	
	$username = $post["username"];
	$pw	= $post["pw"];
	
	$return = "error_username";
	
	$ergebnis_cms = $mysqli->query("SELECT * FROM user WHERE username='".$username."' AND (project_id='".$project_id."' OR project_id='-1')");
	while($row_cms = $ergebnis_cms->fetch_assoc()){
		
		if($pw == $row_cms["pw"]){
			
			$_SESSION["cms_username"] = $username;
			$_SESSION["cms_pw"] = $pw;
			
			$_SESSION["cms_login"] = 1;
			
			$_SESSION["cms_username_full"] = $row_cms["name"];
			$return = $row_cms["name"];
		}
		else{
			$return = "error_pw";
		}
	}
	
	echo $return;
?>