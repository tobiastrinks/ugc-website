<?php @session_start();

	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	include("../dbconnect.php");
	include("../config.php");
	include("../rights.php");
	
	include("../php_fct.php");


	$task = 0;
	if(isset($post["task"]))
		$task = $post["task"];
	
	
	//------------------consents
	
	if($task == "consent"){
		
		consent( $post["subject"], $post["status"] );
	}
	
	if($task == "consent_check"){
		
		$ergebnis = $mysqli_project->query("SELECT status FROM consents WHERE user_key='".$_SESSION["lc_user_key"]."' AND subject='".$post["subject"]."' AND subject_timestamp>='".$consent_timestamp[$post["subject"]]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["status"] == true)
					echo "true";
				else
					echo "false";
			}
		}
		else{
			echo "empty";
		}
	}
	

	//------------------receive_functions
	
	if($task == "rights_receive"){
		
		$result = [];
		
		for($x=0; $x<count($rights); $x++){
			
			$key = array_keys($rights)[$x];
			$val = $rights[$key];
			
			$result[ $key ] = $val;
		}
		
		if(count($result) > 0)
			echo json_encode($result);
		else
			echo "";
	}
	
	
	if($task == "category_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT * FROM category");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			
			$x=0;
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x]["ID"] 		= $row["ID"];
				$result[$x]["title"] 	= $row["title"];
				
				$x++;
			}
			
			echo json_encode($result);
		}
	}
	
	
	
	//---------user
	
	//----reset password
	if($task == "reset_password_mail"){
		
		$ergebnis = $mysqli_project->query("SELECT email, user_key, fname, lname FROM user WHERE email='".$post["user"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				//pwr
				$key 	= "sgkshet39theruitw490";
				$id 	= "tu734tr38ur944r3";
				$encrypted = urlencode ( openssl_encrypt ( $row["user_key"] , "AES-128-CBC" , $key, 0, $id ) );
				
				$encrypted = str_replace("%", "%25", $encrypted);
				
				$email = $row["email"];
				$fname = $row["fname"];
				
				$mysqli_project->query("INSERT INTO user_pwr (user_key, reset_key)
										VALUES ('".$row["user_key"]."', '".$encrypted."')");
			}
			
			//send mail
			php_mailer( $email, "Unigrow <no-reply@unigrow.de>", "hello@unigrow.de", "Passwort zurücksetzen - Unigrow", "../../mail_temp/password_reset.html", [
	
				"name"	=> $fname,
				"key"	=> $encrypted
			] );
		}
	}
	if($task == "reset_password_init"){
		
		$key 	= "sgkshet39theruitw490";
		$id 	= "tu734tr38ur944r3";
		$user_key = openssl_decrypt ( urldecode ( $_POST["key"] ) , "AES-128-CBC" , $key, 0, $id );
	
		$ergebnis = $mysqli_project->query("SELECT user_key FROM user_pwr WHERE user_key='".$user_key."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$ergebnis = $mysqli_project->query("SELECT fname, lname FROM user WHERE user_key='".$user_key."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$result = [];
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["fname"] = $row["fname"];
					$result["lname"] = $row["lname"];
				}
				
				echo json_encode($result);
			}
		}
		else{
			echo "invalid_key";
		}
	}
	if($task == "reset_password"){
		
		$key 	= "sgkshet39theruitw490";
		$id 	= "tu734tr38ur944r3";
		$user_key = openssl_decrypt ( urldecode ( $_POST["key"] ) , "AES-128-CBC" , $key, 0, $id );
		
		$ergebnis = $mysqli_project->query("SELECT user_key FROM user_pwr WHERE user_key='".$user_key."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$mysqli_project->query("UPDATE user SET pw='".$post["password"]."' WHERE user_key='".$user_key."'");
			$mysqli_project->query("DELETE FROM user_pwr WHERE user_key='".$user_key."'");
		}
		else{
			echo "invalid_key";
		}
	}
	
	//----register
	if($task == "register"){
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM user WHERE user_key='".$_SESSION["lc_user_key"]."'") ) == 0){

			if($post["user_key"] == $_SESSION["lc_user_key"] OR $_SESSION["user_rights"] == "root"){

			    $x="";
			    do {
                    $username = strtolower($post["fname"]) . strtolower($post["lname"]) . $x;
                    if ($x == "")
                        $x = 1;
                    else
                        $x++;
                } while(mysqli_num_rows($mysqli_project->query("SELECT ID FROM user WHERE username='".$username."'")) > 0);

                //check email
                if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM user WHERE email='".$post["email"]."'") ) == 0){

                    $mysqli_project->query("INSERT INTO user (user_key, username, email, pw, fname, lname, register_timestamp)
                                            VALUES ('".$post["user_key"]."', '".$username."', '".$post["email"]."', '". password_hash ( $post["pw"], PASSWORD_DEFAULT ) ."', '".$post["fname"]."', '".$post["lname"]."', '".time()."')");

                    $mysqli_project->query("INSERT INTO user_msg_settings (user_key, type, rights, email)
                                            VALUES 	('".$post["user_key"]."', 'private', 'all', 0),
                                                    ('".$post["user_key"]."', 'support', '0', 0)");

                    $mysqli_project->query("INSERT INTO user_email_settings (user_key, frequency)
                                            VALUES ('".$post["user_key"]."', '0')");

                    if($post["kurs_id"] != 0 AND $post["kurs_id"] != "undefined"){

                        $mysqli_project->query("INSERT INTO user_kurse (user_key, kurs_id, rights, progress, join_timestamp)
                                                VALUES ('".$_SESSION["lc_user_key"]."', '".$post["kurs_id"]."', 'premember', '0', '".time()."')");
                    }

                    consent( "datenschutz_agb", true );
                }
                else{
                    echo "error_email";
                }
			}
			else
				echo "rights_error";
		}
	}
	
	if($task == "register_mail"){
		
		$user_key = 0;
		
		if(isset($_SESSION["login"]))
			$user_key = $_SESSION["lc_user_key"];
		else if(isset($_SESSION["reg_confirm_user_key"]))
			$user_key = $_SESSION["reg_confirm_user_key"];
			
		
		if($user_key != 0){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM user WHERE user_key='".$user_key."' AND register_confirm=false");
			if(mysqli_num_rows($ergebnis) > 0){
				
				if(!isset($_SESSION["register_mail_timestamp"]) OR $_SESSION["register_mail_timestamp"] < (time()-600)){
				
					//pwr
					$key 	= "83t4r49ut57zt49i";
					$id 	= "tu39rz4t94tu84r3";
					$encrypted = urlencode ( openssl_encrypt ( $user_key , "AES-128-CBC" , $key, 0, $id ) );
					
					$ergebnis = $mysqli_project->query("SELECT fname, email FROM user WHERE user_key='".$user_key."'");
					if(mysqli_num_rows($ergebnis) > 0){
						while($row = $ergebnis->fetch_assoc()){
							
							$email = $row["email"];
							$fname = $row["fname"];
						}
						$encrypted = str_replace("%", "%25", $encrypted);
						
						//send mail
						php_mailer( $email, "Unigrow <no-reply@unigrow.de>", "hello@unigrow.de", "Registrierung bestätigen - Unigrow", "../../mail_temp/registration.html", [

							"name"	=> strtoupper ( $fname ),
							"key"	=> $encrypted
						] );
						
						$_SESSION["register_mail_timestamp"] = time();
					}
				}
				else{
					echo "already_sent";
				}
			}
			else{
				echo "already_confirmed";
			}
		}
	}
	if($task == "register_mail_confirm"){
		
		//pwr
		$key 	= "83t4r49ut57zt49i";
		$id 	= "tu39rz4t94tu84r3";
		
		$user_key = openssl_decrypt ( urldecode ( $_POST["key"] ) , "AES-128-CBC" , $key, 0, $id );
		
		
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM user WHERE user_key='".$user_key."' AND register_confirm=false");
		if(mysqli_num_rows($ergebnis) > 0){
		
			$mysqli_project->query("UPDATE user SET register_confirm=true WHERE user_key='".$user_key."'");
			
			$_SESSION["reg_confirm"] = "login";
			echo "success";
		}
	}
	
	//----update
	if($task == "user_update"){
		
		$val 		= $post["val"];
		
		if($post["attr"] == "descr"){
			$val = nl2br($post["val"]);
		}
		
		if(rights( $post["user_key"], "root" ) OR $_SESSION["lc_user_key"] == $post["user_key"]){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM user WHERE user_key='".$post["user_key"]."' AND ".$post["attr"]."='".$val."'");
			if(mysqli_num_rows($ergebnis) == 0){
				$mysqli_project->query("UPDATE user SET ".$post["attr"]."='".$val."' WHERE user_key='".$post["user_key"]."'");
			}
		}
		else
			echo "rights_error";
	}
	
	if($task == "user_remove"){
		
		if(rights($_SESSION["lc_user_key"], "root") AND $post["user_key"] != $_SESSION["lc_user_key"]){
			
			//check creator
			if( mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse WHERE user_key='".$post["user_key"]."' AND ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='online')") ) == 0 ){
				
				if($post["type"] == "anonymize"){
				
					$mysqli_project->query("UPDATE user SET username='removed', 
															email='', 
															pw='', 
															register_timestamp=0, 
															fname='', 
															lname='', 
															date_of_birth='', 
															gender='', 
															icon='', 
															icon_type='', 
															descr='', 
															facebook_link='',
															twitter_link='',
															youtube_link='',
															instagram_link='' WHERE user_key='".$post["user_key"]."'");
				}
				else if($post["type"] == "remove"){
					
					$mysqli_project->query("DELETE FROM user WHERE user_key='".$post["user_key"]."'");
					$mysqli_project->query("DELETE FROM msg WHERE user_key='".$post["user_key"]."'");
					$mysqli_project->query("DELETE FROM review WHERE user_key='".$post["user_key"]."'");
				}
				
				$mysqli_project->query("DELETE FROM consents WHERE user_key='".$post["user_key"]."'");
				
				$mysqli_project->query("DELETE FROM msg_post_not WHERE user_key='".$post["user_key"]."'");
				$mysqli_project->query("DELETE FROM msg_reply_not WHERE user_key='".$post["user_key"]."'");
				
				$mysqli_project->query("DELETE FROM user_blocked WHERE user_key='".$post["user_key"]."' OR user_key_action='".$post["user_key"]."'");
				
				$mysqli_project->query("DELETE FROM user_email_settings WHERE user_key='".$post["user_key"]."'");
				$mysqli_project->query("DELETE FROM user_msg_settings WHERE user_key='".$post["user_key"]."'");
				
				$mysqli_project->query("DELETE FROM user_kurse WHERE user_key='".$post["user_key"]."'");
				
			}
			else{
				echo "creator_error";
			}
		}
		else{
			echo "rigths_error";
		}
	}
	
	
	//-----------------newsfeed/project_msg
	if($task == "newsfeed_receive" AND isset($_SESSION["login"])){

		$x=0;
		$result = [];
		$loaded = true;

		$last_msg_id = 0;

		if($post["type"] == "kurs_dashboard"){

			$ergebnis = $mysqli_project->query("	SELECT ID, subject, content, user_key, timestamp, type, dest_id 
													FROM msg 
													WHERE type IN ('post', 'review') AND dest_id='".$_SESSION["kurs_hosting"]."' AND dest_type='kurs'
													ORDER BY timestamp DESC
													LIMIT ".$post["start"].",".(intval($post["anzahl"])+1));
		}
		if($post["type"] == "user_dashboard"){

			$unigrow_post = "'unigrow_user'";

			$ergebnis2 = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin'");
			if(mysqli_num_rows($ergebnis2) > 0)
				$unigrow_post = "'unigrow_user','unigrow_creator'";


			if(!isset($_SESSION["user_register_timestamp"])){
				$ergebnis2 = $mysqli_project->query("SELECT register_timestamp FROM user WHERE user_key='".$_SESSION["lc_user_key"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					while($row2 = $ergebnis2->fetch_assoc()){
						$_SESSION["user_register_timestamp"] = $row2["register_timestamp"];
					}
				}
			}

			$ergebnis = $mysqli_project->query("	SELECT ID, subject, content, user_key, timestamp, type, dest_id, dest_type 
													FROM msg 
													WHERE 	type IN (".$unigrow_post.") OR (type='post' AND (	(dest_type='kurs' AND dest_id IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='0')) OR 
																												(dest_type='creator' AND user_key IN (SELECT user_key FROM user_kurse WHERE rights='admin' AND kurs_id IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."')))))
													AND timestamp>".$_SESSION["user_register_timestamp"]."
													ORDER BY timestamp DESC
													LIMIT ".$post["start"].",".(intval($post["anzahl"])+1));
		}


		if(mysqli_num_rows($ergebnis) > 0){

			while($rows = $ergebnis->fetch_assoc()){

				//check join_timestamp
				$join_timestamp = -1;
				$join_index = 0;

				if($rows["type"] == "post" AND $post["type"] == "user_dashboard"){
					if($rows["dest_type"] == "kurs"){
						if(!isset($_SESSION["kurs_join"][$rows["dest_id"]])){
							$ergebnis2 = $mysqli_project->query("SELECT join_timestamp FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$rows["dest_id"]."'");
							$join_index = $rows["dest_id"];
							$join_timestamp = 0;
						}
						else
							$join_timestamp = $_SESSION["kurs_join"][$rows["dest_id"]];
					}
					if($rows["dest_type"] == "creator" AND $rows["user_key"] != $_SESSION["lc_user_key"]){
						if(!isset($_SESSION["kurs_join"][$rows["user_key"]])){
							$ergebnis2 = $mysqli_project->query("SELECT join_timestamp FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id IN (SELECT ID FROM kurse WHERE user_key='".$rows["user_key"]."' AND ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='online')) ORDER BY join_timestamp ASC LIMIT 1");
							$join_index = $rows["user_key"];
							$join_timestamp = 0;
						}
						else
							$join_timestamp = $_SESSION["kurs_join"][$rows["user_key"]];
					}
				}

				if($join_timestamp == 0){
					if(mysqli_num_rows($ergebnis2) > 0){
						while($row2 = $ergebnis2->fetch_assoc()){
							$join_timestamp 					= $row2["join_timestamp"];
							$_SESSION["kurs_join"][$join_index] = $row2["join_timestamp"];
						}
					}
				}

				if($join_timestamp == -1 OR $join_timestamp<$rows["timestamp"]){

					if($x < $post["anzahl"]){

						$result[$x]["id"]			= $rows["ID"];
						$result[$x]["subject"] 		= $rows["subject"];
						$result[$x]["timestamp"] 	= $rows["timestamp"];


						$result[$x]["subline"] 	= "";

						$ergebnis2 = $mysqli_project->query("SELECT fname, lname, icon FROM user WHERE user_key='".$rows["user_key"]."'");
						while($rows2 = $ergebnis2->fetch_assoc()){

							$media_id = 0;

							if($post["type"] == "user_dashboard"){
								if($rows["dest_type"] == "creator"){
									$result[$x]["subline"] = $rows2["fname"]." ".$rows2["lname"]." (Kursersteller)";
									$media_id = $rows2["icon"];
								}
							}
							if($rows["dest_id"] != 0){
								$ergebnis3 = $mysqli_project->query("SELECT name, thumbnail FROM kurse WHERE ID='".$rows["dest_id"]."'");
								while($rows3 = $ergebnis3->fetch_assoc()){

									if($post["type"] == "kurs_dashboard"){

										if($rows["type"] == "post"){
											$result[$x]["subline"] = "an Kursteilnehmer";
											$media_id = $rows3["thumbnail"];
										}

										if($rows["type"] == "review"){
											$result[$x]["subline"] = "Rezension - ".$rows2["fname"]." ".$rows2["lname"];
											$media_id = $rows2["icon"];
										}
									}

									if($post["type"] == "user_dashboard"){

										if($rows["dest_type"] == "kurs"){
											$result[$x]["subline"] = $rows3["name"];
											$media_id = $rows3["thumbnail"];
										}
									}
								}
							}
							if($rows["type"] == "unigrow_user" OR $rows["type"] == "unigrow_creator"){
								$result[$x]["subline"] = "Unigrow - ".$rows2["fname"]." ".$rows2["lname"];
								$media_id = $rows2["icon"];
							}

							if($media_id != 0){
								$ergebnis4 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$media_id."'");
								while($rows4 = $ergebnis4->fetch_assoc()){

									$result[$x]["icon_filename"] = $rows4["filename"];
								}
							}


						}

						//comments
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM msg WHERE dest_id='".$rows["ID"]."' AND layer='2'");

						$result[$x]["comments"] = mysqli_num_rows($ergebnis2);

						$x++;
					}
					else
						$loaded = false;
				}
			}

			if(count($result) > 0){

				if($loaded == true)
					$result[$x-1]["loaded"] = "1";

				//notifications
				$newsfeed_not_counter = 0;

				$not_type = "user";
				if($post["type"] == "kurs_dashboard")
					$not_type = "kurs";

				for($x=0; $x<count($result); $x++){
					$result[$x]["not"] = 0;
				}
				$ergebnis2 = $mysqli_project->query("SELECT msg_id FROM msg_post_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND type='".$not_type."'");
				if(mysqli_num_rows($ergebnis2) > 0){

					while($row2 = $ergebnis2->fetch_assoc()){

						for($x=0; $x<count($result); $x++){
							if($result[$x]["id"] == $row2["msg_id"]){
								$result[$x]["not"] = 1;
							}
						}

						$newsfeed_not_counter++;
					}
				}

				if(count($result) > 0)
					echo json_encode($result);
			}
		}
	}
	if($task == "newsfeed_post_reset"){
		
		if($post["type"] == "user"){
			$mysqli_project->query("DELETE FROM msg_post_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND type='".$post["type"]."'");
		}
		else if($post["type"] == "msg"){
			$mysqli_project->query("DELETE FROM msg_post_not WHERE msg_id='".$post["dest_id"]."' AND user_key='".$_SESSION["lc_user_key"]."'");
		}
	}
	//newsfeed_not
	if($task == "newsfeed_not_reset"){
		
		$result = [];
		
		if($post["not_id"] == "user"){
			$ergebnis = $mysqli_project->query("SELECT ID, msg_id, kurs_id FROM msg_reply_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id=0");
			$result["not_id"] = "user";
		}
		else if($post["not_id"] == "kurs"){
			$ergebnis = $mysqli_project->query("SELECT ID, msg_id, kurs_id FROM msg_reply_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id!=0");
			$result["not_id"] = "kurs";
		}
		else{
			if(!isset($post["dest_id"]))
				$ergebnis = $mysqli_project->query("SELECT ID, msg_id, kurs_id FROM msg_reply_not WHERE ID=".$post["not_id"]." AND user_key='".$_SESSION["lc_user_key"]."'");
			else
				$ergebnis = $mysqli_project->query("SELECT ID, msg_id, kurs_id FROM msg_reply_not WHERE msg_id=".$post["dest_id"]." AND user_key='".$_SESSION["lc_user_key"]."'");
		}
		
		if(mysqli_num_rows($ergebnis) > 0){
			while($row = $ergebnis->fetch_assoc()){
				
				$result["kurs_id"] 	= $row["kurs_id"];
				
				if(!isset($result["not_id"]))
					$result["not_id"] 	= $row["ID"];
				
				if($row["msg_id"] != 0){
					$mysqli_project->query("UPDATE msg_reply_not SET last_msg_id=(SELECT ID FROM msg WHERE layer>1 AND dest_id='".$row["msg_id"]."' ORDER BY ID DESC LIMIT 1) WHERE ID='".$row["ID"]."'");
				}
				else{
					//review
					$mysqli_project->query("UPDATE msg_reply_not SET last_msg_id=(SELECT ID FROM msg WHERE dest_type='review' AND dest_id IN (SELECT ID FROM review WHERE kurs_id='".$row["kurs_id"]."') ORDER BY ID DESC LIMIT 1) WHERE ID='".$row["ID"]."'");
				}
			}
			
			echo json_encode($result);
		}
		else
			echo "false";
		
		//reply_not session reset
		$_SESSION["pmsg_last_id"] = 0;
	}
	if($task == "newsfeed_not_location"){
		
		$result = [];
		
		//review
		if($post["msg_id"] == 0){
			
			$result["type"] = "kurs";
			
			$ergebnis2 = $mysqli_project->query("SELECT name FROM kurse WHERE ID=".$_SESSION["kurs_hosting"]);
			if(mysqli_num_rows($ergebnis2) > 0){
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$result["get_param"] = str_replace(" ","-", $row2["name"]);
				}
			}
		}
		
		//comments/replies
		else{
			$ergebnis 	= $mysqli_project->query("SELECT type, dest_id FROM msg WHERE ID=".$post["msg_id"]);
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					//replies
					if($row["type"] == "comment"){
						$ergebnis2 = $mysqli_project->query("SELECT ID, type, dest_id FROM msg WHERE ID='".$row["dest_id"]."'");
					}
					//comments
					else{
						$ergebnis2 = $mysqli_project->query("SELECT ID, type, dest_id FROM msg WHERE ID=".$post["msg_id"]);
					}
				}
				
				if(mysqli_num_rows($ergebnis2) > 0){
					while($row2 = $ergebnis2->fetch_assoc()){
						
						if($row2["type"] == "post"){
							$result["type"] 	= "pmsg";
							$result["pmsg_id"] 	= $row2["ID"];
						}
						
						if($row2["type"] == "module"){
							
							$result["type"] 		= "module";
							$result["module_id"]	= $row2["dest_id"];
							
							$ergebnis3 = $mysqli_project->query("SELECT kurs_id FROM kurse_module WHERE ID='".$row2["dest_id"]."'");
							if(mysqli_num_rows($ergebnis3) > 0){
								while($row3 = $ergebnis3->fetch_assoc()){
									$result["kurs_id"]	= $row3["kurs_id"];
								}
							}
						}
						
						if($row2["type"] == "review"){
							
							$result["type"] 		= "review";
							$result["rev_id"] 		= $row2["dest_id"];
							
							$ergebnis3 = $mysqli_project->query("SELECT name FROM kurse WHERE ID=(SELECT dest_id FROM review WHERE ID='".$row2["dest_id"]."')");
							if(mysqli_num_rows($ergebnis3) > 0){
								while($row3 = $ergebnis3->fetch_assoc()){
									$result["get_param"] = str_replace(" ","-", $row3["name"]);
								}
							}
						}
					}
				}
			}
		}
		
		if(count($result) > 0)
			echo json_encode($result);
	}
	
	if($task == "project_msg"){
		
		$pmsg_rights = false;
		
		$pmsg_reply_kurs = 0;
		
		//kursersteller post
		if($post["type"] == "post" AND $post["dest_type"] == "kurs"){
			
			$ergebnis = $mysqli_project->query("SELECT rights FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["dest_id"]."' AND rights='admin'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$pmsg_rights = true;
				$pmsg_reply_kurs = $post["dest_id"];
			}	
		}
		if($post["type"] == "post" AND $post["dest_type"] == "creator"){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin'");
			if(mysqli_num_rows($ergebnis) > 0){
				$pmsg_rights = true;
			}
		}
		if($post["type"] == "unigrow_user" OR $post["type"] == "unigrow_creator"){
			
			if(rights($_SESSION["lc_user_key"], "unigrow_post")){
				$pmsg_rights = true;
			}
		}
		
		if($post["type"] == "comment"){
			
			if(project_msg_rights($post["dest_id"]) === true)
				$pmsg_rights = true;
			
			$reply_not_ergebnis = $mysqli_project->query("SELECT dest_id, dest_type FROM msg WHERE ID='".$post["dest_id"]."'");
		}
		if($post["type"] == "reply"){
			
			$dest_id;
			
			$ergebnis = $mysqli_project->query("SELECT dest_id FROM msg WHERE ID='".$post["dest_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					if(project_msg_rights($row["dest_id"]) === true)
						$pmsg_rights = true;
				}
			}
			
			$reply_not_ergebnis = $mysqli_project->query("SELECT dest_id, dest_type FROM msg WHERE ID IN (SELECT dest_id FROM msg WHERE ID='".$post["dest_id"]."')");
		}
		
		if($post["type"] == "comment" OR $post["type"] == "reply"){
			
			if(mysqli_num_rows($reply_not_ergebnis) > 0){
				
				$dest_id 	= 0;
				$dest_type 	= 0;
				
				while($row = $reply_not_ergebnis->fetch_assoc()){
					$dest_id 	= $row["dest_id"];
					$dest_type 	= $row["dest_type"];
				}
				
				if($dest_type == "review"){
					$ergebnis = $mysqli_project->query("SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin' AND kurs_id IN (SELECT dest_id FROM review WHERE ID=".$dest_id.")");
				}
				else if($dest_type == "module"){
					$ergebnis = $mysqli_project->query("SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin' AND kurs_id IN (SELECT kurs_id FROM kurse_module WHERE ID=".$dest_id.")");
				}
				else if($dest_type == "kurs"){
					if(mysqli_num_rows($mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$dest_id."' AND rights='admin'")) > 0){
						$pmsg_reply_kurs = $dest_id;
					}
				}
				
				if( isset($ergebnis) AND mysqli_num_rows( $ergebnis ) > 0){
					while($row = $ergebnis->fetch_assoc()){
						
						$pmsg_reply_kurs = $row["kurs_id"];
					}
				}
			}
		}
		
		if($pmsg_rights == true){
			
			//send msg
			
			$mysqli_project->query("INSERT INTO msg (user_key, type, dest_type, dest_id, layer, subject, content, timestamp)
									VALUES ('".$_SESSION["lc_user_key"]."', '".$post["type"]."', '".$post["dest_type"]."', '".$post["dest_id"]."', '".$post["layer"]."', '".$post["subject"]."', '".nl2br( $post["content"] )."', ".time().")");
			$last_id = $mysqli_project->insert_id;
			
			//notifications
			
			$user_not_ergebnis = "";
			
			if($post["type"] == "post" AND $post["dest_type"] == "kurs"){
				$user_not_ergebnis = $mysqli_project->query("SELECT user_key FROM user_kurse WHERE kurs_id='".$post["dest_id"]."' AND user_key!='".$_SESSION["lc_user_key"]."'");
			}
			if($post["type"] == "post" AND $post["dest_type"] == "creator"){
				$user_not_ergebnis = $mysqli_project->query("SELECT user_key FROM user_kurse WHERE kurs_id IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin') AND user_key!='".$_SESSION["lc_user_key"]."'");
			}
			if($post["type"] == "unigrow_user"){
				$user_not_ergebnis = $mysqli_project->query("SELECT user_key FROM user WHERE user_key!='".$_SESSION["lc_user_key"]."'");
			}
			if($post["type"] == "unigrow_creator"){
				$user_not_ergebnis = $mysqli_project->query("SELECT DISTINCT user_key FROM kurse");
			}
			if($user_not_ergebnis != ""){
				if(mysqli_num_rows($user_not_ergebnis) > 0){
					
					while($row = $user_not_ergebnis->fetch_assoc()){
						
						$mysqli_project->query("INSERT INTO msg_post_not (user_key, type, msg_id)
												VALUES ('".$row["user_key"]."', 'user', ".$last_id.")");
					}
				}
			}
			
			//prepare reply notifications
			if($post["type"] == "post" OR $post["type"] == "comment"){
				
				$mysqli_project->query("INSERT INTO msg_reply_not (user_key, kurs_id, msg_id, last_msg_id)
										VALUES ('".$_SESSION["lc_user_key"]."', '".$pmsg_reply_kurs."', ".$last_id.", ".$last_id.")");
			}
			
			if($post["type"] == "reply"){
				
				if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM msg_reply_not WHERE user_key='".$_SESSION["lc_user_key"]."' AND msg_id='".$post["dest_id"]."'") ) == 0){
					$mysqli_project->query("INSERT INTO msg_reply_not (user_key, kurs_id, msg_id, last_msg_id)
											VALUES ('".$_SESSION["lc_user_key"]."', '".$pmsg_reply_kurs."', ".$post["dest_id"].", ".$last_id.")");
				}
			}
		}
	}
	
	if($task == "project_msg_receive"){
		
		if(project_msg_rights($post["msg_id"]) === true){
			
			$result = [];
			
			$ergebnis = $mysqli_project->query("SELECT * FROM msg WHERE ID='".$post["msg_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["user_key"] 	= $row["user_key"];
					
					if($row["type"] != "module"){
					
						$result["type"] 		= $row["type"];
						$result["dest_id"] 		= $row["dest_id"];
						$result["dest_type"] 	= $row["dest_type"];
						$result["subject"] 		= $row["subject"];
						$result["content"] 		= $row["content"];
						$result["timestamp"]	= $row["timestamp"];
						
						$ergebnis2 = $mysqli_project->query("SELECT fname, lname, icon FROM user WHERE user_key='".$row["user_key"]."'");
						if(mysqli_num_rows($ergebnis2) > 0){
							
							$ergebnis4 = "";
							
							while($row2 = $ergebnis2->fetch_assoc()){
								
								$result["user_fname"] = $row2["fname"];
								$result["user_lname"] = $row2["lname"];
								
								if($row["dest_type"] == "kurs"){
									
									$ergebnis3 = $mysqli_project->query("SELECT name, thumbnail FROM kurse WHERE ID='".$row["dest_id"]."'");
									if(mysqli_num_rows($ergebnis3) > 0){
										
										while($row3 = $ergebnis3->fetch_assoc()){
											
											$result["kurs_name"] = $row3["name"];
											
											$ergebnis4 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row3["thumbnail"]."'");
										}
									}
								}
								else if($row["dest_type"] == "review" OR $row["dest_type"] == "creator" OR $row["type"] == "unigrow_user" OR $row["type"] == "unigrow_creator"){
									
									$ergebnis4 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row2["icon"]."'");
								}
							}
							
							if($ergebnis4 != ""){
								//icon
								while($row4 = $ergebnis4->fetch_assoc()){
								
									$result["icon_filename"] = $row4["filename"];
								}
							}
						}
						
					}
				}
			}
			
			if(count($result) > 0){
				echo json_encode( $result );
			}
		}
	}
	if($task == "project_msg_receive_layer"){
		
		$dest_id = $post["dest_id"];
		
		$ergebnis = $mysqli_project->query("SELECT dest_id FROM msg WHERE ID='".$dest_id."' AND layer='2'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$dest_id = $row["dest_id"];
			}
		}
		
		if(project_msg_rights($dest_id) === true){
			
			$x=0;
			$loaded = true;
			
			$anzahl = $post["anzahl"];
			if($post["not_comment"] != 0){
				$ergebnis = $mysqli_project->query("SELECT ID FROM msg WHERE dest_id=(SELECT dest_id FROM msg WHERE ID='".$post["not_comment"]."') AND type='comment' AND ID>=".$post["not_comment"]);
				$new_anzahl = mysqli_num_rows($ergebnis)+2;
				if($new_anzahl > $anzahl)
					$anzahl = $new_anzahl;
			}
			
			$result = [];
			
			$ergebnis = $mysqli_project->query("SELECT ID, user_key, content, timestamp FROM msg WHERE dest_id='".$post["dest_id"]."' AND layer='".$post["layer"]."' ORDER BY timestamp DESC LIMIT ".$post["start"].",".(intval($anzahl)+1));
			if(mysqli_num_rows($ergebnis) > 0){
					
				while($row = $ergebnis->fetch_assoc()){
					
					if($x < $anzahl){
						
						$result[$x]["id"]			= $row["ID"];
						$result[$x]["user_key"] 	= $row["user_key"];
						$result[$x]["content"] 		= $row["content"];
						$result[$x]["timestamp"] 	= $row["timestamp"];
						
						$ergebnis2 = $mysqli_project->query("SELECT fname, lname, username FROM user WHERE user_key='".$row["user_key"]."'");
						while($row2 = $ergebnis2->fetch_assoc()){
							
							$result[$x]["fname"] 	= $row2["fname"];
							$result[$x]["lname"] 	= $row2["lname"];
							$result[$x]["username"] = $row2["username"];
						}
					
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM msg WHERE dest_id='".$row["ID"]."' AND type='reply'");
						$result[$x]["reply_counter"] = mysqli_num_rows($ergebnis2);
						
						$x++;
					}
					else
						$loaded = false;
				}
				
				if($loaded == true)
					$result[$x-1]["loaded"] = "1";
			}
			
			
			if(count($result) > 0){
				echo json_encode($result);
			}
		}
	}
	
	
	//-----reviews
	
	if($task == "review_receive"){
		
		$result = [];
		
		$ergebnis = $mysqli_project->query("SELECT * FROM review WHERE dest_type='".$post["dest_type"]."' AND dest_id='".$post["dest_id"]."' ORDER BY timestamp DESC");
	
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result["content"][$x]["id"] 		= $row["ID"];				
				$result["content"][$x]["stars"] 	= $row["stars"];
				$result["content"][$x]["title"] 	= $row["title"];
				$result["content"][$x]["content"] 	= $row["content"];
				$result["content"][$x]["user_key"] 	= $row["user_key"];
				$result["content"][$x]["timestamp"]	= $row["timestamp"];
				
				//pmsg_id
				$ergebnis2 = $mysqli_project->query("SELECT ID FROM msg WHERE layer='1' AND type='review' AND dest_type='review' AND dest_id='".$row["ID"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$result["content"][$x]["pmsg_id"] = $row2["ID"];
					}
				}
				
				//pmsg_comment_counter
				$result["content"][$x]["comment_counter"] = mysqli_num_rows($mysqli_project->query("SELECT ID FROM msg WHERE layer='2' AND dest_id IN (SELECT ID FROM msg WHERE dest_id='".$row["ID"]."' AND dest_type='review' AND layer='1')"));
				
				$x++;
			}
			
		}
		//create review rights
		$result["create"] = 0;
		
		if(review_post_rights($post["dest_type"], $post["dest_id"]) === true){
			$result["create"] = 1;
		}
		
		echo json_encode($result);
	}
	if($task == "review_submit"){
		
		$content 	= nl2br( $post["content"] );
		
		if(review_post_rights($post["dest_type"], $post["dest_id"]) === true){
			
			$mysqli_project->query("INSERT INTO review (dest_type, dest_id, stars, title, content, user_key, timestamp)
									VALUES ('".$post["dest_type"]."', '".$post["dest_id"]."', ".$post["stars"].", '".$post["title"]."', '".$content."', '".$_SESSION["lc_user_key"]."', '".time()."')");
			
			$last_id = $mysqli_project->insert_id;
			
			$mysqli_project->query("INSERT INTO msg (user_key, type, dest_type, dest_id, layer, subject, content, timestamp)
									VALUES ('".$_SESSION["lc_user_key"]."', 'review', 'review', ".$last_id.", '1', '', '', '".time()."')");
			$msg_id = $mysqli_project->insert_id;
			
			//reply_not preparing
			$mysqli_project->query("INSERT INTO msg_reply_not (user_key, kurs_id, msg_id, last_msg_id)
									VALUES ('".$_SESSION["lc_user_key"]."', 0, ".$msg_id.", ".$msg_id.")");
		}
		else
			echo "rights_error";
	}
?>