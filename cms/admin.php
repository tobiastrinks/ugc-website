<?php
@session_start();


if(isset($_SESSION["cms_username"]) and isset($_SESSION["cms_pw"])){
	
	
	$ergebnis_cms = $mysqli->query("SELECT * FROM user WHERE username='".$_SESSION["cms_username"]."' AND (project_id='".$project_id."' OR project_id='-1')");
	while($row_cms = $ergebnis_cms->fetch_assoc()){
		
		if($_SESSION["cms_pw"] == $row_cms["pw"]){
			
			if($project_id == $row_cms["project_id"] OR $row_cms["project_id"] == '-1'){
				$cms_login 		= "true";
				$cms_user_rights= $row_cms["rights"];
				
				echo'
					<script type="text/javascript" src="'.$cms_dir.'js/edit.js"></script>
					<script type="text/javascript" src="'.$cms_dir.'js/dropzone.js"></script>
					<script type="text/javascript" src="'.$cms_dir.'tinymce/tinymce.min.js"></script>
					<script type="text/javascript" src="'.$cms_dir.'tinymce/jquery.tinymce.min.js"></script>
					<script type="text/javascript" src="'.$cms_dir.'tinymce/de.js"></script>
					
					<link type="text/css" href="'.$cms_dir.'style/cms.css" rel="stylesheet" media="screen" />
					<link type="text/css" href="'.$cms_dir.'style/dropzone.css" rel="stylesheet" media="screen" />
					';
					if(file_exists ( $home_dir."temp/style/tinymce.css" ))
						echo'<link type="text/css" href="'.$home_dir.'temp/style/tinymce.css" rel="stylesheet" />
				';
			}
		}
	}
	

}

?>