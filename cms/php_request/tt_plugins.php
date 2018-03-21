<?php

	$task = $_GET["task"];
	
	if($task == "kontakt_form"){
		
		$to = $_POST["email"];
		$subject = $_POST["subject"];
		
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
		
		$message = "";
		
		$val_name = $_POST["val_name"];
		$val_content = $_POST["val_content"];
		
		for($x=0; $x<count($val_name); $x++){
			$message .= $val_name[$x]. " : " . $val_content[$x] . "<br />";
		}
		
		mail($to, $subject, $message, $headers);
		
		return true;
	}
?>