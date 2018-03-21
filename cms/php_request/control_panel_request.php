<?php
@session_start();
	
	//kann ausgegliedert werden (Rechtekontrolle?)
	
	include("../dbconnect.php");
	
	if(isset($_GET["task"])){
		$task = $_GET["task"];
		
		if($task == "login"){
			
			$username = $_POST["username"];
			$pw = $_POST["pw"];
			
			if(mysqli_num_rows($cms_cp_ergebnis = $mysqli->query("SELECT * FROM user WHERE project_id='-1' AND username='".$username."' AND pw='".$pw."'")) >0){
				$_SESSION["cp_username"] = $username;
				$_SESSION["cp_pw"] = $pw;
				
				echo "true";
			}
			else{
				echo "false";
			}
		}
		
		
		if($task == "new_project"){
			
			
			//database new_project
			$mysqli->query("INSERT INTO project (domain) VALUES ('".$_SERVER["HTTP_HOST"]."')");
			
			//get project_id
			$cms_cp_ergebnis = $mysqli->query("SELECT * FROM project WHERE domain='".$_SERVER["HTTP_HOST"]."'");
			while($cms_cp_row = $cms_cp_ergebnis->fetch_assoc()){
				$project_id = $cms_cp_row["ID"];
			}
			
			if(is_dir("../../temp"))
				rename("../../temp", "../../temp".time());
			
			mkdir("../../temp");
			mkdir("../../temp/html");
			mkdir("../../temp/js");
			mkdir("../../temp/media");
			mkdir("../../temp/media/basic");
			mkdir("../../temp/media/thumbnail");
			mkdir("../../temp/style");
			
			$desktop_dir = $_POST["desktop_dir"];
			$mobile_dir = $_POST["mobile_dir"];
			if($desktop_dir == "")
				$desktop_dir = "/";
			if($mobile_dir == "")
				$mobile_dir = "/mobile/";
			
			if($desktop_dir != "/")
				mkdir("../../".substr($desktop_dir, 1));
			mkdir("../../".substr($mobile_dir, 1));
			
			//prepare files
			if(is_file("../../.htaccess"))
				unlink("../../.htaccess");
			copy("../new_project_files/.htaccess", "../../.htaccess");
			
			if(is_file("../../robots.txt"))
				unlink("../../robots.txt");
			copy("../new_project_files/robots.txt", "../../robots.txt");
			
			
			copy("../new_project_files/header.php", "../../temp/header.php");
			
			
			//prepare pages
			//desktop
			$mysqli->query("INSERT INTO page (name, title, ebene, pos, parent_page, filename, visible, project_id, device)
							VALUES ('Home', 'Home', 1, -1, 0, 'index.html', 'false', ".$project_id.", 'desktop')");
			//mobile
			$mysqli->query("INSERT INTO page (name, title, ebene, pos, parent_page, filename, visible, project_id, device)
							VALUES ('Home', 'Home', 1, -1, 0, 'index.html', 'false', ".$project_id.", 'mobile')");
			
			$fr_changes = true;
			include("edit.php");
			sv_filename_reload();
		}
		
		if($task == "domain_change"){
			if(mysqli_num_rows($mysqli->query("SELECT * FROM project WHERE domain='".$_POST["old_domain"]."'")) > 0)
				$mysqli->query("UPDATE project SET domain='".$_SERVER["HTTP_HOST"]."' WHERE domain='".$_POST["old_domain"]."'");
			else
				echo "Fehler: Die Domain existiert in keinem Projekt!";
		}
		
		
		if($task == "db_edit"){
			
			$mysqli->query("UPDATE ".$_POST["table"]." SET ".$_POST["field"]."='".$_POST["val"]."' WHERE ID='".$_POST["id"]."'");
		}
		
		if($task == "db_insert"){
			
			$fields_string 	= "";
			$val_string 	= "";
			
			for($x=0; $x<count($_POST["fields"]); $x++){
				$fields_string 	.= $_POST["fields"][$x].",";
				$val_string 	.= "'".$_POST["val"][$x]."',";
			}
			$fields_string 	= substr($fields_string, 0, -1);
			$val_string 	= substr($val_string, 0, -1);
			
			$mysqli->query("INSERT INTO ".$_POST["table"]." (".$fields_string.",project_id) VALUES (".$val_string.",'".$project_id."')");
			echo $mysqli->insert_id;
		}
		
		if($task == "db_delete"){
			$mysqli->query("DELETE FROM ".$_POST["table"]." WHERE ID='".$_POST["id"]."'");
		}
	}
?>