<?php
	if(!isset($task))
		include($home_dir."livechat/config.php");
	
	function user_receive_refresh(){
		
		$_SESSION["lc_user_receive"] = "";
		
		global $mysqli_livechat;
		
		$ergebnis = $mysqli_livechat->query("SELECT chatroom_id, join_timestamp, leave_timestamp FROM user_receive WHERE user_key='".$_SESSION["lc_user_key"]."' ORDER BY chatroom_id ASC, ID ASC");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			$chatroom_id_cache = "";
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($chatroom_id_cache != $row["chatroom_id"]){
					$x=0;
				}
				
				$_SESSION["lc_user_receive"][$row["chatroom_id"]][$x][0] = $row["join_timestamp"];
				$_SESSION["lc_user_receive"][$row["chatroom_id"]][$x][1] = $row["leave_timestamp"];
				
				$chatroom_id_cache = $row["chatroom_id"];
				$x++;
			}
		}
		else
			$_SESSION["lc_user_receive"] = "";
	}
	
	if(!isset($task)){

		//set user_key
		if(!isset($_SESSION["lc_user_key"])){
			do{
				srand(time());
				$new_user_key = rand(10000,99999);
				
				$ergebnis = $mysqli_livechat->query("SELECT ID FROM user WHERE user_key='".$new_user_key."'");
			}
			while( mysqli_num_rows( $ergebnis ) > 0 );
			
			$_SESSION["lc_user_key"] = $new_user_key;
			
			$_SESSION["lc_login_timestamp"] = time();
		}
		
		//load user data
		$ergebnis = $mysqli_livechat->query("SELECT * FROM user WHERE user_key='".$_SESSION["lc_user_key"]."'");
		
		if(!isset($_SESSION["lc_user_key_cache"]))
			$_SESSION["lc_user_key_cache"] = $_SESSION["lc_user_key"];
		
		if(	mysqli_num_rows($ergebnis) == 0 OR
			$_SESSION["lc_user_key_cache"] != $_SESSION["lc_user_key"]){
			
			$last_msg_id = 0;
			$ergebnis2 = $mysqli_livechat->query("SELECT ID FROM msg ORDER BY ID DESC LIMIT 1");
			
			if(mysqli_num_rows( $ergebnis2 ) > 0){
				
				while($row2 = $ergebnis2->fetch_assoc()){
					$last_msg_id = $row2["ID"];
				}
			}
			else
				$last_msg_id=0;
		}
		
		user_receive_refresh();
		$_SESSION["lc_user_key_cache"] = $_SESSION["lc_user_key"]; //detect changing user_key
	}
?>