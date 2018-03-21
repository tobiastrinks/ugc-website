function m_on_resize(){
	
	//16:9 video size
	$("#m_content_module_video").css("height", $("#m_content_module_video").width()*(0.5625) +"px");
}

function m_first_visit( kurs_id ){
	
	comm_widget_receive_chatroom_id( "kurs", 0, 0, 0, 0, kurs_id, 0, function(chatroom_id){
	
		chatroom_id = chatroom_id[0];
		
		lc_chatroom_user_join( chatroom_id, function(){
			
			blk_steps_open( $("#join_steps") );
			
			$(".blk_steps_content_page_button").click(function(){
				
				var next_page = blk_steps_next( $(this).closest(".blk_steps"), function(){
					
					if(next_page.attr("id") == "join_steps_chatroom"){
						
						comm_widget_show(false, chatroom_id);
						blk_steps_cw_animation( $("#join_steps_chatroom") );
					}
				});
				if(next_page != undefined && next_page.attr("id") == "join_steps_leaderboard"){
					blk_steps_cw_animation_close();
				}
			});
			
			$("#join_steps_leaderboard").find(".blk_steps_content_page_button").click(function(){
				blk_steps_close( $("#join_steps") );
				
				callback(1);
			});
		});
	});
}

function m_leaderboard_consent( retry_if_false, callback ){
	
	var consent_str = "leaderboard_share_progress";
	
	consent_check( consent_str, function( result ){
		
		if(result == "empty" || (result == false && retry_if_false == true)){
			ug_alert( 	"LEADERBOARD VERWENDEN", 
						$("*[data-ug_alert='leaderboard_share_progress']").html(), 
						"Zustimmen", 
						"Abbrechen", 
						function(ug_result){
				
				if(ug_result == true){
					callback(1);
					consent( consent_str, true, function(){
						reload();
					});
				}
				else{
					consent( consent_str, false, function(){} );
					$("#m_content_leaderboard").remove();
				}
			});
		}
		if(result == false && !retry_if_false)
			$("#m_content_leaderboard").remove();
		if(result == true)
			callback(1);
	});
}

function m_pmsg_module_receive( module_id, callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_m_pmsg_module_receive",
		id		: module_id
	})
	.done(function( data ) {
		callback(data);
	});
}

function m_upper_init( id ){
	
	var nav_element 	= $(".m_nav_element[data-upper_id='"+id+"']");
	var content_element = $(".m_content_element[data-upper_id='"+id+"']");
		
	if(!nav_element.hasClass("selected")){
		
		var leaderboard = $.Deferred();
		
		if(id == "leaderboard" && $("#memberarea").attr("data-premember") != "1"){
			m_leaderboard_consent(true, function(){
				leaderboard.resolve();
			});
		}
		else
			leaderboard.resolve();
	
	
		$.when(leaderboard).done(function(){
			
			$(".m_nav_element").removeClass("selected");
			document.cookie = "m_module_open=";
			
			document.cookie = "m_upper_open="+id;
			nav_element.addClass("selected");
			
			$(".m_content_element").removeClass("active").stop().hide();
			content_element.addClass("active").fadeIn(500, function(){
				
				if(id == "leaderboard" && $(".m_content_leaderboard_element_progress_bar").eq(0).attr("data-progress") != ""){
					
					$(".m_content_leaderboard_element_progress_bar").each(function(){
						var this_element = $(this);
						this_element.css("width", this_element.attr("data-progress")+"%");
					});
					
					var leaderboard_user_key = [];
					
					$(".m_content_leaderboard_element_contact").find("*[data-cw_type='user_contact'][data-cw_user_key]").each(function(){
						var user_key = $(this).attr("data-cw_user_key");
						
						leaderboard_user_key[leaderboard_user_key.length] = user_key;
						
						if(lc_user_key == user_key){
							$(this).hide();
						}
					});
					
					cw_user_contact_rights_prepare( leaderboard_user_key, 0, function(){
						cw_user_contact_rights_update( leaderboard_user_key, 0 );
					});
				}
			});
			
		}).promise();
	}
}

