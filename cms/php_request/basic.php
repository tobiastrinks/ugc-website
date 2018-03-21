<?php @session_start();
	
	include("../basic/php_fct.php");
	$post = html_encode($_POST);
	
	if(isset($post["task"]))
		$task = $post["task"];
	else
		$task = "";
	
	//change lang
	if($task == "change_lang"){
		
		$_SESSION["cms_lang"] = $post["new_lang"];
	}
?>