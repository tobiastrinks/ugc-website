//GLOBAL
var kurs_id;

//buy button
function product_buy_init(){
	
	var content_inner = $("#content_inner");
	
	if(content_inner.attr("data-member") == "false"){
		
		if(content_inner.attr("data-price") == 0){
			$("*[data-product_type='free']").addClass("active");
		}
		else{
			$("*[data-product_type='buy']").addClass("active");
		}
	}
	else{
		$("*[data-product_type='member']").addClass("active");
	}
}

function product_buy(){
	var price = $("#content_inner").attr("data-price");
	if(price != 0)
		mp_kurs_join(kurs_id);//blk_steps_open( $("#buy") );
	else
		mp_kurs_join(kurs_id);
}

//review
function review_init( wrapper, dest_type, dest_id, callback ){

	var not_type = getCookie("not_type");
	var not_number = 0;
	if(not_type == "review")
		not_number = getCookie("not_number");

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "review_receive",
		dest_type	: dest_type,
		dest_id		: dest_id
	})
	.done(function( data ) {

		if(data != ""){

			var result = $.parseJSON(data);

			var review_list	= wrapper.find(".review_list");

			wrapper.find(".review_new").hide();

			if(result["create"] != "0"){

				//init review_new
				var review_new = wrapper.find(".review_new");
				review_new.show();

				//icon
				review_new.find(".review_element_icon_inner").text(lc_user_key).attr("data-lc_transl", "user_icon");

				lc_transl(review_new, function(){});
			}
			else if(result["content"] == undefined){
				wrapper.find(".review_placeholder_mp").show();
			}

			if(result["content"] != undefined){

				var clonable_element 	= $(".review_element.clonable");

				var star_empty			= clonable_element.find(".star_empty");
				var star_filled			= clonable_element.find(".star_filled");

				var result = result["content"];

				for(var x=0; x<result.length; x++){

					//clone
					clonable_element.clone().removeClass("clonable").addClass("empty").appendTo( review_list );
					var new_element = review_list.find(".review_element.empty");

					new_element.attr("data-rev_id", result[x]["id"]).attr("data-pmsg_id", result[x]["pmsg_id"]);

					//icon
					new_element.find(".review_element_icon_inner").text(result[x]["user_key"]).attr("data-lc_transl", "user_icon");

					//name
					new_element.find(".review_element_text_name").text(result[x]["user_key"]).attr("data-lc_transl", "user_name");

					//stars
					var star_wrapper = new_element.find(".review_element_text_stars");
					star_wrapper.html("");

					var star_counter = 0;
					for(var star_x=0; star_x<5; star_x++){

						if(parseInt(result[x]["stars"]) <= star_x){
							star_empty.clone().appendTo(star_wrapper);
						}
						else{
							star_filled.clone().appendTo(star_wrapper);
						}
					}

					//title
					new_element.find(".review_element_text_title_inner").html(result[x]["title"]);

					//timestamp
					new_element.find(".review_element_text_timestamp").html(result[x]["timestamp"]).attr("data-lc_transl", "timestamp");

					//content
					new_element.find(".review_element_text_msg").html(result[x]["content"]);

					//comment
					var comment_counter_output = "";
					if(result[x]["comment_counter"] != "0")
						comment_counter_output = result[x]["comment_counter"];

					new_element.find(".review_element_text_comment_button_counter").text(comment_counter_output);

					new_element.removeClass("empty");

					if(not_number.length){
						if(x < not_number){
							new_element.addClass("notification");
						}
					}
				}
			}

			//ready
			lc_transl( review_list, function(){

				rows_width( review_list.find(".review_element_text_timestamp"), review_list.find(".review_element_text_title"), review_list.find(".review_element_text_body"), true );

				//unset cookies
				if(not_type == "review"){
					document.cookie = "not_type=";
					document.cookie = "not_number=";
					document.cookie = "not_comment=";
				}
				callback(1);
			});
		}
	});
}

