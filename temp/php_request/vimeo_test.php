<?php
    include_once("vimeo.php");
	
	$page = 1;
	$vimeo_id = [];
	
	do{
		$result = json_decode (vimeo_request("GET", "https://api.vimeo.com/me/videos?per_page=100&page=".$page, [], [])["http"], true );

		foreach($result["data"] as $video){
			$uri = "'".str_replace("/videos/", "", $video["uri"])."'";
			$vimeo_id[ count($vimeo_id) ] = $uri;
		}
		
		$elements = count($result["data"]);
		$page++;
		
	} while($elements == 100);
	
    echo "Vimeo: ". count($vimeo_id) ."<br />";
	
	$ergebnis = $mysqli_project->query("SELECT ID, vimeo_id FROM vimeo_video WHERE vimeo_id NOT IN (".implode(",", $vimeo_id).")");
	echo "Vimeo zu wenig: ".mysqli_num_rows($ergebnis)."<br />";	
	if(mysqli_num_rows($ergebnis) > 0){
		/*
		while($row = $ergebnis->fetch_assoc()){
			$mysqli_project->query("DELETE FROM vimeo_video WHERE ID='".$row["ID"]."'");
		} */
	}
	
	$vimeo_id_cache = [];
	foreach($vimeo_id as $vimeo_id_element){
		$vimeo_id_cache[count($vimeo_id_cache)] = str_replace("'", "", $vimeo_id_element);
	}
	
	$ergebnis = $mysqli_project->query("SELECT vimeo_id FROM vimeo_video");
	if(mysqli_num_rows($ergebnis) > 0){
		while($row = $ergebnis->fetch_assoc()){
			$is_id = false;
			$id_pos=0;
			for($x=0; $x<count($vimeo_id_cache); $x++){
				if($vimeo_id_cache[$x] == $row["vimeo_id"]){
					$is_id = true;
					$id_pos = $x;
				}
			}
			if($is_id){
				array_splice($vimeo_id_cache, $id_pos, 1);
			}
		}
	}
	echo "Vimeo zu viel: ".count($vimeo_id_cache)."<br /><br />";	
	if(count($vimeo_id_cache) > 0){
		foreach($vimeo_id_cache as $vimeo_video_cache_element){
			//vimeo_request( "DELETE", "https://api.vimeo.com/videos/".$vimeo_video_cache_element, [], [] );
		}
	}
	
	
    $ergebnis = $mysqli_project->query("SELECT vimeo_id FROM vimeo_video");
    echo "Unigrow vimeo_video: ".mysqli_num_rows($ergebnis)."<br />";
	
	$ergebnis = $mysqli_project->query("SELECT ID, vimeo_id FROM vimeo_video WHERE ID NOT IN (SELECT video_id FROM kurse_media WHERE type='video')");
	echo "Unigrow vimeo_video zu viel: ".mysqli_num_rows($ergebnis)."<br /><br />";	
	if(mysqli_num_rows($ergebnis) > 0){
		/*
		while($row = $ergebnis->fetch_assoc()){
			vimeo_request( "DELETE", "https://api.vimeo.com/videos/".$row["vimeo_id"], [], [] );
			$mysqli_project->query("DELETE FROM vimeo_video WHERE ID='".$row["ID"]."'");
		} */
	}
	
	
	
	
    $ergebnis = $mysqli_project->query("SELECT ID FROM kurse_media WHERE type='video'");
    echo "Unigrow kurse_media: ".mysqli_num_rows($ergebnis)."<br />";
	
	$ergebnis = $mysqli_project->query("SELECT ID FROM kurse_media WHERE type='video' AND video_id NOT IN (SELECT ID FROM vimeo_video)");
	
	echo "Unigrow kurse_media zu viel: ". mysqli_num_rows($ergebnis) . "<br />";
	
	if(mysqli_num_rows($ergebnis) > 0){
		/*
		while($row = $ergebnis->fetch_assoc()){
			$mysqli_project->query("DELETE FROM kurse_media WHERE ID='".$row["ID"]."'");
		}
		*/
	}
	
	?>
	<table>
		<tr>
			<td>query1</td>
			<td>query2</td>
		</tr>
		<?php
			$ergebnis = $mysqli_project->query("SELECT * FROM vimeo_test ORDER BY ID");
			if(mysqli_num_rows($ergebnis) > 0){
				
				while($row = $ergebnis->fetch_assoc()){
					?>
					<tr>
						<td><?=$row["query1"];?></td>
						<td><?=$row["query2"];?></td>
					</tr>
					<?php
				}
			}
		?>
	</table>