<?php 
include("../dbconnect.php");
include("../img_op.php");

if(isset($_SESSION["cms_login"]) AND $_SESSION["cms_login"] == 1){

	if(!empty($_FILES)){
		
		$targetDir = "../../temp/media/";
		
		//get filename extension
		$filename 		= $_FILES['file']['name'];
		$filename_wext 	= preg_replace('/\\.[^.\\s]{3,4}$/', '', $filename);
		$filename_ext	= str_replace($filename_wext, "", $filename);
		$filename_ext	= strtolower($filename_ext);
		
		
		for($x=0; $x>=0; $x++){
			
			$ergebnis = $mysqli->query("SELECT * FROM media WHERE src='unbenannt".$x.$filename_ext."' AND project_id='".$project_id."'");
			if(mysqli_num_rows($ergebnis) == 0){
				$filename = "unbenannt".$x.$filename_ext;
				$x=-2;
			}
		}
		$targetFile = $targetDir.$filename;
		
		$result = move_uploaded_file($_FILES['file']['tmp_name'], $targetFile);
		
		if($result){
		
			$filetype_db = "doc";
			
			if($filename_ext == ".jpg" OR $filename_ext == ".jpeg" OR $filename_ext == ".png" OR $filename_ext == ".gif"){
				
				$filetype_db = "img";
				
				//compression
				img_op(["resize", $targetFile, $targetFile, "1920x1080"]);
			}
			else{
					
				if($filename_ext == ".ico"){
					$filetype_db = "img";
				}
				if($filename_ext == ".pdf"){
					$filetype_db = "pdf";
				}
			}
		
		
			$mysqli->query("INSERT INTO media (type, src, alt, project_id, upload_date) VALUES('".$filetype_db."', '".$filename."', '".$filename_wext."', '".$project_id."', '".date("Y-m-d H:i:s")."')");
		}
	}
}

?>