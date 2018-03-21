<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	$task = 0;
	if(isset($post["task"]))
		$task = $post["task"];
	
	include("../config.php");
	include("init.php");
	
	if(is_file("../".$rights_file))
		include("../".$rights_file);

    function generateRandomString ($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

	function check_rights( $action, $chatroom_id, $val, $user_key, $user_key_action ){
		
		global $mysqli_livechat;
		
		if($chatroom_id == 0 OR mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM chatrooms WHERE ID='".$chatroom_id."'") ) > 0){
			if($user_key == 0 OR mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM user WHERE user_key='".$user_key."'") ) > 0){
				if($user_key_action == 0 OR mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM user WHERE user_key='".$user_key_action."'") ) > 0){
					
					global $rights_file;
				
					if(is_file("../".$rights_file)){
						
						$user_rights = -1;
						$user_rights_action = -1;
						
						$ergebnis = $mysqli_livechat->query("SELECT rights, user_key FROM user_chatrooms WHERE chatroom_id='".$chatroom_id."' AND (user_key='".$user_key."' OR user_key='".$user_key_action."')");
						if(mysqli_num_rows($ergebnis) > 0){
							while($row = $ergebnis->fetch_assoc()){
								
								if($row["user_key"] == $user_key)
									$user_rights = $row["rights"];
								else if($row["user_key"] == $user_key_action)
									$user_rights_action = $row["rights"];
							}
						}
						
						$chatroom_status = 0;
						$user_join = 0;
						$ergebnis = $mysqli_livechat->query("SELECT status, user_join FROM chatrooms WHERE ID='".$chatroom_id."'");
						while($row = $ergebnis->fetch_assoc()){
							$chatroom_status 	= $row["status"];
							$user_join 			= $row["user_join"];
						}
						
						return lc_check_rights( $mysqli_livechat, $action, $val, $chatroom_id, $chatroom_status, $user_join, $user_key, $user_rights, $user_key_action, $user_rights_action );
					}
					else
						return true;
				}
				else
					return "invalid_user_key_action";
			}
			else
				return "invalid_user_key";
		}
		else
			return "invalid_chatroom_id";
	}
	
	function check_user_receive( $chatroom_id, $timestamp ){
		
		$result = false;
		$timestamp = intval($timestamp);
		
		if(isset($_SESSION["lc_user_receive"][$chatroom_id])){
			for($x=0; $x<count($_SESSION["lc_user_receive"][$chatroom_id]); $x++){
				
				$join 	= intval($_SESSION["lc_user_receive"][$chatroom_id][$x][0]);
				$leave 	= intval($_SESSION["lc_user_receive"][$chatroom_id][$x][1]);
				
				if(($timestamp >= $join && $timestamp <= $leave) OR ($leave == 0 AND $timestamp >= $join))
					$result = true;
			}
		}
		
		return $result;
	}
	
	
	
	if($task == "user_register"){
        $mysqli_livechat->query("INSERT INTO user (user_key, status) VALUES ('".$_SESSION["lc_user_key"]."', 'temporary')");
		$mysqli_livechat->query("UPDATE user SET status='registered' WHERE user_key='".$_SESSION["lc_user_key"]."'");
	}

	
	//init notifications
	if($task == "notifications_receive"){

	    $ergebnis = $mysqli_livechat->query("SELECT chatroom_id, last_msg, last_report FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND notifications=1");

	    if (mysqli_num_rows($ergebnis) > 0){
	        $x=0;
	        while ($row = $ergebnis->fetch_assoc()){
                //msg
                $ergebnis_msg = $mysqli_livechat->query("SELECT ID FROM msg WHERE chatroom_id='".$row["chatroom_id"]."' AND ID>".$row["last_msg"]);
                //report
                $ergebnis_report = $mysqli_livechat->query("SELECT ID FROM chatroom_report WHERE chatroom_id='".$row["chatroom_id"]."' AND ID>".$row["last_report"]." AND report='invite_user'");

                $result[$x]["id"] = $row["chatroom_id"];
                $result[$x]["msg"] = mysqli_num_rows($ergebnis_msg);
                $result[$x]["report"] = mysqli_num_rows($ergebnis_report);

                $x++;
	        }

	        echo json_encode($result);
        }
	}
	if($task == "notifications_reset"){
		$ergebnis = $mysqli_livechat->query("UPDATE user_chatrooms SET last_msg=(SELECT ID FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY ID DESC LIMIT 1),
		                                                                      last_report=(SELECT ID FROM chatroom_report WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY ID DESC LIMIT 1) WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
	}
	
	
	//chatrooms
	
	if($task == "chatroom_create"){
		
		$check_rights = check_rights( "create", 0, 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
		
			$mysqli_livechat->query("INSERT INTO chatrooms (title, max_users, status, user_join, readonly)
									VALUES ('".$post["title"]."' ,".$post["max_users"].", 'open', '".$post["user_join"]."', '".$post["readonly"]."') ");
			$new_id = $mysqli_livechat->insert_id;
			
			$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, rights, receiving_type)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', 'admin', '".$post["receiving_type"]."')");
									
			$mysqli_livechat->query("INSERT INTO user_receive (chatroom_id, user_key, join_timestamp, leave_timestamp)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', '".time()."', '0')");
			
			user_receive_refresh();
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, report, timestamp)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', 'create', '".time()."')");
			
			echo $new_id;
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_remove"){
		
		$check_rights = check_rights( "remove", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){

            $mysqli_livechat->query("DELETE FROM chatrooms WHERE ID='".$post["chatroom_id"]."'");
            $mysqli_livechat->query("DELETE FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."'");
            $mysqli_livechat->query("DELETE FROM user_receive WHERE chatroom_id='".$post["chatroom_id"]."'");
            $mysqli_livechat->query("DELETE FROM msg WHERE chatroom_id='".$post["chatroom_id"]."'");
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', 'remove', '".time()."')");
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_clear"){
		
		//leeren
		$check_rights = check_rights( "clear", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0, 0 );
		
		if($check_rights === true){
			
			$mysqli_livechat->query("DELETE FROM msg WHERE chatroom_id='".$post["chatroom_id"]."'");
			$mysqli_livechat->query("DELETE FROM chatroom_report WHERE chatroom_id='".$post["chatroom_id"]."' AND report!='create'");
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', 'clear', '".time()."')");
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_update"){
		
		$val = $post["val"];
		
		$check_rights = check_rights( "update_".$post["attr"], $post["chatroom_id"], $val, $_SESSION["lc_user_key"], 0, $post["val"] );
		
		if($check_rights === true){
			
			$ergebnis = $mysqli_livechat->query("SELECT ID FROM chatrooms WHERE ID='".$post["chatroom_id"]."' AND ".$post["attr"]."='".$post["val"]."'");
			if(mysqli_num_rows($ergebnis) == 0){
						
				$mysqli_livechat->query("UPDATE chatrooms SET ".$post["attr"]."='".$val."' WHERE ID='".$post["chatroom_id"]."'");
				
				if($post["attr"] == "status"){
					//chatroom_report
					$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, report, timestamp)
											VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$val."', '".time()."')");
				}
			}
		}
		else
			echo $check_rights;
	}
	
	
	if($task == "chatroom_add_user"){
		
		$check_rights = check_rights( "add_user", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			//!if user is already member
			if(mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."' AND rights NOT IN ('left','removed','invited','invite_user_cancel_remove')") ) == 0){
			
				//invite_user_cancel_remove?
				$mysqli_livechat->query("DELETE FROM chatroom_report WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."' AND report='invite_user_cancel_remove'");
			
				$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
				if(mysqli_num_rows($ergebnis) > 0){
					
					$mysqli_livechat->query("UPDATE user_chatrooms SET rights='0' WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
				}
				else{
					$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, rights, receiving_type)
											VALUES ('".$post["chatroom_id"]."', '".$post["user_key"]."', 0, '".$post["receiving_type"]."')");
				}
				
				$mysqli_livechat->query("INSERT INTO user_receive (chatroom_id, user_key, join_timestamp, leave_timestamp)
										VALUES ('".$post["chatroom_id"]."', '".$post["user_key"]."', '".time()."', '0')");
				
				//chatroom_report
				$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
											VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'add_user', '".time()."')");
			}
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_add_admin"){
		
		$check_rights = check_rights( "add_admin", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			$mysqli_livechat->query("UPDATE user_chatrooms SET rights='admin' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
			
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'add_admin', '".time()."')");
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_remove_admin"){
		
		$check_rights = check_rights( "remove_admin", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			$mysqli_livechat->query("UPDATE user_chatrooms SET rights='0' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
			
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'remove_admin', '".time()."')");
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_remove_user"){
		
		$check_rights = check_rights( "remove_user", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			$user_chatrooms_invite = 0;
			
			$ergebnis = $mysqli_livechat->query("SELECT rights FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["rights"] != "invited"){
					//chatroom_report
					$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
											VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'remove_user', '".time()."')");
				}
				else{
					$report = "invite_user_cancel";
					
					$user_chatrooms_invite = 1;
					
					$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
					if(mysqli_num_rows($ergebnis2) > 0){
						
						$ergebnis3 = $mysqli_livechat->query("SELECT * FROM user_receive WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
						if(mysqli_num_rows($ergebnis3) == 0){
							
							//falls noch nie beigetreten
							$report = "invite_user_cancel_remove";
							$mysqli_livechat->query("UPDATE user_chatrooms SET rights='invite_user_cancel_remove' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
							
							//delete > task == 'chatroom_invite_cancel_remove'
						}
						else{
							
							$last_rights = "";
							
							$ergebnis4 = $mysqli_livechat->query("SELECT report FROM chatroom_report WHERE user_key_action='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."' AND report!='invite_user_cancel' AND report!='invite_user' ORDER BY ID DESC LIMIT 1");
							while($row4 = $ergebnis4->fetch_assoc()){
								
								if($row4["report"] == "remove_user")
									$last_rights = "removed";
								if($row4["report"] == "user_leave")
									$last_rights = "left";
							}
							
							$mysqli_livechat->query("UPDATE user_chatrooms SET rights='".$last_rights."' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
						}
					}
					
					//chatroom_report
					$mysqli_livechat->query("UPDATE chatroom_report SET timestamp='".time()."', report='".$report."' WHERE user_key_action='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."' AND report='invite_user'");
				}
			}
			if($user_chatrooms_invite == 0){
				$mysqli_livechat->query("UPDATE user_chatrooms SET rights='removed' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
				
				$mysqli_livechat->query("UPDATE user_receive SET leave_timestamp='".time()."' WHERE leave_timestamp='0' AND chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
			}
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_invite_cancel_remove"){
		
		$ergebnis = $mysqli_livechat->query("SELECT chatroom_id FROM chatroom_report WHERE user_key_action='".$_SESSION["lc_user_key"]."' AND report='invite_user_cancel_remove'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$mysqli_livechat->query("DELETE FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$row["chatroom_id"]."'");
				$mysqli_livechat->query("DELETE FROM user_receive WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$row["chatroom_id"]."'");
			}
			
			$mysqli_livechat->query("DELETE FROM chatroom_report WHERE user_key_action='".$_SESSION["lc_user_key"]."' AND report='invite_user_cancel_remove'");
		}
	}
	if($task == "chatroom_invite_user"){
		
		$check_rights = check_rights( "invite_user", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			//if user is already member
			if(mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."' AND rights NOT IN ('left','removed','invite_user_cancel_remove')") ) == 0){
			
				//invite_user_cancel_remove?
				$mysqli_livechat->query("DELETE FROM chatroom_report WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$post["user_key"]."' AND report='invite_user_cancel_remove'");
			
				$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
				if(mysqli_num_rows($ergebnis) == 0){
				
					$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, receiving_type, rights)
											VALUES ('".$post["chatroom_id"]."', '".$post["user_key"]."', '".$post["receiving_type"]."', 'invited')");
				}
				else{
					$mysqli_livechat->query("UPDATE user_chatrooms SET rights='invited' WHERE user_key='".$post["user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
				}
				
				//chatroom_report
				$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
										VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'invite_user', '".time()."')");
			}
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_user_join"){
		
		$check_rights = check_rights( "user_join", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
			
			if(mysqli_num_rows($mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'")) > 0)
				$mysqli_livechat->query("UPDATE user_chatrooms SET rights='0' WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$_SESSION["lc_user_key"]."'");
			else
				$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, notifications, receiving_type, rights)
										VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '1', 'offline', '0')");
			
			$mysqli_livechat->query("INSERT INTO user_receive (chatroom_id, user_key, join_timestamp, leave_timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".time()."', '0')");
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', 'user_join', '".time()."')");
			
			user_receive_refresh();
		}
		else
			echo $check_rights;
		
		
	}
	if($task == "chatroom_user_leave"){
		
		$check_rights = check_rights( "user_leave", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
			
			$mysqli_livechat->query("UPDATE user_chatrooms SET rights='left' WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
			
			$mysqli_livechat->query("UPDATE user_receive SET leave_timestamp='".time()."' WHERE leave_timestamp='0' AND user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$_SESSION["lc_user_key"]."', 'user_leave', '".time()."')");
									
			user_receive_refresh();			
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_user_leave_remove"){
		
		$check_rights = check_rights( "user_leave_remove", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
		
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$post["chatroom_id"]."', '', '".$_SESSION["lc_user_key"]."', 'user_leave_remove', '".time()."')");
			
			// > refresh > chatroom_user_leave_remove_action
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_user_leave_remove_action"){
		
		$mysqli_livechat->query("DELETE FROM chatroom_report WHERE user_key_action='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."' AND report='user_leave_remove'");
		$mysqli_livechat->query("DELETE FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
	}
	
	if($task == "chatroom_user_invite_reject"){
		
		$check_rights = check_rights( "user_invite_reject", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
			
			$ergebnis = $mysqli_livechat->query("SELECT user_key FROM chatroom_report WHERE report='invite_user' AND user_key_action='".$_SESSION["lc_user_key"]."' ORDER BY timestamp DESC LIMIT 1");
			
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					//chatroom_report
					$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
											 VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$row["user_key"]."', 'user_invite_reject', '".time()."')");
				}
				
				$mysqli_livechat->query("DELETE FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
			}
			
			user_receive_refresh();	
		}
		else
			echo $check_rights;
	}
	
	if($task == "chatroom_user_readonly"){
		
		$ergebnis1 = $mysqli_livechat->query("SELECT ID FROM chatrooms WHERE ID='".$post["chatroom_id"]."' AND readonly=1");
		$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
		
		if(mysqli_num_rows($ergebnis1) > 0){
			
			if(mysqli_num_rows($ergebnis2) == 0){
				
				$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, notifications, receiving_type, rights)
										VALUES ('".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '0', 'online', 'readonly')");
			}
		}
		else{
			echo "readonly_join_error";
		}
	}
	if($task == "chatroom_private"){
		
		$check_rights = check_rights( "private", 0, 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
		
			$mysqli_livechat->query("INSERT INTO chatrooms (title, max_users, status, user_join, readonly)
									VALUES ('' ,2, 'open', '0', '0')");
									
			$new_id = $mysqli_livechat->insert_id;
			$chatroom_id = $new_id;
		
			$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, rights, receiving_type)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', 'private', '".$post["receiving_type"]."')");
			$mysqli_livechat->query("INSERT INTO user_chatrooms (chatroom_id, user_key, rights, receiving_type)
									VALUES ('".$new_id."', '".$post["user_key"]."', 'private', '".$post["receiving_type"]."')");
			
			$mysqli_livechat->query("INSERT INTO user_receive (chatroom_id, user_key, join_timestamp, leave_timestamp)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', '".(time()-1)."', '0')");
			$mysqli_livechat->query("INSERT INTO user_receive (chatroom_id, user_key, join_timestamp, leave_timestamp)
									VALUES ('".$new_id."', '".$post["user_key"]."', '".(time()-1)."', '0')");
			
			user_receive_refresh();
			
			//chatroom_report
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', '', 'create', '".time()."')");
			$mysqli_livechat->query("INSERT INTO chatroom_report (chatroom_id, user_key, user_key_action, report, timestamp)
									VALUES ('".$new_id."', '".$_SESSION["lc_user_key"]."', '".$post["user_key"]."', 'add_user', '".time()."')");
			
			echo $chatroom_id;
		}
		else
			echo $check_rights;
	}
	if($task == "chatroom_private_check"){
		
		$chatroom_id = [];
		$x=0;
		
		$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."'");
		while($row = $ergebnis->fetch_assoc()){
			
			$ergebnis2 = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE chatroom_id='".$row["chatroom_id"]."' AND user_key='".$post["user_key"]."'");
			
			if(mysqli_num_rows($ergebnis2) > 0){
				
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$ergebnis3 = $mysqli_livechat->query("SELECT * FROM chatrooms WHERE ID='".$row["chatroom_id"]."' AND max_users=2");
					if( mysqli_num_rows($ergebnis3) > 0 ){
						$chatroom_id[$x] = $row["chatroom_id"];
						$x++;
					}
				}
			}
		}
		
		if(count($chatroom_id) > 0)
			echo json_encode($chatroom_id);
	}
	
	//chatroom_receive functions
	if($task == "chatroom_id_receive"){
		
		$ergebnis = $mysqli_livechat->query("SELECT chatroom_id FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights!='invite_user_cancel_remove'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x]	= $row["chatroom_id"];
				$x++;
			}
			
			echo json_encode($result);
		}
	}
	if($task == "chatroom_id_receive_search"){
		
		$ergebnis = $mysqli_livechat->query("SELECT ID FROM chatrooms WHERE title LIKE '".$post["search_str"]."%'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x]	= $row["ID"];
				$x++;
			}
			
			echo json_encode($result);
		}
	}
	if($task == "chatroom_preview_receive"){
		
		$result = [];
		$result_counter = 0;
		
		for($x=0; $x<count($post["chatroom_id"]); $x++){
			
			if(is_array($post["chatroom_id"]))
				$chatroom_id = $post["chatroom_id"][$x];
			else
				$chatroom_id = $post["chatroom_id"];
			
			$ergebnis = $mysqli_livechat->query("SELECT * FROM chatrooms WHERE ID='".$chatroom_id."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$ergebnis2 = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$chatroom_id."'");
				$ergebnis3 = $mysqli_livechat->query("SELECT * FROM chatrooms WHERE ID='".$chatroom_id."' AND readonly=1");
				$ergebnis4 = $mysqli_livechat->query("SELECT * FROM chatrooms WHERE ID='".$chatroom_id."'");
				
				if(mysqli_num_rows($ergebnis2) > 0 OR mysqli_num_rows($ergebnis3) > 0 OR mysqli_num_rows($ergebnis4) > 0){
					
					$result[$result_counter]["member"] = mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM user_chatrooms WHERE chatroom_id='".$chatroom_id."' AND (rights='0' OR rights='admin' OR rights='readonly')") );
					
					while($row = $ergebnis->fetch_assoc()){
						
						$result[$result_counter]["id"]			= $row["ID"];
						
						$result[$result_counter]["private_user"] = "";
						
						if($row["max_users"] == "2" AND $row["title"] == ""){
							
							$ergebnis_private = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE chatroom_id='".$chatroom_id."' AND user_key!='".$_SESSION["lc_user_key"]."'");
							while($row_private = $ergebnis_private->fetch_assoc()){
								
								$result[$result_counter]["private_user"] = $row_private["user_key"];
								$result[$result_counter]["title"] = $row_private["user_key"];
								
								$ergebnis_private2 = $mysqli_livechat->query("SELECT * FROM user WHERE user_key='".$row_private["user_key"]."'");
								while($row_private2 = $ergebnis_private2->fetch_assoc()){
									
									$result[$result_counter]["private_user_status"] = $row_private2["status"];
								}
							}
						}
						else
							$result[$result_counter]["title"] 	= $row["title"];
						
						if(mysqli_num_rows($ergebnis4) > 0)
							$result[$result_counter]["rights"] 	= "no-member";
						if(mysqli_num_rows($ergebnis3) > 0)
							$result[$result_counter]["rights"] 	= "readonly";
						
						while($row2 = $ergebnis2->fetch_assoc()){
							$result[$result_counter]["rights"] 	= $row2["rights"];
						}
						
						
						//timestamp
						if($result[$result_counter]["rights"] != "removed" AND $result[$result_counter]["rights"] != "left" AND $result[$result_counter]["rights"] != "invited"){
							$ergebnis5 = $mysqli_livechat->query("SELECT timestamp FROM msg WHERE chatroom_id='".$row["ID"]."' ORDER BY timestamp DESC LIMIT 1");
							if(mysqli_num_rows($ergebnis5) > 0){
								
								while($row5 = $ergebnis5->fetch_assoc()){
									
									if(check_user_receive($row["ID"], $row5["timestamp"])){
										$result[$result_counter]["timestamp"] = $row5["timestamp"];
									}
								}
							}
						}
						
						if(!isset($result[$result_counter]["timestamp"])){
							$ergebnis5 = $mysqli_livechat->query("SELECT timestamp FROM chatroom_report WHERE chatroom_id='".$row["ID"]."' AND (user_key_action='".$_SESSION["lc_user_key"]."' OR user_key='".$_SESSION["lc_user_key"]."') ORDER BY timestamp DESC LIMIT 1"); 
				
							while($row5 = $ergebnis5->fetch_assoc()){
								
								$result[$result_counter]["timestamp"] = $row5["timestamp"];
							}
						}
					}
					$result_counter++;
				}
			}
		}
		
		if(count($result) > 0){
			echo json_encode($result);
		}

	}
	if($task == "chatroom_info_receive"){
		
		$info = [];
		
		$ergebnis = $mysqli_livechat->query("SELECT title, max_users, status, user_join, readonly FROM chatrooms WHERE ID='".$post["chatroom_id"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$info["title"] 		= $row["title"];
				$info["max_users"] 	= $row["max_users"];
				$info["status"] 	= $row["status"];
				$info["user_join"]	= $row["user_join"];
				$info["readonly"]	= $row["readonly"];
				
				$x=0;
				
				$ergebnis2 = $mysqli_livechat->query("SELECT user_key, rights FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."' AND rights!='removed' AND rights!='invite' AND rights!='left' AND rights!='invite_user_cancel_remove'");
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$info["user_key"][$x] = $row2["user_key"];
					$info["user_rights"][$x] = $row2["rights"];
					$x++;
				}
				$ergebnis2 = $mysqli_livechat->query("SELECT user_key, rights FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."' AND rights='invite'");
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$info["user_key"][$x] = $row2["user_key"];
					$info["user_rights"][$x] = $row2["rights"];
					$x++;
				}
				
				$ergebnis2 = $mysqli_livechat->query("SELECT rights FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
				while($row2 = $ergebnis2->fetch_assoc()){
					$info["rights"] = $row2["rights"];
				}
				
			}
		}
		
		if(count($info) > 0)
			echo json_encode($info);
	}
	
	
	//user

	if($task == "user_notifications"){
		
		$mysqli_livechat->query("UPDATE user_chatrooms SET notifications='".$post["val"]."' WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
	}
	if($task == "user_notifications_receive"){
		
		$ergebnis = $mysqli_livechat->query("SELECT notifications FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
		if(mysqli_num_rows( $ergebnis ) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				echo $row["notifications"];
			}
		}
	}
	if($task == "user_recommend"){
		
		$chatroom_id_string	= "";
			
		$ergebnis = $mysqli_livechat->query("SELECT chatroom_id, receiving_type FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights!='invited'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$chatroom_id_string .= $row["chatroom_id"].",";
				$receiving_type[$row["chatroom_id"]] = $row["receiving_type"];
			}
			$chatroom_id_string = substr_replace($chatroom_id_string, "", -1);
		}
		
		if($chatroom_id_string != ""){
			
			$ergebnis = $mysqli_livechat->query("SELECT user_key FROM user_chatrooms WHERE chatroom_id IN (".$chatroom_id_string.") AND user_key!='".$_SESSION["lc_user_key"]."'");
			$user_key_string = "";
			
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					$user_key_string .= "'".$row["user_key"]."',";
				}
				
				$user_key_string = substr_replace($user_key_string, "", -1);

				$ergebnis = $mysqli_livechat->query("SELECT user_key FROM user WHERE user_key IN (".$user_key_string.") AND status='registered' LIMIT ".$post["anzahl"]);
				
				if(mysqli_num_rows($ergebnis) > 0){
					
					$x=0;
					$result = [];
					
					while($row = $ergebnis->fetch_assoc()){
						$result[$x] = $row["user_key"];
						$x++;
					}
					
					echo json_encode($result);
				}
			}
		}
	}
	
	if($task == "user_remove"){
		
		$check_rights = check_rights( "user_remove", 0, 0, $_SESSION["lc_user_key"], $post["user_key"] );
		
		if($check_rights === true){
			
			if($post["type"] == "anonymize"){
				
				$mysqli_livechat->query("UPDATE user SET status='anonym' WHERE user_key='".$post["user_key"]."'");
				$mysqli_livechat->query("DELETE FROM user_chatrooms WHERE user_key='".$post["user_key"]."' AND rights!='private'");
			}
			else if($post["type"] == "remove"){				
				$mysqli_livechat->query("DELETE FROM user WHERE user_key='".$post["user_key"]."'");
				$mysqli_livechat->query("DELETE FROM user_chatrooms WHERE user_key='".$post["user_key"]."'");
				$mysqli_livechat->query("DELETE FROM user_receive WHERE user_key='".$post["user_key"]."'");
				
				$mysqli_livechat->query("DELETE FROM msg WHERE user_src_key='".$post["user_key"]."'");
				
				$mysqli_livechat->query("DELETE FROM chatroom_report WHERE user_key='".$post["user_key"]."'");
				$mysqli_livechat->query("DELETE FROM chatroom_report WHERE user_key_action='".$post["user_key"]."'");
			}
		}
		else{
			echo $check_rights;
		}
	}
	
	
	//msg
	
	if($task == "send_msg"){
		
		$check_rights = check_rights( "send_msg", $post["chatroom_id"], 0, $_SESSION["lc_user_key"], 0 );
		
		if($check_rights === true){
			
			$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE chatroom_id='".$post["chatroom_id"]."' AND user_key='".$_SESSION["lc_user_key"]."' AND rights!='removed' AND rights!='invited' AND rights!='readonly' AND rights!='left'");
			if(mysqli_num_rows( $ergebnis ) > 0){
				
				$time = time();
				
				//get next wrapper
				$wrap_msg = 1;
				$ergebnis = $mysqli_livechat->query("SELECT wrap_msg FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY wrap_msg DESC LIMIT 1");
				if(mysqli_num_rows($ergebnis) > 0){
					
					while($row = $ergebnis->fetch_assoc()){
						
						$wrap_msg = intval($row["wrap_msg"]) +1;
					}
				}
				
				//check wrapper
				//check timestamp max. 30s after last msg ; last_msg_element > wrap_msg
				$ergebnis = $mysqli_livechat->query("SELECT timestamp, wrap_msg FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' AND user_src_key='".$_SESSION["lc_user_key"]."' AND wrap_msg=". ($wrap_msg-1) ." ORDER BY timestamp, ID DESC LIMIT 1");
				if(mysqli_num_rows($ergebnis) > 0){
					
					while($row = $ergebnis->fetch_assoc()){
						if($time-intval($row["timestamp"]) < 30){
							
							//last element > report or other msg?
							if( mysqli_num_rows( $mysqli_livechat->query("SELECT ID FROM chatroom_report WHERE timestamp>".intval($row["timestamp"])) ) == 0)
								$wrap_msg = $row["wrap_msg"];
						}						
					}
				}
				
				$mysqli_livechat->query("INSERT INTO msg (content, chatroom_id, user_src_key, timestamp, wrap_msg)
										VALUES ('".$post["content"]."', '".$post["chatroom_id"]."', '".$_SESSION["lc_user_key"]."', '".$time."', ".$wrap_msg.")");
				
				$result["id"] = $mysqli_livechat->insert_id;
				$result["user_key"] = $_SESSION["lc_user_key"];
				$result["timestamp"] = $time;
				$result["wrap_msg"] = $wrap_msg;

				echo json_encode($result);
			}
		}
		else{
			echo $check_rights;
		}
	}
	
	
	//chatroom_init
	
	if($task == "receive_chatroom"){
		
		$ergebnis = $mysqli_livechat->query("SELECT * FROM user_chatrooms WHERE user_key='".$_SESSION["lc_user_key"]."' AND chatroom_id='".$post["chatroom_id"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			$content = 0;
			
			$min_timestamp = 0;
			$max_timestamp = time();
			
			$complete = true;
			
			
			$ergebnis = $mysqli_livechat->query("SELECT * FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY ID DESC LIMIT ".$post["start_msg"].",".($post["anzahl_msg"]+1));
			
			if(mysqli_num_rows($ergebnis)){

				$content = 1;
				
				$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY ID ASC LIMIT 1");
				while($row2 = $ergebnis2->fetch_assoc()){
					$min_id = $row2["ID"];
				}
				$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM msg WHERE chatroom_id='".$post["chatroom_id"]."' ORDER BY ID DESC LIMIT 1");
				while($row2 = $ergebnis2->fetch_assoc()){
					$max_id = $row2["ID"];
				}
				
				while($row = $ergebnis->fetch_assoc()){
					
					if(check_user_receive( $row["chatroom_id"], $row["timestamp"] )){
						
						if($x == 0){
							$max_timestamp = $row["timestamp"];
						}
						if($x < mysqli_num_rows($ergebnis)-1 OR $x <= $post["anzahl_msg"]-1){
							
							$result[$x]["type"]			= "msg";
							$result[$x]["id"]			= $row["ID"];
							$result[$x]["content"] 		= $row["content"];
							$result[$x]["user_src_key"] = $row["user_src_key"];
							$result[$x]["timestamp"] 	= $row["timestamp"];
							$result[$x]["wrap_msg"] 	= $row["wrap_msg"];

							$min_timestamp 				= $row["timestamp"];
						
							$x++;
						}
						else{
							$complete = false;
						}
					}
				}
			}
			
			if($complete == true){
				$min_timestamp = 0;
				$max_timestamp = time();
			}
			
			$ergebnis = $mysqli_livechat->query("SELECT * FROM chatroom_report WHERE timestamp>=".$min_timestamp." AND timestamp<=".$max_timestamp." AND chatroom_id='".$post["chatroom_id"]."' ORDER BY ID DESC");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$content = 1;
				
				while($row = $ergebnis->fetch_assoc()){
					
					if(check_user_receive( $row["chatroom_id"], $row["timestamp"] )){
						
						$result[$x]["type"]				= "report";
						$result[$x]["id"]				= $row["ID"];
						$result[$x]["report"]			= $row["report"];
						$result[$x]["user_key"]			= $row["user_key"];
						$result[$x]["user_key_action"]	= $row["user_key_action"];
						$result[$x]["timestamp"]		= $row["timestamp"];
						
						$x++;
						
					}
				}
			}
			
			if($content == 1){
				if($complete == true)
					$result[$x]["type"] = "complete";
				
				echo json_encode( $result );
			}
			else{
				$result[0]["type"] = "complete";
				echo json_encode( $result );
			}
		}
	}
	
	
?>