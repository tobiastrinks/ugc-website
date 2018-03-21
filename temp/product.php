<?php
	
	$product_content = Array();
	
	$product_ergebnis = $mysqli_project->query("SELECT ID, type, name FROM kurse_temp WHERE 	ID IN (SELECT temp_product FROM kurse WHERE ID=".$product_kurs_id.")
																							OR 	ID IN (SELECT temp_sell FROM kurse WHERE ID=".$product_kurs_id.")
																							OR	ID IN (SELECT temp_ty FROM kurse WHERE ID=".$product_kurs_id.")");
	if(mysqli_num_rows($product_ergebnis) > 0){
		while($product_row = $product_ergebnis->fetch_assoc()){
			
			$product_conf_file = $home_dir."temp/html/product_temp/".$product_row["type"]."_".$product_row["name"]."_conf.php";
			if(is_file($product_conf_file))
				include($product_conf_file);
			
			$product_ergebnis2 = $mysqli_project->query("SELECT type, content, pos, kurse_media_id FROM kurse_temp_content WHERE kurs_id=".$product_kurs_id." AND temp_id='".$product_row["ID"]."'");
			if(mysqli_num_rows($product_ergebnis2) > 0){
				while($product_row2 = $product_ergebnis2->fetch_assoc()){
					
					$product_content[$product_row2["type"]][$product_row2["pos"]]["type"] 	= $product_row2["type"];
					
					if($product_row2["type"] == "text"){
						$product_content[$product_row2["type"]][$product_row2["pos"]]["content"] = $product_row2["content"];
					}
					
					if($product_row2["type"] == "img"){
						$product_ergebnis3 = $mysqli_project->query("SELECT name, media_id FROM kurse_media WHERE ID='".$product_row2["kurse_media_id"]."'");
						if(mysqli_num_rows($product_ergebnis3) > 0){
							while($product_row3 = $product_ergebnis3->fetch_assoc()){
								
								$product_ergebnis4 = $mysqli_project->query("SELECT filename, timestamp FROM media WHERE ID='".$product_row3["media_id"]."'");
								if(mysqli_num_rows($product_ergebnis4) > 0){
									while($product_row4 = $product_ergebnis4->fetch_assoc()){
										
										$product_content[$product_row2["type"]][$product_row2["pos"]]["name"] 		= $product_row3["name"];
										$product_content[$product_row2["type"]][$product_row2["pos"]]["filename"] 	= $product_row4["filename"];
										$product_content[$product_row2["type"]][$product_row2["pos"]]["timestamp"] 	= $product_row4["timestamp"];
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	$product_creator;
	
	$product_ergebnis = $mysqli_project->query("SELECT user_key FROM kurse WHERE ID='".$product_kurs_id."'");
	if(mysqli_num_rows($product_ergebnis) > 0){
		
		while($product_row = $product_ergebnis->fetch_assoc()){
			
			$product_kurs_creator = $product_row["user_key"];
		}
	}
	
	function product_publish_pos( $position ){
		
		$return = false;
		
		global $product_publish, $sell_publish, $ty_publish;
		$var_name = ["product", "sell", "ty"];
		
		for($x=0; $x<count($var_name); $x++){
			
			if(isset( ${$var_name[$x]."_publish"} )){
				
				$handle = ${$var_name[$x]."_publish"};
				
				for($y=0; $y<count( $handle ); $y++){
					if($handle[$y] == $position)
						$return = true;
				}
			}
		}
		
		return $return;
	}
	
	function product_thumb(){
		
		global $mysqli_project, $product_kurs_id, $home_dir;
		
		$ergebnis = $mysqli_project->query("SELECT thumbnail FROM kurse WHERE ID='".$product_kurs_id."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["thumbnail"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$src = $home_dir."temp/media/project/kurse_thumb/".$row2["filename"];
					}
				}
			}
		}
		if($src == "")
			echo "<div class='product_img_placeholder'><span>Hier erscheint dein Kursthumbnail</span></div>";
		else
			echo "<img src='".$src."' alt='Kursthumbnail' />";
	}
	
	function product_video(){
		
	}
	function product_img( $position ){
		
		global $home_dir, $product_content;
		
		$src = "";
		if(isset($product_content["img"][$position]["filename"])){
			$src = $home_dir."temp/media/project/".$product_content["img"][$position]["filename"];
		}
		
		echo "<img src='".$src."' alt='Produktbild' />";
		
		if(!is_file($src)){
			?>
			<div class="product_img_placeholder<?php if(product_publish_pos($position)){ ?> required<?php } ?>">
				<i class="fa fa-picture-o" aria-hidden="true"></i>
			</div>
			<?php
		}
	}
	function product_text( $position, $placeholder ){
		
		global $product_content;
		
		$content = "";
		
		if(isset($product_content["text"][$position]["content"])){
			$content = $product_content["text"][$position]["content"];
			
			if($content != "")
				echo $content;
		}
		if($content == ""){
			
			if(product_publish_pos( $position ))
				echo "<span class='product_text_placeholder required'>".$placeholder."</span>";
			else
				echo $placeholder;
		}
	}
	
	function product_inhalte_duration( $duration ){
		
		$duration = intval($duration);
		$duration_str = "";
		
		for($y=0; $y<3; $y++){
			
			$multiplikator = pow(60, $y);
			
			$duration_nb = strval( (($duration / ($multiplikator) ) % 60) );
			if(strlen($duration_nb) == 1)
				$duration_nb = "0".$duration_nb;
			
			$duration_str = $duration_nb.":".$duration_str;
		}
		
		$duration_str = substr($duration_str, 0, -1);
		
		return( $duration_str );
	}
	
	function product_inhalte(){
		
		global $product_kurs_id, $mysqli_project;
		
		$x=0;
		
		$lesson = [];
		$module = [];
		
		$ergebnis = $mysqli_project->query("SELECT ID, title FROM kurse_lesson WHERE kurs_id='".$product_kurs_id."' AND visibility='1' ORDER BY pos ASC");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$lesson[$x]["id"] 		= $row["ID"];
				$lesson[$x]["title"] 	= $row["title"];
				
				if(!isset($lesson[$x]["duration"]))
					$lesson[$x]["duration"] = 0;
				
				$y=0;
				
				$ergebnis2 = $mysqli_project->query("SELECT title, video_id, preview FROM kurse_module WHERE lesson_id='".$row["ID"]."' AND visibility='1' ORDER BY pos ASC");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					$ergebnis2_counter = mysqli_num_rows($ergebnis2);
					
					while($row2 = $ergebnis2->fetch_assoc()){
						
						$module[$x][$y]["title"] 	= $row2["title"];
						$module[$x][$y]["video_id"] = $row2["video_id"];
						$module[$x][$y]["preview"] 	= $row2["preview"];
						
						$ergebnis3 = $mysqli_project->query("SELECT vimeo_id, duration FROM vimeo_video WHERE ID=(SELECT video_id FROM kurse_media WHERE ID='".$row2["video_id"]."')");
						if(mysqli_num_rows($ergebnis3) > 0){
							
							while($row3 = $ergebnis3->fetch_assoc()){
								
								$module[$x][$y]["duration"] 	= intval($row3["duration"]);
								$module[$x][$y]["vimeo_id"] 	= $row3["vimeo_id"];
								
								$lesson[$x]["duration"] = $lesson[$x]["duration"] + $module[$x][$y]["duration"];
							}
						}
						else{
							$module[$x][$y]["duration"] = 0;
							$module[$x][$y]["vimeo_id"] = 0;
						}
						
						$module[$x][$y]["duration_str"] = product_inhalte_duration( $module[$x][$y]["duration"] );
						
						$y++;
						
						if($y == $ergebnis2_counter){
							$lesson[$x]["duration_str"] = product_inhalte_duration( $lesson[$x]["duration"] );
						}
					}
				}
				
				$x++;
			}
			
			for($x=0; $x<count($lesson); $x++){
				
				?>
				<div class="product_lesson">
					<div class="product_lesson_head">
						<p class="product_lesson_title product_lesson_head_row"><?=$lesson[$x]["title"];?></p>
						<p class="product_lesson_duration product_lesson_head_row"><?=$lesson[$x]["duration_str"];?></p>
						<div class="clear"></div>
					</div>
					<div class="product_lesson_list">
						<?php
							for($y=0; $y<count($module[$x]); $y++){
						?>
								<div class="product_module<?php if($module[$x][$y]["preview"] == "1"){ ?> preview<?php } ?>" data-vimeo_id="<?=$module[$x][$y]["vimeo_id"];?>">
									<p class="product_module_title product_module_row"><i class="fa fa-play-circle" aria-hidden="true"></i> <?=$module[$x][$y]["title"];?></p>
									<p class="product_module_duration product_module_row"><?=$module[$x][$y]["duration_str"];?></p>
									<div class="clear"></div>
								</div>
						<?php
							}
						?>
					</div>
				</div>
				<?php
			}
		}
		else{
			?>
				<div class="product_lesson_placeholder">
					Hier erscheinen deine Lektionen und Module
				</div>
			<?php
		}
	}
?>