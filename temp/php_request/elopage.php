<?php @session_start();
	
	include("../../cms/basic/php_fct.php");
	$post = html_encode($_POST);
	
	$task = $post["task"];
	
	if(!isset($mysqli_project))
		include("../dbconnect.php");
	
	function elopage_request( $method, $url, $headers = [], $params = [] ){
		
		$headers[count($headers)] = "Content-Type: application/json";
		
		$curl = curl_init();
		
		switch($method) {
			case 'GET':
				if(count($params) > 0)
					$url .= '?' . http_build_query($params);
				break;
			case 'POST':
				curl_setopt($curl, CURLOPT_POST, true);
				curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($params));
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
	
	function create_payment_link( $kurs_id, $pricing_plan ){
		
		global $mysqli_project;
		
		$ergebnis = $mysqli_project->query("SELECT name FROM kurse WHERE ID='".$kurs_id."'");
		if( mysqli_num_rows($ergebnis) > 0 ){
			
			while($row = $ergebnis->fetch_assoc()){
				
				$product_name = $row["name"];
			}
		}
		
		$request_body = [
			"key"=> 		"50d0e02840d5fb91327e7a96b0d15b34",
			"secret"=> 		"xYLxwnzZpCfYAHCoU2zk_g7EugyVgsuqgzGC6myS8_2R5ZrUMg1qz6erb7yjSu", 
			"name"=>		$product_name." - Unigrow Kurszugang", 
			"success_url"=> "http://beta.unigrow.de/elopage.php?m=success", 
			"cancel_url"=> 	"http://unigrow.localhost/elopage.php?m=cancel", 
			"error_url"=> 	"http://unigrow.localhost/elopage.php?m=error", 
			"ping_url"=> 	"http://unigrow.localhost/elopage_ping.php", 
			"pricing_plans"=> $pricing_plan,
			"success_email"=> [
				"subject_de"=> "test",
				"body_de"=> "<p>Hallo %{first_name} %{last_name},</p><p><br></p><p>vielen Dank f&uuml;r die Bestellung.</p><p><br></p><p>Produktname: %{product_name}</p><p>Betrag: %{amount}</p><p>Zahlung: %{recurring_type}</p><p><br></p><p>Bitte jetzt hier klicken:</p><p>%{next_button}</p><p><br></p><p>Sch&ouml;ne Gr&uuml;&szlig;e,</p>",
				"subject_en"=> "test",
				"body_en"=> "<p>Hello %{first_name} %{last_name},</p><p><br></p><p>thanks for your order.</p><p><br></p><p>Product name: %{product_name}</p><p>Amount: %{amount}</p><p>Plan: %{recurring_type}</p><p><br></p><p>Now click here:</p><p>%{next_button}</p><p><br></p><p>Best regards,</p>"
			]
		];
		
		$request_body_encode = html_encode( json_encode($request_body) );
		
		$ergebnis = $mysqli_project->query("SELECT payment_link FROM elopage_links WHERE kurs_id='".$kurs_id."'  AND request_body='". $request_body_encode ."'");
		if(mysqli_num_rows($ergebnis) > 0){
			while($row = $ergebnis->fetch_assoc()){
				
				return( $row["payment_link"] );
			}
		}
		else{
			$result = elopage_request( "POST", "https://elopage.com/api/payment_links", [], $request_body );
			
			$result = json_decode($result["http"], true);
			
			$url_to_pay = $result["url_to_pay"];
			$payment_id = $result["id"];
			
			$mysqli_project->query("INSERT INTO elopage_links (kurs_id, request_body, payment_link)
									VALUES (".$kurs_id.", '".$request_body_encode."', '".$url_to_pay."')");
			
			return( $url_to_pay );
		}
	}
	
	if($task == "get_payment_link"){
		
		$kurs_id = $_SESSION["buy_id"];
		
		//get pricing plan
		$ergebnis = $mysqli_project->query("SELECT price_model, price_1, price_2 FROM kurse WHERE ID='".$kurs_id."'");
		if(mysqli_num_rows($ergebnis) > 0){
			
			while($row = $ergebnis->fetch_assoc()){
				
				if($row["price_model"] == "fix"){
					
					$pricing_plan = [ [
						"form"=> "one_time", 
						"preferences"=> [
							"price"=> $row["price_1"], 
							"old_price"=> "0"
						]
					] ];
				}
				if($row["price_model"] == "abo"){
					
					//HIER WEITERMACHEN
				}
			}
			
			$url_to_pay = create_payment_link( $kurs_id, $pricing_plan );
			
			echo $url_to_pay;
		}
	}
?>