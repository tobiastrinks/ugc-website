<?php

	//----task definition
	/*
		resize		- [ src, dest, img_geo, extra ]
		crop		- [ src, dest, widthxheight, gravity, extra ]
		dimensions	- [ src ] > return([width, height])
	*/
	function img_op( $task = Array() ){
		
		if(isset($task[0])){
			
			if($task[0] == "resize"){
				
				$src 		= $task[1];
				$dest 		= $task[2];
				$img_geo 	= $task[3];
				
				$new_dim 	= explode("x", $img_geo);
				$max_width 	= intval($new_dim[0]);
				$max_height = intval($new_dim[1]);
				
				try{
					$img = new Imagick();
					$img->readImageBlob(file_get_contents($src));
				}
				catch(Exception $e) {
					die('Error: ' . $e->getMessage());
				}
				
				$new_dim = img_op_max_dimensions($src, $max_width, $max_height);
				
				if($new_dim){
					$img->resizeImage($new_dim[0], $new_dim[1], 1, 1, 0);
					$img = $img->writeImage($dest);
				}
				/*
				if(isset($task[4]))
					$extra = " ".$task[4];
				else
					$extra = "";
				
				exec("convert ".$src." -resize ".$img_geo.$extra." ".$dest);*/
			}
			if($task[0] == "crop"){
				
				$src 		= $task[1];
				$dest 		= $task[2];
				$dimensions	= $task[3];
				
				try{
					$img = new Imagick();
					$img->readImageBlob(file_get_contents($src));
				}
				catch(Exception $e) {
					die('Error: ' . $e->getMessage());
				}
				
				$new_dim 	= explode("x", $dimensions);
				$new_width 	= intval($new_dim[0]);
				$new_height = intval($new_dim[1]);
				
				$img->cropThumbnailImage($new_width, $new_height);
				$img = $img->writeImage($dest);
				
				/*
				if(isset($task[4]))
					$gravity = $task[4];
				else
					$gravity = "center";
				
				if(isset($task[5]))
					$extra = " ".$task[5];
				else
					$extra = "";
				
				//get min_width/height
				$dimensions_old = img_op( ["dimensions", $src] );
				$dimensions_new = explode("x", $dimensions);
				$aspect_ratio	= $dimensions_old[0]/$dimensions_old[1];
				
				if($dimensions_new[1]*$aspect_ratio >= $dimensions_new[0])
					$dimensions_resize = "x".$dimensions_new[1];
				else
					$dimensions_resize = $dimensions_new[0]."x";
				
				exec("convert ".$src." -gravity ".$gravity." -resize ".$dimensions_resize."^".$extra." -crop ".$dimensions."+0+0 ".$dest);*/
			}
			if($task[0] == "dimensions"){
				
				$src 		= $task[1];
				
				$result = Array();
				
				try{
					$img = new Imagick();
					$img->readImageBlob(file_get_contents($src));
				}
				catch(Exception $e) {
					die('Error: ' . $e->getMessage());
				}
				
				$result[0] = $img->getImageWidth();
				$result[1] = $img->getImageHeight();
				
				//$result[0] = intval(exec("magick identify -ping -format %w ".$src));
				//$result[1] = intval(exec("magick identify -ping -format %h ".$src));
				
				return $result;
			}
		}
		else
			return "missing value";
	}
	
	
	function img_op_max_dimensions($src, $max_width, $max_height){
		
		$old_dim 	= img_op(["dimensions", $src]);
		$width 		= $old_dim[0];
		$height 	= $old_dim[1];
		
		$new_width 	= $width;
		$new_height = $height;
		
		if( ($max_width == 0 AND $max_height == 0) OR
			($max_width > $width AND $max_height == 0) OR
			($max_height > $height AND $max_width == 0) OR
			($max_width > $width AND $max_height > $height)){

			return (false);
		}
		else{
			
			if($max_width != 0 AND $max_height != 0){
				
				$new_width = $max_width;
				$new_height = $max_height;
			}
			else{
				if($max_width != 0 AND $new_width > $max_width){
					$new_width_cache = $new_width;
					$new_width = $max_width;
					$new_height = $height*($new_width/$new_width_cache);
				}
				
				if($max_height != 0 AND $new_height > $max_height){
					$new_height_cache = $new_height;
					$new_height = $max_height;
					$new_width = $width*($new_height/$new_height_cache);
				}
				
				$new_width = round($new_width, 0);
				$new_height = round($new_height, 0);
			}
			
			return([$new_width, $new_height]);
		}
	}
?>