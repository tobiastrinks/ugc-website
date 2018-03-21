function temp_on_resize(){
	
	if(glob_cms_device == "desktop"){
		$(".product_basic").each(function(){
			
			var this_element		= $(this);
			
			var descr_kurs_wrapper 	= this_element.find(".product_basic_descr");
			
			var descr_kurs_rows 	= descr_kurs_wrapper.find(".product_basic_descr_kurs_rows");
			var descr_kurs_rows_i 	= descr_kurs_wrapper.find(".product_basic_descr_kurs_rows_inner");
			
			var descr_kurs_height1 	= descr_kurs_rows_i.eq(0).outerHeight(true);
			var descr_kurs_height2 	= descr_kurs_rows_i.eq(1).outerHeight(true);
			
			if(descr_kurs_height1 > descr_kurs_height2)
				descr_kurs_rows.css("height", descr_kurs_height1 +"px");
			else{
				descr_kurs_rows.eq(0).css("height", descr_kurs_height1+"px");
				descr_kurs_rows.eq(1).css("height", descr_kurs_height2+"px");
			}
			
			//bubble
			var bubble_element		= this_element.find(".product_basic_descr_creator_rows_text_bubble");
			bubble_element.each(function(){
				
				var this_element = $(this);
				this_element.css("height", this_element.find(".product_basic_descr_creator_rows_text_bubble_inner").outerHeight(true));
			});
			
			this_element.find(".product_basic_descr_creator_rows_icon2").css("top", this_element.find(".product_basic_descr_creator_rows_text_bubble").eq(0).outerHeight(true));
		});
	}
}

$(document).ready(function(){
	temp_on_resize();
	$(window).on("load", function(){
        temp_on_resize();
	});
	$(window).on("resize", function(){
		temp_on_resize();
	});
	
	//var lc_user_key = 1;
	
	/*init*/
	$.when(livechat).done(function(){
		$(".product_basic_descr_creator_icon2").text(lc_user_key).attr("data-lc_transl", "user_icon");
		lc_transl($(".product_basic"), function(){});
	});
});