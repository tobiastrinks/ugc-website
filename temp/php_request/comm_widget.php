<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	include("../dbconnect.php");
	include("../config.php");
	include("../rights.php");
	
	include("../../livechat/config.php");
	
	
	$task = 0;
	if(isset($post["task"]))
		$task = $post["task"];
	
	//------------------chatrooms
	
	if($task == "chatroom_id_receive"){
		
		$lc_id_string = "";
		
		if($post["status"] != "" AND $post["status"] != "0"){
			
			$user_join = "";
			if($post["user_join"] != "" AND $post["user_join"] != "0")
				$user_join = " AND user_join='".$post["user_join"]."'";
			
			$ergebnis = $mysqli_livechat->query("SELECT ID FROM chatrooms WHERE status='".$post["status"]."'".$user_join);
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$lc_id_string .= "'".$row["ID"]."',";
				}
			}
		}
		
		$lc_request = "";
		if($lc_id_string != ""){
			$lc_id_string = substr_replace($lc_id_string, "", -1);
			$lc_request = " AND lc_chatroom_id IN (".$lc_id_string.")";
		}
		
		$category_id = "";
		
		if($post["category_id"] != "" AND $post["category_id"] != "0"){			
			
			$cat_id = "";
			for($x=0; $x<count($post["category_id"]); $x++)
				$cat_id .= "'".$post["category_id"][$x]."',";
			
			$cat_id = substr_replace($cat_id, "", -1);
			
			$category_id = " AND category_id IN (".$cat_id.")";
		}
		
		
		$kurs_id = "";
		$p_kurs_id = htmlentities($post["kurs_id"], ENT_QUOTES);
		
		if($p_kurs_id != "" AND $p_kurs_id != "0"){
			$kurs_id = " AND kurs_id='".$p_kurs_id."'";
		}
		
		$type = $post["type"];
		$type_cache = explode(",",$type);
		
		$type = "";
		
		for($x=0; $x<count($type_cache); $x++)
			$type .= "'".$type_cache[$x]."',";
		
		$type = substr_replace($type, "", -1);
		
		
		$ergebnis = $mysqli_project->query("SELECT lc_chatroom_id FROM chatrooms WHERE type IN (".$type.")".$lc_request.$category_id.$kurs_id);
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			$x=0;
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x] = $row["lc_chatroom_id"];
				$x++;
			}
			
			echo json_encode($result);
		}
	}
	if($task == "chatroom_info_receive"){
		
		if(is_array($post["chatroom_id"])){
			
			$chatroom_id = "";
			
			for($x=0; $x<count($post["chatroom_id"]); $x++){
				
				$chatroom_id .= "'".$post["chatroom_id"][$x]."',";
			}
			$chatroom_id = substr_replace($chatroom_id, "", -1);
		}
		else
			$chatroom_id = "'".$post["chatroom_id"]."'";
		
		$private_user = [];
		if(is_array($post["private_user"]))
			$private_user = $post["private_user"];
		else
			$private_user[0] = $post["private_user"];
		
		$x=0;
		
		$result = [];
		
		$ergebnis = $mysqli_project->query("SELECT * FROM chatrooms WHERE lc_chatroom_id IN (".$chatroom_id.")");
		while($row = $ergebnis->fetch_assoc()){
			
			$result[$x]["category_id"] 		= $row["category_id"];
			
			$ergebnis2 = $mysqli_project->query("SELECT title FROM category WHERE ID='".$row["category_id"]."'");
			
			if(mysqli_num_rows($ergebnis2) > 0){
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$result[$x]["category_name"] = $row2["title"];
				}
			}
			
			$result[$x]["kurse"] = "";
			
			if(isset($private_user[$x]) AND $private_user[$x] != ""){
				
				$ergebnis2 = $mysqli_project->query("SELECT name FROM kurse WHERE user_key='".$private_user[$x]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$result[$x]["kurse"] .= $row2["name"].", ";
					}
					
					$result[$x]["kurse"] = substr_replace($result[$x]["kurse"], "", -2);
				}
			}
			
			$result[$x]["user_key_host"] 	= $row["user_key_host"];
			$result[$x]["type"] 			= $row["type"];
			$result[$x]["chatroom_id"]		= $row["lc_chatroom_id"];
			
			$result[$x]["icon"]				= $row["icon"];
			$result[$x]["icon_type"]		= $row["icon_type"];
			
			if($row["icon_type"] == "img"){
				
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["icon"]."'");
				while($row2 = $ergebnis2->fetch_assoc()){
					$result[$x]["src"] = $row2["filename"];
				}
			}
			
			$x++;
		}
		
		if(count($result) > 0)
			echo json_encode($result);
		
	}
	if($task == "chatroom_icon_receive"){
		
		$result = [];
		
		$ergebnis = $mysqli_project->query("SELECT icon, icon_type FROM chatrooms WHERE lc_chatroom_id='".$post["chatroom_id"]."'");
		while($row = $ergebnis->fetch_assoc()){
			
			$result["icon"] = $row["icon"];
			$result["type"] = $row["icon_type"];
			
			if($row["icon_type"] == "img"){
				
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["icon"]."'");
				while($row2 = $ergebnis2->fetch_assoc()){
					$result["src"] = $row2["filename"];
				}
			}
		}
		
		echo json_encode($result);
	}
	if($task == "chatroom_type_receive"){
		
		$result = [];
		
		$chatroom_id = "";
		
		if(is_array($post["chatroom_id"])){
			
			for($x=0; $x<count($post["chatroom_id"]); $x++){
				
				$chatroom_id .= "'".$post["chatroom_id"][$x]."',";
			}
			$chatroom_id = substr_replace($chatroom_id, "", -1);
		}
		else
			$chatroom_id = "'".$post["chatroom_id"]."'";
	
		$ergebnis = $mysqli_project->query("SELECT lc_chatroom_id, type FROM chatrooms WHERE lc_chatroom_id IN (".$chatroom_id.")");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$row["lc_chatroom_id"]] = $row["type"];
			}
			
			echo json_encode($result);
		}
		
	}
	if($task == "chatroom_create"){
		
		$lc_chatroom_id = $post["lc_chatroom_id"];
		
		$check_rights = cw_check_rights("chatroom_create", $lc_chatroom_id, 0, $_SESSION["lc_user_key"], 0);
		if($check_rights === true){
			
			$type = $post["type"];
			if($type == "admin_create" && !rights($_SESSION["lc_user_key"], "root"))
				$type = "user_create";
			
			$kurs_id = 0;
			if($type == "kurs" AND isset($_SESSION["kurs_hosting"]))
				$kurs_id = $_SESSION["kurs_hosting"];
			
			$mysqli_project->query("INSERT INTO chatrooms (lc_chatroom_id, category_id, user_key_host, type, icon, icon_type, kurs_id)
									VALUES (".$lc_chatroom_id.", '".$post["category_id"]."', '".$_SESSION["lc_user_key"]."', '".$type."', '', '".$post["icon_type"]."', ".$kurs_id.")");
			
			if($post["icon"] != ""){
				$mysqli_project->query("UPDATE chatrooms SET icon='".$post["icon"]."' WHERE lc_chatroom_id='".$lc_chatroom_id."'");
			}
			
			if($post["type"] == "support_plattform"){
				
				$mysqli_livechat->query("UPDATE user_chatrooms SET rights='0' WHERE chatroom_id='".$lc_chatroom_id."'");
			}
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_remove"){
		
		$check_rights = cw_check_rights("chatroom_remove", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0);
		if($check_rights === true){
		
			$mysqli_project->query("DELETE FROM chatrooms WHERE lc_chatroom_id='".$post["chatroom_id"]."'");
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_update"){
		
		$check_rights = cw_check_rights("chatroom_update_".$post["attr"], $post["chatroom_id"], $post["val"], $_SESSION["lc_user_key"], 0);
		if($check_rights === true){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM chatrooms WHERE lc_chatroom_id='".$post["chatroom_id"]."' AND ".$post["attr"]."='".$post["val"]."'");
			if(mysqli_num_rows($ergebnis) == 0){
				
				$mysqli_project->query("UPDATE chatrooms SET ".$post["attr"]."='".$post["val"]."' WHERE lc_chatroom_id='".$post["chatroom_id"]."'");
			}
		}
		else
			echo $check_rights;
	}
	
	
	
	//------------------user
	if($task == "blocked_receive"){
		
		cw_blocked_load();
		
		if(count($cw_blocked) > 0)
			echo json_encode($cw_blocked);
	}
	if($task == "user_block"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM user_blocked WHERE user_key='".$_SESSION["lc_user_key"]."' AND user_key_action='".$post["user_key"]."'") ) > 0){
			//unblock
			$mysqli_project->query("DELETE FROM user_blocked WHERE user_key='".$_SESSION["lc_user_key"]."' AND user_key_action='".$post["user_key"]."'");
		}
		else{
			//block
			$check_rights = cw_check_rights( "user_block", 0, 0, $_SESSION["lc_user_key"], $post["user_key"] );
			if($check_rights === true){
				
				$mysqli_project->query("INSERT INTO user_blocked (user_key, user_key_action)
										VALUES ('".$_SESSION["lc_user_key"]."', '".$post["user_key"]."')");
			}
			else
				echo $check_rights;
		}
	}
	if($task == "user_contact_rights_receive"){
		
		echo json_encode( cw_user_contact_rights( $post["user_key"], $post["type"] ) );
	}
	if($task == "user_search"){
		
		$x=0;
		$search_val;
		$result = [];
		
		for($y=0; $y<2; $y++){
		
			if($y==0){
				$ergebnis = $mysqli_project->query("SELECT user_key FROM user WHERE username LIKE '".$post["search_str"]."%' AND username!='removed'");
				$search_val = "username";
			}
			if($y==1){
				$name = explode(" ", $post["search_str"]);
				if(count($name) == 1)
					$name[1] = " ";
				
				$ergebnis = $mysqli_project->query("SELECT user_key FROM user WHERE (fname LIKE '".$name[0]."%' OR lname LIKE '".$name[1]."%' OR '".$name[1]."%' OR lname LIKE '".$name[0]."%') AND username NOT LIKE '".$post["search_str"]."%' AND username!='removed'");
				$search_val = "name";
			}
			
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					$result[$x] = $row["user_key"];
					$x++;
				}
			}
		}
		
		if($x > 0)
			echo json_encode($result);
	}
	if($task == "user_list_receive"){
		
		$result = [];
		
		$user_key = "";
		
		if(is_array($post["user_key"])){
			
			for($x=0; $x<count($post["user_key"]); $x++){
				
				$user_key .= "'".$post["user_key"][$x]."',";
			}
			$user_key = substr_replace($user_key, "", -1);
		}
		else
			$user_key = "'".$post["user_key"]."'";
		
		$x=0;
		
		$ergebnis = $mysqli_project->query("SELECT user_key, username, fname, lname FROM user WHERE user_key IN (".$user_key.")");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x]["user_key"]	= $row["user_key"];
				
				$result[$x]["username"]	= $row["username"];
				
				$result[$x]["fname"]	= $row["fname"];
				$result[$x]["lname"]	= $row["lname"];
				
				$x++;
			}
		}
		
		if(count($result) > 0)
			echo json_encode($result);
	}
	if($task == "user_username_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT username FROM user WHERE user_key='".$post["user_key"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				echo $row["username"];
			}
			
		}
	}
	if($task == "user_name_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT fname, lname FROM user WHERE user_key='".$post["user_key"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[0] = $row["fname"];
				$result[1] = $row["lname"];
			}
			
			echo json_encode( $result );
		}
	}
	if($task == "user_icon_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT icon, icon_type FROM user WHERE user_key='".$post["user_key"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result["type"] = $row["icon_type"];
				$result["icon"] = $row["icon"];
				
				if($row["icon_type"] == "img"){
					
					$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["icon"]."'");
					if(mysqli_num_rows($ergebnis2) > 0){
						
						while($row2 = $ergebnis2->fetch_assoc()){
							
							$result["filename"] = $row2["filename"];
						}
					}
				}
			}
			
			echo json_encode($result);
		}
	}
	
	
	//------user_profile
	if($task == "user_profile_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT * FROM user WHERE user_key='".$post["user_key"]."'");
		
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result["username"] 		= $row["username"];
				$result["fname"] 			= $row["fname"];
				$result["lname"] 			= $row["lname"];
				$result["date_of_birth"] 	= $row["date_of_birth"];
				$result["gender"] 			= $row["gender"];
				$result["icon"] 			= $row["icon"];
				$result["icon_type"] 		= $row["icon_type"];
				$result["descr"]			= $row["descr"];
				
				$result["facebook_link"]	= $row["facebook_link"];
				$result["twitter_link"] 	= $row["twitter_link"];
				$result["youtube_link"] 	= $row["youtube_link"];
				$result["instagram_link"] 	= $row["instagram_link"];
			}
			
			//kurse betreten
			$ergebnis = $mysqli_project->query("SELECT kurs_id FROM user_kurse WHERE rights='0' AND user_key='".$post["user_key"]."'");
			
			if(mysqli_num_rows($ergebnis) > 0){
				
				$x=0;
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["courses_visited"][$x] = $row["kurs_id"];
					
					$x++;
				}
			}
			
			//kurse erstellt
			$ergebnis = $mysqli_project->query("SELECT kurs_id FROM kurse_marketplace WHERE status='online' AND kurs_id IN (SELECT kurs_id FROM user_kurse WHERE rights='admin' AND user_key='".$post["user_key"]."')");
			
			if(mysqli_num_rows($ergebnis) > 0){
				
				$x=0;
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["courses_created"][$x] = $row["kurs_id"];
					
					$x++;
				}
			}
			
			//msg_settings
			$ergebnis = $mysqli_project->query("SELECT * FROM user_msg_settings WHERE user_key='".$post["user_key"]."'");
			
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["msg_settings"][ $row["type"] ] = $row["rights"];
				}
			}
			
			echo json_encode($result);
		}
	}
	
	
?>