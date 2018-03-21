<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	include("../dbconnect.php");
	include("../config.php");
	include("../rights.php");
	
	include("../php_fct.php");
	
	include("../../cms/img_op.php");
	
	$task = 0;
	if(isset($post["task"]))
		$task = $post["task"];
	
	//--------------------------------------general
	function kurs_user_progress_update( $kurs_id, $user_key ){
		
		global $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_module WHERE kurs_id='".$kurs_id."' AND visibility=1 AND lesson_id IN (SELECT ID FROM kurse_lesson WHERE kurs_id='".$kurs_id."'AND visibility=1)");
		$module_length = mysqli_num_rows($ergebnis);
		
		$user_key_query = "";
		
		if($user_key != 0){
			$user_key_query = " AND user_key='".$user_key."'";
		}
		
		$ergebnis = $mysqli_project->query("SELECT user_key FROM user_kurse_content WHERE kurs_id='".$kurs_id."' AND type='module' AND status='done'".$user_key_query." ORDER BY user_key ASC");
		$done_length = mysqli_num_rows($ergebnis);
		if($done_length > 0){
			
			$user_key_cache = 0;
			$module_counter = 0;
			$x=0;
			
			while($row = $ergebnis->fetch_assoc()){
				
				$x++;
				$module_counter++;
				
				if($user_key_cache != $row["user_key"] OR $x == $done_length){
					
					if($user_key_cache != 0 OR $x == $done_length){
						
						$progress = intval(($module_counter/$module_length)*100);
						
						$mysqli_project->query("UPDATE user_kurse SET progress='". $progress ."' WHERE kurs_id='".$kurs_id."' AND user_key='".$row["user_key"]."'");
						
						if($user_key != 0){
							return $progress;
						}
					}
					
					$module_counter = 1;
					$user_key_cache = $row["user_key"];
				}
			}
		}
	}
	
	
	//---------------------------------application
	if($task == "kurs_application_init"){

		$ergebnis = $mysqli_project->query("SELECT ID FROM kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='application')");
		if(mysqli_num_rows($ergebnis) == 0){

		    //update consent
            consent("ersteller_agb", true);

			$mysqli_project->query("INSERT INTO kurse (user_key, temp_product, temp_sell, temp_ty)
									VALUES ('".$_SESSION["lc_user_key"]."', 1, 2, 3)");
		
			$insert_id = $mysqli_project->insert_id;
			
			$mysqli_project->query("INSERT INTO user_kurse (user_key, kurs_id, rights)
									VALUES ('".$_SESSION["lc_user_key"]."', '".$insert_id."', 'admin')");
			
			$mysqli_project->query("INSERT INTO kurse_marketplace (kurs_id, status)
									VALUES (".$insert_id.", 'application')");
			
			//application table
			$mysqli_project->query("INSERT INTO kurse_application (user_key, kurs_id, timestamp)
									VALUES ('".$_SESSION["lc_user_key"]."', '".$insert_id."', '0')");
			
			//init first lesson/module
			$mysqli_project->query("INSERT INTO kurse_lesson (kurs_id, pos, title, visibility)
									VALUES (".$insert_id.", 1, 'Bewerbung', 0)");
			
			$lesson_id = $mysqli_project->insert_id;
			
			$mysqli_project->query("INSERT INTO kurse_module (kurs_id, lesson_id, pos)
									VALUES (".$insert_id.", ".$lesson_id.", 1)");
			
			$_SESSION["kurs_application"] = $insert_id;
		}
		else{
			while($row = $ergebnis->fetch_assoc()){
				
				$ergebnis2 = $mysqli_project->query("SELECT ID FROM kurse_application WHERE kurs_id='".$row["ID"]."' AND timestamp!='0'");
				if(mysqli_num_rows($ergebnis2) == 0){
					$_SESSION["kurs_application"] = $row["ID"];
				}
				else{
					echo "already_submitted";
				}
			}
		}
	}
	if($task == "kurs_application_receive"){
		
		if(kurse_check_rights($post["kurs_id"], $_SESSION["lc_user_key"])){
		
			$ergebnis = $mysqli_project->query("SELECT * FROM kurse WHERE ID='".$post["kurs_id"]."'");
			
			while($row = $ergebnis->fetch_assoc()){
				
				//name	
				$result["name"]			= $row["name"];
				
				//descr
				$result["descr"]		= $row["descr"];
				
				//category_id
				$result["category_id"]	= $row["category_id"];
				
				//icon
				$result["thumbnail_id"] = $row["thumbnail"];
				
				//price
				$result["price_model"] 		= $row["price_model"];
				$result["price_1"] 			= $row["price_1"];
				$result["price_2"] 			= $row["price_2"];
				$result["price_duration"] 	= $row["price_duration"];
				
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						$result[ "thumbnail" ] = $row2["filename"];
					}
				}
			}
			
			//module
			
			$ergebnis = $mysqli_project->query("SELECT ID, title, descr FROM kurse_module WHERE kurs_id='".$post["kurs_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					
					$result["module_id"] 	= $row["ID"];
					$result["module_title"] = $row["title"];
					$result["module_descr"] = $row["descr"];
				}
			}
			
			$ergebnis = $mysqli_project->query("SELECT ID, name, video_id FROM kurse_media WHERE kurs_id='".$post["kurs_id"]."' AND type='video'");
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					
					$ergebnis2 = $mysqli_project->query("SELECT type FROM vimeo_video WHERE ID='".$row["video_id"]."'");
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$result[ "video_name" ] = $row["name"].".".$row2["type"];
						$result[ "video_id" ] 	= $row["ID"];
					}
				}
			}
			
			
			//questions
			
			$ergebnis = $mysqli_project->query("SELECT question_1, question_2, question_3 FROM kurse_application WHERE kurs_id='".$post["kurs_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					
					$result["question_1"] = $row["question_1"];
					$result["question_2"] = $row["question_2"];
					$result["question_3"] = $row["question_3"];
				}
			}
			
			echo json_encode( $result );
		}
		else{
			echo "rights_error";
		}
	}
	if($task == "kurs_application_update"){
		
		if(kurse_check_rights($post["kurs_id"], $_SESSION["lc_user_key"])){
			
			if(	$post["attr"] == "question_1" OR
				$post["attr"] == "question_2" OR
				$post["attr"] == "question_3" ){
					
				$mysqli_project->query("UPDATE kurse_application SET ".$post["attr"]."='".$post["val"]."' WHERE kurs_id='".$post["kurs_id"]."'");
			}
		}
	}
	if($task == "kurs_application_submit"){
		
		if(kurse_check_rights($post["kurs_id"], $_SESSION["lc_user_key"])){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_marketplace WHERE status='application' AND kurs_id='".$post["kurs_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				unset($_SESSION["kurs_application"]);
				
				$mysqli_project->query("UPDATE kurse_application SET timestamp='".time()."' WHERE kurs_id='".$post["kurs_id"]."'");

				//get application info
                $ergebnis = $mysqli_project->query("SELECT fname, lname FROM user WHERE user_key='".$_SESSION["lc_user_key"]."'");
                if(mysqli_num_rows($ergebnis) > 0){
                    while($row = $ergebnis->fetch_assoc()){
                        $fname = $row["fname"];
                        $lname = $row["lname"];
                    }
                }
                $ergebnis = $mysqli_project->query("SELECT name, descr, thumbnail FROM kurse WHERE ID='".$post["kurs_id"]."'");
                if(mysqli_num_rows($ergebnis) > 0){
                    while($row = $ergebnis->fetch_assoc()){
                        $kursname = $row["name"];
                        $kursdescr = $row["descr"];

                        if($row["thumbnail"] != 0) {
                            $ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='" . $row["thumbnail"] . "'");
                            if(mysqli_num_rows($ergebnis2) > 0) {
                               while($row2 = $ergebnis2->fetch_assoc()){
                                   $kursthumb = "https://beta.unigrow.de/temp/media/project/kurse_thumb/".$row2["filename"];
                               }
                            }
                        }
                        else{
                            $kursthumb = "https://beta.unigrow.de/mail_temp/application.png";
                        }
                    }
                }

                php_mailer( "application@unigrow.de", "Unigrow<no-reply@unigrow.de>", "", "Bewerbung - ".$fname." ".$lname, "../../mail_temp/application_submit.html", [

                    "fname"	    => $fname,
                    "lname" 	=> $lname,
                    "kursname"	=> $kursname,
                    "kursdescr"	=> $kursdescr,
                    "kursthumb" => $kursthumb
                ] );
			}
		}
		else{
			echo "rights_error";
		}
	}
	if($task == "kurse_application_reply"){
		
		if(rights($_SESSION["lc_user_key"], "root")){

			$mysqli_project->query("UPDATE kurse_application SET result=".$post["result"].", reply_text='".$post["reply_text"]."' WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("UPDATE kurse_marketplace SET status='confirmed' WHERE kurs_id='".$post["kurs_id"]."'");

			//mail
			$template = "../../mail_temp/application_accept.html";
			if($post["result"] == "false"){
                $template = "../../mail_temp/application_reject.html";
            }
            $reason = $post["reply_text"];

			//get info
            $ergebnis = $mysqli_project->query("SELECT name, thumbnail, user_key FROM kurse WHERE ID='".$post["kurs_id"]."'");
            if(mysqli_num_rows($ergebnis) > 0){
                while($row = $ergebnis->fetch_assoc()){

                    $kursname = $row["name"];

                    //user data
                    $ergebnis2 = $mysqli_project->query("SELECT fname, lname, email FROM user WHERE user_key='".$row["user_key"]."'");
                    if(mysqli_num_rows($ergebnis2) > 0){
                        while($row2 = $ergebnis2->fetch_assoc()){
                            $fname = $row2["fname"];
                            $lname = $row2["lname"];
                            $email = $row2["email"];
                        }
                    }

                    //kursthumb
                    if($row["thumbnail"] != 0) {
                        $ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='" . $row["thumbnail"] . "'");
                        if (mysqli_num_rows($ergebnis2) > 0) {
                            while ($row2 = $ergebnis2->fetch_assoc()) {
                                $kursthumb = "https://beta.unigrow.de/temp/media/project/kurse_thumb/".$row2["filename"];
                            }
                        }
                    }
                    else{
                        $kursthumb = "https://beta.unigrow.de/mail_temp/application.png";
                    }
                }
            }

            php_mailer( $email, "Unigrow<no-reply@unigrow.de>", "hello@unigrow.de", "Deine Bewerbung - Unigrow", $template, [
                "reason"    => $reason,
                "fname"	    => $fname,
                "lname" 	=> $lname,
                "kursname"	=> $kursname,
                "kursthumb" => $kursthumb
            ] );
		}
	}
	if($task == "kurse_application_reply_confirm"){
		
		if(kurse_check_rights($post["kurs_id"], $_SESSION["lc_user_key"])){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_application WHERE result=true AND kurs_id='".$post["kurs_id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				//------------confirmed
				
				//kurse_marketplace
				$mysqli_project->query("UPDATE kurse_marketplace SET status='offline' WHERE kurs_id='".$post["kurs_id"]."'");
				
				//prepare reply_not > review
				$mysqli_project->query("INSERT INTO msg_reply_not (user_key, kurs_id, msg_id, last_msg_id)
										VALUES ('".$_SESSION["lc_user_key"]."', ".$post["kurs_id"].", 0, 0)");
				
				//consent
				consent( "leaderboard_share_progress", true );
			}
			else{
				
				//------------rejected
				$mysqli_project->query("DELETE FROM kurse WHERE ID='".$post["kurs_id"]."'");
				$mysqli_project->query("DELETE FROM kurse_media WHERE kurs_id='".$post["kurs_id"]."'");
				$mysqli_project->query("DELETE FROM user_kurse WHERE kurs_id='".$post["kurs_id"]."'");
				
				$mysqli_project->query("DELETE FROM kurse_application WHERE kurs_id='".$post["kurs_id"]."'");
				
				$mysqli_project->query("DELETE FROM kurse_marketplace WHERE kurs_id='".$post["kurs_id"]."'");
				
				$mysqli_project->query("DELETE FROM kurse_lesson WHERE kurs_id='".$post["kurs_id"]."'");
				$mysqli_project->query("DELETE FROM kurse_module WHERE kurs_id='".$post["kurs_id"]."'");
				
				media_files_remove();
			}
		}
	}
	
	if($task == "kurs_update"){
		
		if(kurse_check_rights($post["kurs_id"], $_SESSION["lc_user_key"])){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["kurs_id"]."' AND rights='admin'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				if($post["attr"] != "descr")
					$val = $post["val"];
				else
					$val = str_replace("'", "&apos;", $_POST["val"]);
				
				$rights = true;
				
				//check thumbnail media file
				
				if($rights == true){
					
					//update chatroom_thumb
					if($post["attr"] == "thumbnail")
						$mysqli_project->query("UPDATE chatrooms SET icon='".$post["val"]."' WHERE kurs_id='".$post["kurs_id"]."'");
					
					$mysqli_project->query("UPDATE kurse SET ".$post["attr"]."='".$val."' WHERE ID=".$post["kurs_id"]);
				}
			}
		}
		else{
			echo "rights_error";
		}
	}
	if($task == "kurs_remove"){
		
		if(rights( $_SESSION["lc_user_key"], "root" )){
			
			$mysqli_project->query("DELETE FROM kurse 				WHERE ID='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM kurse_lesson 		WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM kurse_module 		WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM kurse_marketplace 	WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM user_kurse 			WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM kurse_temp_content	WHERE kurs_id='".$post["kurs_id"]."'");
			$mysqli_project->query("DELETE FROM kurse_video			WHERE kurs_id='".$post["kurs_id"]."'");
			
			$mysqli_project->query("DELETE FROM msg_reply_not		WHERE kurs_id='".$post["kurs_id"]."'");
			
			$mysqli_project->query("DELETE FROM kurse_media WHERE kurs_id='".$post["kurs_id"]."'");
			
			media_files_remove();
		}
	}
	
	//receive_functions
	if($task == "kurs_receive"){
		
		$result = [];
		
		$kurs_id = "";
		
		if(is_array($post["kurs_id"])){
			
			for($x=0; $x<count($post["kurs_id"]); $x++){
				
				$kurs_id .= "'".$post["kurs_id"][$x]."',";
			}
			$kurs_id = substr_replace($kurs_id, "", -1);
		}
		else
			$kurs_id = "'".$post["kurs_id"]."'";
		
		
		$ergebnis = $mysqli_project->query("SELECT * FROM kurse WHERE ID IN (".$kurs_id.")");
		
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				//user_key
				$result[ $row["ID"] ][ "user_key" ]		= $row["user_key"];
				
				//name
				$result[ $row["ID"] ][ "name" ]			= $row["name"];
				
				//descr
				$result[ $row["ID"] ][ "descr" ]		= $row["descr"];
				
				//category_id
				$result[ $row["ID"] ][ "category_id" ]	= $row["category_id"];
				
				//category title
				$ergebnis2 = $mysqli_project->query("SELECT title FROM category WHERE ID='".$row["category_id"]."'");
				while($row2 = $ergebnis2->fetch_assoc()){
					
					$result[ $row["ID"] ][ "category_title" ] = $row2["title"];
				}
				
				//icon
				$result[ $row["ID"] ][ "thumbnail_id" ] = $row["thumbnail"];
				
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						$result[ $row["ID"] ][ "thumbnail" ] = $row2["filename"];
					}
				}
			}
			
			echo json_encode( $result );
		}
	}
	
	//---------------------------------------hosting
	
	if($task == "kurs_hosting"){
		
		$rights_bool = false;
		
		$ergebnis = $mysqli_project->query("SELECT rights FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["kurs_id"]."' AND kurs_id NOT IN (SELECT kurs_id FROM kurse_marketplace WHERE status='application' OR status='rejected')");
		if(mysqli_num_rows($ergebnis) > 0){
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["rights"] == "admin")
					$rights_bool = true;
			}
		}
		
		if(rights($_SESSION["lc_user_key"], "root")){
			$rights_bool = true;
		}
		
		if($rights_bool){
			
			$_SESSION["kurs_hosting"] = $post["kurs_id"];
		}
		else{
			if(isset($_SESSION["kurs_hosting"]))
				unset($_SESSION["kurs_hosting"]);
		}
	}
	
	function kurs_publish_check(){
		
		global $mysqli_project;
		
		$result = [];
		$result[0] = false;
		$result[1] = false;
		$result[2] = false;
		
		//dashboard
		$ergebnis = $mysqli_project->query("SELECT name, descr, thumbnail, price_model FROM kurse WHERE ID='".$_SESSION["kurs_hosting"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["name"] != "" AND $row["descr"] != "" AND $row["thumbnail"] != 0 AND $row["price_model"] != ""){
					$result[0] = true;
				}
			}
		}
		
		//content
		$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_module WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND visibility=1 AND descr!='' AND title!=''");
		if(mysqli_num_rows($ergebnis) > 0){
			$result[1] = true;
		}
		
		//pages
		$ergebnis = $mysqli_project->query("SELECT ID, type, name FROM kurse_temp WHERE 	ID IN (SELECT temp_product FROM kurse WHERE ID=".$_SESSION["kurs_hosting"].")
																						OR 	ID IN (SELECT temp_sell FROM kurse WHERE ID=".$_SESSION["kurs_hosting"].")
																						OR	ID IN (SELECT temp_ty FROM kurse WHERE ID=".$_SESSION["kurs_hosting"].")");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$pages_check = Array(false, false, false);
			$x = 0;
			
			while($row = $ergebnis->fetch_assoc()){
				
				$product_conf_file = "../html/product_temp/".$row["type"]."_".$row["name"]."_conf.php";
				if(is_file($product_conf_file)){
					include($product_conf_file);
					
					if(isset( ${ $row["type"]."_publish" } )){
						$product_publish_arr = ${ $row["type"]."_publish" };
						
						for($z=0; $z<count($product_publish_arr); $z++){
							$product_publish_arr[$z] = "'".$product_publish_arr[$z]."'";
						}
						
						$ergebnis2 = $mysqli_project->query("SELECT ID FROM kurse_temp_content WHERE 	kurs_id='".$_SESSION["kurs_hosting"]."' AND temp_id='".$row["ID"]."' AND pos IN (".implode(",",$product_publish_arr).")
																										AND (type!='text' OR (type='text' AND content!=''))");
						if(mysqli_num_rows($ergebnis2) == count($product_publish_arr))
							$pages_check[$x] = true;
					}
					else
						$pages_check[$x] = true;
				}
				else
					$pages_check[$x] = true;
				
				$x++;
			}
			
			$result[2] = true;
			
			for($x=0; $x<count($pages_check); $x++){
				
				if($pages_check[$x] == false)
					$result[2] = false;
			}
		}
		
		return json_encode($result);
	}
	
	if($task == "kurs_publish_check"){
		
		echo kurs_publish_check();
	}
	//--------------------publish
	if($task == "kurs_publish"){
		
		$publish_check = kurs_publish_check();
		$bool = true;
		for($x=0; $x<count($publish_check); $x++){
			
			if($publish_check[$x] == false)
				$bool = false;
		}
		
		if($bool === true){
			//check user_icon
			if( mysqli_num_rows($mysqli_project->query("SELECT ID FROM media WHERE ID IN (SELECT icon FROM user WHERE user_key='".$_SESSION["lc_user_key"]."')") ) > 0 ){
				$mysqli_project->query("UPDATE kurse_marketplace SET status='pre_online' WHERE kurs_id='".$_SESSION["kurs_hosting"]."'");
			
				//first course
				$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin' AND ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='online')");
				if(mysqli_num_rows($ergebnis) == 0){
					
					$mysqli_project->query("UPDATE user_msg_settings SET rights='all' WHERE type='support' AND user_key='".$_SESSION["lc_user_key"]."'");
				}
                //consents
                // consent( "ersteller_agb", true );
			}
			else{
				echo "user_icon";
			}
		}
	}
	
	//number of created courses
	if($task == "kurs_create_number"){
		
		echo mysqli_num_rows( $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin'") );
	}
	
	
	//--------------------media_library
	
	function kurs_lib_check_rights( $media_id ){
		
		global $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE kurs_id IN (SELECT kurs_id FROM kurse_media WHERE ID='".$media_id."') AND user_key='".$_SESSION["lc_user_key"]."' AND rights='admin'");
		if(mysqli_num_rows($ergebnis) > 0){
			return true;
		}
		else
			return false;
	}
	
	//operations
    if($task == "kurs_lib_receive"){

	    $result = [];

        $ergebnis = $mysqli_project->query("SELECT ID, type, name, media_id, video_id FROM kurse_media WHERE kurs_id='".$_SESSION["kurs_hosting"]."' ORDER BY ID ASC");
        if(mysqli_num_rows($ergebnis) > 0){

            $x=0;

            while($row = $ergebnis->fetch_assoc()){

                $result[$x]["lib_id"]   = $row["ID"];
                $result[$x]["lib_type"] = $row["type"];

                $result[$x]["h_name"]   = $row["name"];

                //media info
                if($row["type"] != "video"){
                    $ergebnis2 = $mysqli_project->query("SELECT filename, size, timestamp FROM media WHERE ID=".$row["media_id"]);
                    if(mysqli_num_rows($ergebnis2) > 0){
                        while($row2 = $ergebnis2->fetch_assoc()){
                            if($row["type"] == "img")
                                $result[$x]["img_src"]  = $row2["filename"];

                            $result[$x]["size"]         = $row2["size"];
                            $result[$x]["timestamp"]    = $row2["timestamp"];
                            $result[$x]["filename"]     = $row2["filename"];
                        }
                    }
                }
                else{
                    $ergebnis2 = $mysqli_project->query("SELECT size, timestamp FROM vimeo_video WHERE ID=".$row["video_id"]);
                    if(mysqli_num_rows($ergebnis2) > 0){
                        while($row2 = $ergebnis2->fetch_assoc()){
                            $result[$x]["size"] = $row2["size"];
                            $result[$x]["timestamp"] = $row2["timestamp"];
                        }
                    }
                }

                $x++;
            }
        }

        if(count($result) > 0){
            echo json_encode($result);
        }
    }
	if($task == "kurs_lib_rename"){
		
		if(kurs_lib_check_rights($post["id"])){
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_media WHERE name='".$post["name"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'");
			
			if(mysqli_num_rows($ergebnis) == 0){
				
				$mysqli_project->query("UPDATE kurse_media SET name='".$post["name"]."' WHERE ID='".$post["id"]."'");
			}
			else{
				while($row = $ergebnis->fetch_assoc()){
					
					if($post["id"] != $row["ID"])
						echo "invalid_name";
				}
			}
		}
	}
	if($task == "kurs_lib_remove"){
		
		if(kurs_lib_check_rights($post["id"]) AND (isset($_SESSION["kurs_hosting"]) OR isset($_SESSION["kurs_application"]))){
			
			if(isset($_SESSION["kurs_hosting"]))
				$kurs_id = $_SESSION["kurs_hosting"];
			else
				$kurs_id = $_SESSION["kurs_application"];
			
			$result = "";
			
			//get media_id / video_id
			$media_id;
			$video_id;
			
			$ergebnis = $mysqli_project->query("SELECT media_id, video_id FROM kurse_media WHERE ID='".$post["id"]."'");
			while($row = $ergebnis->fetch_assoc()){
				
				$media_id = $row["media_id"];
				$video_id = $row["video_id"];
			}
			
			//check thumbnail
            if($media_id != 0) {
                $ergebnis = $mysqli_project->query("SELECT ID FROM kurse WHERE thumbnail='" . $media_id . "' AND ID='" . $kurs_id . "'");
                if (mysqli_num_rows($ergebnis) > 0) {
                    $result = "thumbnail";
                }
            }

			//check temp
			$ergebnis = $mysqli_project->query("SELECT type FROM kurse_temp WHERE ID IN (SELECT temp_id FROM kurse_temp_content WHERE kurs_id='".$kurs_id."' AND kurse_media_id='".$post["id"]."') LIMIT 1");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					$result = "temp_".$row["type"];
				}
			}
			
			//check video
			if($video_id != 0){
				$ergebnis = $mysqli_project->query("SELECT title FROM kurse_module WHERE video_id='".$post["id"]."'");
				if(mysqli_num_rows($ergebnis)){
					
					while($row = $ergebnis->fetch_assoc()){
						
						$result = "module_".$row["title"];
					}
				}
			}
			
			if($result == ""){
				
				if($media_id != 0){
					
					//get filename
					$filename;
					$ergebnis = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$media_id."'");
					while($row = $ergebnis->fetch_assoc()){
						$filename = $row["filename"];
					}
					
					if(is_file("../media/project/".$filename))
						unlink("../media/project/".$filename);
					if(is_file("../media/project/kurse_small/".$filename))
						unlink("../media/project/kurse_small/".$filename);
					if(is_file("../media/project/kurse_thumb/".$filename))
						unlink("../media/project/kurse_thumb/".$filename);
				}
				else if($video_id != 0){
					
					//get vimeo_id
					$ergebnis = $mysqli_project->query("SELECT vimeo_id, thumbnail FROM vimeo_video WHERE ID='".$video_id."'");
					if(mysqli_num_rows($ergebnis) > 0){
						
						while($row = $ergebnis->fetch_assoc()){
							require_once("vimeo.php");
							vimeo_request( "DELETE", "https://api.vimeo.com/videos/".$row["vimeo_id"], [], [] );
							$mysqli_project->query("DELETE FROM vimeo_video WHERE ID='".$video_id."'");
							
							$mysqli_project->query("DELETE FROM kurse_media WHERE media_id='".$row["thumbnail"]."' AND type='v_thumb' AND kurs_id='".$kurs_id."'");
							
							$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
							if(mysqli_num_rows($ergebnis2) > 0){
								while($row2 = $ergebnis2->fetch_assoc()){
									unlink("../media/project/video_thumb/desktop/".$row2["filename"]);
									unlink("../media/project/video_thumb/mobile/".$row2["filename"]);
								}
							}
							$mysqli_project->query("DELETE FROM media WHERE ID='".$row["thumbnail"]."'");
						}
					}
				}
				
				$mysqli_project->query("DELETE FROM media WHERE ID='".$media_id."'");
				$mysqli_project->query("DELETE FROM kurse_media WHERE ID='".$post["id"]."'");
			}
			else{
				echo $result;
			}
		}
	}
	if($task == "kurs_lib_video_thumb"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_media WHERE media_id='".$post["thumb_id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."' AND type='v_thumb'") ) > 0){
			
			$ergebnis = $mysqli_project->query("SELECT vimeo_id, thumbnail FROM vimeo_video WHERE ID=(SELECT video_id FROM kurse_media WHERE ID='".$post["video_id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."' AND type='video')");
			if(mysqli_num_rows( $ergebnis ) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
				
					$mysqli_project->query("DELETE FROM kurse_media WHERE media_id='".$row["thumbnail"]."' AND type='v_thumb' AND kurs_id='".$_SESSION["kurs_hosting"]."'");
					
					$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
					if(mysqli_num_rows($ergebnis2) > 0){
						while($row2 = $ergebnis2->fetch_assoc()){
							unlink("../media/project/video_thumb/desktop/".$row2["filename"]);
							unlink("../media/project/video_thumb/mobile/".$row2["filename"]);
						}
					}
					$mysqli_project->query("DELETE FROM media WHERE ID='".$row["thumbnail"]."'");
				
					$mysqli_project->query("UPDATE vimeo_video SET thumbnail='".$post["thumb_id"]."' WHERE vimeo_id='".$row["vimeo_id"]."'");
				}
			}
		}
	}
	
	//receive
	if($task == "kurs_lib_preview_receive"){
		
		if(kurs_lib_check_rights($post["id"])){
			
			$ergebnis = $mysqli_project->query("SELECT type, name, video_id, media_id FROM kurse_media WHERE ID='".$post["id"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				$result = [];
				
				while($row = $ergebnis->fetch_assoc()){
					
					if($row["type"] != "video"){
						
						$ergebnis2 = $mysqli_project->query("SELECT filename, size, timestamp FROM media WHERE ID='".$row["media_id"]."'");
						while($row2 = $ergebnis2->fetch_assoc()){
							
							$result["filename"] 	= $row2["filename"];
							$result["size"] 		= $row2["size"];
							$result["timestamp"] 	= $row2["timestamp"];
						}
						
						if($row["type"] == "img"){
							
							$dimensions = img_op(["dimensions", "../media/project/".$result["filename"]]);
							$width 		= $dimensions[0];
							$height 	= $dimensions[1];
							
							$result["res"] = $width." x ".$height;
						}
					}
					else{
						require_once("vimeo.php");
						
						//receive video data
						$ergebnis2 = $mysqli_project->query("SELECT vimeo_id, type, size, duration, timestamp, thumbnail FROM vimeo_video WHERE ID='".$row["video_id"]."'");
						while($row2 = $ergebnis2->fetch_assoc()){
							
							if($row2["duration"] == 0){
                                $result["duration"] = vimeo_check_encode( $row2["vimeo_id"] );
							}
							else{
								$result["duration"] 	= $row2["duration"];
							}
							
							$ergebnis3 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row2["thumbnail"]."'");
							if(mysqli_num_rows($ergebnis3) > 0){
								
								while($row3 = $ergebnis3->fetch_assoc()){
									$result["thumbnail"] = $row3["filename"];
								}
							}
							
							$result["filetype"] 	= $row2["type"];
							$result["size"] 		= $row2["size"];
							$result["timestamp"] 	= $row2["timestamp"];
							
							$result["vimeo_id"] 	= $row2["vimeo_id"];
						}
					}
					
					$result["name"] = $row["name"];
					$result["type"] = $row["type"];
				}
				echo json_encode($result);
			}
		}
	}
	
	
	//---------------------content
	if($task == "kurs_content_receive"){
		
		$result = [];
		$x = 0;
	
		$ergebnis = $mysqli_project->query("SELECT ID, title, visibility FROM kurse_lesson WHERE kurs_id='".$_SESSION["kurs_hosting"]."' ORDER BY pos ASC");
		if(mysqli_num_rows($ergebnis) > 0){
			while($rows = $ergebnis->fetch_assoc()){
				
				$result[$x]["id"] 			= $rows["ID"];
				$result[$x]["title"] 		= $rows["title"];
				$result[$x]["visibility"] 	= $rows["visibility"];
				
				$y=0;
				
				$ergebnis2 = $mysqli_project->query("SELECT ID, title, lesson_id, visibility, preview FROM kurse_module WHERE lesson_id='".$rows["ID"]."' ORDER BY pos ASC");
				if(mysqli_num_rows($ergebnis2) > 0){
					while($rows2 = $ergebnis2->fetch_assoc()){
						
						$result[$x]["module"][$y]["id"] 		= $rows2["ID"];
						$result[$x]["module"][$y]["title"] 		= $rows2["title"];
						$result[$x]["module"][$y]["lesson_id"] 	= $rows2["lesson_id"];
						$result[$x]["module"][$y]["visibility"] = $rows2["visibility"];
						$result[$x]["module"][$y]["preview"] 	= $rows2["preview"];
						
						$y++;
					}
				}
				
				$x++;
			}
			
			echo json_encode($result);
		}
	}
	if($task == "kurs_content_detail_receive"){
		
		$result = [];
		
		if($post["type"] == "lesson"){
			$ergebnis = $mysqli_project->query("SELECT title, descr, visibility FROM kurse_lesson WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["title"] 		= $row["title"];
					$result["descr"] 		= $row["descr"];
					$result["visibility"] 	= $row["visibility"];
				}
				
				echo json_encode($result);
			}
		}
		if($post["type"] == "module"){
			$ergebnis = $mysqli_project->query("SELECT title, descr, video_id, visibility, preview FROM kurse_module WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$result["title"] 		= $row["title"];
					$result["descr"] 		= $row["descr"];
					$result["video_id"] 	= $row["video_id"];
					$result["visibility"] 	= $row["visibility"];
					$result["preview"] 		= $row["preview"];
					
					$ergebnis2 = $mysqli_project->query("SELECT vimeo_id, thumbnail FROM vimeo_video WHERE ID=(SELECT video_id FROM kurse_media WHERE ID='".$row["video_id"]."')");
					if(mysqli_num_rows($ergebnis2) > 0){
						
						while($row2 = $ergebnis2->fetch_assoc()){
							$result["vimeo_id"] = $row2["vimeo_id"];
							
							$ergebnis3 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row2["thumbnail"]."'");
							while($row3 = $ergebnis3->fetch_assoc()){
								$result["video_thumbnail"] 	= $row3["filename"];
							}
						}
					}
					
					//video_receive einfügen
				}
				
				echo json_encode($result);
			}
		}
	}
	if($task == "kurs_content_update"){
		
		if(isset($_SESSION["kurs_application"]))
			$kurs_id = $_SESSION["kurs_application"];
		
		if(isset($_SESSION["kurs_hosting"]))
			$kurs_id = $_SESSION["kurs_hosting"];
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_".$post["type"]." WHERE ID='".$post["id"]."' AND kurs_id='".$kurs_id."'") ) > 0){
			
			$val = $post["val"];
			
			if($post["attr"] == "descr")
				$val = str_replace("'", "&apos;", $_POST["val"]);
			
			$mysqli_project->query("UPDATE kurse_".$post["type"]." SET ".$post["attr"]."='".$val."' WHERE ID=".$post["id"]);
		}
	}
	if($task == "kurs_content_pos_update"){
		
		for($x=0; $x<count($post["pos_lesson"]); $x++){
			
			$pos_lesson =  $post["pos_lesson"][$x];
			
			if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_lesson WHERE ID='".$pos_lesson."' AND pos=".($x+1)) ) == 0)
				$mysqli_project->query("UPDATE kurse_lesson SET pos=".($x+1)." WHERE ID='".$pos_lesson."'");
			
			if(isset($post["pos_module"][$x])){
				
				for($y=0; $y<count($post["pos_module"][$x]); $y++){
					
					$pos_module =  $post["pos_module"][$x][$y];
					
					if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$pos_module."' AND pos=".($y+1)." AND lesson_id='".$pos_lesson."'") ) == 0){
						$mysqli_project->query("UPDATE kurse_module SET pos=".($y+1).", lesson_id='".$pos_lesson."' WHERE ID='".$pos_module."'");
					}
				}
			}
		}
	}
	if($task == "kurs_content_visibility"){
		
		$publish = true;
		
		if($post["visibility"] == 1){
			//check publish
			if($post["type"] == "lesson"){
				
				$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_module WHERE lesson_id='".$post["id"]."' AND visibility='1'");
				if(mysqli_num_rows($ergebnis) == 0)
					$publish = "lesson_error";
			}
			if($post["type"] == "module"){
				
				$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["id"]."' AND descr!='' AND title!=''");
				if(mysqli_num_rows($ergebnis) == 0)
					$publish = "module_error";
			}
		}
		
		if($publish === true){
			
			if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_".$post["type"]." WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'") )){
				
				$mysqli_project->query("UPDATE kurse_".$post["type"]." SET visibility='".$post["visibility"]."' WHERE ID='".$post["id"]."'");
				
				if($post["visibility"] == 1){
					kurs_user_progress_update( $_SESSION["kurs_hosting"], 0 );
				}
			}
		}
		else{
			echo $publish;
		}
	}
	
	//-----lesson
	if($task == "kurs_content_lesson_create"){
		
		$ergebnis = $mysqli_project->query("SELECT pos FROM kurse_lesson WHERE kurs_id='".$_SESSION["kurs_hosting"]."' ORDER BY pos DESC LIMIT 1");
		if(mysqli_num_rows($ergebnis) > 0){
			while($row = $ergebnis->fetch_assoc()){
				$pos = $row["pos"];
			}
		}
		else
			$pos = 1;
		
		$mysqli_project->query("INSERT INTO kurse_lesson (kurs_id, pos, title, visibility) VALUES ('".$_SESSION["kurs_hosting"]."', ".($pos+1).", '".$post["title"]."', 0)");
		
		echo $mysqli_project->insert_id;
	}
	if($task == "kurs_content_lesson_remove"){
		
		if( mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_lesson WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'") ) > 0){
			
			$mysqli_project->query("DELETE FROM msg_reply_not WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND msg_id IN (SELECT ID FROM msg WHERE dest_type='module' AND dest_id IN (SELECT ID FROM kurse_module WHERE lesson_id='".$post["id"]."'))");
			$mysqli_project->query("DELETE FROM msg WHERE dest_type='module' AND dest_id IN (SELECT ID FROM kurse_module WHERE lesson_id='".$post["id"]."')");
			
			$mysqli_project->query("DELETE FROM kurse_lesson WHERE ID='".$post["id"]."'");
			$mysqli_project->query("DELETE FROM kurse_module WHERE lesson_id='".$post["id"]."'");
			
			$mysqli_project->query("DELETE FROM user_kurse_content WHERE type='lesson' AND content_id='".$post["id"]."'");
			$mysqli_project->query("DELETE FROM user_kurse_content WHERE type='module' AND content_id IN (SELECT ID FROM kurse_module WHERE lesson_id='".$post["id"]."')");
		}
	}
	
	//----module
	if($task == "kurs_content_module_create"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_lesson WHERE ID='".$post["lesson_id"]."'") ) > 0){
		
			$ergebnis = $mysqli_project->query("SELECT pos FROM kurse_module WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND lesson_id='".$post["lesson_id"]."' ORDER BY pos DESC LIMIT 1");
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					$pos = $row["pos"];
				}
			}
			else
				$pos = 1;
			
			$mysqli_project->query("INSERT INTO kurse_module (kurs_id, lesson_id, pos, title, visibility, preview) VALUES ('".$_SESSION["kurs_hosting"]."', '".$post["lesson_id"]."', ".($pos+1).", '".$post["title"]."', 0, 0)");
			
			$insert_id = $mysqli_project->insert_id;
			
			//create project_msg
			$mysqli_project->query("INSERT INTO msg (user_key, type, dest_type, dest_id, layer, subject, content, timestamp)
													VALUES ('".$_SESSION["lc_user_key"]."', 'module', 'module', '".$insert_id."', 1, '', '', '".time()."')");
			$msg_id = $mysqli_project->insert_id;
			
			//reply_not preparing
			$mysqli_project->query("INSERT INTO msg_reply_not (user_key, kurs_id, msg_id, last_msg_id)
									VALUES ('".$_SESSION["lc_user_key"]."', ".$_SESSION["kurs_hosting"].", ".$msg_id.", ".$msg_id.")");
			
			echo $insert_id;
		}
	}
	if($task == "kurs_content_module_preview"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'") )){
			
			if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["id"]."' AND preview='".$post["val"]."'") ) == 0)
				$mysqli_project->query("UPDATE kurse_module SET preview='".$post["val"]."' WHERE ID='".$post["id"]."'");
		}
	}
	if($task == "kurs_content_module_video_update"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["module_id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'") ) > 0){
			
			$ergebnis = $mysqli_project->query("SELECT vimeo_id, thumbnail, duration FROM vimeo_video WHERE ID=(SELECT video_id FROM kurse_media WHERE ID='".$post["video_id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."')");
			
			if(mysqli_num_rows( $ergebnis ) > 0){
				
				while($row = $ergebnis->fetch_assoc()){

                    $duration = $row["duration"];

                    if($duration == 0){
                        require_once("vimeo.php");
                        $duration = vimeo_check_encode( $row["vimeo_id"] );
                    }

					if($duration != 0){
						$mysqli_project->query("UPDATE kurse_module SET video_id='".$post["video_id"]."' WHERE ID='".$post["module_id"]."'");
					}

					$result = [];
					$result["vimeo_id"] 	= $row["vimeo_id"];
					$result["duration"] 	= $duration;
					
					$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
					while($row2 = $ergebnis2->fetch_assoc()){
						$result["thumbnail"] 	= $row2["filename"];
					}
						
					echo json_encode($result);
				}
			}
			else{
				$mysqli_project->query("UPDATE kurse_module SET video_id='0' WHERE ID='".$post["module_id"]."'");
				echo json_encode(["vimeo_id"=>0]);
			}
		}
	}
	if($task == "kurs_content_module_remove"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_hosting"]."'") )){
			
			$mysqli_project->query("DELETE FROM kurse_module WHERE ID='".$post["id"]."'");
			$mysqli_project->query("DELETE FROM user_kurse_content WHERE type='module' AND content_id='".$post["id"]."'");
			
			$mysqli_project->query("DELETE FROM msg_reply_not WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND msg_id IN (SELECT ID FROM msg WHERE dest_type='module' AND dest_id='".$post["id"]."')");
			$mysqli_project->query("DELETE FROM msg WHERE dest_type='module' AND dest_id='".$post["id"]."'");
			
			kurs_user_progress_update( $_SESSION["kurs_hosting"], 0 );
		}
	}
	
	
	//-----------------------------------pages
	
	if($task == "kurs_pages_update"){
		
		$rights 	= true;
		
		$result		= [];
		
		$media_id 	= 0;
		$content	= "";
		
		if($post["type"] == "img"){
		
			$media_id = $post["content"];
			$rights = kurs_lib_check_rights( $media_id );
		}
		else if($post["type"] == "text"){
			
			$content = str_replace("'", "&apos;", $_POST["content"]);
		}
		
		if($rights === true){
			
			$ergebnis = $mysqli_project->query("SELECT temp_".$post["page_type"]." FROM kurse WHERE ID='".$_SESSION["kurs_hosting"]."'");
			while($row = $ergebnis->fetch_assoc()){
				$temp_id = $row["temp_".$post["page_type"]];
			}
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_temp_content WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND temp_id=".$temp_id." AND pos='".$post["pos"]."'");
			if(mysqli_num_rows($ergebnis) == 0){
				
				$mysqli_project->query("INSERT INTO kurse_temp_content (kurs_id, temp_id, pos, type, content, kurse_media_id)
																VALUES (".$_SESSION["kurs_hosting"].", ".$temp_id.", '".$post["pos"]."', '".$post["type"]."', '".$content."', '".$media_id."')");
			}
			else{
				
				$mysqli_project->query("UPDATE kurse_temp_content SET content='".$content."', kurse_media_id=".$media_id." WHERE kurs_id=".$_SESSION["kurs_hosting"]." AND pos='".$post["pos"]."'");
			}
			
			if($post["type"] == "img"){
				$ergebnis = $mysqli_project->query("SELECT filename FROM media WHERE ID IN (SELECT media_id FROM kurse_media WHERE ID=".$media_id.")");
				if(mysqli_num_rows($ergebnis) > 0){
					
					while($row = $ergebnis->fetch_assoc()){
						
						$result["filename"] = $row["filename"];
					}
				}
			}
			
			echo json_encode($result);
		}
	}
	
	//---------------------------marketing
	if($task == "kurs_keywords_update"){
		
		if(count( explode(",", $post["keywords"]) ) <= 5){
		
			$mysqli_project->query("UPDATE kurse_marketplace SET keywords='".$post["keywords"]."' WHERE kurs_id='".$_SESSION["kurs_hosting"]."'");
		}
	}
	
	
	
	//-----------------------------------member_area
	
	if($task == "kurs_join"){
		
		$rights = false;
		
		//check price_model
        if(mysqli_num_rows($mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["kurs_id"]."'")) == 0) {
            $ergebnis = $mysqli_project->query("SELECT ID FROM kurse WHERE ID='" . $post["kurs_id"] . "' AND price_model='free'");
            if (mysqli_num_rows($ergebnis) > 0) {
                $rights = true;
            } else {
                /* ÜBERARBEITEN
                $ergebnis = $mysqli_project->query("SELECT ID FROM elopage_transaction WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["kurs_id"]."'");
                if(mysqli_num_rows($ergebnis) > 0){
                    $rights = true;
                }
                */
                $rights = true;
            }
        }
		if($rights == true){
			$mysqli_project->query("INSERT INTO user_kurse (user_key, kurs_id, rights, progress, join_timestamp)
									VALUES ('".$_SESSION["lc_user_key"]."', '".$post["kurs_id"]."', 'premember', '0', '".time()."')");
		}
	}
	
	if($task == "kurs_memberarea" AND isset($_SESSION["login"])){
		
		if( mysqli_num_rows( $mysqli_project->query("SELECT ID FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$post["kurs_id"]."'") ) > 0 ){
			$_SESSION["kurs_memberarea"] = $post["kurs_id"];
			
			//check user_kurse_content
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_lesson WHERE kurs_id='".$post["kurs_id"]."' AND ID NOT IN (SELECT content_id FROM user_kurse_content WHERE type='lesson' AND kurs_id=".$_SESSION["kurs_memberarea"]." AND user_key='".$_SESSION["lc_user_key"]."')");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					$mysqli_project->query("INSERT INTO user_kurse_content	(user_key, kurs_id, type, content_id, status, progress)
																			VALUES('".$_SESSION["lc_user_key"]."', ".$_SESSION["kurs_memberarea"].", 'lesson', ".$row["ID"].", 0, 0)");
				}
			}
			
			$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_module WHERE kurs_id='".$post["kurs_id"]."' AND ID NOT IN (SELECT content_id FROM user_kurse_content WHERE type='module' AND kurs_id=".$_SESSION["kurs_memberarea"]." AND user_key='".$_SESSION["lc_user_key"]."')");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					//insert status settings > locked
					$mysqli_project->query("INSERT INTO user_kurse_content	(user_key, kurs_id, type, content_id, status, progress)
																			VALUES('".$_SESSION["lc_user_key"]."', ".$_SESSION["kurs_memberarea"].", 'module', ".$row["ID"].", 0, 0)");
				}
			}
		}
		else
			$_SESSION["kurs_memberarea"] = 0;
	}
	if($task == "kurs_m_module_receive"){
		
		$ergebnis = $mysqli_project->query("SELECT title, descr, video_id FROM kurse_module WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_memberarea"]."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$result = [];
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result["title"] = $row["title"];
				$result["descr"] = $row["descr"];

				if($row["video_id"] != 0) {

                    $ergebnis2 = $mysqli_project->query("SELECT vimeo_id, thumbnail FROM vimeo_video WHERE ID=(SELECT video_id FROM kurse_media WHERE ID='" . $row["video_id"] . "')");
                    if (mysqli_num_rows($ergebnis2) > 0) {

                        while ($row2 = $ergebnis2->fetch_assoc()) {

                            $result["vimeo_id"] = $row2["vimeo_id"];

                            $ergebnis3 = $mysqli_project->query("SELECT filename FROM media WHERE ID='" . $row2["thumbnail"] . "'");
                            if (mysqli_num_rows($ergebnis3) > 0) {

                                while ($row3 = $ergebnis3->fetch_assoc()) {

                                    $result["thumbnail"] = $row3["filename"];
                                }
                            }
                        }
                    }
                }
                else{
				    $result["vimeo_id"] = 0;
				    $result["thumbnail"] = 0;
                }
			}
			
			echo json_encode($result);
		}
	}
	if($task == "kurs_m_pmsg_module_receive"){
		
		if(mysqli_num_rows( $mysqli_project->query("SELECT ID FROM kurse_module WHERE ID='".$post["id"]."' AND kurs_id='".$_SESSION["kurs_memberarea"]."'") ) > 0){
		
			$ergebnis = $mysqli_project->query("SELECT ID FROM msg WHERE dest_type='module' AND dest_id='".$post["id"]."'");
			while($row = $ergebnis->fetch_assoc()){
				
				echo $row["ID"];
			}
		}
	}
	if($task == "kurs_m_user_content_status"){
		
		//insert drip-in check
		$mysqli_project->query("UPDATE user_kurse_content SET status='".$post["status"]."' WHERE content_id='".$post["content_id"]."' AND type='".$post["type"]."' AND user_key='".$_SESSION["lc_user_key"]."' AND kurs_id='".$_SESSION["kurs_memberarea"]."'");
		
		if($post["status"] == "done"){
			echo kurs_user_progress_update( $_SESSION["kurs_memberarea"], $_SESSION["lc_user_key"] );
		}
	}
	
?>