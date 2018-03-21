<?php @session_start();
	
	include("../basic/php_fct.php");
	$post = html_encode($_POST);
	
	//lang > dbconnect.php

	if(isset($post["task"]))
		$task = $post["task"];
	else
		$task = 0;
	
	include("../dbconnect.php");
	
	if(isset($_SESSION["cms_login"]) AND $_SESSION["cms_login"] == 1){
	
		include("../img_op.php");
	
		//------------Inhalte bearbeiten-----------//
		
		if($task == "ib_content_media_check"){
			
			$ergebnis = $mysqli->query("SELECT * FROM content WHERE project_id='".$project_id."'");
			while($row = $ergebnis->fetch_assoc()){
				
				if( sizeof($row["media_id"]) > 0 ){
					$ergebnis2 = $mysqli->query("SELECT * FROM media WHERE ID='". $row["media_id"] ."' AND project_id='".$project_id."'");
					if( mysqli_num_rows($ergebnis2) == 0 ){
						$mysqli->query("DELETE FROM content WHERE media_id='". $row["media_id"] ."' AND project_id='".$project_id."'");
					}
				}
			}
			
		}
		
		if($task == "ib_text_change"){
			
			$page		= $post["page"];
			
			if($post["cmstype"] == "text_short")
				$cms_input = strip_tags( $post["cms_input"] );
			else
				$cms_input = str_replace("'", "&apos;", $_POST["cms_input"]);
			
			if($post["content_global"] == "1")
				$page = "-1";
			
			
			if(mysqli_num_rows($mysqli->query("SELECT * FROM content WHERE position='". $post["cmspos"] ."' AND page_id IN('".$post["page"]."','-1') AND lang='".$_SESSION["cms_lang"]."' AND project_id='". $project_id ."'")) > 0){
				$mysqli->query("UPDATE content SET text='". $cms_input ."', page_id='".$page."' WHERE position='". $post["cmspos"] ."' AND page_id IN('".$post["page"]."','-1') AND lang='".$_SESSION["cms_lang"]."' AND project_id='". $project_id ."'");
			}
			else
				$mysqli->query("INSERT INTO content (position, text, page_id, project_id, type, lang)
								VALUES ('".$post["cmspos"]."', '".$cms_input."', '".$page."', '".$project_id."', 'text', '".$_SESSION["cms_lang"]."')");
		}
		
		if($task == "ib_img_receive"){
			
			$ergebnis = $mysqli->query("SELECT * FROM content WHERE position='".$post["cmspos"]."' AND page_id IN('".$post["page"]."','-1') AND project_id=".$project_id);
			
			while($row = $ergebnis->fetch_assoc()){
				
				$ergebnis2 = $mysqli->query("SELECT * FROM media WHERE ID=".$row["media_id"]." AND project_id='".$project_id."'");
				
				if(mysqli_num_rows($ergebnis2) > 0){
				
					$result = [];
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$result["src"] = $row2["src"];
						$result["alt"] = $row2["alt"];
					}
					echo json_encode($result);
				}
			}
		}
		if($task == "ib_img_change"){
			
			$cms_position 	= $post["cmspos"];
			$cms_id			= $post["id"];
			
			$page 			= $post["page"];
			
			$content_global = $post["content_global"];
			if($content_global == "1")
				$page = "-1";
			
			if($cms_id != ""){
				
				$cms_ergebnis = $mysqli->query("SELECT * FROM content WHERE position='".$cms_position."' AND page_id IN('".$post["page"]."','-1') AND project_id='".$project_id."'");
				
				if(mysqli_num_rows($cms_ergebnis) == 0){
					$mysqli->query("INSERT INTO content (position, text, page_id, media_id, project_id, type, img_dia_pos)
									VALUES ('". $cms_position ."', '', ".$page.", '". $cms_id ."', '". $project_id ."', 'img', 0)");
				}
				else
					$mysqli->query("UPDATE content SET media_id='".$cms_id."', page_id='".$page."' WHERE position='".$cms_position."' AND page_id IN('".$post["page"]."','-1') AND project_id='".$project_id."'");	
			}
		}
		
		if($task == "ib_img_dia_change"){
			
			$cms_position 	= $post["cmspos"];
			$cms_id			= $post["cmsid"];
			
			$cms_order		= explode(",", $cms_id);
			
			$page 			= $post["page"];
			
			$content_global = $post["content_global"];
			if($content_global == "1")
				$page = "-1";
			
			//DELETE dia
			$mysqli->query("DELETE FROM content WHERE position='".$cms_position."' AND page_id IN ('".$post["page"]."','-1') AND project_id='".$project_id."'");
			
			for($x=0; $x>=0; $x++){
				
				if( isset($cms_order[$x]) ){
					
					//INSERT dia
					$mysqli->query("INSERT INTO content
									(position, text, page_id, media_id, project_id, type, img_dia_pos)
									VALUES ('". $cms_position ."', '', ".$page.", '". $cms_order[$x] ."', '". $project_id ."', 'img_dia', ". ($x+1) .")");
				}
				
				else
					$x=-2;
				
			}
		}
		

		//content_clone
		if($task == "add_element"){
			
			$ergebnis = $mysqli->query("SELECT * FROM content_clone WHERE class='".$post["clone_class"]."' AND project_id='".$project_id."'");
			$pos = mysqli_num_rows($ergebnis);
			
			$mysqli->query("INSERT INTO content_clone (class, position, project_id, visibility) 
							VALUES('".$post["clone_class"]."', '".$pos."', '".$project_id."', '0')");
		}
		
		if($task == "visibility"){
			
			$mysqli->query("UPDATE content_clone SET visibility='".$post["visibility"]."' WHERE ID='".$post["clone_id"]."'");
		}
		
		if($task == "refresh_class"){
			
			
			$id_array = explode(";", $post["clone_id"]);
			
			$delete = true;
			
			$ergebnis = $mysqli->query("SELECT * FROM content_clone WHERE class='".$post["clone_class"]."' AND project_id='".$project_id."'");
			while($row = $ergebnis->fetch_assoc()){
				
				for($x=0; $x<count($id_array); $x++){
					if($id_array[$x] == $row["ID"])
						$delete = false;
				}
				
				if($delete == true){
					$mysqli->query("DELETE FROM content_clone WHERE ID='".$row["ID"]."'");
					$mysqli->query("DELETE FROM content WHERE position LIKE '".$row["class"]."_clone".$row["ID"]."%' AND project_id='".$project_id."'");
				}
				else
					$delete = true;
			}
			
			for($x=0; $x<count($id_array); $x++){
				$mysqli->query("UPDATE content_clone SET position='".$x."' WHERE ID='".$id_array[$x]."'");			
			}
		}

		
		
		
		//------------Mediathek-----------//
		function media_thumbnail_create(){
			$pathToImages 	= "../../temp/media/";
			$pathToThumbs 	= "../../temp/media/thumbnail/";
			$thumbWidth 	= 300;

			global $mysqli, $project_id;
			
			$abfrage_create_thumb = $mysqli->query("SELECT * FROM media WHERE type='img' AND project_id='".$project_id."'");
			while($row_create_thumb = $abfrage_create_thumb->fetch_assoc()){
				
				$fname = $row_create_thumb["src"];
				
				// parse path for the extension
				$info = pathinfo($pathToImages.$fname);
				
				
				if ( strtolower($info['extension']) == 'jpg' OR strtolower($info['extension']) == 'jpeg' OR strtolower($info['extension']) == 'png' OR strtolower($info['extension']) == 'gif'){
					
					if(!is_file($pathToThumbs.$fname)){
						img_op(["crop", $pathToImages.$fname, $pathToThumbs.$fname, "195x120"]);
					}
				}
				
			}
		}
		
		function media_favicon(){
			
			global $mysqli, $project_id;
			
			
			$new_fav_src = "../../temp/media/favicon.png";
			$fav_dir = "../../temp/fav/";
			
			if(!is_dir($fav_dir))
				mkdir($fav_dir);
			
			if(is_file($new_fav_src)){
			
				$old_fav_src = $fav_dir."favicon.png";
			
				if(md5_file($new_fav_src) != @md5_file($old_fav_src) OR !is_file($old_fav_src)){
					
					copy($new_fav_src, $old_fav_src);
					
					
					$fav_data = Array(	//apple mobile
											Array("57", "apple-icon-57x57.png"),
											Array("60", "apple-icon-60x60.png"),
											Array("72", "apple-icon-72x72.png"),
											Array("76", "apple-icon-76x76.png"),
											Array("114", "apple-icon-114x114.png"),
											Array("120", "apple-icon-120x120.png"),
											Array("144", "apple-icon-144x144.png"),
											Array("152", "apple-icon-152x152.png"),
											Array("180", "apple-icon-180x180.png"),
											Array("192", "apple-icon-precomposed.png"),
											Array("192", "apple-icon.png"),
											
											//android
											Array("36", "android-icon-36x36.png"),
											Array("48", "android-icon-48x48.png"),
											Array("72", "android-icon-72x72.png"),
											Array("96", "android-icon-96x96.png"),
											Array("144", "android-icon-144x144.png"),
											Array("192", "android-icon-192x192.png"),
											
											//desktop
											Array("16", "favicon-16x16.png"),
											Array("32", "favicon-32x32.png"),
											Array("96", "favicon-96x96.png"),
											
											//ms
											Array("70", "ms-icon-70x70.png"),
											Array("144", "ms-icon-144x144.png"),
											Array("150", "ms-icon-150x150.png"),
											Array("310", "ms-icon-310x310.png")
										);
					
					for($x=0; $x<count($fav_data); $x++){
						
						$res = $fav_data[$x][0]."x".$fav_data[$x][0];
						$filename = $fav_data[$x][1];
						
						img_op(["crop", $old_fav_src, $fav_dir.$filename, $res]);
					}
				}
			}
			else{
				$files = glob($fav_dir."*");
				foreach($files as $file){
					if(is_file($file))
						unlink($file);
				}
			}
		}
		
		if($task == "media_receive"){
			
			$result = [];
			$x		= 0;

			$ergebnis_cms_media = $mysqli->query("SELECT * FROM media WHERE project_id=".$project_id);
			while($row_cms_media = $ergebnis_cms_media->fetch_assoc()){
				
				$result[$x]["ID"]			= $row_cms_media["ID"];
				$result[$x]["type"]			= $row_cms_media["type"];
				$result[$x]["src"]			= $row_cms_media["src"];
				$result[$x]["alt"]			= $row_cms_media["alt"];
				$result[$x]["upload_date"]	= $row_cms_media["upload_date"];
				
				$x++;
			}

			if(count($result) > 0)
				echo json_encode($result);
		}
		
		if($task == "media_thumbnail_create"){
			
			media_thumbnail_create();
		}
		
		if($task == "media_rename"){
			
			$id 		= $post["cms_id"];
			$newname 	= iconv("UTF-8", "CP437", $post["cms_newname"]);
			$newalt 	= $post["cms_newalt"];
			$type		= $post["cms_type"];

			$verzeichnis = "../../temp/media/";
			$verzeichnis_thumb = "../../temp/media/thumbnail/";

			$ergebnis = $mysqli->query("SELECT * FROM media WHERE src='".$newname."' AND ID!='".$id."' AND project_id='".$project_id."'");

			if(mysqli_num_rows($ergebnis) > 0){
				echo "Der Dateiname wird bereits verwendet!";
			}
			else{
				
				$ergebnis = $mysqli->query("SELECT * FROM media WHERE ID='".$id."' AND project_id='".$project_id."'");
				while($row = $ergebnis->fetch_assoc()){
					
					if(	rename( $verzeichnis.$row["src"] , $verzeichnis.$newname ) == true ){
						
						if($type == ".jpg" OR $type == ".jpeg" OR $type == ".png" OR $type == ".gif"){
							rename( $verzeichnis_thumb.$row["src"] , $verzeichnis_thumb.$newname );
							
							$mask = "../../temp/media/compressed/".pathinfo( basename($row["src"]), PATHINFO_FILENAME )."*.*";
							array_map('unlink', glob($mask));
						}
						
						$mysqli->query("UPDATE media SET src='".$newname."', alt='".$newalt."' WHERE ID='".$id."' AND project_id='".$project_id."'");
						
						media_favicon();
					}
					else
						echo "Fehler beim Umbenennen!";
				}
				
			}
		}
		
		if($task == "media_delete"){
			
			$auswahl = $post["auswahl"];
			$auswahl = rtrim($auswahl, ",");
			$auswahl = explode(",", $auswahl);

			for($x=0; $x<count($auswahl); $x++){
				
				$ergebnis = $mysqli->query("SELECT * FROM media WHERE ID='". $auswahl[$x] ."' AND project_id='".$project_id."'");
				while($row = $ergebnis->fetch_assoc()){
					
					unlink( "../../temp/media/".$row["src"] );
					
					if($row["type"] == "img"){
						
						$file = "../../temp/media/thumbnail/".$row["src"];
						
						if(is_file($file))
							unlink($file);
						
						$mask = "../../temp/media/compressed/".pathinfo( basename($row["src"]), PATHINFO_FILENAME )."*.*";
						array_map('unlink', glob($mask));
					}
					
					
					media_favicon();
				}
				
				$mysqli->query("DELETE FROM media WHERE ID='". $auswahl[$x] ."' AND project_id='".$project_id."'");
			}

			echo "true";
		}
		
		if($task == "media_zip_download"){
			
			$auswahl = $post["auswahl"];
			$auswahl = explode(",", $auswahl);
			
			if(is_dir("../../temp/media/zip") == false)
				mkdir("../../temp/media/zip");
			
			$zip_name = "temp/media/zip/".$post["zip_name"];
			$zip_name_old = $zip_name;
			
			if(file_exists("../../".$zip_name) == true)
				unlink("../../".$zip_name);
			
			/*
			for($x=0; file_exists("../../".$zip_name) == true ; $x++){
				$zip_name = str_replace(".zip", "", $zip_name_old);
				$zip_name = $zip_name.$x;
				$zip_name = $zip_name.".zip";
			}*/
			
			$zip = new ZipArchive();

			if($zip->open( "../../".$zip_name , ZIPARCHIVE::CREATE ) === TRUE){
				
				for($x=0; $x<count($auswahl); $x++){
					
					$ergebnis = $mysqli->query("SELECT * FROM media WHERE ID='". $auswahl[$x] ."' AND project_id='".$project_id."'");
					while($row = $ergebnis->fetch_assoc()){
						
						$src = $row["src"];
					}
					
					$zip->addFile("../../temp/media/".$src, $src);
				}
				$zip->close();
				echo $zip_name;
			}
			else{
				echo 'failed';
			}
		}
		
		
		
		//------------Seitenverwaltung-----------//
		
		function sv_filename_reload(){
		
			global $mysqli, $project_id, $cms_desktop_dir, $cms_mobile_dir;
		
			//get dir
			$fr_desktop_dir = $cms_desktop_dir;
			$fr_mobile_dir = $cms_mobile_dir;
			
			
			if(!isset($fr_changes))
				$fr_changes = "false";
			
			for($fr_x=0; $fr_x<2; $fr_x++){
			
				if($fr_x==0){ 	$fr_dir = $fr_desktop_dir; 		$fr_device = "desktop"; }
				else{ 			$fr_dir = $fr_mobile_dir; 		$fr_device = "mobile"; }
			
				$ergebnis_fr = $mysqli->query("SELECT * FROM page WHERE device='".$fr_device."' AND project_id='".$project_id."'");
				while($row_fr = $ergebnis_fr->fetch_assoc()){
					
					if(sizeof( glob("../..".$fr_dir.$row_fr["filename"]) ) == 0)
						$fr_changes = "true";
				}
			}
			
			if($fr_changes == "true"){
				
				for($fr_x=0; $fr_x<2; $fr_x++){
			
					if($fr_x==0){ $fr_dir = $fr_desktop_dir;	$fr_device = "desktop";}
					else{ 		  $fr_dir = $fr_mobile_dir;		$fr_device = "mobile";}
					
					$fr_home_dir = "";
					for($fr_y=0; $fr_y<(substr_count($fr_dir, '/')-1); $fr_y++){
						$fr_home_dir = $fr_home_dir."../";
					}
					
					array_map( "unlink", glob( "../..".$fr_dir."*.html" ) );
					
					$ergebnis_fr = $mysqli->query("SELECT * FROM page WHERE device='".$fr_device."' AND project_id='".$project_id."'");
					while($row_fr = $ergebnis_fr->fetch_assoc()){
						
						$filename 	= "../..".$fr_dir.$row_fr['filename'];
						$content 	= "<?php \$filename='".$row_fr['filename']."'; \$device='".$fr_device."'; \$home_dir='".$fr_home_dir."'; include('".$fr_home_dir."cms/control.php'); ?>";
						
						$filename	= utf8_decode ( $filename );
						
						file_put_contents($filename, utf8_encode($content));
					}
					
					//sitemap reload
					
					$sitemap_content = '<?xml version="1.0" encoding="UTF-8" ?>
	<urlset xmlns="http://www.google.com/schemas/sitemap/0.84" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd">';
				
				$ergebnis_fr = $mysqli->query("SELECT * FROM page WHERE device='".$fr_device."' AND ebene='1' AND project_id='".$project_id."'");
				if(mysqli_num_rows($ergebnis_fr)){	
					while($row_fr = $ergebnis_fr->fetch_assoc()){
						
						$sitemap_content .= "
	<url>
		<loc>
			http://".$_SERVER["HTTP_HOST"].$fr_dir.$row_fr["filename"]."
		</loc>
		<changefreq>
			weekly
		</changefreq>
		<priority>
			1.0
		</priority>
	</url>
	";
						
						$ergebnis_fr2 = $mysqli->query("SELECT * FROM page WHERE device='".$fr_device."' AND ebene='2' AND parent_page='".$row_fr["ID"]."' AND project_id='".$project_id."'");
						if(mysqli_num_rows($ergebnis_fr2)){
							while($row_fr2 = $ergebnis_fr2->fetch_assoc()){
								
								$sitemap_content .= "
		<url>
			<loc>
				http://".$_SERVER["HTTP_HOST"].$fr_dir.$row_fr2["filename"]."
			</loc>
			<changefreq>
				weekly
			</changefreq>
			<priority>
				0.9
			</priority>
		</url>
	";
							
								$ergebnis_fr3 = $mysqli->query("SELECT * FROM page WHERE device='".$fr_device."' AND ebene='3' AND parent_page='".$row_fr2["ID"]."' AND project_id='".$project_id."'");
								if(mysqli_num_rows($ergebnis_fr3)){
									while($row_fr3 = $ergebnis_fr3->fetch_assoc()){
										
										$sitemap_content .= "
			<url>
				<loc>
					http://".$_SERVER["HTTP_HOST"].$fr_dir.$row_fr3["filename"]."
				</loc>
				<changefreq>
					weekly
				</changefreq>
				<priority>
					0.8
				</priority>
			</url>
	";
										}
									}
								}
							}
						}
					}
					
					$sitemap_content .= "</urlset>";
					
					file_put_contents("../..".$fr_dir."sitemap.xml", "\xEF\xBB\xBF".$sitemap_content);
				}
			}
		}
		
		
		if($task == "sv_load_info"){
			
			//Seitendaten laden
			$ergebnis = $mysqli->query("SELECT * FROM page WHERE ID='".$post["id"]."' AND project_id='".$project_id."'");
			while($row = $ergebnis->fetch_assoc()){
				
				echo $row["name"].";";
				echo $row["title"].";";
				echo $row["filename"].";";
				
				echo $row["meta_keywords"].";";
				echo $row["meta_descr"].";";
				
				echo $row["pos"].";";
				echo $row["ebene"].";";
				echo $row["ID"].";";
				echo $row["parent_page"].";";
				echo $row["new_child"].";";
				echo $row["temp"].";";
				echo $row["device"];
			}
		}
		
		if($task == "sv_seitendaten"){
			
			//Seitendaten Update
			$id = $post["id"];
			
			if($id != ""){
		
				$mysqli->query("UPDATE page SET name='". $post["name"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET title='". $post["title"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				
				//filename check
				$filename = $post["filename"].".html";
				
				//filename is changed
				if(mysqli_num_rows( $mysqli->query("SELECT * FROM page WHERE ID='". $id ."' AND filename='". $filename ."' AND project_id='".$project_id."'") ) == 0){
					
					//new filename does not exist
					if(mysqli_num_rows( $mysqli->query("SELECT * FROM page WHERE filename='". $filename ."' AND project_id='". $project_id ."' AND device='".$post["device"]."'") ) == 0){
						
						$mysqli->query("UPDATE page SET filename='". $filename ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
					}
					else{
						echo "Der Dateiname existiert bereits.";
					}
				}
				
				$mysqli->query("UPDATE page SET meta_keywords='". $post["meta_keywords"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET meta_descr='". $post["meta_descr"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				
				$mysqli->query("UPDATE page SET pos='". $post["pos"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET ebene='". $post["ebene"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET parent_page='". $post["parent_page"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET new_child='". $post["new_child"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				
				$mysqli->query("UPDATE page SET temp='". $post["temp"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
				$mysqli->query("UPDATE page SET device='". $post["device"] ."' WHERE ID='". $id ."' AND project_id='".$project_id."'");
			}
			else{ //new_page_root
			
				$mysqli->query("INSERT INTO page 
							(name, title, temp, meta_keywords, meta_descr, ebene, pos, parent_page, filename, visible, project_id, new_child, device)
							VALUES ('".$post['name']."', '".$post['title']."', '".$post['temp']."', '".$post['meta_keywords']."', '".$post['meta_descr']."', '".$post['ebene']."', '".$post['pos']."', '".$post['parent_page']."', '".$post['filename'].".html', 'false', '".$project_id."', '".$post['new_child']."', '".$post['device']."')");
			}
			
			sv_filename_reload();
		}
		
		if($task == "sv_reihenfolge"){
			
			$id 	= $post["id"];
			$oldpos = $post["oldpos"];
			$newpos = $post["newpos"];
			
			$mysqli->query("UPDATE page SET pos=".$oldpos." WHERE pos='".$newpos."' AND project_id='".$project_id."'");
			$mysqli->query("UPDATE page SET pos=".$newpos." WHERE ID='".$id."' AND project_id='".$project_id."'");
		}
		
		if($task == "sv_change_visibility"){
			
			$visibility_id = $post["visibility_id"];
			
			$ergebnis_vis = $mysqli->query("SELECT * FROM page WHERE ID='". $visibility_id ."' AND project_id='".$project_id."'");
			
			while($row_vis = $ergebnis_vis->fetch_assoc()){
				$current_vis = $row_vis["visible"];
			}
			
			
			if($current_vis == "true"){
				$new_vis = "false";
			}
			else{
				$new_vis = "true";
			}
			
			$mysqli->query("UPDATE page SET visible='". $new_vis ."' WHERE ID='". $visibility_id ."' AND project_id='".$project_id."'");
		
		}
		
		
		if($task == "sv_new_child"){
			
			$nc_parent 		= $post["new_child_parent"];
			$nc_ebene	 	= $post["new_child_ebene"];
			$nc_device		= $post["new_child_device"];
			
			$nc_ebene_anzahl = 0;
			
			$nc_pos = mysqli_num_rows( $mysqli->query("SELECT * FROM page WHERE parent_page='".$nc_parent."' AND project_id='".$project_id."'") ) +1;
			
			if($nc_pos == 1)
				$ergebnis_nc = $mysqli->query("SELECT * FROM page WHERE ID='".$nc_parent."' AND project_id='".$project_id."'");
			else
				$ergebnis_nc = $mysqli->query("SELECT * FROM page WHERE parent_page='".$nc_parent."' AND project_id='".$project_id."'");
			
			while($row_nc = $ergebnis_nc->fetch_assoc()){
				$nc_temp = $row_nc["temp"];
			}
			
			
			//filename
			$nc_filename_counter = 0;
			$nc_filename_boolean = 0;
			
			while($nc_filename_boolean == 0){
				
				$nc_filename_boolean = 1;
				
				$ergebnis_nc = $mysqli->query("SELECT filename FROM page WHERE project_id='".$project_id."'");
				while($row_nc = $ergebnis_nc->fetch_assoc()){
					if($row_nc["filename"] == "name".$nc_filename_counter.".html"){
						$nc_filename_counter++;
						$nc_filename_boolean = 0;
					}
				}
			}
			
			$nc_filename = "name".$nc_filename_counter.".html";
			
			
			
			$mysqli->query("INSERT INTO page 
							(name, title, temp, meta_keywords, meta_descr, ebene, pos, parent_page, filename, visible, project_id, new_child, device)
							VALUES ('Neue Seite', 'Titel', '".$nc_temp."', 'Keywords', 'Beschreibung', '".$nc_ebene."', ". $nc_pos .", '".$nc_parent."', '".$nc_filename."', 'false', '".$project_id."', '-1', '".$nc_device."')");
			
			$ergebnis_nc = $mysqli->query("SELECT * FROM page WHERE filename='".$nc_filename."' AND project_id='".$project_id."'");
			
			while($row_nc = $ergebnis_nc->fetch_assoc()){
				$new_child_id = $row_nc["ID"];
			}
			
			sv_filename_reload();
			
			echo $new_child_id;

		}
		
		if($task == "sv_remove"){
			
			$dl_pageid = $post["id"];
			$dl_cms_sv_pageid = 1;
			
			$ergebnis_dl = $mysqli->query("SELECT parent_page FROM page WHERE ID='". $dl_pageid ."' AND project_id='".$project_id."'");
			while($row_dl = $ergebnis_dl->fetch_assoc()){
				
				if($row_dl["parent_page"] != "-1")
					$dl_cms_sv_pageid = $row_dl["parent_page"];
					
			}
			
			//delete subpages
			
			$mysqli->query("DELETE FROM page WHERE ID='". $dl_pageid ."' AND project_id='".$project_id."'");
			$mysqli->query("DELETE FROM content WHERE page_id='". $dl_pageid ."' AND project_id='".$project_id."'");
			
			for($x=2; $x<=3; $x++){
				$ergebnis_dl = $mysqli->query("SELECT * FROM page WHERE ebene='".$x."' AND project_id='".$project_id."'");
				while($row_dl = $ergebnis_dl->fetch_assoc()){
					
					$ergebnis_dl2 = $mysqli->query("SELECT * FROM page WHERE ID='".$row_dl["parent_page"]."' AND project_id='".$project_id."'");

					if(mysqli_num_rows($ergebnis_dl2) === 0){
					
						$ergebnis_dl3 = $mysqli->query("SELECT * FROM page WHERE parent_page='". $row_dl["parent_page"] ."' AND project_id='".$project_id."'");
						while($row_dl3 = $ergebnis_dl3->fetch_assoc()){
							$dl3_pageid = $row_dl3["ID"];
						}
						$mysqli->query("DELETE FROM page WHERE parent_page='". $row_dl["parent_page"] ."' AND project_id='".$project_id."'");
						$mysqli->query("DELETE FROM content WHERE page_id='". $dl3_pageid ."' AND project_id='".$project_id."'");
					}
				}
			}
			$fr_changes = "true";
			sv_filename_reload();
				
		}
		/*
		if($task == "sv_copy_desktop"){
			
			$mysqli->query("DELETE FROM page WHERE device='mobile' AND project_id='".$project_id."'");
			
			$ergebnis = $mysqli->query("SELECT * FROM page WHERE device='desktop' AND ebene='1' AND project_id='".$project_id."'");
			while($row = $ergebnis->fetch_assoc()){
				
				$mysqli->query("INSERT INTO page (name, title, temp, meta_keywords, meta_descr, ebene, pos, parent_page, filename, visible, project_id, new_child, device)
								VALUES ('".$row["name"]."', '".$row["title"]."', '".$row["temp"]."', '".$row["meta_keywords"]."', '".$row["meta_descr"]."', '".$row["ebene"]."', '".$row["pos"]."', '".$row["parent_page"]."', '".$row["filename"]."', '".$row["visible"]."', '".$project_id."', '".$row["new_child"]."', 'mobile')");
				
				$parent_id1 = $mysqli->insert_id;
				
				$ergebnis2 = $mysqli->query("SELECT * FROM page WHERE ebene='2' AND parent_page='".$row["ID"]."' AND device='desktop' AND project_id='".$project_id."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$mysqli->query("INSERT INTO page (name, title, temp, meta_keywords, meta_descr, ebene, pos, parent_page, filename, visible, project_id, new_child, device)
										VALUES ('".$row2["name"]."', '".$row2["title"]."', '".$row2["temp"]."', '".$row2["meta_keywords"]."', '".$row2["meta_descr"]."', '".$row2["ebene"]."', '".$row2["pos"]."', '".$parent_id1."', '".$row2["filename"]."', '".$row2["visible"]."', '".$project_id."', '".$row2["new_child"]."', 'mobile')");
						
						$parent_id2 = $mysqli->insert_id;
						
						$ergebnis3 = $mysqli->query("SELECT * FROM page WHERE ebene='3' AND parent_page='".$row2["ID"]."' AND device='desktop' AND project_id='".$project_id."'");
						if(mysqli_num_rows($ergebnis3) > 0){
							
							while($row3 = $ergebnis3->fetch_assoc()){
								
								$mysqli->query("INSERT INTO page (name, title, temp, meta_keywords, meta_descr, ebene, pos, parent_page, filename, visible, project_id, new_child, device)
												VALUES ('".$row3["name"]."', '".$row3["title"]."', '".$row3["temp"]."', '".$row3["meta_keywords"]."', '".$row3["meta_descr"]."', '".$row3["ebene"]."', '".$row3["pos"]."', '".$parent_id2."', '".$row3["filename"]."', '".$row3["visible"]."', '".$project_id."', '".$row3["new_child"]."', 'mobile')");
							}
						}
					}
				}
			}
			
			sv_filename_reload();
		}*/
	}
?>