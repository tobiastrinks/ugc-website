<?php @session_start();?>

<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<meta name="robots" content="index,follow" />

<meta name="author" content="" />
<meta name="copyright" content="" />
<meta name="publisher" content="" />
<meta name="siteinfo" content="<?=$home_dir;?>robots.txt" />
<meta name="language" content="de" />

<link itemprop="url" href="http://www.beta.unigrow.de/" />
<link rel="canonical" href="http://www.beta.unigrow.de/" />

<!-- PROJECT FILES -->
<?php
	include($home_dir."temp/rights.php");
	include($home_dir."temp/dbconnect.php");
?>
<script type="text/javascript">
	var login_bool = 0;
	var reg_confirm = false;
	<?php
		if(isset($_SESSION["login"]) AND $_SESSION["login"] == "true"){
			?>
			login_bool = 1;
			<?php
		}
		if(isset($_SESSION["reg_confirm"]) AND $_SESSION["reg_confirm"] == "confirm"){
			?>
			reg_confirm = true;
			<?php
		}
	?>
</script>

<link rel="stylesheet" href="<?=$home_dir;?>temp/style/style.css" />

<!-- PLUGINS -->
<script type="text/javascript" src="<?=$home_dir;?>cms/basic/jquery.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>cms/basic/jqueryui.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>cms/js/dropzone.js"></script>

<script type="text/javascript" src="<?=$home_dir;?>temp/js/dotimeout.js"></script>

<script type="text/javascript" src="<?=$home_dir;?>temp/Trumbowyg-master/dist/trumbowyg.min.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>temp/Trumbowyg-master/dist/trumbowyg_colors.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>temp/Trumbowyg-master/dist/langs/de.min.js"></script>
<link rel="stylesheet" href="<?=$home_dir;?>temp/Trumbowyg-master/dist/ui/trumbowyg.min.css" />

<script type="text/javascript" src="<?=$home_dir;?>temp/lightslider-master/dist/js/lightslider.min.js"></script>
<link rel="stylesheet" href="<?=$home_dir;?>temp/lightslider-master/dist/css/lightslider.min.css" />

<link rel="stylesheet" href="<?=$home_dir;?>cms/basic/font_awesome/css/font-awesome.min.css" />

<script src="<?=$home_dir;?>temp/js/push.js"></script>

<!-- LIVECHAT -->
<?php include($home_dir."livechat/php_request/init.php"); ?>
<script type="text/javascript">
	var lc_user_key = <?=$_SESSION["lc_user_key"];?>;
</script>
<script type="text/javascript" src="<?=$home_dir;?>temp/js/helper.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>livechat/livechat.js"></script>
<script type="text/javascript" src="<?=$home_dir;?>temp/js/basic.js"></script>

<script type="text/javascript" src="<?=$home_dir;?>temp/js/facebook.js"></script>


<!-- PHP FCT INCLUDE -->

<?php
	//clear session vars
