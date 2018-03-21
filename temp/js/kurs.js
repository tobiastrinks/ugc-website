//review
function review_init( wrapper, dest_type, dest_id ){
	
	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "review_receive",
		dest_type	: dest_type,
		dest_id		: dest_id
	})
	.done(function( data ) {
		
		if(data != ""){
			
			var result = $.parseJSON(data);
			
			if(result["create"] != undefined){
				if(result["create"] == "0"){
					wrapper.find(".review_new").hide();
				}
			}
			
			var clonable_element 	= $(".review_element.clonable");
			var review_list			= wrapper.find(".review_list");
			
			var star_empty			= clonable_element.find(".star_empty");
			var star_filled			= clonable_element.find(".star_filled");
			
			result = result["content"];
			
			for(var x=0; x<result.length; x++){
				
				//clone
				clonable_element.clone().removeClass("clonable").addClass("empty").appendTo( review_list );
				var new_element = review_list.find(".review_element.empty");
				
				//stars
				var star_wrapper = new_element.find(".review_element_text_stars");
				star_wrapper.html("");
				
				var star_counter = 0;
				for(var star=0; star_x<5; star_x++){
					
					if(parseInt(result["stars"]) <= star_x){
						star_empty.appendTo(star_wrapper);
					}
					else{
						star_filled.appendTo(star_wrapper);
					}
				}
				
				//ready
				lc_transl( new_element, function(){
					
					new_element.removeClass("empty");
				});
			}
		}
	});
}

$(document).ready(function(){
	
	review_init( $(".review"), "kurs", 14 );
});