function m_module_init( module_id, callback ){
	
	var m_content = $("#m_content_module");
	
	if(!m_content.hasClass("active")){
		$(".m_content_element").removeClass("active").hide();
		m_content.addClass("active").show();
		
		$(".m_nav_element").removeClass("selected");
		document.cookie = "m_upper_open=";
	}
	
	if(m_content.attr("data-c_id") != module_id){
		
		m_content.stop().css("visibility", "hidden");
		
		$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
			task 	: "kurs_m_module_receive",
			id		: module_id
		})
		.done(function( data ) {
			if(data != ""){
				
				var result = $.parseJSON(data);
				
				//load video
				if(result["vimeo_id"] != 0) {
                    $("#m_content_module_video").removeClass("inactive");
                    vimeo_player($("#m_content_module_video"), result["vimeo_id"], result["thumbnail"], function () {});
                }
                else{
                    $("#m_content_module_video").addClass("inactive");
				}
				$(".m_nav_module_element").removeClass("selected");
				var new_module = $(".m_nav_module_element[data-m_id='"+module_id+"']");
				new_module.addClass("selected");
				
				var new_lesson = new_module.closest(".m_nav_lesson_element");
				
				if(new_module.index() == 0 && new_lesson.index() == 0){
					$("#m_content_module_video_footer").addClass("first");
				}
				else{
					$("#m_content_module_video_footer").removeClass("first");
				}
				
				if(!new_module.closest(".m_nav_lesson_element_module").hasClass("active"))
					new_module.closest(".m_nav_lesson_element_module").stop().slideDown(500).addClass("active");
				
				m_content.attr("data-m_id", module_id);
				
				//title
				m_content.find("#m_content_module_title_lesson").text(new_lesson.index()+1);
				m_content.find("#m_content_module_title_module").text(new_module.index()+1);
				m_content.find("#m_content_module_title_content").html(result["title"]);
				
				rows_width( $("#m_content_module_title_number"), $("#m_content_module_title_text"), $("#m_content_module_title"), true );
				
				//descr
				m_content.find("#m_content_module_descr_content").html(result["descr"]);
				
				//comments
				m_pmsg_module_receive(module_id, function(msg_id){
				
					project_msg_init( $("#m_content_module_comments"), msg_id, function(){
						
						m_content.stop().css("visibility", "visible").hide().fadeIn(500, function(){
							callback(1);
						});
					});
				});
				
				document.cookie = "m_module_open="+module_id;
			}
		});
	}
}

//status update
function m_user_content_status( type, content_id, status, callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_m_user_content_status",
		type		: type,
		content_id 	: content_id,
		status		: status
	})
	.done(function( progress ) {
		
		if(progress != "")
			callback(progress);
	});
}