/*
	if($filename != "hosting.html" AND isset($_SESSION["kurs_hosting"])){
		unset($_SESSION["kurs_hosting"]);
	}
	if($filename != "mitgliederbereich.html" AND isset($_SESSION["kurs_memberarea"])){
		unset($_SESSION["kurs_memberarea"]);
	}
	if($filename != "bewerbung.html" AND isset($_SESSION["kurs_bewerbung"])){
		unset($_SESSION["kurs_bewerbung"]);
	}
*/
	//admin
	if($filename == "admin.html"){
		if(!rights($_SESSION["lc_user_key"], "root")){
			$error404 = true;
		}
	}
	
	//control
	?>
	<script type="text/javascript">
		var get_control = 0;
		<?php if(isset($_GET["control"])){ ?>
		get_control = <?=$_GET["control"];?>;
		<?php } ?>
	</script>
	<?php
	

	include($home_dir."temp/reply_not.php");

	if(	($filename == "search.html" AND !isset($_GET["s"])) OR
		($filename == "mitgliederbereich.html" AND !isset($_SESSION["kurs_memberarea"])) OR
		($filename == "hosting.html" AND $device == "mobile") ){
		?>
		<script type="text/javascript"> window.location = "index.html"; </script>
		<?php
	}

	include($home_dir."temp/marketplace.php");
	
	if($filename == "buy.html"){
		
		if(isset($_SESSION["buy_id"])){
			if(isset($_SESSION["login"])){
				$buy_ergebnis = $mysqli_project->query("SELECT ID FROM user_kurse WHERE kurs_id='".$_SESSION["buy_id"]."' AND user_key='".$_SESSION["lc_user_key"]."'");
				if(mysqli_num_rows($buy_ergebnis) > 0){
					?>
					<script type="text/javascript"> 
						document.cookie = "buy_login_first="; 
						document.cookie = "control_open=1"; 
						window.location = "index.html"; 
					</script>
					<?php
				}
			}
		}
		else{
			?>
			<script type="text/javascript"> window.location = "index.html"; </script>
			<?php
		}
	}
	
	//application
	if($filename == "bewerbung.html"){
		if(!isset($_SESSION["login"])){
			$error404 = true;
		}
	}
	
	//hosting
	if($filename == "hosting.html" AND isset($_GET["pg"])){
		
		//publish
		$kurs_ergebnis = $mysqli_project->query("SELECT ID FROM kurse_marketplace WHERE kurs_id='".$_SESSION["kurs_hosting"]."' AND status='offline'");
		if(mysqli_num_rows($kurs_ergebnis) > 0){
			
			if($_GET["pg"] != "pages"){
				$product_kurs_id = $_SESSION["kurs_hosting"];
				include($home_dir."temp/product.php");
			}
			?>
			<link rel="stylesheet" href="<?=$home_dir;?>temp/style/marketplace.css" />
			<script type="text/javascript" src="<?=$home_dir;?>temp/js/marketplace.js"></script>
			<?php
		}
	}
	
	//vimeo_upload
	if($filename == "hosting.html" OR $filename == "bewerbung.html"){
		?>
		<script type="text/javascript" src="<?=$home_dir;?>temp/vimeo_upload_master/vimeo-upload.js"></script>
		<?php
	}
	
	if($filename == "kurs.html" OR ($filename == "hosting.html" AND isset($_GET["pg"]) AND $_GET["pg"] == "pages")){
		
		$kurs_id = 0;
		
		if($filename == "kurs.html"){
			$kurs_name = htmlentities($_GET["p"], ENT_QUOTES);
			
			$kurs_ergebnis = $mysqli_project->query("SELECT ID FROM kurse WHERE name='". urldecode($kurs_name) ."' AND (ID IN (SELECT kurs_id FROM kurse_marketplace WHERE status='online') OR ID IN (SELECT kurs_id FROM user_kurse WHERE user_key='".$_SESSION["lc_user_key"]."' AND rights='admin')) LIMIT 1");
			if(mysqli_num_rows($kurs_ergebnis) > 0){
				while($kurs_row = $kurs_ergebnis->fetch_assoc()){
					$kurs_id = $kurs_row["ID"];
				}
			}
			else
				$error404 = true;
		}
		if($filename == "hosting.html"){
			$kurs_id = $_SESSION["kurs_hosting"];
			
			$kurs_ergebnis = $mysqli_project->query("SELECT name FROM kurse WHERE ID='".$kurs_id."'");
			if(mysqli_num_rows($kurs_ergebnis) > 0){
				
				while($kurs_row = $kurs_ergebnis->fetch_assoc()){
					
					$product_get_param = urlencode($kurs_row["name"]);
				}
			}
		}
		
		if($kurs_id != 0){
			
			if(!isset($product_content)){ //if already included > publish
				$product_kurs_id = $kurs_id;
				include($home_dir."temp/product.php");
			}
			
			$kurs_ergebnis = $mysqli_project->query("SELECT ID FROM kurse_marketplace WHERE kurs_id='".$kurs_id."'");//AND status!='offline'");
			if(mysqli_num_rows($kurs_ergebnis) > 0){
				
				//product
				$kurs_ergebnis = $mysqli_project->query("SELECT type, name FROM kurse_temp WHERE ID IN (SELECT temp_product FROM kurse WHERE ID='".$kurs_id."')");
				if(mysqli_num_rows($kurs_ergebnis) > 0){
					
					while($kurs_rows = $kurs_ergebnis->fetch_assoc()){
						
						$product_temp_name = $kurs_rows["type"]."_".$kurs_rows["name"];
					}
				}
			}
			$product_temp = $home_dir."temp/html/product_temp/".$product_temp_name.".html";
		}
		
		?>
			<link rel="stylesheet" href="<?=$home_dir;?>temp/style/product_temp/<?=$product_temp_name;?>.css" />
			<script type="text/javascript" src="<?=$home_dir;?>temp/js/product_temp/<?=$product_temp_name;?>.js"></script>
		<?php
	}
	
	if($filename == "user.html"){
		
		if(isset($_GET["u"])){
			
			$user_ergebnis = $mysqli_project->query("SELECT user_key, fname, lname, descr, icon, facebook_link, twitter_link, instagram_link, youtube_link FROM user WHERE username='".$_GET["u"]."'");
			if(mysqli_num_rows($user_ergebnis) > 0){
				while($user_row = $user_ergebnis->fetch_assoc()){

				    $user_key   = $user_row["user_key"];

					$user_fname = $user_row["fname"];
					$user_lname = $user_row["lname"];
					$user_descr = $user_row["descr"];
					
					$user_facebook_link 	= $user_row["facebook_link"];
					$user_twitter_link		= $user_row["twitter_link"];
					$user_instagram_link 	= $user_row["instagram_link"];
					$user_youtube_link 		= $user_row["youtube_link"];
					
					$user_icon_src = "";
					$user_ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$user_row["icon"]."'");
					if(mysqli_num_rows($user_ergebnis2) > 0){
						
						while($user_row2 = $user_ergebnis2->fetch_assoc()){
							
							$user_icon_src = $user_row2["filename"];
						}
					}
				}
			}
			else
				$error404 = true;
		}
		else
			$error404 = true;
	}
	
	
	
	//vimeo_player
?>
	<script src="<?=$home_dir;?>temp/mediaelement_master/build/mediaelement-and-player.js"></script>
	<script src="<?=$home_dir;?>temp/mediaelement_master/build/renderers/vimeo.js"></script>
	<script src="<?=$home_dir;?>temp/mediaelement_master/build/lang/de.js"></script>
	<link rel="stylesheet" href="<?=$home_dir;?>temp/mediaelement_master/build/mediaelementplayer.min.css">
