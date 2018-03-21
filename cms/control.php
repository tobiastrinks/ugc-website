<?php
	//umleitung bei 'filename.html/'
	if(substr($_SERVER["REQUEST_URI"], -1-(strlen($filename)) ) == $filename."/"){
		header('Location: ../'.$filename);
		exit();
	}
?>
<!DOCTYPE html>

<?php 
	//desktop/mobile dir > dbconnect.php
	
	$cms_dir = $home_dir."cms/";
	$temp_basic_dir = $home_dir."temp/media/basic/";
	
	include($cms_dir."dbconnect.php");
	
	function startsWith($haystack, $needle) {
		return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
	}
	function endsWith($haystack, $needle) {
		return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
	}
	
	$full_filename = basename($_SERVER["REQUEST_URI"]);
	
	$cms_server_protocol = explode("/", strtolower($_SERVER["SERVER_PROTOCOL"]));
	$cms_server_protocol = $cms_server_protocol[0];
	$cms_server_protocol .= (empty($_SERVER["HTTPS"]) ? "": ($_SERVER["HTTPS"]=='on') ? "s": "")."://";
	
	include($cms_dir."basic/php_fct.php");
	
	$cms_ergebnis = $mysqli->query("SELECT * FROM page WHERE filename='". $filename ."' AND device='".$device."' AND project_id='".$project_id."'");
	
	if(mysqli_num_rows($cms_ergebnis) > 0){ 
		while($cms_row = $cms_ergebnis->fetch_assoc()){
?>

<html lang="de">
	
	<head itemscope itemtype="http://schema.org/WebSite">
		
		<?php
			$error404 = false;
		?>
		
		<meta charset="utf-8" />
		
		<title itemprop='name'><?=$cms_row["title"]; ?></title>
		
		<link rel="apple-touch-icon" sizes="57x57" href="<?=$home_dir;?>temp/fav/apple-icon-57x57.png">
		<link rel="apple-touch-icon" sizes="60x60" href="<?=$home_dir;?>temp/fav/apple-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="72x72" href="<?=$home_dir;?>temp/fav/apple-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="76x76" href="<?=$home_dir;?>temp/fav/apple-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="114x114" href="<?=$home_dir;?>temp/fav/apple-icon-114x114.png">
		<link rel="apple-touch-icon" sizes="120x120" href="<?=$home_dir;?>temp/fav/apple-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="144x144" href="<?=$home_dir;?>temp/fav/apple-icon-144x144.png">
		<link rel="apple-touch-icon" sizes="152x152" href="<?=$home_dir;?>temp/fav/apple-icon-152x152.png">
		<link rel="apple-touch-icon" sizes="180x180" href="<?=$home_dir;?>temp/fav/apple-icon-180x180.png">
		
		<link rel="icon" type="image/png" sizes="192x192"  href="<?=$home_dir;?>temp/fav/android-icon-192x192.png">

		<link rel="icon" type="image/png" sizes="32x32" href="<?=$home_dir;?>temp/fav/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="96x96" href="<?=$home_dir;?>temp/fav/favicon-96x96.png">
		<link rel="icon" type="image/png" sizes="16x16" href="<?=$home_dir;?>temp/fav/favicon-16x16.png">
		
		<meta name="msapplication-TileColor" content="#ffffff">
		<meta name="msapplication-TileImage" content="<?=$home_dir;?>temp/fav/ms-icon-144x144.png">
		<meta name="theme-color" content="#ffffff">
		
		<meta name="keywords" content="<?=$cms_row["meta_keywords"]; ?>" />
		<meta name="description" content="<?=$cms_row["meta_descr"]; ?>" />
		
		<?php include($home_dir."temp/header.php"); ?>
		
		<link type="text/css" href="<?=$cms_dir;?>style/basic.css" rel="stylesheet" />
		<link rel="stylesheet" href="<?=$home_dir;?>cms/basic/font_awesome/css/font-awesome.min.css" />
		
		<?php if($cms_row["device"] == "desktop"){ 
				
				$mobile_dev_dir = $cms_server_protocol.$_SERVER["HTTP_HOST"].$cms_mobile_dir;
				
				$mobile_dev_filename = $mobile_dev_dir.$full_filename;
		?>
			<script type="text/javascript">
				var isMobile = false; //initiate as false
				// device detection
				if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
					|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
				
				if(isMobile)
					window.location = "<?=$mobile_dev_filename;?>";
			</script>
		
			<meta name="viewport" content="width=device-width, initial-scale=1">
		<?php }
		else{
		?>
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<?php } ?>
		
		<script type="text/javascript">
			var glob_cms_filename 		= "<?=$filename; ?>";
			var glob_cms_full_filename 	= "<?=$full_filename; ?>";
			var glob_cms_pageid 		= "<?=$cms_row["ID"]; ?>";
			var glob_cms_device 		= "<?=$device; ?>";
			var glob_cms_home_dir 		= "<?=$home_dir; ?>";
			var glob_cms_desktop_dir 	= "<?=$cms_desktop_dir; ?>";
			var glob_cms_mobile_dir 	= "<?=$cms_mobile_dir; ?>";
			var glob_cms_lang 			= "<?=$_SESSION["cms_lang"]; ?>";
		</script>
		
		<script type="text/javascript" src="<?=$cms_dir;?>js/cover.js"></script>
		<script type="text/javascript" src="<?=$cms_dir;?>js/basic.js"></script>
		<script type="text/javascript" src="<?=$cms_dir;?>js/temp.js"></script>
		
		<?php
		
		//GOOGLE ANALYTICS
		if(is_file($home_dir."gtag.html")){
			//include($home_dir."gtag.html");
		}
		
		$cms_login = "false";
		
		$cms_ergebnis2 = $mysqli->query("SELECT css_filename, js_filename FROM temp WHERE name='".$cms_row["temp"]."' AND project_id='".$project_id."'");
		
		while($cms_row2 = $cms_ergebnis2->fetch_assoc()){
			
			$css_filename 	= $cms_row2["css_filename"];
			if($css_filename != ""){
				$css_filename 	= explode(",", $css_filename);
				
				$css_count		= count( $css_filename );
				
				for($x=0; $x<$css_count; $x++){
					echo '<link type="text/css" href="'.$home_dir.'temp/style/'.$css_filename[$x].'" rel="stylesheet" />';
				}
			}
			
			$js_filename 	= $cms_row2["js_filename"];
			
			if($js_filename != ""){
				$js_filename 	= explode(",", $js_filename);
				
				$js_count		= count( $js_filename );
				
				for($x=0; $x<$js_count; $x++){
					echo '<script type="text/javascript" src="'.$home_dir.'temp/js/'.$js_filename[$x].'"></script>';
				}
			}
		}
		
		if($error404 === true){
			?>
			<script type="text/javascript">
				window.location = "index.html";
			</script>
			<?php
		}
		
		include($cms_dir."admin.php");
		
		?>
		
	</head>
	
	<body id="page<?=$cms_row["ID"]; ?>">
	
		<div id="loading"><?php
		
				if(is_file($home_dir."temp/loading.html"))
					include($home_dir."temp/loading.html");
		?></div>
		
		<?php
			//cms_widgets -> dont load page
			$load_page = "true";
		
			?>
			
			<?php
			include($home_dir."cms/img_op.php");
			
			//login
			if(isset($_GET["cms"])){
				if($_GET["cms"] == "login"){
					echo'<link type="text/css" href="'.$cms_dir.'style/cms.css" rel="stylesheet" media="screen" />';
					include($cms_dir."login.html");
					echo'<script type="text/javascript" src="'.$cms_dir.'js/login.js"></script>';
				}
			}
			//cms_include_files > end of body
			
			
			
			if($load_page == "true" AND $error404 != true){
			
				/* parent1 finden */
				
				$parent1	= $cms_row["ID"];
				$ebene 		= $cms_row["ebene"];
				
				while($ebene != 1){
					
					$cms_ergebnis_nav2 = $mysqli->query("SELECT parent_page  FROM page WHERE ID=".$parent1." AND project_id=".$project_id);
					
					while($cms_row_nav2 = $cms_ergebnis_nav2->fetch_assoc()){
					
						$parent1 = $cms_row_nav2["parent_page"];
						$ebene--;
					}
				}
				?>
                <div id="playSound"></div>
				<div id="wrapper" class="<?=$device;?>">
				<?php
				/* TEMPLATE */
					
					$cms_ergebnis2 = $mysqli->query("SELECT html_url FROM temp WHERE name='".$cms_row["temp"]."' AND project_id='".$project_id."'");
			
					while($cms_row2 = $cms_ergebnis2->fetch_assoc()){
						
						//content Variablen aus Datenbank lesen -> für temp
						
						$cms_ergebnis3  = $mysqli->query("SELECT position, text, type, media_id, img_dia_pos FROM content WHERE page_id IN('-1','".$cms_row["ID"]."') AND (type IN ('img', 'img_dia') OR (type='text' AND lang='".$_SESSION["cms_lang"]."')) AND project_id=".$project_id);
		
						while($cms_row3 = $cms_ergebnis3->fetch_assoc()){
							
							${$cms_row3["position"]} = $cms_row3["text"];
							
							
							//img zusammensetzen
							
							$cms_ergebnis4 = $mysqli->query("SELECT ID, src, alt, res_x, res_y FROM media WHERE ID='".$cms_row3["media_id"]."' AND project_id=".$project_id);
							while($cms_row4 = $cms_ergebnis4->fetch_assoc()){
								
								$cms_img_cache = array("id"=>$cms_row4["ID"], "src"=>$home_dir."temp/media/".$cms_row4["src"], "alt"=>$cms_row4["alt"], "res_x"=>$cms_row4["res_x"], "res_y"=>$cms_row4["res_y"]);
								
								if($cms_row3["type"] == "img"){
									${$cms_row3["position"]} = $cms_img_cache;
								}
								if($cms_row3["type"] == "img_dia"){
									${$cms_row3["position"].$cms_row3["img_dia_pos"]} = $cms_img_cache;
								}
							}
						}
						
						function cms_load_img(&$element, $max_width, $max_height, $extra_attr){
							
							global $mysqli;
							
							if($extra_attr == 0)
								$extra_attr = "";
							
							if(isset($element["src"])){
								
								$src 	= $element["src"];
								$alt 	= $element["alt"];
								$width 	= $element["res_x"];
								$height = $element["res_y"];
								/*
								if($width == 0 AND $height == 0){
									
									$dimensions = img_op(["dimensions", $src]);
									
									$width 	= $dimensions[0];
									$height = $dimensions[1];
									
									$mysqli->query("UPDATE media SET res_x=".$width.", res_y=".$height." WHERE ID=".$element["id"]);
								}
								
								$new_dim = img_op_max_dimensions($src, $max_width, $max_height);

								if(!$new_dim){
                                */
									echo '<img src="'.$src.'" alt="'.$alt.'" '.$extra_attr.'/>';
									/*
								}
								else{
									
									$new_width 	= $new_dim[0];
									$new_height = $new_dim[1];
									
									global $home_dir;
									$compressed_dir = $home_dir."temp/media/compressed";
									
									if(!is_dir($compressed_dir))
										mkdir($compressed_dir);
									
									$compressed_file = pathinfo( basename($src), PATHINFO_FILENAME )."_".$new_width."x".$new_height.".".pathinfo($src, PATHINFO_EXTENSION);
									$compressed_file = $compressed_dir."/".$compressed_file;
								
									if(!is_file($compressed_file)){
										
										if($max_width != 0 AND $max_height != 0){
											img_op(["crop", $src, $compressed_file, $new_width."x".$new_height]);
										}
										else{
											img_op(["resize", $src, $compressed_file, $new_width."x".$new_height]);
										}
									}
									
									echo '<img src="'.$compressed_file.'" alt="'.$alt.'" '.$extra_attr.'/>';
								} */
							}
						}
						
						function cms_load_dia($dia_name, $max_width, $max_height){
							
							for($x=1; $x>0; $x++){
							
								global ${$dia_name.$x};
								
								if(isset( ${$dia_name.$x} )){
									
									cms_load_img( ${$dia_name.$x}, $max_width, $max_height, 0);
								}
								else{
									$x=-2;
								}
							}
						}
						
						function cms_load_clone($clone_class){
							global $mysqli, $project_id, $cms_login;
							
							if($cms_login == "true")
								return $mysqli->query("SELECT * FROM content_clone WHERE class='".$clone_class."' AND project_id='".$project_id."' ORDER BY position ASC");
							else
								return $mysqli->query("SELECT * FROM content_clone WHERE class='".$clone_class."' AND visibility='1' AND project_id='".$project_id."' ORDER BY position ASC");
						}
						
						include( $home_dir."temp/".$cms_row2["html_url"] );
					
					}
				?>
				</div>
				<?php
			}			
		
		
		if($cms_login == "true"){
		?>
			
			<div id="cms_black"></div>
			<div id="cms_goto_top" title="Nach oben"><i class="fa fa-chevron-up" aria-hidden="true"></i></div>
			
			<!-- content_clone -->
			<div class="hidden" style="display: none;">
				<div class="cms_clone_element_nav cms_element">
					<i class="fa fa-arrows cms_clone_element_nav_move" aria-hidden="true"></i><i class="fa fa-angle-left cms_clone_element_nav_sortable_buttons" aria-hidden="true"></i><i class="fa fa-angle-right cms_clone_element_nav_sortable_buttons" aria-hidden="true"></i><i class="fa cms_clone_element_nav_visibility" aria-hidden="true"></i><i class="fa fa-trash cms_clone_element_nav_remove" aria-hidden="true"></i>
				</div>
			</div>
			
			<!-- save_changes -->
			<div id="cms_save_onpage_changes" class="cms_element">
				<div class="cms_save_onpage_changes_element" id="cms_save_onpage_changes_submit"><i class="fa fa-check" aria-hidden="true"></i> Übernehmen</div>
				<div class="cms_save_onpage_changes_element" id="cms_save_onpage_changes_reset"><i class="fa fa-undo" aria-hidden="true"></i> Zurücksetzen</div>
				<div class="clear"></div>
			</div>
			
		<?php
			
			include($cms_dir."menu.html");
			include($cms_dir."inhalte_bearbeiten.html");
			include($cms_dir."seitenverwaltung.html");
		}
		?>
		
	</body>
	
</html>

<?php } //db - page 
	}
	else{
		echo "Das Projekt existiert nicht!";
	}?>