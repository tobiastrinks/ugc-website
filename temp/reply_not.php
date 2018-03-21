<?php

	if(!isset($_SESSION["pmsg_last_id"]))
		$_SESSION["pmsg_last_id"] = 0;
	
	if(!isset($_SESSION["reply_not"]))
		$_SESSION["reply_not"] = [];
	
	$pmsg_last_id = 0;
	
	$reply_not_ergebnis = $mysqli_project->query("SELECT ID FROM msg ORDER BY ID DESC LIMIT 1");
	if(mysqli_num_rows($reply_not_ergebnis) > 0){
		while($reply_not_row = $reply_not_ergebnis->fetch_assoc()){
			$pmsg_last_id = $reply_not_row["ID"];
		}
	}
	$_SESSION["pmsg_last_id"] = 0;
	if($_SESSION["pmsg_last_id"] < $pmsg_last_id){
		
		$reply_not = [];
		
		for($rn_x=0; $rn_x<2; $rn_x++){
			
			$reply_x = 0;
			
			if($rn_x == 0){
				//user_dashboard
				$rn_ergebnis = $mysqli_project->query("SELECT ID, user_key, msg_id, last_msg_id FROM msg_reply_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id=0 ORDER BY last_msg_id DESC");
				$rn_type = "user";
			}
			else{
				//kurs_dashboard
				$rn_ergebnis = $mysqli_project->query("SELECT ID, user_key, msg_id, last_msg_id, kurs_id FROM msg_reply_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id!=0 ORDER BY kurs_id ASC, last_msg_id DESC");
				$rn_type = "kurs";
			}
			
			if(mysqli_num_rows($rn_ergebnis) > 0){
				
				$rn_kurs_id = 0;
				
				while($rn_row = $rn_ergebnis->fetch_assoc()){
					
					if($rn_x == 0){
						//reply to comment || comment to review/creator_post
						$rn_ergebnis2 = $mysqli_project->query("SELECT ID, type, timestamp, user_key FROM msg WHERE ID>".$rn_row["last_msg_id"]." AND dest_id='".$rn_row["msg_id"]."' AND user_key!='".$_SESSION["lc_user_key"]."' AND
																(type='reply' OR type='comment') ORDER BY timestamp DESC");
					}
					else{
						//comment to modul || reply to comment > creator comments/replies too > basic.php 'project_msg'
						if($rn_row["msg_id"] != 0){
							$rn_ergebnis2 = $mysqli_project->query("SELECT ID, type, timestamp, user_key FROM msg WHERE ID>".$rn_row["last_msg_id"]." AND dest_id='".$rn_row["msg_id"]."' AND user_key!='".$_SESSION["lc_user_key"]."' AND
																	(type='reply' OR type='comment') ORDER BY timestamp DESC");
						}
						//review
						else{
							$rn_ergebnis2 = $mysqli_project->query("SELECT ID, type, timestamp, user_key FROM msg WHERE ID>".$rn_row["last_msg_id"]." AND type='review' AND user_key!='".$_SESSION["lc_user_key"]."' AND dest_id IN (SELECT ID FROM review WHERE dest_id='".$rn_row["kurs_id"]."') ORDER BY timestamp DESC");
						}
					}
					
					if(mysqli_num_rows($rn_ergebnis2) > 0){
						
						if($rn_x == 0){
							$reply_not_ref = &$reply_not[$rn_type][$reply_x];
						}
						else{
							if($rn_kurs_id == 0)
								$rn_kurs_id = $rn_row["kurs_id"];
							if($rn_kurs_id != $rn_row["kurs_id"]){
								$reply_x = 0;
								$rn_kurs_id = $rn_row["kurs_id"];
							}
							
							$reply_not_ref = &$reply_not[$rn_type][$rn_row["kurs_id"]][$reply_x];
						}
						
						$reply_type = 0;
						$reply_counter = 0;
						
						$reply_user_counter = 0;
						$reply_user_counter_helper = [];
						
						while($rn_row2 = $rn_ergebnis2->fetch_assoc()){
							
							if($reply_counter == 0){
								$reply_type 		= $rn_row2["type"];
								$reply_timestamp 	= $rn_row2["timestamp"];
								$reply_user_key 	= $rn_row2["user_key"];
							}
							
							if(!isset($reply_user_counter_helper[$rn_row2["user_key"]])){
								$reply_user_counter_helper[$rn_row2["user_key"]] = 1;
								$reply_user_counter++;
							}
							
							$reply_counter++;
						}
						
						//user_name
						$rn_ergebnis2 = $mysqli_project->query("SELECT fname, lname FROM user WHERE user_key='".$reply_user_key."'");
						if(mysqli_num_rows($rn_ergebnis2) > 0){
							while($rn_row2 = $rn_ergebnis2->fetch_assoc()){
								
								$reply_not_ref["user_name"] = $rn_row2["fname"]." ".$rn_row2["lname"];
							}
						}
						//user_counter
						$reply_not_ref["user_number"] = $reply_user_counter;
						
						//subject
						$rn_ergebnis2 = $mysqli_project->query("SELECT type, subject, content, dest_id, user_key FROM msg WHERE ID='".$rn_row["msg_id"]."'");
						if(mysqli_num_rows($rn_ergebnis2) > 0){
							while($rn_row2 = $rn_ergebnis2->fetch_assoc()){
								
								if($rn_row2["type"] == "comment"){
									
									$reply_not_ref["subject"] = $reply_counter." Antwort";
									if($reply_counter > 1)
										$reply_not_ref["subject"] .= "en";
									$reply_not_ref["subject"] .= " auf: <span><i class='fa fa-commenting' aria-hidden='true'></i> ".substr($rn_row2["content"], 0, 50)."</span>";
								}
								if($rn_row2["type"] == "post"){
									
									$reply_not_ref["subject"] = $reply_counter." Kommentar";
									if($reply_counter > 1)
										$reply_not_ref["subject"] .= "e";
									$reply_not_ref["subject"] .= " zu: <span>".substr($rn_row2["subject"], 0, 50)."</span>";
								}
								
								if($rn_row2["type"] == "review"){
									$rn_ergebnis3 = $mysqli_project->query("SELECT title FROM review WHERE ID=".$rn_row2["dest_id"]);
									if(mysqli_num_rows($rn_ergebnis3) > 0){
										while($rn_row3 = $rn_ergebnis3->fetch_assoc()){
											
											$reply_not_ref["subject"] = $reply_counter." Kommentar";
											if($reply_counter > 1)
												$reply_not_ref["subject"] .= "e";
											$reply_not_ref["subject"] .= " zu: <span><i class='fa fa-star' aria-hidden='true'></i> ".substr($rn_row3["title"], 0, 50)."</span>";
										}
									}
								}
								if($rn_row2["type"] == "module"){
									$rn_ergebnis3 = $mysqli_project->query("SELECT title FROM kurse_module WHERE ID=".$rn_row2["dest_id"]);
									if(mysqli_num_rows($rn_ergebnis3) > 0){
										while($rn_row3 = $rn_ergebnis3->fetch_assoc()){
											
											$reply_not_ref["subject"] = $reply_counter." Kommentar";
											if($reply_counter > 1)
												$reply_not_ref["subject"] .= "e";
											$reply_not_ref["subject"] .= " zu: <span><i class='fa fa-video-camera' aria-hidden='true'></i> ".$rn_row3["title"]."</span>";
										}
									}
								}
								
								//check if created
								if($rn_row2["user_key"] != $_SESSION["lc_user_key"]){
									
								}
							}
						}
						if($rn_row["msg_id"] == 0){
							$reply_not_ref["subject"] = $reply_counter." neue Rezension";
							if($reply_counter > 1)
								$reply_not_ref["subject"] .= "en";
						}
						
						$reply_not_ref["id"] 		= $rn_row["msg_id"];
						$reply_not_ref["type"] 		= $reply_type;
						$reply_not_ref["number"] 	= $reply_counter;
						$reply_not_ref["timestamp"]	= $reply_timestamp;
						$reply_not_ref["not_id"]	= $rn_row["ID"];
						
						$reply_x++;
					}
				}
			}
		}
		
		$_SESSION["reply_not"] = $reply_not;
		$_SESSION["pmsg_last_id"] = $pmsg_last_id;
	}
?>