<?php
	@session_start();
	
	include("dbconnect.php");
	
	$cms_cp_login = false;
	
	if(isset($_SESSION["cp_username"]) && isset($_SESSION["cp_pw"])){
		
		if(mysqli_num_rows($cms_cp_ergebnis = $mysqli->query("SELECT * FROM user WHERE project_id='-1' AND username='".$_SESSION["cp_username"]."' AND pw='".$_SESSION["cp_pw"]."'")) >0){
			$cms_cp_login = true;
		}
	}
		
?>
<!DOCTYPE html>
<html lang="de">
	<head>
		<meta charset="utf-8" />
	
		<title>Control Panel - Content Mangement System</title>
		
		<link type="text/css" rel="stylesheet" href="style/control_panel.css" />
		
		<script type="text/javascript" src="basic/jquery.js"></script>
		<script type="text/javascript" src="basic/jqueryui.js"></script>
		
		<script type="text/javascript" src="js/control_panel.js"></script>
	</head>
		
	<body>
		<div id="wrapper">
			<div id="cms_cp_header">
				<img id="cms_cp_logo" src="img/logo.png" />
				<p id="cms_cp_headline">Control Panel</p>
			</div>
			
	<?php 	if($cms_cp_login == false){ ?>
				<div class="cms_cp_area" id="cms_cp_login">
					
					<input type="text" id="cms_cp_login_username" placeholder="Benutzername" /><br />
					<input type="password" id="cms_cp_login_pw" placeholder="Passwort" />
				
					<p id="cms_cp_login_button" class="cms_cp_submit">
						<span id="cms_cp_login_button_login">Login</span>
						<span id="cms_cp_login_button_error">Ungültige Daten</span>
						<span id="cms_cp_login_button_success">Erfolgreich</span>
					</p>
				</div>
	<?php 	}
			else{ 
				if(!isset($project_id)){?>
			
				<div class="cms_cp_area" id="cms_cp_new_project">
				
					<div class="cms_cp_new_project_form">
						<div class="cms_cp_new_project_form_body">
							<table>
								<tr>
									<td><label for="cms_cp_new_project_desktop_dir">Desktop-Verzeichnis</label></td>
									<td><input type="text" id="cms_cp_new_project_desktop_dir" value="/" /></td>
								</tr>
								<tr>
									<td><label for="cms_cp_new_project_mobile_dir">Mobile-Verzeichnis</label></td>
									<td><input type="text" id="cms_cp_new_project_mobile_dir" value="/mobile/" /></td>
								</tr>
							</table>
						</div>
						<p id="cms_cp_new_project_button" class="cms_cp_submit">Neues Projekt erstellen</p>
					</div>
					
					<div class="cms_cp_new_project_form">
						<div class="cms_cp_new_project_form_body" id="cms_cp_domain_change">
							<input type="text" id="cms_cp_domain_change_old_domain" placeholder="alte Domain" />
						</div>
						<p id="cms_cp_domain_change_button" class="cms_cp_submit">Projekt von alter Domain übernehmen</p>
					</div>
					
				</div>
	<?php		}
				else{ ?>
				
				<div class="cms_cp_area" id="cms_cp_edit_project">
					
					<div class="cms_cp_edit_row">
						<p class="cms_cp_edit_row_headline">Templates</p>
						<table data-cms_table="temp">
							<tr>
								<td>name</td>
								<td>html_url</td>
								<td>css_filename</td>
								<td>js_filename</td>
							</tr>
							<?php
								$cms_cp_ergebnis = $mysqli->query("SELECT * FROM temp WHERE project_id='".$project_id."' ORDER BY ID ASC");
								while($cms_cp_row = $cms_cp_ergebnis->fetch_assoc()){
									?>
									<tr>
										<td><input type="text" value="<?=$cms_cp_row["name"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="name"/></td>
										<td><input type="text" value="<?=$cms_cp_row["html_url"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="html_url"/></td>
										<td><input type="text" value="<?=$cms_cp_row["css_filename"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="css_filename"/></td>
										<td><input type="text" value="<?=$cms_cp_row["js_filename"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="js_filename"/></td>
									</tr>
									<?php
								}
							?>
							<tr>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="name" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="html_url" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="css_filename" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="js_filename" /></td>
							</tr>
						</table>
						<p class="cms_cp_edit_db_remove">ausgewählten Datensatz löschen</p>
					</div>
					
					
					<div class="cms_cp_edit_row">
						<p class="cms_cp_edit_row_headline">Benutzer</p>
						<table data-cms_table="user">
							<tr>
								<td>username</td>
								<td>pw</td>
								<td>rights</td>
								<td>name</td>
							</tr>
							<?php
								$cms_cp_ergebnis = $mysqli->query("SELECT * FROM user WHERE project_id='".$project_id."' ORDER BY ID ASC");
								while($cms_cp_row = $cms_cp_ergebnis->fetch_assoc()){
									?>
									<tr>
										<td><input type="text" value="<?=$cms_cp_row["username"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="username"/></td>
										<td><input type="text" value="<?=$cms_cp_row["pw"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="pw"/></td>
										<td><input type="text" value="<?=$cms_cp_row["rights"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="rights"/></td>
										<td><input type="text" value="<?=$cms_cp_row["name"];?>" data-cms_id="<?=$cms_cp_row["ID"];?>" data-cms_field="name"/></td>
									</tr>
									<?php
								}
							?>
							<tr>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="username" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="pw" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="rights" /></td>
								<td><input type="text" class="cms_cp_new_input" data-cms_field="name" /></td>
							</tr>
						</table>
						<p class="cms_cp_edit_db_remove">ausgewählten Datensatz löschen</p>
					</div>
					
				</div>
				
	<?php		}
			} ?>
		</div>
	</body>
	
</html>