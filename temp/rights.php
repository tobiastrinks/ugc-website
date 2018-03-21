<?php
	//livechat.php
	if(is_file("../../temp/dbconnect.php"))
		include("../../temp/dbconnect.php");
	
	//html page
	if(is_file("temp/dbconnect.php"))
		include("temp/dbconnect.php");
	
	//Rechteverwaltung
	
	$rights = Array(
		
		//tobi
		"50159" => Array("root", "supporter"),
		//marco
		"26452" => Array("root", "supporter")

	);
	
	$cw_blocked; //cw_blocked_load
	
	
	function rights( $user_key, $right ){
		
		global $rights;
		
		$return = false;
		
		if(isset($rights[$user_key])){
			for($x=0; $x<count($rights[$user_key]); $x++){
				
				if($rights[$user_key][$x] == $right)
					$return = true;
			}
		}
		
		return $return;
	}
	
	function cw_blocked( $type, $user_key ){
		
		global $cw_blocked;
		
		$return = false;
		
		if(isset($cw_blocked[$type])){
			for($x=0; $x<count($cw_blocked[$type]); $x++){
				
				if($cw_blocked[$type][$x] == $user_key)
					$return = true;
			}
		}
		
		return $return;
	}
	function cw_blocked_load(){
		
		global $cw_blocked, $mysqli_project;
		
		//cw_blocked
		$cw_blocked_result = Array();
		$cw_blocked_result_counter = 0;
		
		$ergebnis = $mysqli_project->query("SELECT user_key_action FROM user_blocked WHERE user_key='".$_SESSION["lc_user_key"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$cw_blocked_result[0][$cw_blocked_result_counter] = $row["user_key_action"];
			}
		}
		
		$cw_blocked_result_counter = 0;
		
		$ergebnis = $mysqli_project->query("SELECT user_key FROM user_blocked WHERE user_key_action='".$_SESSION["lc_user_key"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$cw_blocked_result[1][$cw_blocked_result_counter] = $row["user_key"];
			}
		}
		$cw_blocked = $cw_blocked_result;
	}
	
	//user_contact
	function cw_user_contact_rights( $user_key, $type ){
		
		cw_blocked_load();
		
		global $mysqli_project;
		
		if(is_array($user_key)){
			$user_key_query = "'".implode("','", $user_key)."'";
		}
		else{
			$user_key_query = "'".$user_key."'";
		}
		
		$kursersteller = false;
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='online')");
		if(mysqli_num_rows( $ergebnis ) > 0){
			$kursersteller = true;
		}
		
		$result = [];
		
		if($type != 0){
			$type = "'".$type."'";
		}
		else{
			$type = "'private','support'";
		}
		
		$ergebnis = $mysqli_project->query("SELECT user_key, type, rights FROM user_msg_settings WHERE user_key IN (".$user_key_query.") AND type IN (".$type.")");
		if(mysqli_num_rows($ergebnis) > 0){
			while($row = $ergebnis->fetch_assoc()){
				
				$bool = false;
				$setting = $row["rights"];
				
				$rights = explode(",", $row["rights"]);
				
				for($x=0; $x<count($rights); $x++){
					
					if($rights[$x] == "all"){
						$bool = true;
					}
					if($rights[$x] == "creator"){
						if($kursersteller == true)
							$bool = true;
					}
					if($rights[$x] == "member"){
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$row["user_key"]."' AND rights='admin')");
						if(mysqli_num_rows( $ergebnis2 ) > 0){
							$bool = true;
						}
					}
					if($rights[$x] == "0"){
						$bool = false;
					}
				}
				
				if(cw_blocked( 0, $row["user_key"] )){
					$bool = false;
					$setting = "blocked_0";
				}
				if(cw_blocked( 1, $row["user_key"] )){
					$bool = false;
					$setting = "blocked_1";
				}
				if($row["user_key"] == $_SESSION["lc_user_key"]){
					$bool = false;
				}
				$result[$row["user_key"]][$row["type"]]["bool"] 	= $bool;
				$result[$row["user_key"]][$row["type"]]["setting"] 	= $setting;
			}
		}
		
		return $result;
	}
	
	
	function lc_check_rights( $mysqli_livechat, $lc_action, $lc_val, $lc_chatroom_id, $lc_chatroom_status, $lc_user_join, $lc_user_key, $lc_user_rights, $lc_user_key_action, $lc_user_rights_action ){
		
		cw_blocked_load();
		
		global $mysqli_project;
		
		$cw_chatroom_type = 0;
		
		if($lc_chatroom_id != 0 AND $lc_chatroom_id != ""){
			
			$ergebnis = $mysqli_project->query("SELECT type FROM chatrooms WHERE lc_chatroom_id='".$lc_chatroom_id."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$cw_chatroom_type = $row["type"];
				}
			}
		}
		
		$return = false;
		
		if($_SESSION["login"] == "true"){
			
			//chatroom
			if($lc_action == "create"){
				
				$chatroom_counter = 0;
				
				//max 5 chatrooms pro user
				$ergebnis = $mysqli_project->query("SELECT lc_chatroom_id FROM chatrooms WHERE user_key_host='".$lc_user_key."' AND type!='support_plattform'");
				while($row = $ergebnis->fetch_assoc()){
					
					$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE chatroom_id='".$row["lc_chatroom_id"]."' AND rights='admin'");
					if(mysqli_num_rows($ergebnis2))
						$chatroom_counter++;
				}
				
				if($chatroom_counter <= 5)
					$return = true;
				else
					$return = "max_chatrooms";
				
				//if kurschatroom
				$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_marketplace WHERE status='pre_online' AND kurs_id IN (SELECT ID FROM kurse WHERE user_key='".$_SESSION["lc_user_key"]."') LIMIT 1");
				if(mysqli_num_rows($ergebnis) > 0){
					
					while($row = $ergebnis->fetch_assoc()){
						$mysqli_project->query("UPDATE kurse_marketplace SET status='online' WHERE ID='".$row["ID"]."'");
					}
					$return = true;
				}
			}
			if($lc_action == "remove"){
				//only lc_mod and root
			}
			if($lc_action == "clear"){
				//only lc_mod and root
			}
			//update
			if($lc_action == "update_title"){
				
				if($lc_user_rights == "admin" AND $cw_chatroom_type != "kurs"){
					$return = true;
				}
			}
			if($lc_action == "update_max_users"){
				//only lc_mod and root
			}
			if($lc_action == "update_status"){
				
				if($lc_user_rights == "admin" AND ($lc_val == "open" OR $lc_val == "close") AND $cw_chatroom_type != "kurs"){
					$return = true;
				}
			}
			if($lc_action == "update_user_join"){
				
				if($lc_user_rights == "admin" AND $cw_chatroom_type != "kurs" AND ($lc_val == "open" OR $lc_val == "invite")){
					$return = true;
				}
			}
			if($lc_action == "update_readonly"){
				//only lc_mod and admin
			}
			
			if($lc_action == "private"){
				
				if(!cw_blocked(1, $lc_user_key_action)){
					
					//user_msg_settings
					$ergebnis = $mysqli_project->query("SELECT rights FROM user_msg_settings WHERE user_key='".$lc_user_key_action."' AND type='private'");
					while($row = $ergebnis->fetch_assoc()){
						
						if($row["rights"] == "all")
							$return = true;
						
						else{
							//nutzer / ersteller
							$ergebnis2 = $mysqli_project->query("SELECT status FROM user WHERE lc_user_key='".$lc_user_key."' AND status='".$row["rights"]."'");
							if(mysqli_num_rows ($ergebnis2) > 0)
								$return = true;
						}
					}
				}
			}
			
			if($lc_action == "send_msg"){
				
				if($cw_chatroom_type == "support_plattform"){
					$return = true;
				}
				else{
					$ergebnis = $mysqli_livechat->query("SELECT user_key FROM user_chatrooms WHERE chatroom_id='".$lc_chatroom_id."' AND user_key!='".$_SESSION["lc_user_key"]."'");
					if(mysqli_num_rows($ergebnis) == 1){
						
						while($row = $ergebnis->fetch_assoc()){
							
							if(!cw_blocked(1, $row["user_key"]))
								$return = true;
						}
					}
					else
						$return = true;
					
					if($return == false)
						$return = "blocked";
				}
			}
			
			//user
			if($lc_action == "add_user"){
				
				//only lc_mod/admin
			}
			if($lc_action == "remove_user"){
				
				$supporter = false;
				
				if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM chatrooms WHERE lc_chatroom_id='".$lc_chatroom_id."' AND type='support_plattform'") ) > 0 AND rights($_SESSION["lc_user_key"], "supporter"))
					$supporter = true;
				
				if(($lc_user_rights == "admin" AND $cw_chatroom_type != "kurs" AND $lc_user_rights_action != "admin" AND !rights( $lc_user_key_action, "lc_mod" ) AND !rights( $lc_user_key_action, "root" )) OR $supporter == true){
					$return = true;
				}
			}
			if($lc_action == "add_admin"){
				
				if($lc_user_rights == "admin" AND $cw_chatroom_type != "kurs" AND $lc_user_rights_action != "admin" AND $lc_user_rights_action != "invited" AND !rights( $lc_user_key_action, "lc_mod" ) AND !rights( $lc_user_key_action, "root" )){
					$return = true;
				}
			}
			if($lc_action == "remove_admin"){
				//only lc_mod and admin
			}
			
			if($lc_chatroom_status == "open"){
				
				if($lc_action == "invite_user"){
					
					if($lc_user_rights == "admin" AND $cw_chatroom_type != "kurs" /*AND !rights( $lc_user_key_action, "root" )*/ AND !cw_blocked(1, $lc_user_key_action)){
						$return = true;
					}
				}			
				if($lc_action == "user_join"){
					
					if( ($lc_user_join == "open" OR ($lc_user_join == "invite" AND $lc_user_rights == "invited")) AND $cw_chatroom_type != "kurs" ){
						
						$return = true;
					}
					if( $cw_chatroom_type == "kurs" ){
						
						$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$lc_user_key."' AND kurs_id IN (SELECT kurs_id FROM chatrooms WHERE lc_chatroom_id='".$lc_chatroom_id."')");
						
						if($lc_user_rights == -1 AND mysqli_num_rows($ergebnis)){
							
							$return = true;
						}
					}
				}
			}
			
			
			if($lc_action == "user_leave"){
				
				$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE chatroom_id='".$lc_chatroom_id."' AND rights='admin'");
				$ergebnis2 = $mysqli_project->query("SELECT ID FROM chatrooms WHERE lc_chatroom_id='".$lc_chatroom_id."' AND type='support_plattform'");
				
				if( mysqli_num_rows( $ergebnis ) > 1 ){
					
					$return = true;
				}
				else if( rights( $_SESSION["lc_user_key"], "supporter" ) AND mysqli_num_rows($ergebnis2) > 0 ){
					//support
					$return = true;
				}
				else if($cw_chatroom_type == "admin_create")
					$return = true;
				else
					$return = "admin_needed";
				
				if($cw_chatroom_type == "kurs")
					$return = false;
			}
			if($lc_action == "user_leave_remove"){
				
				if($lc_user_rights == "removed" OR $lc_user_rights == "left")
					$return = true;
				else
					$return = "first_left_or_remove";
			}
			
			if($lc_action == "user_invite_reject"){
				
				if($lc_user_rights == "invited")
					$return = true;
			}
			
			if($lc_action == "user_remove"){
				
				//only lc_mod/root
			}
		}
		else{
			//Support
			if($lc_action == "create"){
				//max ein chatroom (support)
				$ergebnis = $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE user_key='".$lc_user_key."'");
				if(mysqli_num_rows($ergebnis) <= 1)
					$return = true;
			}
			if($lc_action == "send_msg"){
				if($cw_chatroom_type == "support_plattform")
					$return = true;
			}
				
		}
		if($lc_action == "add_user"){
			//support_plattform
			$ergebnis = $mysqli_project->query("SELECT ID FROM chatrooms WHERE lc_chatroom_id='".$lc_chatroom_id."' AND type='support_plattform'");
			if(rights( $lc_user_key_action, "supporter" ) AND mysqli_num_rows($ergebnis) > 0)
				$return = true;
		}
		
		
		
		if(rights( $_SESSION["lc_user_key"], "root" ) OR rights( $_SESSION["lc_user_key"], "lc_mod" ))
			$return = true;
		
		if($return == false)
			$return = "rights_error";
		
		return($return);
	}
	
	function cw_check_rights( $action, $chatroom_id, $val, $user_key, $user_key_action ){
		
		cw_blocked_load();
		
		$return = false;
		
		global $mysqli_project, $mysqli_livechat;
		
		$user_rights = 0;
		$ergebnis = $mysqli_livechat->query("SELECT rights FROM user_chatrooms WHERE chatroom_id='".$chatroom_id."' AND user_key='".$user_key."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$user_rights = $row["rights"];
			}
		}
		
		$chatroom_type = 0;
		$user_key_host = 0;
		$ergebnis = $mysqli_project->query("SELECT type, user_key_host FROM chatrooms WHERE lc_chatroom_id='".$chatroom_id."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$chatroom_type = $row["type"];
				$user_key_host = $row["user_key_host"];
			}
		}
		
		
		if($action == "chatroom_create"){
			
			//lc_chatroom_created && cw_chatroom not created
			if(($user_rights == "admin" OR $user_rights == "private") AND $chatroom_type == 0){
				
				$return = true;
			}
		}
		if($action == "chatroom_remove"){
			//only root and lc_mod
		}
		
		//chatroom_update
		if($action == "chatroom_update_icon"){
			
			if($user_rights == "admin" AND $chatroom_type == "user_create"){
				
				$ergebnis = $mysqli_project->query("SELECT ID FROM chatrooms WHERE lc_chatroom_id='".$chatroom_id."' AND icon_type='img'");
				if(mysqli_num_rows($ergebnis) > 0){
					
					$ergebnis = $mysqli_project->query("SELECT ID FROM media WHERE ID='".$val."' AND user_key='".$_SESSION["lc_user_key"]."'");
					if(mysqli_num_rows($ergebnis) > 0){
						$return = true;
					}
				}
				else
					$return = true;
			}
		}
		if($action == "chatroom_update_icon_type"){
			
			if($user_rights == "admin" AND $chatroom_type == "user_create"){
				$return = true;
			}
		}
		if($action == "chatroom_update_category"){
			
			if($user_rights == "admin" AND $chatroom_type == "user_create"){
				
				$ergebnis = $mysqli_project->query("SELECT ID FROM category WHERE ID='".$val."'");
				if(mysqli_num_rows($ergebnis) > 0){
				
					$return = true;
				}
			}
		}
		
		//block
		if($action == "user_block"){
			
			if(!cw_blocked(0, $user_key_action) AND !rights( $user_key_action, "root" ) AND !rights( $user_key_action, "lc_mod" ) AND !rights( $user_key_action, "supporter" )){
				$return = true;
			}
		}
		
		if(rights( $_SESSION["lc_user_key"], "root" ) OR rights( $_SESSION["lc_user_key"], "lc_mod" ))
			$return = true;
		
		if($return == false)
			$return = "rights_error";
		
		return($return);
	}
	
	function kurse_check_rights( $kurs_id, $user_key ){
		
		global $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$user_key."' AND kurs_id='".$kurs_id."' AND rights='admin'");
		if(mysqli_num_rows($ergebnis) > 0){
			return true;
		}
		else
			return false;
	}
	
	function upload_check_rights($type, $extension){
		
		$return = false;
		
		if($type == "cw_icon" OR $type == "pb"){
		
			$allow_ext = Array(".jpg", ".jpeg", ".png", ".gif");
		}
		if($type == "kurs_file"){
		
			$allow_ext = Array(".jpg", ".jpeg", ".png", ".gif", ".pdf");
		}
		if($type == "video_thumb"){
			
			$allow_ext = Array(".jpg", ".jpeg", ".png", ".gif");
		}
		
		for($x=0; $x<count($allow_ext); $x++){
			if($allow_ext[$x] == $extension)
				$return = true;
		}
		return($return);
	}
	
	function project_msg_rights($dest_id){
		
		$rights = false;
		
		global $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT user_key, type, dest_type, dest_id, layer FROM msg WHERE ID='".$dest_id."'");
		
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["type"] == "post"){
					
					if($row["dest_type"] == "kurs"){
						
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$row["dest_id"]."'");
						if(mysqli_num_rows($ergebnis2) > 0){
							
							$rights = true;
						}
					}
					if($row["dest_type"] == "creator"){
						
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$row["user_key"]."' AND rights='admin')");
						if(mysqli_num_rows($ergebnis2) > 0){
							
							$rights = true;
						}
					}
					if($row["dest_type"] == "unigrow_user"){
						$rights = true;
					}
					if($row["dest_type"] == "unigrow_creator"){
						
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin'");
						if(mysqli_num_rows($ergebnis2) > 0){
							$rights = true;
						}
					}
				}
				if($row["type"] == "unigrow_creator"){
					
					$ergebnis2 = $mysqli_project->query("SELECT ID FROM kurse WHERE user_key='".$_SESSION["lc_user_key"]."'");
					if(mysqli_num_rows($ergebnis2) > 0){
						$rights = true;
					}
				}
				if($row["type"] == "unigrow_user"){
					$rights = true;
				}
				if($row["type"] == "module"){
					$rights = true;
				}
				if($row["type"] == "review"){
					$rights = true;
				}
			}
		}
		
		return $rights;
	}
	
	function review_post_rights($dest_type, $dest_id){
		
		$rights = false;
		
		global $mysqli_project;
		
		if($dest_type == "kurs"){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$dest_id."' AND rights='0'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$ergebnis = $mysqli_project->query("SELECT ID FROM review WHERE user_key='".$_SESSION["lc_user_key"]."' AND dest_type='".$dest_type."' AND dest_id='".$dest_id."'");
				if(mysqli_num_rows($ergebnis) == 0)
					$rights = true;
			}
		}
		
		return $rights;
	}
?>