function review_submit( dest_type, dest_id, stars, title, content, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "review_submit",
		dest_type	: dest_type,
		dest_id		: dest_id,
		stars		: stars,
		title		: title,
		content		: content
	})
	.done(function( data ) {

		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

function review_submit_check(review_element){

	var result = true;

	var stars	= review_element.find(".review_element_text_stars").attr("data-star");
	if(stars == undefined)
		result = "Bitte Sterne vergeben.";

	var title	= review_element.find(".review_element_text_title_input").val();
	if(title == "")
		result = "Bitte Titel eingeben";

	var content	= review_element.find(".review_element_text_content_input").val();
	if(content == "")
		result = "Begründe deine Bewertung mit einigen Sätzen.";

	return(result);
}

function review_consent_check(callback){

	consent_check( "review_comments_public", function(result){

		if(result == false || result == "empty"){

			ug_alert( 	"VERÖFFENTLICHEN",
						$("*[data-ug_alert='review_comments_public']").html(),
						"Zustimmen",
						"Abbrechen",
						function(ug_result){

				if(ug_result == true){
					consent("review_comments_public", true, function(){});
					callback(1);
				}
			});
		}
		else{
			callback(1);
		}
	});
}

$(document).ready(function(){

    kurs_id = $("#content_inner").attr("data-product_id");

	/*--------buy-----------*/
	//init
	product_buy_init();

    if(getCookie("buy_trigger") != ""){
        product_buy();
        document.cookie = "buy_trigger=";
    }

	$("*[data-product_type='buy'], *[data-product_type='free']").click(function(){
		if(login_bool){
			product_buy();
		}
		else{
			ug_alert( "KURS KAUFEN", "Bitte logge dich dafür zuerst ein. :)", "Schließen", 0, function(){} );
			control_open();
			control_login_switch();
			document.cookie = "buy_login_first=" + $("#content_inner").attr("data-product_url");
		}
	});
	$("#buy_elopage_button_continue").click(function(){
		
		elopage_get_payment_link( function( payment_link ){
			window.location = payment_link;
		});
	});
	$("#buy_elopage_button_cancel").click(function(){
		blk_steps_close( $("#buy") );
	});

	$("*[data-product_type='member']").click(function(){
		var product_id = $(this).closest("#content_inner").attr("data-product_id");
		kurs_memberarea(product_id);
	});
	
	/*--------support-----*/
	if(getCookie("login_reason") == "kurs_msg" && !reg_confirm){
		$("#content").scrollTop($(".product_basic_descr_creator_support").offset().top - window.innerHeight*0.5);
		control_close();
		
		$(".product_basic_descr_creator_support_textarea").val( getCookie("kurs_msg") );
		
		document.cookie = "login_reason=";
		document.cookie = "kurs_msg=";
	}
	if($(".product_basic_descr_creator_support_textarea").val() != ""){
		$(".product_basic_descr_creator_support").addClass("active");
		$(".product_basic_descr_creator_support_submit").fadeIn(300);
	}
	
	$(".product_basic_descr_creator_support_textarea").on("input", function(){
		
		var this_element 	= $(this);
		var support_wrapper = this_element.closest(".product_basic_descr_creator_support");
		var textarea 		= support_wrapper.find(".product_basic_descr_creator_support_textarea");
		var submit 			= support_wrapper.find(".product_basic_descr_creator_support_submit");
		
		if(!support_wrapper.hasClass("active") && textarea.val() != ""){
			support_wrapper.addClass("active");
			submit.fadeIn(300);
		}
	});
	$(".product_basic_descr_creator_support_submit").click(function(){
		
		var this_element = $(this);
		var support_wrapper = this_element.closest(".product_basic_descr_creator_support");
		var textarea 		= support_wrapper.find(".product_basic_descr_creator_support_textarea");
		
		if(textarea.val() != ""){
			if(!reg_confirm) {
                if (login_bool == true) {

                    comm_widget_show();

                    comm_widget_menu_open("support");
                    $("#comm_widget_content_support_menu").hide();

                    var chatbox_area = $("#comm_widget_content_support_chatbox_area");
                    var chatbox_clonable = $("#comm_widget_chatbox_private_clonable");

                    var chatbox = $("#comm_widget_content_support_chatbox");

                    var user_key = $("#content_inner").attr("data-creator_key");

                    lc_chatroom_private_check(user_key, function (lc_private_chatroom_id) {

                        comm_widget_receive_chatroom_id("support_kursersteller", 0, 1, 0, 0, 0, lc_private_chatroom_id, function (cw_private_chatroom_id) {

                            if (cw_private_chatroom_id == "" || lc_private_chatroom_id == 0) {

                                chatbox.show();

                                lc_chatroom_private(user_key, "offline", chatbox_area, chatbox_clonable, 20, textarea.val(), function (chatroom_id) {

                                    //chatroom_created
                                    comm_widget_chatroom_create(chatroom_id, "0", "support_kursersteller", "", "", function () {
                                        //chatroom_erstellt
                                        comm_widget_chatbox_init(chatroom_id, chatbox, chatbox_area, chatbox_clonable, 50, function () {
                                        });
                                    });
                                });
                            }
                            else {
                            	var message = textarea.val();

                                comm_widget_chatbox_init(cw_private_chatroom_id[0], chatbox, chatbox_area, chatbox_clonable, 50, function () {
                                    lc_send_msg( cw_private_chatroom_id[0], message );
                                });
                                textarea.val("");
                            }
                        });
                    });

                    $("#comm_widget_user_profile").hide();
                    $("#comm_widget_content_menu_wrapper").stop().fadeIn(300);
                }
                else {
                    ug_alert("KURSERSTELLER KONTAKTIEREN", "Bitte melde dich zuerst an, um eine private Nachricht zu schreiben.", "zum Login", "abbrechen", function (result) {

                        if (result == true) {
                            control_open();
                            document.cookie = "login_reason=kurs_msg";
                            document.cookie = "kurs_msg=" + textarea.val();
                        }
                    });
                }
            }
            else {
				ug_alert("E-MAIL BESTÄTIGEN", "Bitte bestätige zuerst deine E-Mail Adresse, um deine Frage zu senden.", "Verstanden", 0, function(){
                    control_open();
				});
			}
		}
		else{
			ug_alert( "KURSERSTELLER KONTAKTIEREN", "Bitte gib eine Nachricht ein.", "Schließen", 0, function(){} );
		}
	});
	
	/*--------list of lessons/modules--------*/
	rows_width( $(".product_lesson_duration"), $(".product_lesson_title"), $(".product_lesson_head"), true );
	rows_width( $(".product_module_duration"), $(".product_module_title"), $(".product_module"), true );
	
	//preview
	var preview_player;
	
	$(".product_module.preview").click(function(){
		
		$("#product_video_preview").find("video.clonable").clone().removeClass("clonable").appendTo($("#product_video_preview_inner_video"));
		
		var video_id = $(this).attr("data-vimeo_id");
		
		vimeo_player( $("#product_video_preview_inner_video"), video_id, undefined, function( player ){
			player.play();
			
			preview_player = player;
			$("#product_video_preview").addClass("active");
		});
	});
	
	$("#product_video_preview_inner_button_close").click(function(){
		$("#product_video_preview").removeClass("active");
		$("#product_video_preview_inner_video").html("").removeClass("init");
	});
	
	
	/*--------reviews---------*/
	
	//newsfeed_not
	var not_type 	= getCookie("not_type");
	var not_comment	= getCookie("not_comment");
	
	review_init( $(".review"), "kurs", $("#content_inner").attr("data-product_id"), function(){
		
		//review_new
		if(getCookie("review_new").length){
			$("#content").scrollTop( $(".review").offset().top - (0.3* window.innerHeight) );
			document.cookie = "review_new=";
		}
		
		//newsfeed_not
		if(not_type.length){
			
			if(not_type == "review"){
				
				$("#content").animate({scrollTop: $(".review").offset().top - (0.3* window.innerHeight) }, 1000);
			}
			else{
				var not_rev_id = getCookie("not_rev_id");
				
				var review_element = $(".review_element[data-rev_id='"+not_rev_id+"']");
				var comment_inner	= review_element.find(".review_element_text_comment_inner");
					
				comment_inner.addClass("init").addClass("active");
				
				project_msg_init( comment_inner, review_element.attr("data-pmsg_id"), function(){
					
					comment_inner.show();
					
					var scroll;
					if(not_type == "comment")
						scroll = review_element.find(".review_element_text_comment").offset().top - (0.3* window.innerHeight);
					if(not_type == "reply"){
						var comment_element = review_element.find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+not_comment+"']");
						scroll = comment_element.find("*[data-pmsg_type='reply_area']").offset().top - (0.3* window.innerHeight);
					}
					$("#content").animate({scrollTop:scroll}, 1000);
				});
			}
		}
	});
	
	$(".review_element_text_stars_input").hover(function(){
		
		var this_element 	= $(this);
		var star_nb 		= this_element.attr("data-star");
		var star_wrapper 	= this_element.closest(".review_element_text_stars");
		
		if(!star_wrapper.hasClass("active")){
		
			for(var x=1; x<=5; x++){
				
				var input = star_wrapper.find(".review_element_text_stars_input");
				
				if(star_nb < x)
					input.eq(x-1).removeClass("active");
				else
					input.eq(x-1).addClass("active");
			}
		}
		
	}, function(){
		
		var wrapper = $(this).closest(".review_element_text_stars");
		
		if(!wrapper.hasClass("active"))
			wrapper.find(".review_element_text_stars_input").removeClass("active");
	});
	
	$(".review_element_text_stars_input").click(function(){
		
		var this_element = $(this);
		
		var wrapper = this_element.closest(".review_element_text_stars");
		var star_nb = this_element.attr("data-star");
		
		if(wrapper.attr("data-star") == undefined){
			wrapper.attr("data-star", star_nb);
			wrapper.addClass("active");
			
			var review_new 	= this_element.closest(".review_new");
			var submit		= review_new.find(".review_new_submit");
			
			if(!submit.hasClass("active") && review_submit_check(review_new) === true){
				review_new.find(".review_new_submit").stop().slideDown(300).addClass("active");
			}
		}
		
		if(wrapper.attr("data-star") != star_nb){

			for(var x=1; x<=5; x++){
				
				var input = wrapper.find(".review_element_text_stars_input");
				
				if(star_nb < x)
					input.eq(x-1).removeClass("active");
				else
					input.eq(x-1).addClass("active");
			}
			wrapper.attr("data-star", star_nb);
		}
	});
	$(".review_element_text_title_input, .review_element_text_content_input").on("input", function(event){
		
		var this_element 	= $(event.target);
		var review_new 		= this_element.closest(".review_new");
		var submit			= review_new.find(".review_new_submit");
		
		if(!submit.hasClass("active") && review_submit_check(review_new) === true){
			submit.stop().slideDown(300).addClass("active");
		}
	});
	
	$(".review_new_submit").click(function(){
		
		var review_new = $(this).closest(".review_new");

		var stars	= review_new.find(".review_element_text_stars").attr("data-star");
		var title	= review_new.find(".review_element_text_title_input").val();
		var content	= review_new.find(".review_element_text_content_input").val();
		
		var check_result = review_submit_check(review_new);
		
		if(check_result === true){
			
			review_consent_check(function(){
					
				review_submit( "kurs", kurs_id, stars, title, content, function(){
					review_new.slideUp(500);
					
					document.cookie = "review_new=1";
					reload();
				});
			});
		}
		else{
			alert(check_result);
		}
	});
	
	
	$(".review_list").on("click", ".review_element_text_comment_button", function(event){
		
		var this_element 	= $(event.target);
		var review_element 	= this_element.closest(".review_element");
		
		var comment_inner	= review_element.find(".review_element_text_comment_inner");
		
		
		if(!comment_inner.hasClass("init")){
			
			review_consent_check(function(){
			
				comment_inner.addClass("init").addClass("active");
				
				project_msg_init( comment_inner, review_element.attr("data-pmsg_id"), function(){
					comment_inner.fadeIn(300);
				});
			});
		}
		else{
			if(!comment_inner.hasClass("active")){
				comment_inner.addClass("active").stop().fadeIn(300);
			}
			else{
				comment_inner.removeClass("active").stop().hide();
			}
		}
	});
});