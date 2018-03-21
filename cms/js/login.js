function cms_box_open( selector ){
	
	$("body, html").css("overflow", "hidden");
	selector.wrap("<div class='cms_box_wrapper cms_element'></div>");
	
	$("#cms_black").stop().fadeIn(500, function(){ 
		selector.stop().fadeIn(300); 
	});
	$("#cms_goto_top").addClass("active");
	
}

$(document).ready(function(){
	
	cms_box_open( $("#cms_login") );
	
	
	if($("#cms_menu").length)
		$("#cms_menu").hide();
	
	$("#cms_login_button").click(function(){
		
		var this_button = $(this).find("span");
	
		if($(this).hasClass("success") == false){
		
			$(".cms_login_error_message").hide();
			
			var username = $("#cms_login_username input").val();
			var pw = $("#cms_login_pw input").val();
			
			if(username != "" && pw != ""){
				
				$.post( glob_cms_home_dir+"cms/php_request/login.php", {
					username 	: username,
					pw 			: pw
				})
				.done(function( data ) {
					
					if(data != "error_username" && data != "error_pw"){
							
						this_button.addClass("success");
						$("#cms_login_button").css("background-color", "rgba(255,255,255,0.7)");
						this_button.text("Willkommen "+data);
						this_button.delay(2000, function(){
							window.location = glob_cms_filename;
						});
					}
					else{
						if(data == "error_username")
							$("#cms_login_error_username").fadeIn(300);
						if(data == "error_pw")
							$("#cms_login_error_pw").fadeIn(300);
					}
				});
			}
			else{
				$("#cms_login_error_empty").fadeIn(300);
			}
		
		}	
	});
	
	$("#cms_login .cms_box_close i").click(function(){
		
		window.location = glob_cms_filename;
	});
	
});