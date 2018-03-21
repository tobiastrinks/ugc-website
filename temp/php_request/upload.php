<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	$response = [];
	
	include("../dbconnect.php");
	include("../rights.php");
	include("../php_fct.php");
	
	include("../../cms/img_op.php");
	
	media_files_remove();
	
	if(!empty($_FILES)){
			
		//get filename extension
		$filename 		= $_FILES['file']['name'];
		$filename_wext 	= preg_replace('/\\.[^.\\s]{3,4}$/', '', $filename);
		$filename_ext	= str_replace($filename_wext, "", $filename);
		$filename_ext	= strtolower($filename_ext);

		$type			= explode(",", $post["type"]);
		
		if(upload_check_rights($type[0], $filename_ext) === true){

			if($type[0] == "kurs_file" AND (isset($_SESSION["kurs_hosting"]) OR isset($_SESSION["kurs_application"]))){
				
				if(isset($_SESSION["kurs_hosting"]))
					$kurs_id = $_SESSION["kurs_hosting"];
				else
					$kurs_id = $_SESSION["kurs_application"];
				
				//type
				if(!isset($type[1]) OR $type[1] != "video_thumb"){
					$h_type 		= "img";
				
					if($filename_ext == ".pdf"){
						$h_type = "pdf";
					}
					
					//application > remove old thumbnail if exists
					if(isset($_SESSION["kurs_application"])){
						$ergebnis = $mysqli_project->query("SELECT thumbnail FROM kurse WHERE ID='".$_SESSION["kurs_application"]."'");
						if(mysqli_num_rows($ergebnis) > 0){
							while($row = $ergebnis->fetch_assoc()){
								$mysqli_project->query("DELETE FROM kurse_media WHERE media_id='".$row["thumbnail"]."'");
							}
						}
					}
					
					//filename
					$h_filename_cache = str_replace($filename_ext, "", $_FILES['file']['name']);
					$h_filename = $h_filename_cache;
					$h_x = 2;
					
					while(mysqli_num_rows($mysqli_project->query("SELECT ID FROM kurse_media WHERE kurs_id=".$kurs_id." AND name='".$h_filename."'")) > 0){
						$h_filename = $h_filename_cache."-".$h_x;
						$h_x++;
					}
				}
				else if($type[1] == "video_thumb"){
					$h_type = "v_thumb";
					$h_filename = "v_thumb";
				}
			}
			
			$mysqli_project->query("INSERT INTO media (user_key, filename, size, timestamp)
									VALUES ('".$_SESSION["lc_user_key"]."', 0, ".$_FILES['file']['size'].", '".time()."')");
			$last_id = $mysqli_project->insert_id;

			$filename = $last_id.$filename_ext;
			$mysqli_project->query("UPDATE media SET filename='".$filename."' WHERE ID='".$last_id."'");
			
			$targetDir = "../media/project/";
			$targetFile = $targetDir.$filename;
			$result = move_uploaded_file($_FILES['file']['tmp_name'], $targetFile);

			if($result){
				if($filename_ext == ".jpg" OR $filename_ext == ".jpeg" OR $filename_ext == ".png" OR $filename_ext == ".gif"){
					
					$dimensions = img_op(["dimensions", $targetFile]);
					$width 		= $dimensions[0];
					$height 	= $dimensions[1];
					
					//compression
					if($type[0] == "cw_icon"){
						img_op(["crop", $targetFile, $targetFile, "400x400", "center", "-strip -treedepth 8 -interlace plane"]);
						img_op(["crop", $targetFile, $targetDir."cw_icon/".$filename, "200x200"]);
					}
					if($type[0] == "pb"){
						img_op(["crop", $targetFile, $targetFile, "500x500", "center", "-strip -treedepth 8 -interlace plane"]);
						img_op(["crop", $targetFile, $targetDir."cw_icon/".$filename, "200x200"]);
					}
					if($type[0] == "kurs_file"){
						img_op(["resize", $targetFile, $targetFile, "1920x1080", "-strip -treedepth 8 -interlace plane"]);
						img_op(["crop", $targetFile, $targetDir."kurse_small/".$filename, "200x200"]);
						
						if(isset($type[1])){
							
							if($type[1] == "thumbnail"){
								img_op(["crop", $targetFile, $targetDir."kurse_thumb/".$filename, "500x500"]);
								img_op(["crop", $targetFile, $targetDir."cw_icon/".$filename, "200x200"]);
							}
							if($type[1] == "video_thumb"){
								img_op(["crop", $targetFile, $targetDir."video_thumb/desktop/".$filename, "1980x1080"]);
								img_op(["crop", $targetFile, $targetDir."video_thumb/mobile/".$filename, "1360x720"]);
								unlink($targetFile);
							}
						}
					}					
				}
				
				if(($type[0] == "kurs_file") AND (isset($_SESSION["kurs_hosting"]) OR isset($_SESSION["kurs_application"]))){
					
					if(isset($_SESSION["kurs_hosting"]))
						$kurs_id = $_SESSION["kurs_hosting"];
					else
						$kurs_id = $_SESSION["kurs_application"];
					
					$mysqli_project->query("INSERT INTO kurse_media (kurs_id, type, video_id, name, media_id)
																	VALUES(".$kurs_id.", '".$h_type."', 0, '".$h_filename."', ".$last_id.")");
					$response["lib_id"] 	= $mysqli_project->insert_id;
					$response["lib_type"] 	= $h_type;
					$response["h_name"] 	= $h_filename.$filename_ext;
					$response["type"] 		= $h_type;
				}
				
				$response["id"] 		= $last_id;
				$response["src"] 		= $filename;
				$response["size"] 		= $_FILES['file']['size'];
				$response["timestamp"] 	= time();
				
				echo json_encode($response);
			}
			else{
				$mysqli_project->query("DELETE FROM media WHERE ID='".$last_id."'");
			}
			
		}
		else{
			echo "filetype_error";
		}
	}
?>