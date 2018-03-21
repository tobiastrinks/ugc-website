<?php
	if(!function_exists("html_encode")){
		
		function normalize( $val ){
			
			return normalizer_normalize( $val, Normalizer::FORM_C );
		}
		
		function html_encode( $val ){
			
			$val_cache = false;
			
			if(!is_array($val)){
				$val_cache = $val;
				$val = [];
				$val[0] = $val_cache;
			}			
			
			foreach($val as $key => $value){
				if(is_string($value)){
					$val[$key] = normalize( $value );
					$val[$key] = htmlentities($val[$key], ENT_QUOTES);
					$val[$key] = str_replace("~", "&#126;", $val[$key]);
					$val[$key] = str_replace("[", "&#91;", $val[$key]);
					$val[$key] = str_replace("]", "&#93;", $val[$key]);
					$val[$key] = str_replace("^", "&#94;", $val[$key]);
					$val[$key] = str_replace("°", "&deg;", $val[$key]);
				}
				else
					$val[$key] = $value;
			}
			
			if($val_cache){
				$val = $val[0];
			}
			
			return( $val );
		}
		
		function php_mailer( $dest, $src, $reply_to, $subject, $template, $content = [] ){
			
			$temp = file_get_contents( $template );
			
			foreach($content as $key => $value){
				$temp = str_replace("{{".$key."}}", $value, $temp);
			}
			
			$html = $temp;
			
			$ch = curl_init();
	
			curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
			curl_setopt($ch, CURLOPT_USERPWD, 'api:key-9dfb3a6679899eb3ea6fd2edf5a3ab88');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
			curl_setopt($ch, CURLOPT_URL, 'https://api.mailgun.net/v3/unigrow.de/messages');
			
			curl_setopt($ch, CURLOPT_POSTFIELDS,
						array(	'from' 		=> $src,
								'to' 		=> $dest,
								'h:Reply-To'=> $reply_to,
								'subject' 	=> $subject,
								'html' 		=> $html) );
			
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			$result = curl_exec($ch);
			curl_close($ch);
		}
		
	}
?>