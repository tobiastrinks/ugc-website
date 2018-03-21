<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	if(!isset($mysqli_project))
		include("../dbconnect.php");
	
	if(!function_exists("vimeo_request")){
	
		function vimeo_request( $method, $url, $headers = [], $params = [] ){
			
			$headers[count($headers)] = "Authorization: Bearer 0659e69a2d8cceb961444554334dee17";
			
			$curl = curl_init();
			
			$params_string = "";
			foreach($params as $key=>$value){
				$params_string .= $key."=".$value."&"; 
			}
			$params_string = rtrim($params_string, "&");
			
			switch($method) {
				case 'GET':
					if(count($params) > 0)
						$url .= '?' . http_build_query($params);
					break;
				case 'POST':
					curl_setopt($curl, CURLOPT_POST, true);
					curl_setopt($curl, CURLOPT_POSTFIELDS, $params_string);
					break;
				case 'PUT':
					curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');
					curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($params));
					break;
				case 'DELETE':
					curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
					if(count($params) > 0)
						$url .= '?' . http_build_query($params);
					break;
			}
			
			curl_setopt($curl, CURLOPT_URL, $url);
			curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
			
			if($method == "DELETE"){
				curl_setopt($curl, CURLOPT_HEADER, true); //include headers in http data
				curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false); //don't follow redirects
			}
			
			$response = [];
			
			$response["http"] = curl_exec($curl);
			$response["info"] = curl_getinfo($curl);
			curl_close($curl);
			
			return ($response);
		}

		function vimeo_check_encode( $vimeo_id ){

		    global $mysqli_project;

            $vimeo_get = json_decode( vimeo_request( "GET", "https://api.vimeo.com/videos/".$vimeo_id, [], [] )["http"], true );
            $duration = $vimeo_get["duration"];

            if($duration != 0){
                $mysqli_project->query("UPDATE vimeo_video SET duration='".$duration."' WHERE vimeo_id='".$vimeo_id."'");
            }

            return ($duration);
        }
	}
		
	$task = 0;
	if(isset($post["task"]))
		$task = $post["task"];
	
	//------------------UPLOAD
	
	if($post["task"] == "upload_ticket"){
		$result = vimeo_request( "POST", "https://api.vimeo.com/me/videos", [], ["type"=>"streaming"] );
		echo $result["http"];
	}
	
	if($post["task"] == "upload_complete"){
		
		$result = vimeo_request("DELETE", $_POST["complete_uri"], [], []);
		
		$result_str = $result["http"];
		
		//get video_id
		$search_str = "Location: /videos/";
		$video_id_offset = strpos($result_str, $search_str) + strlen($search_str);
		
		$video_id = "";
		for($x=$video_id_offset; is_numeric($result_str[$x]); $x++){
			$video_id .= $result_str[$x];
		}
		
		//project_db
		$filename = $post["filename"];
		
		$filetype = pathinfo($filename, PATHINFO_EXTENSION);
		$name = substr( str_replace( $filetype, "", $filename ), 0, -1 );
		
		$result = [];
		
		/*
		if(isset($_SESSION["kurs_hosting"]))
			$kurs_id = $_SESSION["kurs_hosting"];
		
		else if(isset($_SESSION["kurs_application"]))
			$kurs_id = $_SESSION["kurs_application"]; */
		
		$kurs_id = $post["kurs_id"];
		
		$query1 = "INSERT INTO vimeo_video (vimeo_id, size, type, timestamp) VALUES ('".$video_id."', '".$post["filesize"]."', '".$filetype."', '".time()."')";
		$mysqli_project->query("INSERT INTO vimeo_video (vimeo_id, size, type, timestamp)
								VALUES ('".$video_id."', '".$post["filesize"]."', '".$filetype."', '".time()."')");
		$insert_id = $mysqli_project->insert_id;
		
		$query2 = "INSERT INTO kurse_media (kurs_id, type, name, video_id) VALUES (".$kurs_id.", 'video', '".$name."', ".$insert_id.")";
		$mysqli_project->query("INSERT INTO kurse_media (kurs_id, type, name, video_id)
								VALUES (".$kurs_id.", 'video', '".$name."', ".$insert_id.")");
		$result["lib_id"] = $mysqli_project->insert_id;
		
		$mysqli_project->query("INSERT INTO vimeo_test (query1, query2) VALUES ('".html_encode( $query1 )."', '".html_encode( $query2 )."')");
		
		$result["h_name"] 		= $name.".".$filetype;
		$result["size"]			= $post["filesize"];
		$result["timestamp"]	= time();
		
		echo json_encode($result);
	}
	
?>