$(document).ready(function(){
	
	var kurs_id = $("#memberarea").attr("data-kurs_id");
	
	//-----------header_buttons
	$("#m_header_hosting").click(function(){
		kurs_hosting(kurs_id);
	});
	
	
	//first_visit
	if($("#memberarea").attr("data-premember") == "1"){
		m_first_visit( kurs_id, function(){
			m_leaderboard_consent(false, function(){});
		});
	}
	else{
		m_leaderboard_consent(false, function(){});
	}
	
	
	//blk_steps_open( $("#join_steps") );
	rows_width($("#join_steps_leaderboard_accept_box"), $("#join_steps_leaderboard_accept_text"), $("#join_steps_leaderboard_accept"), true);
	
	//video resizing
	$("#m_content_module_video").css("height", $("#m_content_module_video").width()*(0.5625) +"px");
			
	$(window).on("resize", function(){
		m_on_resize();
	});
	
	$(window).on("load", function(){
		
		//load progress
		$("#memberarea_progress_bar_inner").css("width", $("#memberarea_progress_bar").attr("data-progress")+"%");
		
		$(".m_nav_module_element_progress.active").each(function(){
			
			var progress = $(this).attr("data-m_progress");
			var progress_bar = $(this).find(".m_nav_module_element_progress_bar_inner");
			
			progress_bar.css("width", progress+"%");
		});
	});
	
	
	//-------------nav
	$(".m_nav_element[data-upper_id]").click(function(){
		
		m_upper_init( $(this).attr("data-upper_id") );
	});
	
	if(glob_cms_device == "desktop"){
		$(".m_nav_lesson_element").each(function(){
			
			var this_element	= $(this);
			var lesson_id 		= this_element.attr("data-m_id");
			
			var module_cookie	= getCookie("m_module_"+lesson_id);
			
			if(module_cookie == "1"){
				
				var module = this_element.find(".m_nav_lesson_element_module");
				
				module.addClass("active").show();
			}
		});
		
		$(".m_nav_lesson_element_inner").click(function(){
			
			var this_element 	= $(this);
			
			var lesson_element	= this_element.closest(".m_nav_lesson_element");
			var lesson_id 		= lesson_element.attr("data-m_id");
			var module			= lesson_element.find(".m_nav_lesson_element_module");
			
			if(!module.hasClass("active")){
				
				module.addClass("active");
				module.stop().slideDown(500);
				
				document.cookie = "m_module_"+lesson_id+"=1";
			}
			else{
				module.removeClass("active");
				module.stop().slideUp(500);
				
				document.cookie = "m_module_"+lesson_id+"=";
			}
		});
	}
	
	$(".m_nav_module_element").click(function(){
		
		var this_element 	= $(this);
		var module_id		= this_element.attr("data-m_id");
		
		if(!this_element.hasClass("selected")){
			
			m_module_init( module_id, function(){
				this_element.addClass("selected");
			});
		}
		
		if(glob_cms_device == "mobile"){
			$("#m_nav").removeClass("active");
		}
	});
	$(".m_nav_upper_element").click(function(){
		if(glob_cms_device == "mobile"){
			$("#m_nav").removeClass("active");
		}
	});
	
	if(glob_cms_device == "mobile"){
		$("#m_content_module_title, #m_content_leaderboard_head_text").click(function(){
			if(!$("#m_nav").hasClass("active")){
				$("#m_nav").addClass("active");
			}
		});
		$("#m_nav_blk").click(function(){
			if($("#m_nav").hasClass("active")){
				$("#m_nav").removeClass("active");
			}
		});
	}
	
	//-------leaderboard
	if($("#m_content_leaderboard").length){
		var m_leaderboard_user_key = "";
		$("#m_content_leaderboard").find("*[data-lc_type='user_status']").each(function(){
			m_leaderboard_user_key += $(this).attr("data-lc_user_key")+",";
		});
		m_leaderboard_user_key = m_leaderboard_user_key.slice(0,-1);
		
		lc_user_status_receive( m_leaderboard_user_key, function(result){
			
			$("#m_content_leaderboard").find("*[data-lc_type='user_status']").each(function(){
				
				var this_element = $(this);
				var status = result[this_element.attr("data-lc_user_key")];
				
				this_element.find("*[data-lc_type='user_status_"+status+"']").show();
			});
		});
	}
	
	//-------module
	var module_open = getCookie("m_module_open");
	if(module_open && $(".m_nav_element[data-m_id='"+module_open+"']").length){
		
		//newsfeed_not
		var not_type 	= getCookie("not_type");
		var not_comment = getCookie("not_comment");
		
		m_module_init( module_open, function(){
			
			if(not_type.length){
				
				var scroll = 0;
				
				if(not_type == "comment")
					scroll = $("#m_content_module_comments").offset().top;
				else{
					var comment_element = $("#m_content_module_comments").find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+not_comment+"']");
					scroll = comment_element.find("*[data-pmsg_type='reply_area']").offset().top - (0.3*window.innerHeight);
				}
				
				$("#content").stop().animate({scrollTop:scroll}, 1000);
			}
		});
	}
	else{
		if(!getCookie("m_upper_open"))
			m_module_init( $(".m_nav_module_element").eq(0).attr("data-m_id"), function(){} );
		else{
			m_upper_init( getCookie("m_upper_open") );
		}
	}
	
	
	//module consumption
	$("#m_content_module_video_prev").click(function(){
		
		var module_id = $("#m_content_module").attr("data-m_id");
		var module_nav_element 	= $(".m_nav_module_element[data-m_id='"+module_id+"']");
		var prev_element 		= module_nav_element.prev(".m_nav_module_element[data-m_id]");
		
		if(!prev_element.length){
			var prev_lesson	= module_nav_element.closest(".m_nav_lesson_element").prev(".m_nav_lesson_element");
			if(prev_lesson.length)
				prev_element = prev_lesson.find(".m_nav_module_element[data-m_id]").last();
		}
		
		if(prev_element.length){
			m_module_init( prev_element.attr("data-m_id"), function(){} );
		}
	});
	$("#m_content_module_video_next").click(function(){
		
		var module_id = $("#m_content_module").attr("data-m_id");
		
		m_user_content_status( "module", module_id, "done", function( progress ){
			
			$("#memberarea_progress_bar_inner").css("width", progress+"%");
			
			//---leaderboard
			var leaderboard_element = $(".m_content_leaderboard_element[data-cw_user_key='"+lc_user_key+"']");
			leaderboard_element.find(".m_content_leaderboard_element_progress_bar").css("width", progress+"%").attr("data-progress", progress);
			leaderboard_element.find(".m_content_leaderboard_element_progress_val_number").text(progress);
			
			//check order
			var last_element = true;
			var quit = false;
			
			$(".m_content_leaderboard_element_progress_bar").each(function(){
				
				if(!quit && progress < $(this).attr("data-progress")){
					$(this).closest(".m_content_leaderboard_element").before(leaderboard_element);
					last_element = false;
					quit = true;
				}
			});
			if(last_element){
				$(".m_content_leaderboard_element").last().after(leaderboard_element);
			}
			
			var module_nav_element 	= $(".m_nav_module_element[data-m_id='"+module_id+"']");
			var next_element 		= module_nav_element.next(".m_nav_module_element[data-m_id]");
			
			if(!next_element.length){
				var next_lesson	= module_nav_element.closest(".m_nav_lesson_element").next(".m_nav_lesson_element");
				if(next_lesson.length)
					next_element = next_lesson.find(".m_nav_module_element[data-m_id]").eq(0);
			}
			
			module_nav_element.find("#m_nav_module_element_icon_done").addClass("active");
			
			//bei drip-in überarbeiten
			if(next_element.length){
				m_module_init( next_element.attr("data-m_id"), function(){} );
			}
		});
	});
});