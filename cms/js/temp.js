function temp_set_img_align(){
	
	//img cover_options
	for(var x=0; x<$("*[data-cms_img_align='cover_center']").length; x++)
		coverimg( $("*[data-cms_img_align='cover_center']").eq(x) );
	
}

function cms_change_lang( new_lang ){
	
	$.post( glob_cms_home_dir+"cms/php_request/basic.php", {
		task 		: "change_lang",
		new_lang	: new_lang
	})
	.done(function( data ) {
		if(data != "")
			alert(data);
		else
			window.location = glob_cms_filename;
	});
}

$(document).ready(function(){
	
	var standard_text_short 	= "Kurzer Text...";
	var standard_text_long 		= "Langer formatierbarer Text...";
	
	var standard_text_short_a	= "Verlinkung";
	
	//Empty textboxes
		
	$("*[data-cmstype='text_short']:empty, *[data-cmstype='text_long']:empty").each(function(){
		
		var placeholder = $(this).attr("data-cmsplaceholder");
		
		if(!placeholder){
			
			if($(this).attr("data-cmstype") == "text_short")
				placeholder = standard_text_short;
			if($(this).attr("data-cmstype") == "text_long")
				placeholder = standard_text_long;
		}
		
		$(this).text(placeholder);
		
		if($("#cms_ib_widget").length)
			cms_ib_widget_empty_elements($(this));
	});
	$("").each(function(){
		
		var placeholder = $(this).attr("data-cmsplaceholder");
		
		if(placeholder)
			$(this).text(placeholder);
		else
			$(this).text(standard_text_long);
		
		if($("#cms_ib_widget").length)
			cms_ib_widget_empty_elements($(this));
	});
	
		$("a[data-cmstype='text_short']:empty").text(standard_text_short_a);
		
		$("h1[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 1");
		$("h2[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 2");
		$("h3[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 3");
		$("h4[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 4");
		$("h5[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 5");
		$("h6[data-cmstype='text_short']:contains("+standard_text_short+")").text("Überschrift 6");
		
		
	//Empty img
	$("*[data-cmstype='img']:empty").each(function(){
		$(this).html("<img src='"+glob_cms_home_dir+"cms/img/empty_img.jpg' alt='CMS Beispielbild'/>");
		
		if($("#cms_ib_widget").length)
			cms_ib_widget_empty_elements($(this));
	});
	
	//Empty diashow
	$("*[data-cmstype='img_dia']:empty").each(function(){
		$(this).html("<img src='"+glob_cms_home_dir+"cms/img/empty_img_dia.jpg' alt='CMS Beispielbild'/>");
		
		if($("#cms_ib_widget").length)
			cms_ib_widget_empty_elements($(this));
	});

	
	temp_set_img_align();
	
	
	//content_clone
	if($("#cms_black").length == 0)
		$("*[data-cmstype='add_clone']").remove();
	
	if($("#loading").html() != ""){
		$(window).load(function(){
			$("#wrapper").css({"visibility":"visible", "position":"relative"});
			$("#loading").hide();	
		});
	}
	else{
		$("#wrapper").css({"visibility":"visible", "position":"relative"});
		$("#loading").hide();	
	}
		
	$(window).on("resize", function(){
		temp_set_img_align();
	});
});
