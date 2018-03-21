<?php
	if(!function_exists("consent")){
		
		function consent( $subject, $status ){
			
			global $mysqli_project, $consent_timestamp;
			
			if( mysqli_num_rows( $mysqli_project->query("SELECT ID FROM consents WHERE user_key='".$_SESSION["lc_user_key"]."' AND subject='".$subject."' AND subject_timestamp='".$consent_timestamp[ $subject ]."'") ) == 0 ){
			
				$mysqli_project->query("INSERT INTO consents (user_key, subject, subject_timestamp, status, timestamp)
										VALUES ('".$_SESSION["lc_user_key"]."', '".$subject."', '".$consent_timestamp[ $subject ]."', ".$status.", '". time() ."')");
			}
			else{
				$mysqli_project->query("UPDATE consents SET status=".$status." WHERE user_key='".$_SESSION["lc_user_key"]."' AND subject='".$subject."' AND subject_timestamp='".$consent_timestamp[ $subject ]."'");
			}
		}
		
		function media_files_remove(){
			//remove unused files
			
			global $mysqli_project;
			
			//media
			
			$remove_where_statement = "	ID NOT IN (SELECT icon FROM chatrooms WHERE icon_type='img') AND
										ID NOT IN (SELECT thumbnail FROM kurse) AND
										ID NOT IN (SELECT media_id FROM kurse_media) AND
										ID NOT IN (SELECT icon FROM user WHERE icon_type='img')";
			
			$ergebnis = $mysqli_project->query("SELECT filename FROM media WHERE ".$remove_where_statement." AND timestamp<'".(time()-20)."'");
			if(mysqli_num_rows($ergebnis) > 0){
				while($row = $ergebnis->fetch_assoc()){
					
					$filename = $row["filename"];
					
					if(is_file("../media/project/".$filename))
						unlink("../media/project/".$filename);
					if(is_file("../media/project/cw_icon/".$filename))
						unlink("../media/project/cw_icon/".$filename);
					if(is_file("../media/project/kurse_small/".$filename))
						unlink("../media/project/kurse_small/".$filename);
					if(is_file("../media/project/kurse_thumb/".$filename))
						unlink("../media/project/kurse_thumb/".$filename);
				}
				
				$mysqli_project->query("DELETE FROM media WHERE ".$remove_where_statement);
			}
			
			//vimeo
			
			$ergebnis = $mysqli_project->query("SELECT ID, vimeo_id FROM vimeo_video WHERE ID NOT IN (SELECT video_id FROM kurse_media WHERE type='video') AND timestamp<'".(time()-20)."'");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					
					if(is_file("vimeo.php"))
						include("vimeo.php");
					else if(is_file("temp/php_request/vimeo.php"))
						include("temp/php_request/vimeo.php");
					
					vimeo_request( "DELETE", "https://api.vimeo.com/videos/".$row["vimeo_id"], [], [] );
					$mysqli_project->query("DELETE FROM vimeo_video WHERE ID='".$row["ID"]."'");
				}
			}
		}
	}
?>