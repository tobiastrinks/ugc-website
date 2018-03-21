<?php
	function product_price($kurs_id = 0, $no_echo = 0){
		
		global $product_kurs_id, $mysqli_project;
		
		if($kurs_id == 0)
			$kurs_id = $product_kurs_id;
		
		$ergebnis = $mysqli_project->query("SELECT price_model, price_1, price_2 FROM kurse WHERE ID='".$kurs_id."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["price_model"] == "free"){
					
					$echo = "Free";
				}
				else if($row["price_model"] == "fix"){
					
					$echo = $row["price_1"]." &euro;";
				}
				else if($row["price_model"] == "abo"){
					
					$echo = $row["price_2"]." &euro; mtl.";
				}
				
				$price = [];
				$price["price_model"] 	= $row["price_model"];
				$price["price_1"] 		= $row["price_1"];
				$price["price_2"] 		= $row["price_2"];
			}
			
			if($no_echo == 0){
				echo $echo;
			}
			else{
				return $price;
			}
		}
	}
	
	function product_avg_review($kurs_id = 0){
		
		global $product_kurs_id, $mysqli_project;
		
		if($kurs_id == 0)
			$kurs_id = $product_kurs_id;
		
		$result = 0;
		
		$ergebnis = $mysqli_project->query("SELECT ID FROM review WHERE dest_type='kurs' AND dest_id='".$kurs_id."'");
		$review_nb = mysqli_num_rows($ergebnis);
		
		$ergebnis = $mysqli_project->query("SELECT AVG(stars) avg_stars FROM review WHERE dest_type='kurs' AND dest_id='".$kurs_id."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$row = $ergebnis->fetch_assoc();
			$result = intval($row["avg_stars"]);
		}
		
		$star 	= 0;
		$star_o = 0;
		
		for($x=0; $x<5; $x++){
			
			if($x<$result){
				$star++;
			}
			else{
				$star_o++;
			}
		}
		
		$return = Array();
		$return[0] = $star;
		$return[1] = $star_o;
		$return[2] = $review_nb;
		
		return $return;
	}
	
	function product_rand_user($anzahl, $kurs_id=0){
		
		global $product_kurs_id, $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT user_key, fname, lname, icon FROM user WHERE user_key IN (SELECT user_key FROM user_kurse WHERE kurs_id='".$kurs_id."' AND rights='0' ORDER BY rand())");
		if(mysqli_num_rows($ergebnis) > 0){
			
			$x=0;
			$result = Array();
			
			while($row = $ergebnis->fetch_assoc()){
				
				$result[$x]["user_key"] = $row["user_key"];
				$result[$x]["fname"] 	= $row["fname"];
				$result[$x]["lname"] 	= $row["lname"];
				
				$ergebnis2 = $mysqli_project->query("SELECT filename FROM media WHERE ID='".$row["icon"]."'");
				if(mysqli_num_rows($ergebnis2) > 0){
					
					while($row2 = $ergebnis2->fetch_assoc()){
						$result[$x]["icon"] = $row2["filename"];
					}
				}
				
				$x++;
			}
			
			return $result;
		}
	}
?>