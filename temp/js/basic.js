//global_var
var documentTitle = document.title;
var documentFocus = true;

var window_scroll_cache = 0;
var window_noscroll_pos = 0;

var user_username = [];
var user_name = [];
var user_img = [];
var cw_chatroom_icon = [];
var cw_chatroom_type = [];

var rights = [];
var rights_output = [];
	rights_output["root"] 		= "Entwickler";
	rights_output["lc_mod"] 	= "Livechat Mod";
	rights_output["supporter"] 	= "Supporter";
	rights_output["admin"]	 	= "Admin";

var cw_course_create_number = 0;

var cw_contact = [];

var dropzone_array = [];

var vimeo_players = [];

var login_reload = false;

function getParam(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

//--------------unigrow alert
function ug_alert( headline, content, accept, decline, callback ){

	//content
	$("#ug_alert_headline").html(headline);
	$("#ug_alert_content").html(content);

	//buttons
	var accept_button = $("#ug_alert_buttons_accept");
	var decline_button = $("#ug_alert_buttons_decline");

	accept_button.html(accept);
	if(decline != undefined && decline != 0){
		decline_button.html(decline);
		decline_button.show();
	}
	else
		decline_button.hide();

	accept_button.bind("click", function(){
		accept_button.unbind();
		$("#ug_alert").removeClass("active").stop().fadeOut(500);
		callback(true);
	});
	decline_button.bind("click", function(){
		decline_button.unbind();
		$("#ug_alert").removeClass("active").stop().fadeOut(500);
		callback(false);
	});

	//show
	$("#ug_alert").addClass("active").stop().fadeIn(500);
}

//--------------consent
function consent( subject, status, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "consent",
		status	: status,
		subject	: subject
	})
	.done(function( data ) {
		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function consent_check( subject, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "consent_check",
		subject	: subject
	})
	.done(function( data ) {
		if(data == "empty")
			callback("empty");
		else if(data == "true")
			callback(true);
		else if(data == "false")
			callback(false);
	});
}


//--------------login
function login( user, pw ){

	$.post( glob_cms_home_dir+"temp/php_request/login.php", {
		user 	: user,
		pw		: pw
	})
	.done(function( data ) {
		if(data){
			//anmeldung erfolgreich
			document.cookie = "login_reload=1";
			if(user != 0 && pw != 0)
				document.cookie = "welcome_push=1";
			else
				document.cookie = "welcome_push=";

			if(getCookie("buy_login_first") == "" || getCookie("register") == "1")
                reload();
			else if (user != 0 && pw != 0) {
				//standard login
                var url = "kurs.html?p=" + getCookie("buy_login_first");
				document.cookie = "buy_login_first=";
				document.cookie = "buy_trigger=1";
                window.location = url;
			}
			else {
				//register
                //buy_trigger after #welcome_close
                reload();
			}
		}
		else{
			ug_alert( "ANMELDUNG FEHLGESCHLAGEN", "Benutzername oder Passwort sind fehlerhaft.", "Schließen", 0, function(){});
		}
	});
}

//-------reset pw
function reset_password_mail( user ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "reset_password_mail",
		user	: user
	})
	.done(function( data ) {
		if(data == ""){
			ug_alert( "DU HAST POST!", "Checke deinen Posteingang um dein Passwort zurückzusetzen.", "Schließen", 0, function(){});
		}
		else{
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		}
	});
}
function reset_password_init( key ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "reset_password_init",
		key			: key
	})
	.done(function( data ) {
		if(data != ""){
			if(data != "invalid_key"){
				var result = $.parseJSON(data);

				$("#pwr_steps_fname").text(result["fname"]);

				//open blk_steps
				blk_steps_open($("#pwr_steps"));
			}
			else{
				ug_alert( "BEREITS ZURÜCKGESETZT", "Du hast dein Passwort bereits mit dieser E-Mail zurückgesetzt. Im Login Bereich kannst du eine neue E-Mail zum Zurücksetzen anfordern.", "Schließen", 0, function(){
					window.history.replaceState({}, document.title, "/" + "index.html");
				} );
			}
		}
	});
}
function reset_password( password, key ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "reset_password",
		password	: password,
		key			: key
	})
	.done(function( data ) {
		if(data == ""){
			ug_alert( "PASSWORT ZURÜCKGESETZT", "Dein Passwort wurde erfolgreich zurückgesetzt.", "zum Login", 0, function(){
				if(login_bool == false){
					control_open();
					blk_steps_close($("#pwr_steps"));
					window.history.replaceState({}, document.title, "/" + "index.html");
				}
				else
					logout();
			});
		}
		else{
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		}
	});
}

//----------------------load project----------------------------
function init_html(){

	$("*[data-placeholder_standard]").each(function(){

		var this_element = $(this);

		this_element.attr("placeholder", this_element.attr("data-placeholder_standard"));
	});

	$("#comm_widget_content_nachrichten_privat_search").find("input").val("");
	$("#comm_widget_content_chatrooms_gruppe_beitreten_search").find("input").val("");


	$("img").bind("dragstart", function(){
		return false;
	});
}
function on_resize(){

	var window_innerheight = window.innerHeight;

	if(glob_cms_device != "mobile")
		$("#wrapper").css("height", window_innerheight+"px");

	//-----control
	//bg
	if(glob_cms_device == "desktop" && $(".control_background img.transform").length)
		control_bg_transform();
	else
		coverimg($(".control_background:visible"));

	//login
	if(glob_cms_device == "desktop"){
		$("#control_login_top").css("height", window_innerheight - $(".control_nav").eq(0).outerHeight() +"px");

		if($("#control").hasClass("demo"))
			$("#control_login_bottom").css("height", window_innerheight+"px");
	}

	newsfeed_on_resize();

	cw_on_resize();

	//------vimeo_video
	//16:9
	$(".vimeo_player").each(function(){

		var this_element = $(this);

		this_element.css("height", this_element.width()*(9/16) +"px");
	});

	//---demo
	if($("#demo").hasClass("active") && glob_cms_device == "desktop"){

		$(".demo_present_content_video").each(function(){
			var this_elem = $(this);

			this_elem.css("margin-top", this_elem.closest(".demo_pages").find(".demo_present_text_head").outerHeight() +"px");
		});
	}
}
function noscroll( status ){
	if(status == true){
		window_noscroll_pos = $(document).scrollTop();
		$("html, body").addClass("noscroll");
	}
	else{
		$("html, body").removeClass("noscroll");
		$(document).scrollTop(window_noscroll_pos);
	}
}
function rows_width( elem1, elem2, wrapper, on_resize ){

	if(elem1 != undefined && elem2 != undefined && wrapper != undefined){
		elem1.attr("data-rows_width", "elem1");
		elem2.attr("data-rows_width", "elem2");
		wrapper.attr("data-rows_width", "wrapper");
	}

	$("*[data-rows_width='elem1']:visible").each(function(){
		var elem1 = $(this);
		var wrapper = elem1.closest("*[data-rows_width='wrapper']");
		var elem2 = wrapper.find("*[data-rows_width='elem2']");

		elem2.each(function(){

			var this_element = $(this);

			elem1.css("width", "");

			var elem2_padding = 0;

			this_element.css("width", "");
			elem2_padding = this_element.outerWidth()-this_element.width();

			this_element.css("width", wrapper.width()-elem1.outerWidth()-elem2_padding-2);
		});
	});

	if(on_resize != undefined && !on_resize){
		elem1.attr("data-rows_width", "");
		elem2.attr("data-rows_width", "");
		wrapper.attr("data-rows_width", "");
	}
}


function rights_check( user_key, right ){

	var result = false;

	if(rights[user_key] != undefined){

		for(var x=0; x<rights[user_key].length; x++){

			if(rights[user_key][x] == right)
				result = true;
		}
	}

	return(result);
}
function rights_receive( callback ){ //format: result[user_key] = [rights]

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "rights_receive"
	})
	.done(function( data ) {

		if(data != "")
			callback($.parseJSON(data));
		else
			callback("");
	});
}
function rights_get_user( right, callback ){

	var result = [];
	var result_counter = 0;

	for(var key in rights) {
		for(var x=0; x<rights[key].length; x++){

			if(rights[key][x] == right){

				result[result_counter] = key;
				result_counter++;
			}
		}
	}

	if(result.length)
		callback(result);
	else
		callback("");
}
function category_receive( callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "category_receive"
	})
	.done(function( data ) {

		if(data != "")
			callback($.parseJSON(data));
	});
}

//control_open
function control_init(){
	//load control_element
	var control_element;
	var control_element_id = getCookie("control_element");
	if(control_element_id != ""){
        control_element = $("#"+control_element_id);
	} else {
		control_element = $(".control_element.load");
		document.cookie = "control_element="+control_element.attr("id");
	}
	if(!control_element.hasClass("active")) {
        $(".control_element, .control_background").removeClass("active");
        control_element.addClass("active");
        $("#" + control_element.attr("id") + "_bg").addClass("active");
        //load_bg
        control_bg_transform();
    }
}
function control_open(fast){

	var control = $("#control");

	if(!control.hasClass("active")){

		if($("#demo").hasClass("active") && glob_cms_device == "mobile")
			$("#demo").stop().fadeIn(500);

		$("#control").show();
		on_resize();

		var task1 = $.Deferred();
		var task2 = $.Deferred();

		if(fast != undefined && fast != "" && fast != 0){
			$("#control").css("top", "0px");
			$("#control_open").hide();
			task1.resolve();
			task2.resolve();
		}
		else{
			$("#control").stop().animate({"top":"0px"}, 1000, function(){
				task1.resolve();
			});
			$("#control_open").stop().fadeOut(500, function(){
				task2.resolve();
			});
		}

		document.cookie = "control_open=1";

		$.when(task1, task2).done(function(){
			noscroll(true);
			$("#control_nav_close").stop().fadeIn(300);
			$(".control_nav").addClass("active");
			control.addClass("active");
		}).promise();

	}
}
function control_close(){

	var control = $("#control");

	if(control.hasClass("active")){

		if(glob_cms_device != "mobile" || !$("#comm_widget.active").length)
			noscroll(false);

		if(glob_cms_device == "mobile" && $("#demo").hasClass("active"))
			$("#demo").stop().fadeOut(500);

		$(".control_nav").removeClass("active");
		$("#control_nav_close").hide();

		$("#control").stop().animate({"top":"100%"}, 1000, function(){
			control.removeClass("active");
			$("#control_open").stop().fadeIn(500);
			control.hide();
		});

		document.cookie = "control_open=";
	}
}

function control_bg_transform(){

	var page_bg = $(".control_background:visible");
	var page_bg_img = page_bg.find("img");

	page_bg_img.removeClass("transform");
	coverimg(page_bg);

	if(page_bg_img.hasClass("transform") == false)
		page_bg_img.addClass("transform");

	page_bg_img.removeClass('transform');
	setTimeout(
		function(){page_bg_img.addClass('transform')}
	, 1);
}

function control_open_element(){

    var new_element = $(".control_element.load");

	if(!new_element.hasClass("active")){

		document.cookie = "control_element="+new_element.attr("id");

		var old_element 		= $(".control_element.active");

		if(old_element.length == 0){

			$(".control_element, .control_background").removeClass("active");
			$("#"+getCookie("control_element")).addClass("active");
			$("#"+getCookie("control_element")+"_bg").addClass("active");
		}

			old_element 		= $(".control_element.active");
		var control_elements 	= $(".control_element");

		var old_bg				= $(".control_background.active");
		var new_bg				= $("#"+new_element.attr("id")+"_bg");

		var old_wrap			= old_element.add(old_bg);
		var new_wrap			= new_element.add(new_bg);

		new_bg.addClass("active");
		coverimg(new_bg);

		var task1 = $.Deferred();
		var task2 = $.Deferred();

		var slide_duration = 1000;
		if(glob_cms_device == "mobile")
			slide_duration = 600;

		//next: right
		if( control_elements.index(old_element) < control_elements.index(new_element) ){

			new_wrap.css("left", "100%");
			old_wrap.stop().animate({"left": "-100%"}, slide_duration, function(){ task1.resolve(); });
		}

		//next: left
		else{
			new_wrap.css("left", "-100%");
			old_wrap.stop().animate({"left": "100%"}, slide_duration, function(){ task1.resolve(); });
		}

		new_wrap.stop().animate({"left": "0px"}, slide_duration, function(){ task2.resolve(); });

		$.when(task1, task2).done(function(){

			old_bg.removeClass("active");

			old_element.removeClass("active");
			new_element.addClass("active");

			control_bg_transform();

		}).promise();
	}
}
function control_login_switch(){

	var new_element = $("#control_login_top").find(".control_login_form:not(.active)");

	$("#control_login_top").find(".control_login_form").stop().hide().removeClass("active");
	new_element.stop().fadeIn(500).addClass("active");

	on_resize();
}

//control_demo
function demo_open(){
	$("#control_login_bottom").css("height", window.innerHeight);
	temp_set_img_align();
	if(!$("#control").hasClass("demo")){
		$("#control_login").animate({scrollTop: window.innerHeight}, 1000, "swing", function(){
			$("#control").addClass("demo");
			//$("#control_nav_close").stop().fadeOut(500);
			$("#demo_close").stop().fadeIn(500);
		});
	}
	else{
		//$("#control_nav_close").stop().fadeOut(500);
		$("#demo_close").stop().fadeIn(500);
	}

	$("#demo").addClass("active");
}
function demo_mobile_open(){
	//$("#control_nav_close").hide();
	$("#control_login_top").hide();
	$("#demo_open_mobile").hide();

	$("#demo").stop().fadeIn(1000);
	temp_set_img_align();
	$("#demo_close").stop().fadeIn(500);

	$("#demo").addClass("active");
}
function demo_close(){

	$("#control").removeClass("demo");
	$("#demo").removeClass("active");
	//$("#control_nav_close").stop().fadeIn(500);
	$("#demo_close").stop().fadeOut(500);

	$(".demo_pages.active").removeClass("active");
	$("#demo_intro").addClass("active").removeClass("inactive");

	$(".demo_nav_element").removeClass("inactive");

	var login = $("#control_login_top").find("#control_login_form_login_wrapper.active");
	if(login.length){
		login.hide().removeClass("active");
		$("#control_login_top").find("#control_login_form_register_wrapper").show().addClass("active");
	}

	var task1 = $.Deferred();

	//desktop
	if(glob_cms_device == "desktop"){
		$("#control_login").scrollTop(window.innerHeight).animate({scrollTop:0}, 1000, function(){
			task1.resolve();
		});
	}
	else{
		//$("#control_nav_close").show();
		$("#control_login_top").show();
		$("#demo_open_mobile").show();
		$("#demo").stop().fadeOut(700, function(){
			task1.resolve();
		});
	}

	$.when(task1).done(function(){

		$(".demo_pages").removeClass("inactive");

		$("#control_login_bottom").css("height", "0px");

		if($("#demo_present_member_freecourse").hasClass("register"))
			$("#demo_present_member_freecourse").removeClass("register");

	}).promise();
}

//control_courses
function control_course_mouseenter( course_id ){
	var dashboard 		= $("#control_dashboard");
	var course_element 	= dashboard.find(".control_dashboard_course[data-course_id='"+course_id+"']");
	var perc			= course_element.attr("data-course_progress");

	course_element.find(".control_dashboard_course_progress").stop().animate({"width" : perc+"%"}, 500);
}
function control_course_mouseleave(){

	var dashboard = $("#control_dashboard");
	dashboard.find(".control_dashboard_course_progress").stop().animate({"width":"0%"}, 500);
}


//dropzone
function dropzone_open( area, element, type, thumb_dimensions, callback ){

	var dropzone_id;
	do{
		dropzone_id = "dz_"+Math.floor((Math.random() * 100) + 1);
	}
	while($("#"+dropzone_id).length > 0);

	area.html("");
	element.clone().removeClass("clonable").appendTo(area);
	area.find("*[data-project_type='dropzone_thumb']").remove();

	var dropzone_element = area.find("*[data-project_type='dropzone']");
	dropzone_element.find("*[data-project_type='dropzone_content']").attr("id", dropzone_id);

	if(thumb_dimensions == 0){
		thumb_dimensions[0] = area.width();
		thumb_dimensions[1] = area.height();
	}

	dropzone_array[dropzone_id] = new Dropzone("#"+dropzone_id, {

		url: glob_cms_home_dir+"temp/php_request/upload.php",
		params: {
			type : type
		},
		autoProcessQueue: true,
		dictDefaultMessage: "",
		maxFilesize: 4,
		maxFiles: 1,
		thumbnailWidth: thumb_dimensions[0],
		thumbnailHeight: thumb_dimensions[1],
		thumbnailMethod: "crop",
		previewTemplate: element.find("*[data-project_type='dropzone_thumb']").html(),

		init: function() {

			this.on("dragenter", function(event){
				dropzone_element.addClass("drag");
			});
			this.on("dragleave", function(event){
				dropzone_element.removeClass("drag");
			});
			this.on("maxfilesexceeded", function(file) {
				this.removeAllFiles(true);
				this.addFile(file);
			});
			this.on("thumbnail", function(file, dataUrl) {
				coverimg(dropzone_element.find("*[data-project_type='dropzone_thumb_img']"));
				dropzone_element.find(".dz-progress, *[data-project_type='dropzone_thumb_blk']").show();
				area.addClass("active");
			});

			this.on("success", function (file, response) {

				dropzone_element.removeClass("drag");
				if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
					var this_element = this;
					dropzone_element.find(".dz-progress, *[data-project_type='dropzone_thumb_blk']").stop().fadeOut(300, function(){
						this_element.removeAllFiles();
					});

					if(response == "filetype_error")
						ug_alert( "Error", "Dateityp wird nicht unterstützt.", "Schließen", 0, function(){} );
					else{
						var result = $.parseJSON(response);
						callback(result["id"], result["src"]);
					}
				}
			});
			this.on("error", function (file, error) {
				console.log(error);
			});

		}
	});

}
//--------------------------vimeo--------------------------------
function vimeo_player( wrapper, video_id, thumbnail, callback ){

	var player_id;

	var task1 = $.Deferred();

	if(!wrapper.hasClass("init")){

		player_id = vimeo_players.length;
		wrapper.css("height", wrapper.width()*(9/16)).addClass("init").attr("data-vimeo_id", player_id);

		wrapper.find("video").html("<source src='https://player.vimeo.com/video/"+video_id+"' type='video/x-vimeo'>");

		vimeo_players[player_id] = new MediaElementPlayer(wrapper.find("video")[0], {
			pluginPath: glob_cms_home_dir+"temp/mediaelement_master/build/",
			features: [],
			success: function(mediaElement, originalNode, instance) {

				wrapper.find(".mejs__overlay-play").click(function(){
					wrapper.find(".mejs__layers, .mejs__iframe-overlay").addClass("inactive");
				});

				// do things
				mediaElement.addEventListener("play", function () {
					wrapper.find(".mejs__controls").removeClass("inactive");
				});
				mediaElement.addEventListener("ended", function () {
					wrapper.find(".mejs__controls").addClass("inactive");
				});

				task1.resolve();
			}
		});
	}
	else{
		player_id = wrapper.attr("data-vimeo_id");
		vimeo_players[player_id].pause();
		vimeo_players[player_id].setSrc("https://player.vimeo.com/video/"+video_id);

		wrapper.find(".mejs__time-current").css("transform", "scaleX(0)");
		wrapper.find(".mejs__duration, .mejs__currenttime").text("00:00");
		wrapper.find(".mejs__controls").css("opacity","1");
		wrapper.find(".mejs__poster").addClass("show");
		wrapper.find(".mejs__layers").removeClass("inactive");
		wrapper.find(".mejs__iframe-overlay").addClass("inactive");

		task1.resolve();
	}

	if(thumbnail != undefined){
		var url = glob_cms_home_dir+"temp/media/project/video_thumb/"+glob_cms_device+"/"+thumbnail;
		vimeo_players[player_id].setPoster(url);
	}
	else{
		vimeo_players[player_id].setPoster("");
	}

	$.when(task1).done(function(){
		callback( vimeo_players[player_id] );

	}).promise();
}


//blk_steps
function blk_steps_open( wrapper ){

	if(!wrapper.find(".blk_steps_content_page.active").length)
		wrapper.find(".blk_steps_content_page").eq(0).addClass("active");

	wrapper.find(".blk_steps_bg").stop().fadeIn(500, function(){
		wrapper.find(".blk_steps_content").addClass("active");
		wrapper.find(".blk_steps_close").stop().fadeIn(500);
	});

	noscroll(true);
	$("#control_open").hide();
}
function blk_steps_close( wrapper ){

	wrapper.find(".blk_steps_bg").stop().fadeOut(500);
	wrapper.find(".blk_steps_content").removeClass("active");
	wrapper.find(".blk_steps_close").stop().fadeOut(500);

	noscroll(false);
	if(!$("#control").hasClass("active"))
		$("#control_open").stop().fadeIn(500);
}
function blk_steps_next( wrapper, callback ){

	var this_page = wrapper.find(".blk_steps_content_page.active");

	if(this_page.length){

		var next_page = this_page.next(".blk_steps_content_page");

		if(next_page.length){

			var duration = 2000;
			if(glob_cms_device == "mobile")
				duration = 1000;

			this_page.addClass("noscroll");

			this_page.stop().animate({"left":"-100%"}, duration);
			next_page.stop().animate({"left":"0px"}, duration, function(){
				callback(1);
				next_page.addClass("active");
				this_page.removeClass("active");
			});

			return next_page;
		}
	}
}

function blk_steps_cw_animation( page ){

	$("#comm_widget").addClass("publish");
	blk_steps_cw_animation_cw_pos( page, true );

	page.stop().fadeIn(500);
	page.find(".blk_steps_content_page_button").stop().fadeIn(500);

	$(window).on("resize", function(){
		if($("#comm_widget").hasClass("publish") && blk_steps_page_cw_animation_done)
			blk_steps_cw_animation_cw_pos(page);
	});
	page.scroll(function(){
		if($("#comm_widget").hasClass("publish") && blk_steps_page_cw_animation_done)
			blk_steps_cw_animation_cw_pos(page);
	});
}
function blk_steps_cw_animation_close(){

	$("#comm_widget, #comm_widget_open").stop().fadeOut(800, function(){
		$("#comm_widget").removeClass("publish").removeClass("active");
		document.cookie = "comm_widget_open=0";
		$("#comm_widget").attr("style","");
		$("#comm_widget_open").stop().fadeIn(500).removeClass("active");
	});
}
var blk_steps_page_cw_animation_done = false;
var blk_steps_page_cw_animation_offset = 0;
function blk_steps_cw_animation_cw_pos( page, animate ){

	var content	= page.find(".blk_steps_content_page_content");

	if(blk_steps_page_cw_animation_offset == 0)
		blk_steps_page_cw_animation_offset = content.offset().top;

	var scrollbar_width = page.outerWidth()-page.prop("clientWidth");

	var width	= 450;
	if(window.innerWidth*0.9 < width)
		width = window.innerWidth*0.9;
	var height	= width*1.15;
	if(height < 450)
		height = 450;

	var left 	= ((window.innerWidth-scrollbar_width)*0.5)-(width*0.5);
	var top 	= -page.scrollTop() + blk_steps_page_cw_animation_offset;

	var duration = 1000;
	if(glob_cms_device == "mobile")
		duration = 600;

	if(animate == true){

		$("#comm_widget").animate({"left":left, "top":top, "width":width, "height":height}, duration, function(){
			cw_on_resize();
			blk_steps_page_cw_animation_done = true;
			blk_steps_cw_animation_cw_pos( page, false );
		});
	}
	else{
		$("#comm_widget").css({"left":left, "top":top});
	}

	content.css("height", height);
}

//-----------------------------livechat_fct-----------------------------

var chatroom_edit_confirm = [];
chatroom_edit_confirm["user_remove"] 	= "/user_key/ entfernen";
chatroom_edit_confirm["add_admin"] 		= "/user_key/ zum Admin machen";
chatroom_edit_confirm["remove_admin"] 	= "Admin-Rechte von /user_key/ entfernen";
chatroom_edit_confirm["open"] 			= "Chatroom öffnen";
chatroom_edit_confirm["close"] 			= "Chatroom schließen";
chatroom_edit_confirm["clear"] 			= "Chatverlauf leeren";
chatroom_edit_confirm["remove"] 		= "Chatroom löschen";
chatroom_edit_confirm["leave"] 			= "Chatroom verlassen";
chatroom_edit_confirm["leave_remove"]	= "Chatverlauf löschen";
chatroom_edit_confirm["cancel"] 		= "Abbrechen";


function lc_ready(){


}
function lc_chatbox_ready( chatbox, area, rights_chatbox, notifications, status, user_join, readonly, callback ){

	var chatroom_id = chatbox.attr("data-lc_chatroom");

	var chatroom_info = 0;
	var task_chatroom_info = $.Deferred();

	if(chatroom_id != undefined){
		comm_widget_receive_chatroom_info( chatroom_id, 0, function(result){
			chatroom_info = result;
			chatroom_info = chatroom_info[0];
			task_chatroom_info.resolve();
		});
	}
	else{
		task_chatroom_info.resolve();
	}

	$.when(task_chatroom_info).done(function(){

		//--head
		if(area == 0 || area == "head"){

			//notification bell
			var content_element = chatbox.find("*[data-cw_type='notifications']");
			if(content_element.length){

				if(rights_chatbox != "left" && rights_chatbox != "removed"){
					content_element.hide();
					chatbox.find("*[data-cw_type='notifications'][data-cw_not='"+notifications+"']").show();
				}
				else
					content_element.hide();
			}
			//open_info
			var content_element = chatbox.find("*[data-lc_type='chatroom_title']");
			if(content_element.length){

				if(rights_chatbox == "invited" || rights_chatbox == "removed" || rights_chatbox == "left")
					content_element.removeClass("info_open");
				else
					content_element.addClass("info_open");
			}
		}

		//--body
		if(area == 0 || area == "info"){

			//info
			var content_element = chatbox.find("*[data-lc_type='info'].active");
			if(content_element.length){

				content_element.show();
			}
			else{

				if(rights_chatbox != "invited"){
					//history
					var content_element = chatbox.find("*[data-lc_type='history']");
					if(content_element.length)
						content_element.show();

					//form
					var content_element = chatbox.find("*[data-lc_type='form']");
					if(content_element.length)
						content_element.show();
				}
			}

			var content_element = chatbox.find("*[data-lc_type='info']");
			if(content_element.length){

				if(chatroom_info["type"] == "kurs" && !rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod")){

					chatbox.find(".comm_widget_chatbox_user_info_action_button_text").css("visibility", "hidden");
					chatbox.find(".comm_widget_chatbox_user_info_action_content").remove();
					chatbox.find("*[data-cw_type='add_admin']").remove();
					chatbox.find("*[data-cw_type='remove_admin']").remove();
					chatbox.find("*[data-cw_type='remove_user']").remove();
				}
			}

			//info_user
			chatbox.find("*[data-lc_type='info_user'][data-lc_user_key]").each(function(){

				var this_element 		= $(this);
				var element_user_key 	= this_element.attr("data-lc_user_key");

				this_element.attr("data-cw_user_key", element_user_key);

				if(rights[element_user_key] != undefined)
					var rights_output_info	= rights_output[ rights[element_user_key][0] ];

				if(rights_output_info == undefined){
					rights_output_info = "";

					if(this_element.attr("data-lc_user_rights") == "admin")
						rights_output_info = rights_output["admin"];
				}

				this_element.find("*[data-cw_type='rights_output']").text( rights_output_info );

				if(this_element.find("*[data-lc_type='user_invite']:visible").length)
					this_element.find("*[data-cw_type='rights_output']").hide();

				this_element.find("*[data-cw_type='user_key']").html(element_user_key);
				lc_translate_user_data("user_icon", this_element.find("*[data-cw_type='user_key'][data-lc_transl='user_icon']"), function(){});
			});

			//action_button
			var content_element = chatbox.find(".comm_widget_chatbox_user_info_action");
			if(content_element.length)
				content_element.show();

			//chatroom_settings
			var content_element = chatbox.find("*[data-cw_type='chatroom_settings']");
			if(content_element.length){

				if( !rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod") && rights_chatbox != "admin")
					content_element.hide();
				else{
					content_element.show();

					var settings_element = chatbox.find(".comm_widget_chatbox_settings");

					//load settings

					//icon
					settings_element.find("input[data-cw_type='settings_mod_icon']").val(chatroom_info["icon"]);
					settings_element.find("input[data-cw_type='settings_mod_icon_type']").val(chatroom_info["icon_type"]);

					//title
					chatbox.find("*[data-cw_type='settings_title']").find("input").val( chatbox.find("*[data-lc_type='chatroom_title']").text() );

					//user_join
					var user_join_element = settings_element.find("*[data-cw_type='settings_user_join']");

					user_join_element.find("*[data-cw_val]").removeClass("active");
					user_join_element.find("*[data-cw_val='"+user_join+"']").addClass("active");

					//category
					$("*[data-cw_type='settings_category']").find("option[value='"+chatroom_info["category_id"]+"']").prop('selected', true);
				}
			}

			//add_user
			var content_element = chatbox.find("*[data-cw_type='add_user']");
			if(content_element.length){

				if(!rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod"))
					content_element.hide();
				else
					content_element.show();
			}

			//invite_user
			var content_element = chatbox.find("*[data-cw_type='invite_user']");
			if(content_element.length){

				if(!rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod") && rights_chatbox != "admin")
					content_element.hide();
				else
					content_element.show();
			}

			//chatroom_status
			var content_element = chatbox.find("*[data-cw_type='open'], *[data-cw_type='close']");
			if(content_element.length){

				if(!rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod") && rights_chatbox != "admin")
					content_element.hide();
				else{
					content_element.show();
					chatbox.find("*[data-cw_type='"+status+"']").hide();
				}
			}

			//clear chatroom
			var content_element = chatbox.find("*[data-cw_type='clear']");
			if(content_element.length){

				if(!rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod"))
					content_element.hide();
				else
					content_element.show();
			}

			//remove_chatroom
			var content_element = chatbox.find("*[data-cw_type='remove']");
			if(content_element.length){

				if(!rights_check(lc_user_key, "root"))
					content_element.hide();
				else
					content_element.show();
			}

			//leave_remove
			var content_element = chatbox.find("*[data-cw_type='leave_remove']");
			if(content_element.length){

				if(rights_chatbox != "removed" && rights_chatbox != "left")
					content_element.hide();
				else
					content_element.show();
			}
		}

		//-----private
		if(chatbox.hasClass("comm_widget_chatbox_private") && chatbox.attr("data-lc_user_key") != undefined){

			var user_key = chatbox.attr("data-lc_user_key");

			//cw_link > head
			if(area == 0 || area == "head"){
				$("*[data-lc_type='chatroom_title']").attr("data-cw_user_key", user_key);
			}


			//block
			if(area == 0 || area == "form"){

				cw_user_contact_rights_prepare( user_key, 0, function(){
					cw_user_contact_rights_update( user_key, 0 );
				});
			}
		}

		//-----supporter
		if(chatbox.hasClass("comm_widget_chatbox_support_plattform") && rights_check(lc_user_key, "supporter")){

			if(area == 0 || area == "info"){
				//add_user
				var content_element = chatbox.find("*[data-cw_type='add_user']");
				if(content_element.length){
					content_element.show();
				}

				//invite_user
				var content_element = chatbox.find("*[data-cw_type='invite_user']");
				if(content_element.length){
					content_element.show();
				}
			}

			var support_user_key;

			support_user_key = chatroom_info["user_key_host"];

			if(area == 0 || area == "head"){

				var content_element = chatbox.find("*[data-cw_type='support_user_icon']");
				if(content_element.length){

					content_element.attr({"data-lc_transl":"user_icon"}).text(support_user_key);
				}

				var content_element = chatbox.find("*[data-cw_type='support_user_name']");
				if(content_element.length){

					content_element.attr({"data-lc_transl":"user_name"}).attr("data-cw_user_key", support_user_key).text(support_user_key);
				}

				var content_element = chatbox.find("*[data-cw_type='support_user_status']");
				if(content_element.length){

					lc_user_status_receive( support_user_key, function( result ){
						content_element.attr({"data-lc_user_key":support_user_key, "data-lc_type":"user_status"});
						content_element.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
						content_element.find("*[data-lc_type='user_status_"+result[support_user_key]+"']").show();
					});
				}

				lc_transl(chatbox, function(){});
			}
			if(area == 0 || area == "info"){

				var user_wrapper		= chatbox.find("*[data-lc_type='info_user_wrapper']");
				var first_user_element 	= user_wrapper.find("*[data-lc_type='info_user']:not(.clonable)").eq(0);

				if(first_user_element.attr("data-lc_user_key") != support_user_key){

					first_user_element.before( user_wrapper.find("*[data-lc_type='info_user'][data-lc_user_key='"+support_user_key+"']:not(.clonable)") );
				}
			}
		}


		//title_attr
		chatbox.find("*[data-cw_title='content']").each(function(){
			$(this).attr("title", $(this).text());
		});

		cw_on_resize();
		callback(1);

	}).promise();
}
function lc_notification_update( chatroom_id ){
	comm_widget_notifications_update( chatroom_id );
}

function lc_new_msg( chatroom_id, notifications, content, user_src_key, timestamp ){

	if(notifications == "1"){

		var chatbox = $(".comm_widget_chatbox[data-lc_chatroom='"+chatroom_id+"']");

		if(chatbox.length == 0 || !$("#comm_widget").hasClass("active")){

			lc_notification_update( chatroom_id );

			if(chatbox.length > 0 && !$("#comm_widget").hasClass("active")){

				chatbox.find("*[data-lc_type='history_msg_content_element'][data-lc_timestamp='"+timestamp+"'][data-lc_user_src_key='"+user_src_key+"']").addClass("lc_msg_not");
			}

			if((!$("#comm_widget").hasClass("active") || documentFocus == false) && login_reload == false){
				//push
				comm_widget_notifications_push( chatroom_id, user_src_key, content, "msg" );
			}
		}
		else{
			//chatbox geöffnet
			lc_notifications_reset( chatroom_id, function(){});
		}
	}

	comm_widget_chatroom_list(0,0,chatroom_id);
}
function lc_chatroom_report( chatroom_id, report, user_key, user_key_action, timestamp ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	if(report == "invite_user" && user_key_action == lc_user_key){
		if(chatbox.length == 0 || !$("#comm_widget").hasClass("active")){
			lc_notification_update( chatroom_id );
		}
		else
			lc_notifications_reset( chatroom_id, function(){} );
	}

	//refresh
	if(	(report == "invite_user" ||
		report == "user_join" ||
		report == "user_leave" ||
		report == "user_leave_remove" ||
		report == "invite_user_cancel") && user_key_action == lc_user_key){

			comm_widget_chatroom_list(0,0,chatroom_id);
		}

	//add/remove
	if( report == "create" ||
		report == "remove" ||
		((report == "add_user" ||
		report == "remove_user" ||
		report == "invite_user" ||
		report == "invite_user_cancel" ||
		report == "user_join" ||
		report == "user_leave") && user_key_action == lc_user_key) ||
		(report == "user_invite_reject" && user_key == lc_user_key )){

			comm_widget_chatroom_list( $(".comm_widget_nav_elements.active").attr("data-content") ,0,0);
		}

	//user_invite_reject
	if(report == "user_invite_reject" && user_key == lc_user_key){

		comm_widget_chatbox_close(chatbox);
	}

	//user_leave_remove
	if(report == "user_leave_remove" || report == "remove"){
		$("#comm_widget_content_chatrooms_chatbox").hide();
		$(".comm_widget_content_elements.active").show();

		var content_element = $(".comm_widget_content_elements.active").find("#comm_widget_content_chatrooms_menu");
		if(content_element.length)
			content_element.show();
	}

	//remove chatroom
	if(report == "remove"){

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "chatroom_remove",
			chatroom_id : chatroom_id
		})
		.done(function( data ) {
			if(data != "")
				ug_alert( "Error", data, "Schließen", 0, function(){} );
		});
	}

	//notifications
	if(	report == "remove" ||
		(report == "remove_user" && user_key_action == lc_user_key)){

			lc_notifications_reset( chatroom_id, function(){} );
		}

	//push
	if(user_key_action == lc_user_key){

		comm_widget_chatroom_type_receive(chatroom_id, function(result){

			var chatroom_type = result[chatroom_id];

			var content = "";

			if(report == "invite_user")
				content = "Du wurdest eingeladen.";
			if(report == "invite_user_cancel")
				content = "Einladung zurückgezogen.";
			if(report == "add_user" && chatroom_type != "private" && chatroom_type != "support_kursersteller")
				content = "Du wurdest hinzugefügt.";
			if(report == "remove_user")
				content = "Du wurdest entfernt.";
			if(report == "user_invite_reject")
				content = "Deine Einladung wurde abgelehnt.";

			if(content != "")
				comm_widget_notifications_push( chatroom_id, user_key, content, "report" );
		});
	}
}
function lc_chatroom_add_element( chatroom_id ){


}
function lc_user_status( status, user_key ){

	if($("*[data-cw_type='mod_status']:visible").length)
		comm_widget_support_plattform_status();

}
function lc_user_activity( activity, chatroom_id, user_key ){

}
function lc_translate_user_data( type, element, callback ){

	var private_user = element.closest("*[data-lc_type='chatbox']").attr("data-lc_user_key");

	if(element.attr("data-cw_link") == "user_profile" && private_user != undefined)
		element.attr("data-cw_user_key", private_user);

	if(type == "user_key" || type == "user_name"){

		var closest_lc_type = element.closest("*[data-lc_type]");
		var lc_type = closest_lc_type.attr("data-lc_type");

		user_name_receive( element.text(), function(result){

			var user_key = element.text();

			if(result != ""){

				if(Array.isArray(result))
					element.html(result[0]+" "+result[1]);
				else{
					if(result == "removed")
						result = "Nutzer";

					element.html(result);
				}

				element.attr("data-cw_user_key", user_key);
			}
			else if(user_key == lc_user_key)
				element.text("Du").attr("data-cw_user_key", user_key);
			else
				element.text("Nutzer").attr("data-cw_user_key", user_key);

			callback(1);
		});
	}
	if(type == "user_username"){

		user_username_receive( element.text(), function(result){
			var user_key = element.text();

			if(result == "removed")
				result = "Nutzer";

			element.html(result).attr("data-cw_user_key", user_key);

			callback(1);
		});
	}
	if(type == "user_icon"){
		element.data("data-cw_user_key", element.text());

		user_icon_receive( element.text(), function(result){

			if(result["type"] == "img"){
				element.attr("data-cw_filename", result["filename"]);
				element.html( "<img src='"+glob_cms_home_dir+"temp/media/project/cw_icon/"+result["filename"]+"' alt='Chatroom-Icon' />" );
			}
			else if(result["type"] == "html"){
				element.html( result["icon"] );
			}
			else{
				element.html( '<i class="fa fa-user-o" aria-hidden="true"></i>' );
			}

			callback(1);
		});
	}
	if(type == "chatroom_icon"){

		if(element.text() != "0"){

			element.attr("data-cw_filename", "");

			comm_widget_chatroom_icon_receive( element.text(), function(chatroom_icon){

				if(chatroom_icon["type"] == "img"){
					element.attr("data-cw_filename", chatroom_icon["src"]);
					element.html( "<img src='"+glob_cms_home_dir+"temp/media/project/cw_icon/"+chatroom_icon["src"]+"' alt='Chatroom-Icon' />" );
				}
				else if(chatroom_icon["type"] == "html"){
					element.html( chatroom_icon["icon"] );
				}
				else{
					element.html( '<i class="fa fa-users" aria-hidden="true"></i>' );
				}

				callback(1);
			});
		}
		else{
			element.attr("data-cw_filename", "logo.png");
			element.html( "<img src='"+glob_cms_home_dir+"temp/media/basic/logo.png' alt='Chatroom-Icon' />" );
			callback(1);
		}
	}
	if(type == "timestamp"){

		var timestamp = element.text();
		var jsDate = new Date(timestamp*1000);
		var nowDate = new Date($.now());

		var days 	= ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
		var months 	= ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

		var time_string = "";
		var hhmm = "";
		hhmm += jsDate.getHours()+":";
		var minutes = jsDate.getMinutes();
		if(minutes < 10)
			hhmm += "0";
		hhmm += jsDate.getMinutes();

		var chatbox = element.closest("*[data-lc_type='chatbox']");

		//gleicher Tag
		if( timestamp > ($.now()/1000)- 86400 && jsDate.getDay() == nowDate.getDay() ){

			time_string = hhmm;
		}
		//gestern
		else if( timestamp > ($.now()/1000)- 172800 && jsDate.getDay() == nowDate.getDay()-1 ){

			if(chatbox.length){

				time_string = "Gestern, "+hhmm;
			}
			else{
				time_string = "Gestern";
			}
		}
		//bis 4d
		else if( timestamp > ($.now()/1000)- 432000 && jsDate.getDay() >= nowDate.getDay()-4 ){

			if(chatbox.length){

				time_string = days[jsDate.getDay()]+", "+hhmm;
			}
			else{
				time_string = days[jsDate.getDay()];
			}
		}
		//älter als 4d
		else if( jsDate.getFullYear() == nowDate.getFullYear() ){

			if(chatbox.length){

				time_string = jsDate.getDate()+". "+months[jsDate.getMonth()]+", "+hhmm;
			}
			else{
				time_string = jsDate.getDate()+". "+months[jsDate.getMonth()];
			}
		}
		//letztes Jahr
		else{

			if(chatbox.length){

				time_string = jsDate.getDate()+"."+jsDate.getMonth()+"."+jsDate.getFullYear()+", "+hhmm;
			}
			else{
					time_string = jsDate.getDate()+"."+jsDate.getMonth()+"."+jsDate.getFullYear();
			}
		}

		element.text(time_string);

		callback(1);
	}
	if(type == "filesize"){

		var size_unit 	= "KB";
		var size 		= parseFloat(element.text())/1000;

		if(size > 100){
			size 		= size/1000;
			size_unit 	= "MB";
		}
		if(size > 100){
			size 		= size/1000;
			size_unit 	= "GB";
		}

		size = Math.round10(size, -1);

		var size_output = size+" "+size_unit;
		element.text(size_output);

		callback(1);
	}
}

//----------------comm_widget---------------------------

//block_user
function cw_user_block( user_key, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 	: "user_block",
		user_key: user_key
	})
	.done(function( data ) {
		if(data == ""){
			callback(1);
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

//user_contact (buttons/pr_chatbox/etc)
function cw_user_contact_rights_receive( user_key, type, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 	: "user_contact_rights_receive",
		type	: type,
		user_key: user_key
	})
	.done(function( data ) {

		if(data != ""){

			var result = $.parseJSON(data);

			var user_key = Object.keys( result );

			for(var x=0; x<user_key.length; x++){

				var type = Object.keys( result[user_key[x]] );

				for(var y=0; y<type.length; y++){

					if(cw_contact[user_key[x]] == undefined)
						cw_contact[user_key[x]] = [];
					if(cw_contact[user_key[x]][type[y]] == undefined)
						cw_contact[user_key[x]][type[y]] = [];

					if(result[user_key[x]][type[y]]["bool"] == "true")
						cw_contact[user_key[x]][type[y]]["bool"] = true;
					else{
						cw_contact[user_key[x]][type[y]]["bool"] = false;
					}

					cw_contact[user_key[x]][type[y]]["setting"] = result[user_key[x]][type[y]]["setting"];
				}
			}

			callback(1);
		}
	});
}
function cw_user_contact_rights_prepare( user_key, type, callback ){

	var user_key_request = [];

	for(var x=0; x<user_key.length; x++){

		if(type != 0){
			if(cw_contact[user_key[x]] == undefined || cw_contact[user_key[x]][type] == undefined ){
				user_key_request[user_key_request.length] = user_key[x];
			}
		}
		else{
			if(cw_contact[user_key[x]] == undefined || cw_contact[user_key[x]]["private"] == undefined || cw_contact[user_key[x]]["support"] == undefined ){
				user_key_request[user_key_request.length] = user_key[x];
			}
		}
	}

	if(user_key_request.length){
		cw_user_contact_rights_receive( user_key, type, function(){
			callback(1);
		});
	}
	else{
		callback(1);
	}
}
function cw_user_contact_rights_check( user_key, type ){

	if(type == 0)
		type = "private";

	if(cw_contact[user_key] == undefined || cw_contact[user_key][type] == undefined ){
		ug_alert( "Error", "user_contact_rights not prepared", "Schließen", 0, function(){} );
	}
	else{
		return ( cw_contact[user_key][type] );
	}
}

function cw_user_contact_rights_update( user_key, type ){

	if( !Array.isArray( user_key ) ) {
		var user_key_cache = user_key;
		user_key = [];
		user_key[0] = user_key_cache;
	}


	if( type == 0 ){
		type = ["private", "support"];
	}
	else if( !Array.isArray( type ) ){
		var type_cache = type;
		type = [];
		type[0] = type_cache;
	}

	//update

	for(var x=0; x<user_key.length; x++){

		for(var y=0; y<type.length; y++){

			var contact_private = $("*[data-cw_type='user_contact_private'][data-cw_user_key='"+user_key[x]+"']");
			var contact_support = $("*[data-cw_type='user_contact_support'][data-cw_user_key='"+user_key[x]+"']");

			var chatbox_private = $("*[data-lc_type='chatbox'][data-lc_chatroom][data-lc_user_key]");
			var chatbox_private_input = chatbox_private.find("*[data-lc_type='form_input']");


			var blocked_button	= $("*[data-cw_type='user_block'][data-cw_user_key='"+user_key[x]+"']");

			if(blocked_button.length){
				var blocked_button0 = blocked_button.find("*[data-cw_type='user_block_0']");
				var blocked_button1 = blocked_button.find("*[data-cw_type='user_block_1']");
				var blocked_button2 = blocked_button.find("*[data-cw_type='user_block_2']");

				blocked_button0.show();
				blocked_button1.hide();
				blocked_button2.hide();
			}

			if(user_key[x] != lc_user_key){

				if(cw_contact[user_key[x]] != undefined){ //if not removed

					switch(cw_contact[user_key[x]][type[y]]["setting"]){

						case "all":
							if(type[y] == "private")
								contact_private.show();
							if(type[y] == "support")
								contact_support.show();

							if(chatbox_private.length){
								chatbox_private_input	.attr("placeholder", chatbox_private_input.attr("data-lc_placeholder_open"))
														.prop('readonly', false);
							}
						break;

						case "0":
							if(type[y] == "private")
								contact_private.hide();
							if(type[y] == "support")
								contact_support.hide();
						break;

						//case: member/creator/etc

						case "blocked_0":
							//you blocked sb
							contact_private.hide().addClass("blocked_0");
							contact_support.hide().addClass("blocked_0");

							if(chatbox_private.length){
								chatbox_private_input	.attr("placeholder", chatbox_private_input.attr("data-cw_placeholder_blocked_0"))
														.prop('readonly', true);
							}

							if(blocked_button.length){
								blocked_button0.hide();
								blocked_button1.show();
							}
						break;

						case "blocked_1":
							//you were blocked by sb
							contact_private.hide().addClass("blocked_1");
							contact_support.hide().addClass("blocked_1");

							if(chatbox_private.length){
								chatbox_private_input	.attr("placeholder", chatbox_private_input.attr("data-cw_placeholder_blocked_1"))
														.prop('readonly', true);
							}

							if(blocked_button.length){
								blocked_button0.hide();
								blocked_button2.show();
							}
						break;
					}
				}
			}
		}
	}
}

//cw_on_resize
function cw_on_resize(){

	rows_width();

	var comm_widget = $("#comm_widget");
	var comm_widget_content_height = comm_widget.height();
	if(glob_cms_device == "mobile")
		comm_widget_content_height = comm_widget_content_height - $("#comm_widget_nav").height();
	$("#comm_widget_content").css("height", comm_widget_content_height);

	var chatbox = $(".comm_widget_chatbox:visible");
	if(chatbox.length){

		$(".comm_widget_content_chatbox_wrapper").css("height", comm_widget_content_height);

		var head_height = chatbox.find("*[data-lc_type='head']").outerHeight(true);
		var form_height = chatbox.find("*[data-lc_type='form']").outerHeight(true);

		var history_height = chatbox.height()-(head_height+form_height);
		chatbox.find("*[data-lc_type='history']").css("height", history_height+"px");

		var info_height = chatbox.height()-head_height;
		chatbox.find("*[data-lc_type='info']").css("height", info_height +"px");

		//private
		var private_empty = chatbox.find(".comm_widget_chatbox_private_empty:visible");
		if(private_empty.length){
			private_empty.css( "padding", "0px" );
			private_empty_height = private_empty.height();
			private_empty.css( "padding", (chatbox.height()-form_height-private_empty_height)/2 +"px 0px" );
		}

		//info_user_wrapper
		if(chatbox.find(".comm_widget_chatbox_user_info_action").length == 0)
			chatbox.find("*[data-lc_type='info_user_wrapper']").css("height", "100%");
	}
}

//open/close
function comm_widget_show(fast, chatroom_id){

	if(fast == 1){
		$("#comm_widget").stop().show();
		$("#comm_widget_open").hide();
	}
	else{
		if(!$("#comm_widget").hasClass("small"))
			$("#comm_widget_blk").stop().fadeIn(300);

		if(glob_cms_device == "mobile"){
			$("#comm_widget").stop().toggle({	effect: "scale",
												origin: [ "bottom", "right" ],
												duration: 500,
												complete: function(){
													cw_on_resize();
													$("#comm_widget_open").hide();
													noscroll(true);
												}
											}).show();
		}
		else{
			$("#comm_widget").stop().fadeIn(500, function(){
				cw_on_resize();
				$("#comm_widget_open").hide();
			});
		}
	}

	cw_on_resize();

	$("#comm_widget").addClass("active");

	if(!$(".comm_widget_nav_elements.active").length){

		if(login_bool == 1)
			comm_widget_menu_open( "chatrooms" );
		else{

			if(!$("#comm_widget_content_support_chatbox_area").find(".comm_widget_chatbox_support_plattform").length){

				//support for unregistred users
				$(".comm_widget_nav_elements[data-content='support']").addClass("active");

				comm_widget_receive_chatroom_id( "support_plattform", 0, 1, 0, 0, 0, 0, function( result ){

					if(result == ""){
						comm_widget_support_plattform_chatbox_init();
						$(".comm_widget_chatbox_private_cancel").hide();
					}
					else{
						comm_widget_chatbox_init( result[0], $("#comm_widget_content_support_chatbox"), $("#comm_widget_content_support_chatbox_area"), $("#comm_widget_chatbox_support_clonable"), 20, function(){});
					}
					comm_widget_support_plattform_status();

					$("#comm_widget_content_support").css("visibility", "hidden").show();
					cw_on_resize();
					$("#comm_widget_content_support").hide().css("visibility", "visible").fadeIn(500);
				});
			}
		}
	}

	chatbox = $("#comm_widget *[data-lc_type='chatbox'][data-lc_chatroom]");

	if(chatbox.length){

		lc_notifications_reset( chatbox.attr("data-lc_chatroom"), function(){} );
		lc_notification_update();
	}

	//load_chatroom
	if(chatroom_id != undefined && chatroom_id != 0){

		if(chatroom_id == "help"){
			if(!rights_check(lc_user_key, "supporter")){
				comm_widget_menu_open( "support" );

				comm_widget_receive_chatroom_id( "support_plattform", 0, 1, 0, 0, 0, 0, function( result ){

					if(result == ""){
						comm_widget_support_plattform_chatbox_init();
						$(".comm_widget_chatbox_private_cancel").hide();
					}
					else{
						comm_widget_chatbox_init( result[0], $("#comm_widget_content_support_chatbox"), $("#comm_widget_content_support_chatbox_area"), $("#comm_widget_chatbox_support_clonable"), 20, function(){});
					}
					comm_widget_support_plattform_status();

					$("#comm_widget_content_support").css("visibility", "hidden").show();
					cw_on_resize();
					$("#comm_widget_content_support").hide().css("visibility", "visible").fadeIn(500);
				});
			}
			else
				ug_alert( "WOZU BRAUCHST DU HILFE?", data, "Du bist selbst Supporter. :b", 0, function(){} );
		}
		else{

			comm_widget_receive_chatroom_info( chatroom_id, 0, function(result){

				var type = result[0]["type"];

				if(type == "kurs" || type == "admin_create" || type == "user_create"){

					comm_widget_menu_open( "chatrooms" );

					$("#comm_widget_content_chatrooms_menu").hide();
					comm_widget_chatbox_init( chatroom_id, $("#comm_widget_content_chatrooms_chatbox"), $("#comm_widget_content_chatrooms_chatbox_area"), $("#comm_widget_chatbox_clonable"), 20, function(){});
				}
				if(type == "private"){

					comm_widget_menu_open( "nachrichten" );

					$("#comm_widget_content_nachrichten_menu").hide();
					comm_widget_chatbox_init( chatroom_id, $("#comm_widget_content_nachrichten_chatbox"), $("#comm_widget_content_nachrichten_chatbox_area"), $("#comm_widget_chatbox_private_clonable"), 20, function(){});
				}
				if(type == "support_kursersteller" || type == "support_plattform"){

					comm_widget_menu_open( "support" );

					$("#comm_widget_content_support_menu").hide();

					var chatbox_clonable;

					if(type == "support_kursersteller")
						chatbox_clonable = $("#comm_widget_chatbox_private_clonable");
					if(type == "support_plattform")
						chatbox_clonable = $("#comm_widget_chatbox_support_clonable");

					comm_widget_chatbox_init( chatroom_id, $("#comm_widget_content_support_chatbox"), $("#comm_widget_content_support_chatbox_area"), chatbox_clonable, 20, function(){});
				}
			});
		}
	}

	document.cookie = "comm_widget_open=1";
}
function comm_widget_hide(){

	if(!$("#comm_widget").hasClass("small"))
		$("#comm_widget_blk").stop().fadeOut(300);

	if(glob_cms_device == "mobile"){
		if(!$("#control.active").length)
			noscroll(false);
		$("#comm_widget").stop().toggle({	effect: "scale",
											origin: [ "bottom", "right" ],
											duration: 500
										}).fadeOut(500).removeClass("active");
	}
	else{
		$("#comm_widget").stop().fadeOut(500).removeClass("active");
	}

	$("#comm_widget_open").stop().fadeIn(300);

	document.cookie = "comm_widget_open=0";
}

//notifications
function comm_widget_notifications_update( chatroom_id ){

	//global
	var global_not = 0;

	var key;
	for(key in lc_notcounter){
		global_not += parseInt(lc_getNotSum(key));
	}

	if(global_not > 99)
		global_not = "99+";

	var global_not_counter = $("*[data-cw_type='notcounter_global']");

	global_not_counter.text(global_not);

	if(global_not == 0 && global_not_counter.hasClass("active"))
		global_not_counter.stop().fadeOut(300).removeClass("active");

	else if(global_not != 0 && !global_not_counter.hasClass("active"))
		global_not_counter.stop().fadeIn(300).addClass("active");

	if(global_not != 0)
        document.title = "("+global_not+") "+documentTitle;
	else
		document.title = documentTitle;

	//check_categories
	var chatroom_not = [];
	var x=0;

	for(key in lc_notcounter){

		if( parseInt(lc_getNotSum(key)) != 0 ){

			chatroom_not[x] = key;
			x++;
		}
	}

	comm_widget_chatroom_type_receive( chatroom_not, function(result){

		$(".comm_widget_nav_elements").removeClass("notification");

		if(result != ""){

			var key;

			for(key in result){

				var result_cache = result[key];

				if(result_cache == "user_create" || result_cache == "admin_create" || result_cache == "kurs")
					$(".comm_widget_nav_elements[data-content='chatrooms']").addClass("notification");

				if(result_cache == "private")
					$(".comm_widget_nav_elements[data-content='nachrichten']").addClass("notification");

				if(result_cache == "support_kursersteller" || result_cache == "support_plattform")
					$(".comm_widget_nav_elements[data-content='support']").addClass("notification");
			}
		}
	});


	//list_elements
	if( [chatroom_id] == 0){
		$("*[data-cw_notcounter='"+chatroom_id+"']").hide();
	}
	else{
		$("*[data-cw_notcounter='"+chatroom_id+"']").show().text( lc_getNotSum(chatroom_id) );
	}
}
function comm_widget_notifications_push( chatroom_id, user_key, content, type ){

	//Pushbenachrichtigung

	var push_element = $("#comm_widget_push");

	if(getCookie("comm_widget_push") != "0" && !$("#comm_widget_push_inner[data-cw_welcome='1']").length){

		var task1 = $.Deferred();
		var timeout = 5000;


		if(content.length > 60)
			content = content.substr(0,150)+"...";
		$("#comm_widget_push_content").html(content);

		var title_output1 = "";
		var title_output2 = "";

		if(chatroom_id == "unigrow"){

			$("#comm_widget_push_inner").attr("data-cw_chatroom", "0").attr("data-cw_welcome", "1");

			title_output1 = "Unigrow";
			title_output2 = "";

			task1.resolve();
		}
		else{
			lc_chatroom_title_receive( chatroom_id, function(title){

				user_name_receive(user_key, function(user_name){

					if(push_element.hasClass("active"))
						push_element.stop().hide();

					$("#comm_widget_push_inner").attr("data-cw_chatroom", chatroom_id);

					comm_widget_chatroom_type_receive(chatroom_id, function(result){

						var chatroom_type = result[chatroom_id];

						//title
						var user = user_name[0]+" "+user_name[1];

						title_output1 = user;

						if(title != 0)
							title_output2 = title;

						if(chatroom_type == "private"){
							title_output2 = "";
						}
						if(chatroom_type == "support_kursersteller"){
							title_output2 = "Kurssupport";
						}
						if(chatroom_type == "support_plattform"){

							if(user_name[0] == undefined){
								title_output1 = "Nutzer";
								title_output2 = "Unigrow-Support";
							}
							else{
								title_output2 = "Unigrow-Support";
							}
						}

						//input

						$("#comm_widget_push_input").find("textarea").val("");

						if(glob_cms_device != "mobile"){
							if(type == "report")
								$("#comm_widget_push_input").hide();
							else
								$("#comm_widget_push_input").show();
						}

                        //icon

                        if(chatroom_type == "private" || chatroom_type == "support_kursersteller"){
                            $("#comm_widget_push_img_standard").html(user_key);
                            lc_translate_user_data( "user_icon", $("#comm_widget_push_img_standard"), function(){
                                task1.resolve();
                            });
                        }
                        else if(chatroom_type == "support_plattform"){

                            if(!rights_check(lc_user_key, "supporter")){
                                $("#comm_widget_push_img_standard").html( $("#comm_widget_plattform_support_img").html() );
                                task1.resolve();
                            }
                            else{
                                comm_widget_receive_chatroom_info( chatroom_id, 0, function(chatroom_info){

                                    $("#comm_widget_push_img_standard").html(chatroom_info[0]["user_key_host"]);
                                    lc_translate_user_data( "user_icon", $("#comm_widget_push_img_standard"), function(){
                                        task1.resolve();
                                    });
                                });
                            }
                        }
                        else{
                            $("#comm_widget_push_img_standard").html(chatroom_id);
                            lc_translate_user_data( "chatroom_icon", $("#comm_widget_push_img_standard"), function(){
                                task1.resolve();
                            });
                        }
					});
				});
			});
		}

		//show
		$.when(task1).done(function(){

			if (!documentFocus) {
                Push.create(title_output1, {
                    serviceWorker: '//serviceWorker.min.js',
                    body: content,
                    icon: glob_cms_home_dir + 'temp/media/logo_push.png',
                    timeout: 4000,
                    onClick: function () {
                        window.focus();
                        this.close();
                    }
                });
            }
            playSound({
                mp3: glob_cms_home_dir+'temp/media/sounds/notification.mp3',
                ogg: glob_cms_home_dir+'temp/media/sounds/notification.ogg'
            });

			$("#comm_widget_push_title1").html(title_output1);
			$("#comm_widget_push_title2").html(title_output2);

			if(chatroom_id == "unigrow")
				$("#comm_widget_push").addClass("unigrow_push");
			else
				$("#comm_widget_push").removeClass("unigrow_push");

			if(push_element.hasClass("active"))
				push_element.stop().fadeIn(300);
			else
				comm_widget_push_show();

			$.doTimeout("comm_widget_push_inner", timeout+500, function(){
				comm_widget_push_hide();
                $("#comm_widget_push_inner").attr("data-cw_welcome", "");
			});
		}).promise();
    }
}
function comm_widget_push_show(){

	var push_element = $("#comm_widget_push");

	push_element.addClass("active");
	push_element.stop().animate({"top": window.innerHeight-push_element.outerHeight(true)+"px"}, 500);
	$("#comm_widget_open").stop().fadeOut(500);
}
function comm_widget_push_hide(){

	var push_element = $("#comm_widget_push");

	push_element.stop().animate({"top": "100%"}, 500, function(){
		$(this).removeClass("active");
		login_reload = false;
	});
	$("#comm_widget_open").stop().fadeIn(500);
}
function comm_widget_push_msg(){

	var chatroom_id = $("#comm_widget_push_inner").attr("data-cw_chatroom");
	var input_val = $("#comm_widget_push_input").find("textarea").val();

	if(input_val != ""){
		lc_send_msg( chatroom_id, input_val );
		comm_widget_push_hide();
	}
}

//----db_functions
function comm_widget_chatroom_create(chatroom_id, category_id, type, icon, icon_type, callback){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 			: "chatroom_create",
		lc_chatroom_id 	: chatroom_id,
		category_id 	: category_id,
		type 			: type,
		icon 			: icon,
		icon_type 		: icon_type
	})
	.done(function( data ) {

		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else{
			callback(1);
		}
	});
}


//----receive_functions

//receive chatroom_id
function comm_widget_receive_chatroom_id( type, lc_status, bool_user_key, lc_user_join, category_id, kurs_id, chatroom_id, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 		: "chatroom_id_receive",
		status		: lc_status,
		user_join 	: lc_user_join,
		category_id : category_id,
		type 		: type,
		kurs_id		: kurs_id
	})
	.done(function( data ) {

		if(data != "")
			var result = $.parseJSON(data);

		if(chatroom_id != 0 && chatroom_id.length>0 && Array.isArray(chatroom_id)){
			if(data != ""){

				for(var x=0; x<result.length; x++){

					var remove = true;

					for(var y=0; y<chatroom_id.length; y++){

						if(result[x] == chatroom_id[y])
							remove = false;
					}

					if(remove == true){
						if(!Array.isArray(result))
								result = "";
						else{
							result.splice(x,1);
							x--;
						}
					}
				}
			}
		}
		if(bool_user_key == 1){

			if(data != ""){

				lc_chatroom_id_receive(function(result2){

					var remove;

					for(var x=0; x<result.length; x++){

						remove = true;

						for(var y=0; y<result2.length; y++){

							if(result[x] == result2[y])
								remove = false;
						}

						if(remove == true){
							if(!Array.isArray(result))
								result = "";
							else{
								result.splice(x,1);
								x--;
							}
						}
					}

					callback(result);
				});
			}
			else
				callback("");
		}
		else{
			if(data != "")
				callback( result );
			else
				callback("");
		}
	});

}
function comm_widget_receive_chatroom_info( chatroom_id, private_user, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task : "chatroom_info_receive",
		chatroom_id : chatroom_id,
		private_user: private_user
	})
	.done(function( data ){
		if(data != ""){
			var result = $.parseJSON(data);
			callback(result);
		}
	});
}
function comm_widget_chatroom_icon_receive( chatroom_id, callback ){

	if(cw_chatroom_icon[chatroom_id] != undefined && cw_chatroom_icon[chatroom_id] != 0)
		callback(cw_chatroom_icon[chatroom_id]);
	else{

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "chatroom_icon_receive",
			chatroom_id : chatroom_id
		})
		.done(function( data ) {
			if(data != ""){
				var result = $.parseJSON(data);

				cw_chatroom_icon[chatroom_id] = result;
				callback(result);
			}
			else
				callback("");
		});
	}
}
function comm_widget_chatroom_type_receive( chatroom_id, callback ){

	var result = [];
	var post_val = [];
	var post_val_counter = 0;

	if(Array.isArray(chatroom_id)){

		for(var x=0; x<chatroom_id.length; x++){

			if(cw_chatroom_type[chatroom_id[x]] != undefined)
				result[chatroom_id[x]] = cw_chatroom_type[chatroom_id[x]];
			else{
				post_val[post_val_counter] = chatroom_id[x];
				post_val_counter++;
			}
		}
	}
	else{
		if(cw_chatroom_type[chatroom_id] != undefined){
			result[chatroom_id] = cw_chatroom_type[chatroom_id];
		}
		else
			post_val[0] = chatroom_id;
	}

	if(post_val.length){

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "chatroom_type_receive",
			chatroom_id : chatroom_id
		})
		.done(function(data){

			if(data != ""){
				var post_result = $.parseJSON(data);

				for(var key in post_result){
					result[key] = post_result[key];
				}
				callback(result);
			}
			else{
				if(!result.length)
					callback("");
				else
					callback(result);
			}
		});
	}
	else{
		if(!result.length)
			callback("");
		else
			callback(result);
	}
}

//receive user_profile
function user_profile_receive( user_key, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 		: "user_profile_receive",
		user_key 	: user_key
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);

			callback(result);
		}
		else{
			callback("");
		}
	});
}
function user_username_receive( user_key, callback ){

	if(user_username[user_key] != undefined)
		callback(user_username[user_key]);
	else{

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "user_username_receive",
			user_key : user_key
		})
		.done(function( data ) {

			user_username[user_key] = data;
			callback(data);
		});
	}
}
function user_name_receive( user_key, callback ){

	if(user_name[user_key] != undefined)
		callback(user_name[user_key]);
	else{

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "user_name_receive",
			user_key : user_key
		})
		.done(function( data ) {

			if(data != ""){

				var result = $.parseJSON( data );

				if((result[0] != null && result[0] != "") && (result[1] != null && result[1] != "")){

					user_name[user_key] = result;

					callback(result);
				}
				else{
					user_username_receive(user_key, function(user_username){
						callback(user_username);
					});
				}
			}
			else
				callback(data);
		});
	}
}
function user_icon_receive( user_key, callback ){

	if(user_img[user_key] != undefined)
		callback(user_img[user_key]);
	else{

		$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
			task : "user_icon_receive",
			user_key : user_key
		})
		.done(function( data ) {
			if(data != ""){
				var result = $.parseJSON(data);

				user_img[user_key] = result;
				callback(result);
			}
			else
				callback("");
		});
	}
}



//----content

//load content
function comm_widget_menu_open( menu ){

	var this_element = $(".comm_widget_nav_elements[data-content='"+menu+"']");

	$(".comm_widget_nav_elements").removeClass("active");
	this_element.addClass("active");

	if($("#comm_widget_content_"+this_element.attr("data-content")).hasClass("active") == false){

		comm_widget_content_open( this_element.attr("data-content") );

		$(".comm_widget_content_elements").removeClass("active").stop().hide(0);
		$("#comm_widget_content_"+this_element.attr("data-content")).stop().fadeIn(300, function(){
			temp_set_img_align(); //cms img align > PB
		}).addClass("active");
	}

	if(menu == "chatrooms"){
		if($("#comm_widget_create_chatroom:visible").length){
			comm_widget_create_chatroom_close();
		}
	}
}
function comm_widget_content_open( submenu ){

	if(submenu == "chatrooms"){

		comm_widget_chatrooms_load();
	}
	if(submenu == "nachrichten"){

		comm_widget_nachrichten_load();
	}
	if(submenu == "support"){

		comm_widget_support_load();
	}
	if(submenu == "search"){

		comm_widget_search_load();
	}
}

//load chatroom_list
function comm_widget_chatroom_list( submenu, list_name, chatroom_id ){

	if(submenu != 0){

		if(submenu == "chatrooms"){

			comm_widget_chatroom_list(0, "chatrooms_kurse", 0);
			comm_widget_chatroom_list(0, "chatrooms_eigene_gruppen", 0);

			/*
			category_receive(function(result){

				for(var x=0; x<result.length; x++){
					comm_widget_chatroom_list( 0, "chatrooms_gruppe_beitreten_"+result[x]["ID"]+"_admin_create", 0 );
					comm_widget_chatroom_list( 0, "chatrooms_gruppe_beitreten_"+result[x]["ID"]+"_user_create", 0 );
				}
			});
			*/

			comm_widget_chatroom_list(0, "chatrooms_gruppe_beitreten_popular_list", 0);
		}

		if(submenu == "nachrichten"){

			comm_widget_chatroom_list(0, "nachrichten_privat", 0);
		}

		if(submenu == "support"){

			comm_widget_chatroom_list(0, "support_kursersteller", 0);
			comm_widget_chatroom_list(0, "support_plattform", 0);
		}
	}
	else if(list_name != 0){

		if(list_name == "chatrooms_kurse"){

			comm_widget_receive_chatroom_id("kurs", 0, 1, 0, 0, 0, 0, function(result){

				var kurse_element = $("#comm_widget_content_chatrooms_kurse");

				if(result == ""){

					kurse_element.find(".comm_widget_content_chatrooms_menu_elements_content").hide();
					kurse_element.find(".comm_widget_content_widget_empty").show();
				}
				else{

					kurse_element.find(".comm_widget_content_chatrooms_menu_elements_content").show();
					kurse_element.find(".comm_widget_content_widget_empty").hide();
				}

				comm_widget_chatroom_list_load( list_name,
												kurse_element.find(".comm_widget_chatroom_list_element.clonable"),
												$("#comm_widget_content_chatrooms_kurse_list"),
												result,
												"timestamp",
												"desc" );
			});
		}

		if(list_name == "chatrooms_eigene_gruppen"){

			var eigene_gruppen_element = $("#comm_widget_content_chatrooms_eigene_gruppen");

			comm_widget_receive_chatroom_id("user_create,admin_create", 0, 1, 0, 0, 0, 0, function(result){

				if(result == ""){

					eigene_gruppen_element.find(".comm_widget_content_chatrooms_menu_elements_content").hide();
					eigene_gruppen_element.find(".comm_widget_content_widget_empty").show();
				}
				else{
					eigene_gruppen_element.find(".comm_widget_content_chatrooms_menu_elements_content").show();
					eigene_gruppen_element.find(".comm_widget_content_widget_empty").hide();

					comm_widget_chatroom_list_load( list_name,
													$("#comm_widget_content_chatrooms_eigene_gruppen .comm_widget_chatroom_list_element.clonable"),
													$("#comm_widget_content_chatrooms_eigene_gruppen_list"),
													result,
													"timestamp",
													"desc" );
				}
			});
		}

		if(list_name == "chatrooms_gruppe_beitreten_popular_list"){

			category_receive(function(result){

				var cat_id = [];

				for(var x=0; x<result.length; x++){

					cat_id[x] = result[x]["ID"];
				}

				comm_widget_receive_chatroom_id("admin_create", "open", 0, "open", cat_id, 0, 0, function(chatroom_id){

					comm_widget_chatroom_list_load( list_name,
													$(".comm_widget_chatroom_gruppe_beitreten_list_element_bubble.clonable"),
													$("#comm_widget_content_chatrooms_gruppe_beitreten_popular_list"),
													chatroom_id,
													"title",
													"asc" );
				});

			});
		}

		/*
		if(list_name.startsWith("chatrooms_gruppe_beitreten_")){

			category_receive(function(result){

				var cat_id;

				for(var x=0; x<result.length; x++){

					var list_name_test = "chatrooms_gruppe_beitreten_"+result[x]["ID"];

					if(list_name == list_name_test+"_admin_create"){

						cat_id = result[x]["ID"];

						comm_widget_receive_chatroom_id("admin_create", 0, "open", cat_id, 0, function(chatroom_id){

							comm_widget_chatroom_list_load( list_name,
															$(".comm_widget_chatroom_list_element_gruppe_beitreten.clonable"),
															$(".comm_widget_content_chatrooms_gruppe_beitreten_category_list_admin_create[data-cw_category_id='"+cat_id+"']"),
															chatroom_id,
															"title",
															"asc" );
						});
					}
					if(list_name == list_name_test+"_user_create"){

						cat_id = result[x]["ID"];

						comm_widget_receive_chatroom_id("user_create", 0, "open", cat_id, 0, function(chatroom_id){

							comm_widget_chatroom_list_load( list_name,
															$(".comm_widget_chatroom_list_element_gruppe_beitreten.clonable"),
															$(".comm_widget_content_chatrooms_gruppe_beitreten_category_list_user_create[data-cw_category_id='"+cat_id+"']"),
															chatroom_id,
															"title",
															"asc" );
						});
					}
				}
			});
		}
		*/

		if(list_name == "nachrichten_privat"){

			var nachrichten_privat_element = $("#comm_widget_content_nachrichten_privat");

			comm_widget_receive_chatroom_id("private", 0, 1, 0, 0, 0, 0, function(chatroom_id){

				if(chatroom_id == ""){

					nachrichten_privat_element.find("#comm_widget_content_nachrichten_privat_content").hide();
					nachrichten_privat_element.find(".comm_widget_content_widget_empty").show();
				}
				else{
					comm_widget_chatroom_list_load( list_name,
													$("#comm_widget_content_nachrichten_privat .comm_widget_chatroom_list_element.clonable"),
													$("#comm_widget_content_nachrichten_privat_list"),
													chatroom_id,
													"timestamp",
													"desc" );
					nachrichten_privat_element.find(".comm_widget_content_widget_empty").hide();
				}
			});
		}


		/*support*/

		if(list_name == "support_kursersteller"){

			var support_kursersteller_element = $("#comm_widget_content_support_kursersteller");

			comm_widget_receive_chatroom_id("support_kursersteller", 0, 1, 0, 0, 0, 0, function(chatroom_id){

				if(chatroom_id == ""){

					support_kursersteller_element.find("#comm_widget_content_support_kursersteller_content").hide();
					support_kursersteller_element.find(".comm_widget_content_widget_empty").show();
				}
				else{
					comm_widget_chatroom_list_load( list_name,
													$(".comm_widget_content_support_kursersteller_list_element.clonable"),
													$("#comm_widget_content_support_kursersteller_content_list"),
													chatroom_id,
													"timestamp",
													"desc" );
				}
			});
		}

		if(list_name == "support_plattform"){

			var support_plattform_element = $("#comm_widget_content_support_plattform_content");

			if(rights_check( lc_user_key, "root" ) || rights_check( lc_user_key, "lc_mod" ) || rights_check( lc_user_key, "supporter" )){

				comm_widget_receive_chatroom_id("support_plattform", 0, 1, 0, 0, 0, 0, function(chatroom_id){

					comm_widget_chatroom_list_load( list_name,
													$("#comm_widget_content_support_plattform_content").find(".comm_widget_chatroom_list_element.clonable"),
													$("#comm_widget_content_support_plattform_list"),
													chatroom_id,
													"timestamp",
													"desc" );
				});
			}
			else{
				comm_widget_receive_chatroom_id("support_plattform", 0, 1, 0, 0, 0, 0, function(chatroom_id){

					if(chatroom_id != ""){
						//manuell
						lc_chatroom_preview_receive( chatroom_id, function(result){

							support_plattform_element.find("*[data-cw_type='chatroom_list_element']").attr("data-chatroom_id", chatroom_id[0]);

							//notifications
							var content_element = support_plattform_element.find("*[data-cw_type='notcounter']");
							if(content_element.length){

								content_element.attr("data-cw_notcounter", result[0]["id"]);

								if( lc_getNotSum(result[0]["id"]) == 0 || lc_getNotSum(result[0]["id"]) == undefined ){
									content_element.hide();
								}
								else{
									content_element.show().text( lc_getNotSum(result[0]["id"]) );
								}
							}

							//first_msg
							lc_chatroom_msg_receive( chatroom_id[0], 0, 1, function(first_msg, chatroom_id){

								if(first_msg[0]["content"] != undefined){

									support_plattform_element.find("*[data-cw_type='first_msg']").html(first_msg[0]["content"]);

									var content_element = support_plattform_element.find("*[data-cw_type='timestamp']");
									if(content_element.length){
										content_element.text(first_msg[0]["timestamp"]);
									}
									lc_retransl(support_plattform_element, function(){});
								}
							});

							var support_no_mod = $(".comm_widget_chatbox[data-lc_chatroom='"+chatroom_id+"']").find(".comm_widget_chatbox_support_no_mod");

							if(support_no_mod.length){
								if($(".comm_widget_chatbox[data-lc_chatroom='"+chatroom_id+"']").find("*[data-lc_type='info_user']").length > 1){

									support_no_mod.hide();
								}
							}
						});
					}
				});
			}
		}

	}
	else if(chatroom_id != 0){

		//refresh chatroom_id > list_element

		var list_element		 = $("*[data-cw_type='chatroom_list_element'][data-chatroom_id='"+chatroom_id+"']");
		var list_element_wrapper = list_element.closest("*[data-cw_type='chatroom_list'][data-cw_name]");

		if(list_element_wrapper.length){

			comm_widget_chatroom_list(0, list_element_wrapper.attr("data-cw_name"), 0);
		}
		else{
			if($(".comm_widget_nav_elements.active").length){
				comm_widget_chatroom_list($(".comm_widget_nav_elements.active").attr("data-content"), 0, 0);
			}
		}
	}
}
function comm_widget_chatroom_list_load( name, list_element, list_destination_wrapper, chatroom_id, order_val, order_dir ){

	var parent = $("*[data-cw_type='chatroom_list'][data-cw_name='"+name+"']");

	//create list

	if(chatroom_id == ""){
		list_destination_wrapper.html("");
		return false;
	}

	if(parent.length == 0){

		list_destination_wrapper.attr("data-cw_type", "chatroom_list").attr("data-cw_name", name);
	}

	lc_chatroom_preview_receive( chatroom_id, function(result){

		var private_user = [];

		for(var x=0; x<result.length; x++){

			private_user[x] = result[x]["private_user"];
		}

		comm_widget_receive_chatroom_info( chatroom_id, private_user, function(chatroom_info){

			var list_element_active = list_destination_wrapper.find("*[data-cw_type='chatroom_list_element']");


			//result order_by
			if(	order_val != undefined && order_val != 0 &&
				order_dir != undefined && order_dir != 0){

				var extr = -1;
				var result_cache;
				var chatroom_info_cache;
				var pos;

				for(var x=0; x<result.length; x++){

					for(var y=x; y<result.length; y++){

						if(	extr == -1 || (
							order_dir == "asc" && extr>result[y][order_val] ||
							order_dir == "desc" && extr<result[y][order_val]) ){

							extr = result[y][order_val];
							pos = y;
						}
					}

					result_cache = result[x];
					result[x] = result[pos];
					result[pos] = result_cache;

					chatroom_info_cache = chatroom_info[x];
					chatroom_info[x] = chatroom_info[pos];
					chatroom_info[pos] = chatroom_info_cache;

					extr = -1;
				}
			}

			//add/remove elements
			if( list_element_active.length != result.length ){

				//remove
				for(var x=0; x<list_element_active.length; x++){

					var remove = true;

					for(var y=0; y<result.length; y++){

						if(result[y]["id"] == list_element_active.eq(x).attr("data-chatroom_id")){
							remove = false;
						}
					}

					if(remove == true)
						list_element_active.eq(x).remove();
				}

				list_element_active = list_destination_wrapper.find("*[data-cw_type='chatroom_list_element']");

				//add
				if( list_element_active.length != result.length ){

					for(var x=0; x<result.length; x++){

						var new_id = true;

						for(var y=0; y<list_element_active.length; y++){

							if(result[x]["id"] == list_element_active.eq(y).attr("data-chatroom_id")){
								new_id = false;
							}
						}

						if(new_id == true){
							add_id = result[x]["id"];

							var clone_cache = list_element.eq(0).clone().removeClass("clonable")
																		.attr("data-chatroom_id", add_id);

							if(x > 0){
								clone_cache.hide().insertAfter( list_destination_wrapper.find("*[data-cw_type='chatroom_list_element'][data-chatroom_id='"+result[x-1]["id"]+"']") );
							}
							else{
								clone_cache.hide().prependTo( list_destination_wrapper );
							}
						}
					}
				}
			}

			list_element_active = list_destination_wrapper.find("*[data-cw_type='chatroom_list_element']");

			for(var x=0; x<list_element_active.length; x++){
				list_element_active.eq(x).attr("data-chatroom_id", result[x]["id"]);
			}

			var task1 = $.Deferred();
			var task2 = $.Deferred();

			var transl_counter = 0;

			var chatroom_id_length1 = result.length;
			var transl_counter_length = result.length;

			for(var x=0; x<result.length; x++){

				list_element_active.eq(x).find("*[data-cw_type='user_leave_remove']").hide();
				list_element_active.eq(x).find("*[data-cw_hide]").each(function(){

					$(this).show();
					var data_cw_hide = $(this).attr("data-cw_hide");

					data_cw_hide = data_cw_hide.split(",");

					for(var y=0; y<data_cw_hide.length; y++){
						if(data_cw_hide[y] == result[x]["rights"])
							$(this).hide();
					}
				});

				var chatroom_type = "";

				if(	chatroom_info[x]["type"] == "private" ||
					chatroom_info[x]["type"] == "support_kursersteller"){

						chatroom_type = "private";
				}

				//title
				var title_element = list_element_active.eq(x).find("*[data-cw_type='title']");

				title_element.html(result[x]["title"]);

				if(chatroom_info[x]["type"] == "private")
					title_element.attr("data-lc_transl", "user_name");

				else if(chatroom_info[x]["type"] == "support_plattform")
					title_element.text(chatroom_info[x]["user_key_host"]).attr("data-lc_transl", "user_name");


				//notifications
				var content_element = list_element_active.eq(x).find("*[data-cw_type='notcounter']");
				if(content_element.length){

					content_element.attr("data-cw_notcounter", result[x]["id"]);

					if( lc_getNotSum(result[x]["id"]) == 0 || lc_getNotSum(result[x]["id"]) == undefined ){
						content_element.hide();
					}
					else{
						content_element.show().text( lc_getNotSum(result[x]["id"]) );
					}
				}

				list_element_active.eq(x).find("*[data-cw_type='member']").text(result[x]["member"]);

				//timestamp
				if(list_element_active.eq(x).find("*[data-cw_type='timestamp']").length){
					list_element_active.eq(x).find("*[data-cw_type='timestamp']").text( result[x]["timestamp"] );
					lc_translate_user_data( "timestamp", list_element_active.eq(x).find("*[data-cw_type='timestamp']"), function(){} );
				}

				if(result[x]["rights"] != "no-member" && result[x]["rights"] != "invited" && result[x]["rights"] != "left" && result[x]["rights"] != "removed"){

					lc_chatroom_msg_receive( result[x]["id"], 0, 1, function(first_msg, chatroom_id){
						list_element_active = list_destination_wrapper.find("*[data-cw_type='chatroom_list_element'][data-chatroom_id='"+chatroom_id+"']");

						if(first_msg != "" && first_msg[0]["content"] != undefined){

							var first_msg_text = first_msg[0]["content"];

							if(list_element_active.find("*[data-cw_type='first_msg']").length)
								list_element_active.find("*[data-cw_type='first_msg']").html( first_msg_text );
						}
						else
							list_element_active.find("*[data-cw_type='first_msg']").text( "Du bist beigetreten." );

						chatroom_id_length1--;
						if(chatroom_id_length1 == 0)
							task1.resolve();
					});
				}
				else{
					if(result[x]["rights"] == "invited")
						list_element_active.eq(x).find("*[data-cw_type='first_msg']").text("Du wurdest eingeladen.");
					if(result[x]["rights"] == "removed"){
						list_element_active.eq(x).find("*[data-cw_type='first_msg']").text("Du wurdest entfernt.");
						list_element_active.eq(x).find("*[data-cw_type='user_leave_remove']").show();
					}
					if(result[x]["rights"] == "left"){
						list_element_active.eq(x).find("*[data-cw_type='first_msg']").text("Du hast den Chatroom verlassen.");
						list_element_active.eq(x).find("*[data-cw_type='user_leave_remove']").show();
					}
					if(result[x]["rights"] == "no-member"){
						list_element_active.attr("data-user_rights", "no-member");
					}

					chatroom_id_length1--;
					if(chatroom_id_length1 == 0)
						task1.resolve();
				}

				//kurse
				if(chatroom_info[x]["type"] == "support_kursersteller"){

					var content_element = list_element_active.eq(x).find("*[data-cw_type='kurse']");
					if(content_element.length){

						var content_element2 = list_element_active.eq(x).find("*[data-cw_type='kurse_wrapper']");
						if(content_element2.length){

							content_element2.show();
						}

						var kurse_output = chatroom_info[x]["kurse"];

						if(kurse_output.length > 20){
							content_element.attr("title", kurse_output);

							var slice_length = 10;
							if(!$("#comm_widget").hasClass("small"))
								slice_length = 25;

							kurse_output = kurse_output.slice(0,slice_length)+"...";
						}
						else if(kurse_output == ""){
							kurse_output = "Student";
						}
						content_element.text(kurse_output);
					}
				}
				else{
					var content_element2 = list_element_active.eq(x).find("*[data-cw_type='kurse_wrapper']");
					if(content_element2.length){

						content_element2.hide();
					}
				}

				//category
				var content_element = list_element_active.eq(x).find("*[data-cw_type='category']");
				if(content_element.length){

					content_element.text(chatroom_info[x]["category_name"]);
				}


				//icon
				var content_element = list_element_active.eq(x).find("*[data-cw_type='icon']");
				if(content_element.length){

					if(chatroom_type == "private"){
						content_element.text(result[x]["private_user"]).attr("data-lc_transl", "user_icon");
					}
					else if(chatroom_info[x]["type"] == "support_plattform"){
						content_element.text(chatroom_info[x]["user_key_host"]).attr("data-lc_transl", "user_icon");
					}
					else{
						content_element.html("");

						if(chatroom_info[x]["icon_type"] == "html")
							content_element.html(chatroom_info[x]["icon"]);
						else if(chatroom_info[x]["icon_type"] == "img")
							content_element.html( "<img src='"+glob_cms_home_dir+"temp/media/project/cw_icon/"+chatroom_info[x]["src"]+"' alt='Chatroom-Icon' />" );
						else
							content_element.html( '<i class="fa fa-users" aria-hidden="true"></i>' );
					}
				}

				//status
				var content_element = list_element_active.eq(x).find("*[data-lc_type='user_status']");
				if(content_element.length){

					if(chatroom_type == "private"){

						content_element.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
						content_element.find("*[data-lc_type='user_status_"+result[x]["private_user_status"]+"']").show();

						content_element.attr("data-lc_user_key", result[x]["private_user"]);
					}
				}

				lc_retransl( list_element_active.eq(x), function(){

					transl_counter++;

					if(transl_counter == transl_counter_length)
						task2.resolve();
				});
			}

			//show elements
			$.when(task1, task2).done(function(){

				//title_attr
				list_destination_wrapper.find("*[data-cw_title='content']").each(function(){
					$(this).attr("title", $(this).text());
				});

				list_destination_wrapper.find("*[data-cw_type='chatroom_list_element']").show();

				var elem1 	= list_destination_wrapper.find(".comm_widget_chatroom_list_element_text2").find("*[data-cw_type='timestamp'], *[data-cw_type='category']");
				var elem2 	= list_destination_wrapper.find(".comm_widget_chatroom_list_element_text1").find("*[data-cw_type='title'], *[data-cw_type='first_msg']");
				var wrapper = list_destination_wrapper.find(".comm_widget_chatroom_list_element_text");

				rows_width(elem1, elem2, wrapper, true);

			}).promise();

		});
	});

}

//chatbox init
function comm_widget_chatbox_init( chatroom_id, chatbox, chatbox_area, chatbox_clonable, max_msg, callback){

	chatbox.show().css("visibility", "hidden");
	chatbox_area.show().css("visibility", "hidden");

	$("#comm_widget_content_loading").show();

	lc_chatroom_init( chatroom_id, chatbox_area, chatbox_clonable, max_msg, function(){

		chatbox_area.css("visibility", "visible");
		$("#comm_widget_content_loading").hide();

		cw_on_resize();
		temp_set_img_align();
		lc_chatroom_init_receive_scroll( chatroom_id, 0 );

		chatbox.css("visibility", "visible").hide().stop().fadeIn(500);

		callback(1);
	});

}
//chatbox submenus
//info
function comm_widget_chatbox_info_open(){

	var chatbox 		= $("*[data-lc_type='chatbox'][data-lc_chatroom]");
	var info 			= chatbox.find("*[data-lc_type='info']");
	var history_form 	= chatbox.find("*[data-lc_type='history'], *[data-lc_type='form']");

	info.stop().fadeIn(300).addClass("active");
	history_form.hide();

	chatbox.find(".comm_widget_content_chatbox_cancel.no_close").addClass("active");

	var info_open_elem = $(".info_open");
	if(info_open_elem.length)
		info_open_elem.addClass("active");

	comm_widget_chatbox_info_action_close();
}
function comm_widget_chatbox_info_close(){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom]");

	chatbox.find("*[data-lc_type='info']").hide().removeClass("active");
	chatbox.find("*[data-lc_type='history'], *[data-lc_type='form']").fadeIn(300);
	chatbox.find("*[data-lc_type='history']").scrollTop(999999999);

	var info_open_elem = $(".info_open");
	if(info_open_elem.length)
		info_open_elem.removeClass("active");
}
//info > aktionen
function comm_widget_chatbox_info_action_close(){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom]");

	chatbox.find(".comm_widget_chatbox_user_info_action_element.active").stop().slideUp(500).removeClass("active");
	chatbox.find("*[data-lc_type='info_user'].active").removeClass("active");

	var action = chatbox.find(".comm_widget_chatbox_user_info_action");
	action.show();

	var info_user_wrapper = action.closest("*[data-lc_type='info']").find("*[data-lc_type='info_user_wrapper']");
	info_user_wrapper.show();

	var action_button = chatbox.find(".comm_widget_chatbox_user_info_action_button");
	action_button.removeClass("active");

	action_button.find("p").hide();
	action_button.find(".comm_widget_chatbox_user_info_action_button_text").show();

	var confirm_button = chatbox.find("*[data-lc_type='chatbox'][data-lc_chatroom]").find("*[data-cw_type='confirm_button']");
	confirm_button.unbind("click");
	confirm_button.removeClass("bound");

	chatbox.find(".comm_widget_chatroom_edit_element.active").fadeOut(300).removeClass("active");
}
//info > confirm
function chatroom_edit_confirm_open( type, chatroom_id, user_key, callback ){

	var chatbox = $("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']");

	var confirm_elem 	= chatbox.find("*[data-cw_type='confirm']");
	var confirm_button 	= confirm_elem.find("*[data-cw_type='confirm_button']");

	if(confirm_elem.length){

		var submit_msg = chatroom_edit_confirm[type];

		if(submit_msg != undefined){
			confirm_button.find("*[data-cw_type='confirm_msg']").html(submit_msg.replace("/user_key/", "<span data-lc_transl='user_key'>"+user_key+"</span>"));
			lc_transl(confirm_elem, function(){});
		}

		comm_widget_chatbox_info_action_close();

		confirm_elem.addClass("active").stop().slideDown(300);
		var action_button = chatbox.find(".comm_widget_chatbox_user_info_action_button");
		action_button.addClass("active");

		action_button.find("p").hide();
		action_button.find(".comm_widget_chatbox_user_info_action_button_cancel").show();

		if(confirm_button.hasClass("bound") == false){

			confirm_button.bind("click", function(){

				confirm_button.unbind("click");
				confirm_button.removeClass("bound");
				callback(1);
			});
		}
		confirm_button.addClass("bound");
	}
	else{
		callback(1);
	}
}

//add_user
function comm_widget_add_user_list(task, user_element, user_element_wrapper, user_key, callback){

	var start_element = 0;
	var user_key_add = user_element_wrapper.find(".comm_widget_chatbox_user_info[data-user_key]");

	if(task == "add" && user_key_add.length){

		start_element = user_key_add.length;

		for(var x=0; x<user_key.length; x++){
			user_element.eq(0).clone().appendTo( user_element_wrapper );
		}
	}
	else{
		var clone_cache = user_element.eq(0).clone();
		user_element.remove();
		clone_cache.appendTo( user_element_wrapper );

		user_element = user_element_wrapper.find(".comm_widget_chatbox_user_info");

		for(var x=0; x<user_key.length-1; x++){
			user_element.eq(0).clone().appendTo( user_element_wrapper );
		}
	}

	user_element = user_element_wrapper.find(".comm_widget_chatbox_user_info");

	var chatbox = user_element_wrapper.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");

	var user_key_str = "";

	cw_user_contact_rights_receive(user_key, 0, function(){

		for(var x=start_element; x<(user_key.length+start_element); x++){

			user_element.eq(x).attr("data-user_key", user_key[x-start_element]);
			user_element.eq(x).find("*[data-cw_type='user_name']").html("<span data-lc_transl='user_key'>"+user_key[x-start_element]+"</span>");
			user_element.eq(x).find("*[data-cw_link='user_profile']").attr("data-cw_user_key", user_key[x-start_element]);
			user_key_str += user_key[x-start_element]+",";

			user_element.eq(x).find("*[data-cw_type='user_key']").text(user_key[x-start_element]);
			lc_translate_user_data("user_icon", user_element.eq(x).find("*[data-cw_type='user_key'][data-lc_transl='user_icon']"), function(){});

			var member = chatbox.find("*[data-lc_type='info_user'][data-lc_user_key='"+ user_key[x-start_element] +"']");
			user_element.eq(x).removeClass("member").removeClass("invited").removeClass("blocked").find("*[data-cw_type='member'], *[data-cw_type='invited'], *[data-cw_type='blocked_0'], *[data-cw_type='blocked_1']").hide();

			if(member.length){

				if(member.attr("data-lc_user_rights") == "invited")
					user_element.eq(x).addClass("invited").find("*[data-cw_type='invited']").show();
				else
					user_element.eq(x).addClass("member").find("*[data-cw_type='member']").show();
			}

			var blocked_set = cw_user_contact_rights_check( user_key[x-start_element], 0 )["setting"];

			if(blocked_set == "blocked_0" || blocked_set == "blocked_1"){
				user_element.eq(x).removeClass("invited").removeClass("member").addClass("blocked").find("*[data-cw_type='invited'], *[data-cw_type='member'], *[data-cw_type='blocked_0'], *[data-cw_type='blocked_1']").hide();
				user_element.eq(x).find("*[data-cw_type='"+blocked_set+"']").show();
			}
		}

		lc_transl(user_element_wrapper, function(){

			user_element.show();
		});

		user_key_str = user_key_str.slice(0,-1);

		lc_user_status_receive( user_key_str, function(result){

			for(var x=start_element; x<(user_key.length+start_element); x++){

				user_element.eq(x).find("*[data-lc_type='user_status']").attr("data-lc_user_key", user_key[x-start_element]);

				if(result[user_key[x-start_element]] == "online"){
					user_element.eq(x).find("*[data-lc_type='user_status_online']").show();
					user_element.eq(x).find("*[data-lc_type='user_status_offline']").hide();
				}
				else{
					user_element.eq(x).find("*[data-lc_type='user_status_offline']").show();
					user_element.eq(x).find("*[data-lc_type='user_status_online']").hide();
				}
			}

			callback(1);
		});
	});
}
function comm_widget_add_user_search( chatbox ){

	var input_element = chatbox.find(".comm_widget_chatbox_add_user_search_input");

	if(input_element.val() != ""){

		var search_box 				= chatbox.find(".comm_widget_chatbox_add_user_results");
		var search_box_no_results 	= chatbox.find(".comm_widget_chatbox_add_user_results_no_results");
		var user_element 			= chatbox.find(".comm_widget_chatbox_add_user_results_element");
		var user_element_wrapper 	= chatbox.find(".comm_widget_chatbox_add_user_results_element_wrapper");

		user_search( input_element.val(), function(result_user_key){

			user_list_receive( result_user_key, function(result){

				var user_key = [];

				for(var x=0; x<result.length; x++)
					user_key[x] = result[x]["user_key"];

				search_box.show();

				if(result != ""){
					comm_widget_add_user_list("refresh", user_element, user_element_wrapper, user_key, function(){});
					user_element_wrapper.show();
					search_box_no_results.hide();
				}
				else{
					user_element_wrapper.hide();
					search_box_no_results.show();
				}
			});
		});
	}
	else
		input_element.attr("placeholder", "Bitte Nutzernamen eingeben!");
}

//chatbox close
function comm_widget_chatbox_close( chatbox ){

	var chatroom_id = chatbox.attr("data-lc_chatroom");

	comm_widget_chatroom_list( $(".comm_widget_nav_elements.active").attr("data-content") ,0,0);

	chatbox.closest(".comm_widget_content_chatbox_wrapper").hide();
	chatbox.closest(".comm_widget_content_elements").find(".comm_widget_content_menu").stop().fadeIn(300);
	chatbox.attr("data-lc_chatroom", "");

	$("#comm_widget_content_chatrooms_eigene_gruppen_add_form").hide();

	lc_chatroom_leave(chatroom_id);
	//temp_set_img_align();
}

//chatroom update
function comm_widget_chatroom_update( chatroom_id, attr, val, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 		: "chatroom_update",
		chatroom_id	: chatroom_id,
		attr		: attr,
		val			: val
	})
	.done(function( data ) {
		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

//------------cw_img

function comm_widget_img_open( icon_type, icon ){

	$("#comm_widget_content_menu_wrapper:visible, #comm_widget_user_profile:visible").addClass("visible").hide();

	$("#comm_widget_img").stop().fadeIn(300);
	$("#comm_widget_img_content_inner").html("");
	$("#comm_widget_img_loading").show();

	if(icon_type == "img"){

		var targetFile = glob_cms_home_dir+"temp/media/project/"+icon;
		$("#comm_widget_img_content_inner").html("<img src='"+targetFile+"' alt='Vorschaubild' />");

		$("#comm_widget_img_content_inner").find("img").on("load", function(){
			coverimg($("#comm_widget_img_content_inner"));
		});
	}
	else if(icon_type == "html"){
		$("#comm_widget_img_content_inner").html(icon);
		$("#comm_widget_img_loading").hide();
	}
}
function comm_widget_img_close(){

	$("#comm_widget_content_menu_wrapper.visible, #comm_widget_user_profile.visible").removeClass("visible").stop().fadeIn(300);
	$("#comm_widget_img").stop().fadeOut(300);
	cw_on_resize();
}

//------------user_profile

//----init_profile
function comm_widget_user_profile_init( user_key ){

	user_profile_receive( user_key, function( result ){

		if(result != ""){

			cw_user_contact_rights_prepare( user_key, 0, function(){

				var user_profile = $("#comm_widget_user_profile");

				user_profile.hide();
				$("#comm_widget_content_loading").show();
				$("#comm_widget_content_menu_wrapper").hide();

				var task1 = $.Deferred();
				var task2 = $.Deferred();

				var task2_0 = $.Deferred();
				var task2_1 = $.Deferred();

				//courses created/visited

				var kurs_receive_x = 0;

				if(user_profile.find("*[data-lc_type='user_status']").length){

					lc_user_status_receive( user_key, function( result ){

						var status = result[user_key];

						user_profile.find("*[data-lc_type='user_status']").attr("data-lc_user_key", user_key);
						user_profile.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();
						user_profile.find("*[data-lc_type='user_status_"+status+"']").show();

						task1.resolve();
					});
				}
				else{
					task1.resolve();
				}


				var content_element;

				//icon
				content_element = user_profile.find("*[data-cw_type='user_profile_icon']");
				if(content_element.length){

					content_element.html(user_key);
				}

				if(result["username"] == "removed"){

					//user_removed
					$("#comm_widget_user_profile").addClass("removed");

					$("#comm_widget_user_profile_head_info_name").text("Profil gelöscht");

					task2_0.resolve();
					task2_1.resolve();
				}
				else{
					$("#comm_widget_user_profile").removeClass("removed");

					//name
					content_element = user_profile.find("*[data-cw_type='user_profile_name']");
					if(content_element.length){

						if(result["fname"] != "" && result["fname"] != null &&
							result["lname"] != "" && result["lname"] != null)
							content_element.html(result["fname"]+" "+result["lname"]);
						else
							content_element.html(result["username"]);
					}

					//fname/lname
					content_element = user_profile.find("*[data-cw_type='user_profile_fname']");
					if(content_element.length){
						content_element.show();

						if(result["fname"] != "" && result["fname"] != null)
							content_element.html(result["fname"]);
					}

					content_element = user_profile.find("*[data-cw_type='user_profile_lname']");
					if(content_element.length){
						content_element.show();

						if(result["lname"] != "" && result["lname"] != null)
							content_element.html(result["lname"]);
						else
							content_element.hide();
					}

					$("#comm_widget_user_profile_head_info_username").show();

					content_element = user_profile.find("*[data-cw_type='user_profile_fname']");
					if((result["fname"] == "" || result["fname"] == null) && (result["lname"] == "" || result["lname"] == null)){
						content_element.html(result["username"]);
						$("#comm_widget_user_profile_head_info_username").hide()
					}

					//username
					content_element = user_profile.find("*[data-cw_type='user_profile_username']");
					if(content_element.length){

						content_element.html(result["username"]);
					}


					//contact
					content_element = user_profile.find("*[data-cw_type='user_contact_private']");
					if(content_element.length){
						content_element.attr("data-cw_user_key", user_key);

						cw_user_contact_rights_update( user_key, "private", function(){});
					}
					content_element = user_profile.find("*[data-cw_type='user_contact_support']");
					if(content_element.length){

						content_element.attr("data-cw_user_key", user_key);

						cw_user_contact_rights_update( user_key, "support", function(){});
					}


					//blocked
					content_element = user_profile.find("*[data-cw_type='user_block']");
					if(content_element.length){
						content_element.attr("data-cw_user_key", user_key);

						var block0 = $("*[data-cw_type='user_block_0']");
						var block1 = $("*[data-cw_type='user_block_1']");
						var block2 = $("*[data-cw_type='user_block_2']");

						block0.hide(); block1.hide(); block2.hide();

						switch(cw_user_contact_rights_check( user_key, 0 )["setting"]){

							case "blocked_0": //you were blocked sb
								block1.show();
							break;
							case "blocked_1": //you blocked by sb
								block2.show();
							break;
							default:
								block0.show();
							break;
						}
					}


					//user_profile_link
					content_element = user_profile.find("#comm_widget_user_profile_action_button_profile");
					if(content_element.length){
						content_element.closest("a").attr("href", glob_cms_home_dir+"user.html?u="+result["username"]);
						content_element.unbind();
						content_element.bind("click", function(){
							document.cookie = "control_open=";
						});
					}

					user_profile.find("*[data-cw_type='user_profile_courses_empty']").hide();

					for(var x=0; x<2; x++){

						var courses_str;
						if(x==0)
							courses_str = "courses_created";
						if(x==1)
							courses_str = "courses_visited";

						content_element = user_profile.find("*[data-cw_type='user_profile_"+courses_str+"']");
						if(content_element.length){
							content_element.show();

							if(result[courses_str] != undefined && result[courses_str].length){

								kurs_receive(result[courses_str], function(result2){

									var courses_str_new = "";

									//courses_created
									if(result["courses_created"] != undefined){
										for(var z=0; z<result["courses_created"].length; z++){
											if(result2[ result["courses_created"][z] ] != undefined)
												courses_str_new = "courses_created";
										}
									}

									if(courses_str_new == "")
										courses_str_new = "courses_visited";

									var wrapper							= user_profile.find("*[data-cw_type='user_profile_"+courses_str_new+"']")

									var kurse_list_element_receive 		= wrapper.find("*[data-cw_type='user_profile_courses_list']");
									var kurse_clonable_element_receive 	= wrapper.find("*[data-cw_type='user_profile_courses_clonable']");

									kurse_list_element_receive.html("");

									for(var y=0; y<result[courses_str_new].length; y++){

										var kurs_id = result[courses_str_new][y];

										kurse_clonable_element_receive.clone().appendTo( kurse_list_element_receive );

										var new_element = kurse_list_element_receive.find("*[data-cw_type='user_profile_courses_clonable'].clonable");

										new_element.attr("title", html_decode( result2[ kurs_id ]["name"] ) );

										var content_element2 = new_element.find("*[data-cw_type='user_profile_courses_thumbnail']");
										if(content_element2.length){

											content_element2.find("img").attr("src", glob_cms_home_dir+"temp/media/project/cw_icon/"+result2[ kurs_id ]["thumbnail"]);
											content_element2.attr("data-get_param", encodeURI(result2[ kurs_id ]["name"]));
										}

										new_element.removeAttr("data-cw_type").removeClass("clonable");
									}

									kurs_receive_x++;
									if(kurs_receive_x == 1) task2_0.resolve();
									if(kurs_receive_x == 2) task2_1.resolve();
								});
							}
							else{

								kurs_receive_x++;
								if(kurs_receive_x == 1) task2_0.resolve();
								if(kurs_receive_x == 2) task2_1.resolve();

								content_element.hide();

								if(	(result["created"] == undefined || result["created"].length)
									&& (result["visited"] == undefined || result["visited"].length)){

										user_profile.find("*[data-cw_type='user_profile_courses_empty']").show();
									}
							}
						}
						else{

							kurs_receive_x++;
							if(kurs_receive_x == 1) task2_0.resolve();
							if(kurs_receive_x == 2) task2_1.resolve();
						}
					}

					var soc_net_hidden = 0;

					for(var x=0; x<4; x++){

						var soc_net = "";

						if(x==0)
							soc_net = "facebook";
						if(x==1)
							soc_net = "twitter";
						if(x==2)
							soc_net = "youtube";
						if(x==3)
							soc_net = "instagram";

						var content_element = user_profile.find("*[data-cw_type='user_profile_"+soc_net+"']");
						if(content_element.length){
							content_element.show();

							if(result[soc_net+"_link"] != "" && result[soc_net+"_link"] != null){

								content_element.attr("data-cw_url", result[soc_net+"_link"]);
							}
							else{
								content_element.hide();
								soc_net_hidden++;
							}
						}
					}

					if(soc_net_hidden == 4)
						user_profile.find("*[data-cw_type='user_profile_soc_net_empty']").show();
					else
						user_profile.find("*[data-cw_type='user_profile_soc_net_empty']").hide();
				}

				$.when(task1, task2_0, task2_1).done(function(){

					$("#comm_widget_user_profile").attr("data-cw_user_key", user_key);

					lc_retransl(user_profile, function(){

						//title_attr
						user_profile.find("*[data-cw_title='content']").each(function(){
							$(this).attr("title", $(this).text());
						});

						$("#comm_widget_content_loading").hide();
						user_profile.stop().fadeIn(500);
					});

				}).promise();
			});
		}
	});
}


//------------submenus

//----chatrooms
function comm_widget_chatrooms_load(){

	comm_widget_chatroom_list( "chatrooms", 0, 0 );
}
function comm_widget_create_chatroom_open(){

	var create_element = $("#comm_widget_create_chatroom");

	$("#comm_widget_content_chatrooms .comm_widget_content_elements_inner").hide();
	create_element.stop().fadeIn(300);

	//preset
	$("#comm_widget_create_chatroom").scrollTop(0);

	//dropzone
	if(create_element.find(".comm_widget_create_chatroom_element_content_dropzone_wrapper").html() == ""){
		dropzone_open(create_element.find(".comm_widget_create_chatroom_element_content_dropzone_wrapper"), $(".cw_dropzone_single.clonable"), "cw_icon", 0, function(id, filename){

			create_element	.find(".comm_widget_create_chatroom_img")
							.html("<img src='"+glob_cms_home_dir+"temp/media/project/cw_icon/"+filename+"' alt='Chatroom-Icon' />")
							.attr("data-cw_id='"+id+"'");

			$("#comm_widget_create_chatroom_icon").val(id);
			$("#comm_widget_create_chatroom_icon_type").val("img");
		});
	}

	if(!rights_check(lc_user_key, "root")){
		$("#comm_widget_create_chatroom_icon_wrapper").hide();
	}
	else
		$("#comm_widget_create_chatroom_icon_wrapper").show();

	$("#comm_widget_create_chatroom_icon_wrapper").find("input").val("");

	$("#comm_widget_create_chatroom_title").val("");

	$("#comm_widget_create_chatroom_user_join").find("*[data-cw_val]").removeClass("active");
	$("#comm_widget_create_chatroom_user_join").find("*[data-cw_val='open']").addClass("active");

	$("#comm_widget_create_chatroom_category").val( $("#comm_widget_create_chatroom_category").find("option").eq(0).attr("value") );

	$("#comm_widget_create_chatroom_admin_create").prop( "checked", false );
}
function comm_widget_create_chatroom_close(){

	$("#comm_widget_create_chatroom").hide();
	$("#comm_widget_content_chatrooms .comm_widget_content_elements_inner").stop().fadeIn(300);
}


//gruppe_beitreten search
function comm_widget_chatrooms_gruppe_beitreten_search( input_element, search_str ){

	if(search_str == ""){
		input_element.attr("placeholder", input_element.attr("data-placeholder_empty"));
	}
	else{

		input_element.attr("placeholder", input_element.attr("data-placeholder_standard"));

		$("#comm_widget_content_chatrooms_gruppe_beitreten_popular").hide();
		$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content").stop().fadeIn(300);

		$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_list").hide();
		$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_no_result").hide();
		$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_loading").show();

		lc_chatroom_id_receive_search( search_str, function( chatroom_id ){

			if(chatroom_id != ""){

				comm_widget_receive_chatroom_id( "user_create,admin_create", "open", 0, "open", 0, 0, chatroom_id, function(result){

					$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_loading").hide();

					if(result.length){
						comm_widget_chatroom_list_load( "chatrooms_gruppe_beitreten_search",
														$(".comm_widget_chatroom_gruppe_beitreten_list_element_search.clonable"),
														$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_list"),
														result, "title","asc" );
					}
					else{
						$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_no_result").fadeIn(300);
						$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_list").html("");
					}

					$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_list").show();
				});
			}
			else{
				$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_loading").hide();

				$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_no_result").fadeIn(300);
				$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_list").html("");
			}
		});
	}
}


//---------Nachrichten
function comm_widget_nachrichten_load(){

	comm_widget_chatroom_list( "nachrichten", 0, 0 );
}


//---------Support
function comm_widget_support_load(){

	comm_widget_support_plattform_status();
	comm_widget_chatroom_list( "support", 0, 0 );
}
function comm_widget_support_plattform_status(){

	//status supporter (mods)
	var mod_key_str = "";

	rights_get_user( "supporter", function(result){

		for(var x=0; x<result.length; x++){

			mod_key_str += result[x] + ",";
		}
		mod_key_str = mod_key_str.slice(0,-1);

		lc_user_status_receive( mod_key_str, function(result2){

			var mod_online = false;

			for(var x=0; x<result.length; x++){

				if(result2[ result[x] ] == "online"){
					mod_online = true;
					break;
				}
			}

			$("*[data-cw_type='mod_status']").find("*[data-cw_type='mod_status_online'], *[data-cw_type='mod_status_offline']").hide();

			if(mod_online == true){
				$("*[data-cw_type='mod_status']").find("*[data-cw_type='mod_status_online']").show();
			}
			else{
				$("*[data-cw_type='mod_status']").find("*[data-cw_type='mod_status_offline']").show();
			}
			cw_on_resize();
		});
	});
}
function comm_widget_support_plattform_chatbox_init(){

	$("#comm_widget_content_support_chatbox_area").html("");
	$("#comm_widget_chatbox_support_clonable").clone().removeAttr("id").appendTo("#comm_widget_content_support_chatbox_area");

	//settings
	var chatbox = $("#comm_widget_content_support_chatbox_area").find(".comm_widget_chatbox");

	chatbox.find("*[data-lc_type='head']").hide();
	chatbox.find("*[data-lc_type='info']").hide();
	chatbox.find("*[data-lc_type='history']").hide();

	chatbox.find("*[data-lc_type='form']").addClass("inactive");

	chatbox.find(".comm_widget_chatbox_private_empty").show();

	//display
	$("#comm_widget_content_support_menu").hide();
	$("#comm_widget_content_support_chatbox").show();

	temp_set_img_align();
	cw_on_resize();
}
function comm_widget_support_plattform_submit( input_element ){

	var chatbox			= input_element.closest("*[data-lc_type='chatbox']");

	if(chatbox.attr("data-lc_chatroom") == undefined){

		var email = "no-mail";
		var email_input = $("#comm_widget_content_support_chatbox").find(".comm_widget_plattform_support_email");

		if(email_input.length && email_input.css("display") != "none"){
			email = email_input.val()
			if(email == ""){
				ug_alert( "EINE SACHE NOCH", "Bitte E-Mail Adresse eintragen. :)", "Schließen", 0, function(){} );
				email = "";
			}
		}

		var msg = chatbox.find("*[data-lc_type='form_input']").val();

		if(msg != "" && email != ""){
			comm_widget_support_plattform_create(msg, email);
		}
	}

}
function comm_widget_support_plattform_create( msg, email ){

	if(email == "no-mail")
		email = "";

	lc_chatroom_create( email, 1000, "offline", "", "0", function(chatroom_id){

		comm_widget_chatroom_create(chatroom_id, "0", "support_plattform", "", "", function(){

			//chatroom_created
			//add supporter
			rights_get_user( "supporter", function(user_key){

				user_add_counter 	= 0;
				user_add_length 	= user_key.length;

				for(var x=0; x<user_key.length; x++){
					lc_chatroom_add_user( chatroom_id, user_key[x], "offline", function(){

						user_add_counter++;
						if(user_add_counter == user_add_length){

							//init chatbox
							$("#comm_widget_chatbox_private_clonable").find(".comm_widget_chatbox_private_empty").remove();

							comm_widget_chatbox_init( chatroom_id, $("#comm_widget_content_support_chatbox"), $("#comm_widget_content_support_chatbox_area"), $("#comm_widget_chatbox_support_clonable"), 20, function(){
								$("#comm_widget_content_support_chatbox").find("*[data-lc_report='create']").hide();

								//send_msg
								lc_send_msg( chatroom_id, msg );

								$("#comm_widget_content_support_chatbox_area").find("*[data-lc_type='form']").removeClass("inactive");
							});
						}
					});
				}
			});
		});
	});
}

//------search
function comm_widget_search_load(){

	comm_widget_search_init( $("#comm_widget_search_form").find("input").val() );
}
function comm_widget_search_init( search_str ){

	//if search_str=="" > load recommend

	//----kurse

	//----user

	var wrapper = $("#comm_widget_search_user");

	if(search_str != "")
		var wrapper_list = $("#comm_widget_search_user_list");
	else
		var wrapper_list = $("#comm_widget_search_user_recommend_list");


	var task0 = $.Deferred();
	var user_key;

	if(search_str == ""){

		lc_user_recommend(5, function(callback){
			user_key = callback;
			task0.resolve();
		});
	}
	else{

		user_search( search_str, function(callback){
			user_key = callback;
			task0.resolve();
		});
	}

	$.when(task0).done(function(){

		user_list_receive(user_key, function(search_result){

			wrapper_list.css("visibility", "hidden");

			if(search_result != ""){

				var old_elements = wrapper_list.find(".comm_widget_search_user_list_element");

				if(old_elements.length > search_result.length){

					for(var x=0; x<(old_elements.length-search_result.length); x++){

						old_elements.eq(old_elements.length-1-x).remove();
					}
				}
				else if(old_elements.length < search_result.length){

					var clonable_element = wrapper.find(".comm_widget_search_user_list_element.clonable");

					for(var x=0; x<(search_result.length-old_elements.length); x++){

						clonable_element.clone().removeClass("clonable").appendTo( wrapper_list );
						clonable_element = wrapper.find(".comm_widget_search_user_list_element.clonable");
					}
				}

				var lc_user_status_str = "";

				var user_key_arr = [];

				for(var x=0; x<search_result.length; x++){

					user_key_arr[user_key_arr.length] = search_result[x]["user_key"];

					var element_active = wrapper_list.find(".comm_widget_search_user_list_element").eq(x);

					element_active.attr("data-cw_user_key", search_result[x]["user_key"]);

					//icon
					var content_element = element_active.find("*[data-cw_type='user_icon']");
					if(content_element.length){

						content_element.text(search_result[x]["user_key"]);
						lc_retransl(element_active, function(){});
					}

					//name
					var content_element = element_active.find("*[data-cw_type='user_name']");
					if(content_element.length){

						if(search_result[x]["fname"] != null && search_result[x]["fname"] != "" && search_result[x]["lname"] != null && search_result[x]["lname"] != ""){
							content_element.html(search_result[x]["fname"]+" "+search_result[x]["lname"]);

							content_element.show();
							element_active.find("*[data-cw_type='user_name_empty']").show();
						}
						else{
							content_element.hide();
							element_active.find("*[data-cw_type='user_name_empty']").hide();
						}
					}

					//username
					var content_element = element_active.find("*[data-cw_type='user_username']");
					if(content_element.length){

						content_element.text(search_result[x]["username"]);
					}

					var content_element = element_active.find("*[data-cw_type='user_contact_private'], *[data-cw_type='user_contact_support']");
					if(content_element.length){
						content_element.attr("data-cw_user_key", search_result[x]["user_key"]);
					}

					//lc_user_status_str
					lc_user_status_str += search_result[x]["user_key"]+",";
				}

				var task1 = $.Deferred();

				//contact
				var content_element = element_active.find("*[data-cw_type='user_contact']");
				if(content_element.length){
					cw_user_contact_rights_prepare( user_key_arr, 0, function(){
						cw_user_contact_rights_update( user_key_arr, 0 );
						task1.resolve();
					});
				}
				else{
					task1.resolve();
				}

				lc_user_status_str = lc_user_status_str.slice(0,-1);

				var task2 = $.Deferred();

				//lc_user_status
				var content_element = wrapper_list.find("*[data-lc_type='user_status']");
				if(content_element.length){

					content_element.find("*[data-lc_type='user_status_online'], *[data-lc_type='user_status_offline']").hide();

					lc_user_status_receive( lc_user_status_str, function(lc_user_status){

						for(var x=0; x<search_result.length; x++){

							content_element.eq(x).attr("data-lc_user_key", search_result[x]["user_key"] );
							content_element.eq(x).find("*[data-lc_type='user_status_"+lc_user_status[ search_result[x]["user_key"] ]+"']").show();
						}
						task2.resolve();
					});
				}
				else{
					task2.resolve();
				}

				$.when(task1, task2).done(function(){

					wrapper.show();
					if(search_str == ""){
						$("#comm_widget_content_search").find(".comm_widget_search_recommend").show();
						$("#comm_widget_content_search").find(".comm_widget_search_results").hide();
					}
					else{
						$("#comm_widget_content_search").find(".comm_widget_search_recommend").hide();
						$("#comm_widget_content_search").find(".comm_widget_search_results").show();
					}

					wrapper.find(".comm_widget_search_empty").hide();
					wrapper_list.hide().css("visibility","visible").fadeIn(500);

				}).promise();
			}
			else{
				if(search_str != ""){
					wrapper.show();
					$("#comm_widget_content_search").find(".comm_widget_search_recommend").hide();
					$("#comm_widget_content_search").find(".comm_widget_search_results").show();

					wrapper_list.hide();
					wrapper.find(".comm_widget_search_empty").show();
				}
				else{
					wrapper.hide();
				}
			}
		});
	}).promise();
}



//----------------user----------------------------

//user_create (new account / register)
function user_create( user_key, fname, lname, email, pw, kurs_id, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "register",
		user_key 	: user_key,
		fname		: fname,
		lname		: lname,
		email		: email,
		pw 			: pw,
		kurs_id		: kurs_id
	})
	.done(function( data ) {

		if(data == ""){
			callback(1);
			lc_user_register();
		}
		else{
			if(data == "error_email"){
				ug_alert( "E-MAIL VERGEBEN", "Mit dieser E-Mail Adresse wurde bereits ein Account erstellt.", "Schließen", 0, function(){} );
			}
			else{
				ug_alert( "Error", data, "Schließen", 0, function(){} );
			}
		}
	});
}

function user_register_mail( callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task : "register_mail"
	})
	.done(function( data ) {
		if(data == "")
			callback(1);
		else if(data == "already_confirmed")
			ug_alert( "SCHON ERLEDIGT", "Deine E-Mail Adresse wurde bereits bestätigt.", "Schließen", 0, function(){} );
		else if(data == "already_sent")
			ug_alert( "BEREITS GESENDET", "Bitte versuche es in 10 Minuten nochmal.", "Schließen", 0, function(){
				$("#control_dashboard_confirm_img_square").removeClass("blocked");
			});
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function user_register_mail_confirm( key ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 	: "register_mail_confirm",
		key		: key
	})
	.done(function( data ) {
		if(data == "success"){
			document.cookie = "reg_confirm=1";
			login(0,0);
		}
		window.history.replaceState({}, document.title, "/" + "index.html");
	});
}

function user_list_receive( user_key, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 		: "user_list_receive",
		user_key	: user_key
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);
			callback(result);
		}
		else{
			callback("");
		}
	});
}
function user_search( search_str, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/comm_widget.php", {
		task 		: "user_search",
		search_str	: search_str
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);

			callback(result);
		}
		else{
			callback("");
		}
	});
}

//user_update
function user_update( user_key, attr, val, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "user_update",
		user_key	: user_key,
		attr		: attr,
		val			: val
	})
	.done(function( data ) {
		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}


//----------------kurse---------------------------

//----operationen
function kurs_receive(kurs_id, callback){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_receive",
		kurs_id		: kurs_id
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);
			callback(result);
		}
	});
}
function kurs_update(kurs_id, attr, val, callback){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_update",
		kurs_id		: kurs_id,
		attr		: attr,
		val			: val
	})
	.done(function( data ) {
		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function kurs_content_update(type, id, attr, val, callback){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task	: "kurs_content_update",
		type	: type,
		id		: id,
		attr	: attr,
		val		: val
	})
	.done(function(data){

		if(data == "")
			callback(1);
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function kurs_hosting(kurs_id){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_hosting",
		kurs_id		: kurs_id
	})
	.done(function( data ) {

		if(data == ""){
			document.cookie = "control_open=";
			window.location = "hosting.html?pg=dashboard";
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function kurs_memberarea(kurs_id){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_memberarea",
		kurs_id		: kurs_id
	})
	.done(function( data ) {

		if(data == ""){
			document.cookie = "control_open=";
			window.location = "mitgliederbereich.html";
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}


//------------platformwide features
//application
function kurs_application_init(agb){

	//check consent ersteller agb
    consent_check("ersteller_agb", function(consent){

		if(consent === true || agb === true){
            $.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
                task 		: "kurs_application_init"
            })
			.done(function( data ) {
				if(data == ""){
					window.location = "bewerbung.html";
				}
				else if(data == "already_submitted"){
					ug_alert( "BEWERBUNG", "Du hast bereits eine Bewerbung gesendet. Bitte warte ab bis diese beantwortet wurde.", "Schließen", 0, function(){} );
				}
				else
					ug_alert( "Error", data, "Schließen", 0, function(){} );
			});
		}
		else{
            rows_width( $(".agb_widget_checkbox"), $(".agb_widget_text"), $("#agb_widget"), true );
			blk_steps_open($("#agb_ersteller"));
		}
	});
}
function kurs_application_reply_confirm( kurs_id ){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurse_application_reply_confirm",
		kurs_id		: kurs_id
	})
	.done(function( data ) {
		if(data != ""){
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		}
	});
}

//newsfeed
function newsfeed_on_resize(){

	//newsfeed
	var newsfeed_element = $(".newsfeed_element");

	newsfeed_element.each(function(){

		var newsfeed_text 	= $(this).find(".newsfeed_text");
		var nf_row1			= newsfeed_text.find(".newsfeed_rows1");
		var nf_row2			= newsfeed_text.find(".newsfeed_rows2");

		for(var x=0; x<nf_row1.length; x++){

			nf_row1.eq(x).css("width", newsfeed_text.width()-nf_row2.eq(x).width()-10 +"px");
		}
	});
}

//----------------newsfeed--------------------------------
function newsfeed_counter( element, diff ){

	if(!element.hasClass("inactive")){

		var element_val = parseInt( element.text() );

		if(element_val-diff < 1)
			element.stop().fadeOut(300).addClass("inactive");
		else
			element.text( element_val-diff );
	}
}
function newsfeed_list_load(type, newsfeed_wrapper, anzahl, add, callback){

	var start = 0;
	var newsfeed_more = newsfeed_wrapper.find(".newsfeed_more");

	if(newsfeed_more.attr("data-start") != "" && newsfeed_more.attr("data-start") != undefined){
		start = newsfeed_more.attr("data-start");
	}
	if(add == 1)
		start = 0;

	if(type == 0)
		type = newsfeed_wrapper.attr("data-nf_type");


	newsfeed_wrapper.attr("data-nf_type", type);

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "newsfeed_receive",
		type		: type,
		start		: start,
		anzahl		: anzahl
	})
	.done(function( data ) {
		if(add != 1)
			newsfeed_more.show();

		if(data != ""){
			var result = $.parseJSON(data);

			var newsfeed_list = newsfeed_wrapper.find(".newsfeed_list");
			newsfeed_list.css("visibility", "hidden");

			for(var x=0; x<result.length; x++){

				if(!newsfeed_list.find(".newsfeed_element[data-msg_id='"+result[x]["id"]+"']").length){

					if(add != 1)
						newsfeed_wrapper.find(".newsfeed_element.clonable").clone().addClass("empty").appendTo( newsfeed_list );
					else
						newsfeed_wrapper.find(".newsfeed_element.clonable").clone().addClass("empty").prependTo( newsfeed_list );


					var new_element = newsfeed_list.find(".newsfeed_element.empty");

					if(add == 1)
						new_element.hide();

					//general
					new_element.attr("data-msg_id", result[x]["id"]);

					//notifications
					if(result[x]["not"]){
						new_element.addClass("notification");
					}
					else{
						new_element.removeClass("notification");
					}

					//icon
					new_element.find(".newsfeed_icon").find("img").attr("src", glob_cms_home_dir+"temp/media/project/cw_icon/"+result[x]["icon_filename"]);

					//subject
					new_element.find(".newsfeed_subject").html(result[x]["subject"]).attr("title", result[x]["subject"]);

					//subline
					new_element.find(".newsfeed_subline").html(result[x]["subline"]).attr("title", result[x]["subline"]);

					//timestamp
					new_element.find(".newsfeed_timestamp").html(result[x]["timestamp"]).attr("data-lc_transl", "timestamp");

					//comments
					new_element.find(".newsfeed_comments_counter").html(result[x]["comments"]);

					new_element.removeClass("empty").removeClass("clonable");
				}
			}
			if(add != 1){
				if(result[result.length-1]["loaded"] != undefined)
					newsfeed_more.hide();
				else
					newsfeed_more.attr("data-start", parseInt(start)+parseInt(anzahl));
			}
			else
				newsfeed_more.attr("data-start", parseInt(newsfeed_more.attr("data-start"))+1);

			lc_transl( newsfeed_list, function(){

				new_element.show();
				newsfeed_list.css("visibility", "visible");
				newsfeed_on_resize();
			});
		}
		else{
			if(add == 0){
				$("#control_newsfeed_widget_empty").show();
			}
			callback(1);
			newsfeed_more.hide();
		}
	});
}
function newsfeed_post_reset( type, dest_id, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "newsfeed_post_reset",
		type		: type,
		dest_id		: dest_id
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}
//newsfeed_not
function newsfeed_not_reset( not_id, callback, dest_id ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "newsfeed_not_reset",
		not_id		: not_id,
		dest_id		: dest_id
	})
	.done(function( data ) {
		if(data != "" && data != "false"){

			var result 	= $.parseJSON( data );
			var kurs_id = result["kurs_id"];
			var not_id	= result["not_id"];

			if(kurs_id != 0){

				//kurs
				newsfeed_counter( $("#h_dashboard_newsfeed_not_counter"), 1 );

				var kurs_counter_element = $(".control_dashboard_course[data-course_id='"+kurs_id+"']").find(".control_dashboard_course_not");
				newsfeed_counter( kurs_counter_element, 1 );
			}
			if(kurs_id == 0){
				//dashboard
				var counter_element = $("#control_newsfeed_not_counter");
				newsfeed_counter( counter_element, 1 );
			}

			newsfeed_counter( $("#control_open_not"), 1 );

			var newsfeed_element = $(".newsfeed_not").find(".newsfeed_element[data-not_id='"+not_id+"']");
			if(newsfeed_element.length){
				newsfeed_element.stop().slideUp(500, function(){
					newsfeed_element.remove();
				});
			}

			//user > empty
			if($("#control_newsfeed_not_counter").hasClass("inactive")){
				$("#newsfeed_not_readall").slideUp(500);
				$("#control_newsfeed_not_wrapper").fadeOut(500);
			}

			//kurs > empty
			if($("#h_dashboard_newsfeed_not_counter").hasClass("inactive")){
				$("#h_dashboard_newsfeed_not_readall").slideUp(500, function(){
					$("#h_dashboard_newsfeed_not .newsfeed_empty").addClass("active");
				});
			}

			callback(1);
		}
	});
}
function newsfeed_not_location( msg_id, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "newsfeed_not_location",
		msg_id		: msg_id
	})
	.done(function( data ){
		if(data != "")
			callback($.parseJSON(data));
		else
			callback("");
	});
}

//----------------project_msg (posts/reviews/comments/...) ------
function project_msg(type, dest_type, dest_id, layer, subject, content, callback){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "project_msg",
		type		: type,
		dest_type	: dest_type,
		dest_id		: dest_id,
		layer		: layer,
		subject		: subject,
		content		: content
	})
	.done(function( data ) {

		if(data == ""){
			if(layer > 1){
				newsfeed_not_reset(0, function(){}, dest_id);

				if(layer == 2)
					var wrapper = $("*[data-pmsg_type='wrapper'][data-pmsg_id='"+dest_id+"']");
				if(layer == 3){
					var wrapper = $("*[data-pmsg_type='comment_element'][data-pmsg_id='"+dest_id+"']").closest("*[data-pmsg_type='wrapper']");
					newsfeed_not_reset(0, function(){}, wrapper.attr("data-pmsg_id"));
				}
				wrapper.find("*[data-pmsg_type='comment_element'], *[data-pmsg_type='reply_element']").removeClass("notification");
			}
			callback(1);
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

function project_msg_widget_open(){

	var pmsg = $("#project_msg");

	if(!pmsg.hasClass("active")){
		pmsg.addClass("active");
		$("#project_msg_blk").stop().fadeIn(500);

		$("#pmsg_close").css("margin-right", $("#project_msg_inner").width()-$("#project_msg_inner").prop("clientWidth")+10+ "px");
	}
}
function project_msg_widget_close(){

	var pmsg = $("#project_msg");

	if(pmsg.hasClass("active")){
		pmsg.removeClass("active");
		$("#project_msg_blk").stop().fadeOut(500);

		$("#pmsg_comment_more").attr("data-start", "0");
	}
}
function project_msg_init( wrapper, msg_id, callback ){

	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "project_msg_receive",
		msg_id		: msg_id
	})
	.done(function( data ) {

		if(data != ""){

			var result = $.parseJSON(data);

			wrapper.attr("data-pmsg_id", msg_id);
			wrapper.attr("data-pmsg_type", "wrapper");

			var header = wrapper.find("*[data-pmsg_type='header']");

			//icon
			var content_element = header.find("*[data-pmsg_type='icon']");
			if(content_element.length){

				content_element.find("img").attr("src", glob_cms_home_dir+"temp/media/project/"+result["icon_filename"]);
				coverimg(content_element);
			}

			//subject
			var content_element = header.find("*[data-pmsg_type='subject']");
			if(content_element.length){

				content_element.html(result["subject"]);
			}

			//timestamp
			var content_element = header.find("*[data-pmsg_type='timestamp']");
			if(content_element.length){

				content_element.text(result["timestamp"]).attr("data-lc_transl", "timestamp");
			}

			//type
			var content_element = header.find("*[data-pmsg_type='type']");
			if(content_element.length){

				var type_output = "";

				if(result["type"] == "post"){

					type_output = result["user_fname"]+" "+result["user_lname"];

					if(result["kurs_name"] != undefined)
						type_output += " - "+result["kurs_name"];

					content_element.html(type_output);
				}
				if(result["type"].startsWith("unigrow_")){
					type_output = "Unigrow";
					content_element.html(type_output);
				}
			}

			//content
			var content_element = header.find("*[data-pmsg_type='content']");
			if(content_element.length){

				content_element.html(result["content"]);
			}


			//input area
			wrapper.find("*[data-pmsg_type='input_area']").val("");

			//comment_input_icon
			var content_element = wrapper.find("*[data-pmsg_type='input'] *[data-pmsg_type='user_icon']");
			if(content_element.length){

				content_element.text(lc_user_key).attr("data-lc_transl", "user_icon");
			}

			lc_retransl(wrapper.find("*[data-pmsg_type='header'], *[data-pmsg_type='input']"), function(){

				project_msg_layer( wrapper, 2, msg_id, 15, 0, function(){

					callback(1);
				});
			});
		}
	});
}
function project_msg_layer( wrapper, layer, dest_id, anzahl, add, callback ){

	//newsfeed_not
	var not_comment = 0;
	var not_type = getCookie("not_type");

	if(not_type.length){

		var not_number = parseInt(getCookie("not_number"));

		if(not_type == "comment"){
			if(anzahl < not_number+2)
				anzahl = not_number+2;
		}
		if(not_type == "reply"){
			not_comment = getCookie("not_comment");
		}
	}

	var msg_wrapper;
	var msg_clonable;

	if(layer == 2){
		msg_wrapper		= wrapper.find("*[data-pmsg_type='comment_list']");
		msg_clonable	= wrapper.find("*[data-pmsg_type='comment_element'].clonable");
	}
	if(layer == 3){
		msg_wrapper		= wrapper.find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+dest_id+"']").find("*[data-pmsg_type='reply_list']");
		msg_clonable 	= wrapper.find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+dest_id+"']").find("*[data-pmsg_type='reply_element'].clonable");
	}

	var msg_more = msg_wrapper.next("*[data-pmsg_type='more']").eq(0);

	var start = 0;
	if(msg_more.attr("data-start") != "" && msg_more.attr("data-start") != undefined){
		start = msg_more.attr("data-start");
	}
	if(add == 1)
		start = 0;


	$.post( glob_cms_home_dir+"temp/php_request/basic.php", {
		task 		: "project_msg_receive_layer",
		layer		: layer,
		dest_id		: dest_id,
		start		: start,
		anzahl		: anzahl,
		not_comment : not_comment
	})
	.done(function( data ) {

		if(data == ""){
			msg_wrapper.html("");
		}

		if(data != ""){
			var result = $.parseJSON(data);

			if(parseInt(start) == 0 && add != 1){
				msg_wrapper.html("");
			}

			var new_element_counter = 0;

			for(var x=0; x<result.length; x++){

				if(msg_wrapper.find("*[data-pmsg_id='"+result[x]["id"]+"']").length == 0){

					if(add != 1)
						msg_clonable.clone().addClass("empty").appendTo( msg_wrapper );
					else
						msg_clonable.clone().addClass("empty").prependTo( msg_wrapper );

					if(layer == 2)
						var new_element = msg_wrapper.find("*[data-pmsg_type='comment_element'].empty");
					if(layer == 3)
						var new_element = msg_wrapper.find("*[data-pmsg_type='reply_element'].empty");

					if(add == 1)
						new_element.hide();

					new_element.attr("data-pmsg_id", result[x]["id"]);

					//user_icon
					var content_element = new_element.find("*[data-pmsg_type='user_icon']").eq(0);
					if(content_element.length)
						content_element.attr("data-lc_transl", "user_icon").text(result[x]["user_key"]);

					//user_name
					var content_element = new_element.find("*[data-pmsg_type='user_name']").eq(0);
					if(content_element.length){
						if(result[x]["username"] == "removed")
							content_element.html("Nutzer");
						else
							content_element.html(result[x]["fname"]+" "+result[x]["lname"]);
					}

					//content
					var content_element = new_element.find("*[data-pmsg_type='content']").eq(0);
					if(content_element.length)
						content_element.html(result[x]["content"]);


					//timestamp
					var content_element = new_element.find("*[data-pmsg_type='timestamp']").eq(0);
					if(content_element.length)
						content_element.text(result[x]["timestamp"]).attr("data-lc_transl", "timestamp");

					//reply_counter
					if(layer == 2 && result[x]["reply_counter"] != ""){

						var content_element = new_element.find("*[data-pmsg_type='reply_counter']");
						if(content_element.length)
							content_element.text(result[x]["reply_counter"]);
					}
					new_element.removeClass("empty").removeClass("clonable");

					new_element_counter++;
				}
				if(not_type.length){
					if((not_type == "comment" && layer == 2) || (not_type == "reply" && layer == 3)){
						if(not_number > x){
							new_element.addClass("notification");
						}
					}
				}
			}

			if(not_type.length){

				if(layer == 2 && not_type == "reply"){

					var comment_element = wrapper.find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+not_comment+"']");
					var reply_button	= comment_element.find("*[data-pmsg_type='reply_button']");
					var reply_area		= comment_element.find("*[data-pmsg_type='reply_area']");

					reply_button.addClass("loaded");
					reply_area.addClass("active");

					project_msg_layer( wrapper, 3, not_comment, anzahl, 0, function(){
						reply_area.stop().show();
						callback(1);
					});
				}

				//unset cookies
				if((not_type == "comment" && layer == 2) || (not_type == "reply" && layer == 3)){
					document.cookie = "not_type=";
					document.cookie = "not_number=";
					document.cookie = "not_comment=";
				}
			}

			if(result[result.length-1]["loaded"] != undefined)
				msg_more.hide();
			else
				msg_more.attr("data-start", parseInt(start)+parseInt(new_element_counter));

			lc_transl(msg_wrapper, function(){
				if(add == 1){
					new_element.slideDown(500);

					if(layer == 3){
						var reply_counter = msg_wrapper.closest("*[data-pmsg_type='comment_element']").find("*[data-pmsg_type='reply_counter']");
						var new_val = parseInt(reply_counter.text())+1;
						if(reply_counter.text() == "")
							new_val = 1;
						reply_counter.text( new_val );
					}
				}
				if(!not_type.length || ((not_type == "comment" && layer == 2) || (not_type == "reply" && layer == 3)))
					callback(1);
			});
		}
		else{
			var input_area = msg_wrapper.prev("*[data-pmsg_type='input_area']");

			if(input_area.attr("data-placeholder_first") != undefined)
				input_area.eq(0).attr("placeholder", input_area.attr("data-placeholder_first"));

			msg_more.hide();
			callback(1);
		}
	});
}


//------------logout
function logout(){

	$.post( glob_cms_home_dir+"temp/php_request/logout.php")
	.done(function( data ){

		if(data == ""){
			window.location = "index.html";
		}
		else
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}


$(document).ready(function(){

	//webtab focus
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    document.addEventListener(visibilityChange, function(){
        documentFocus = !document.hidden;
    });

	//general
	init_html();
	on_resize();
	//on-resize
	$(window).resize(function(){
		on_resize();
	});

	window_scroll_cache = $(window).scrollTop();

	//cw_course_create_number > get 'cw_user_status'
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task : "kurs_create_number"
	})
	.done(function( data ) {
		cw_course_create_number = data;
	});

	rights_receive( function(result){
		rights = result;
	});

	//--------------cookies------------------
	if(!getCookie("cookie_info")){
		$("#cookies").addClass("active");
	}
	$("#cookies_button_accept").click(function(){
		$("#cookies").removeClass("active");
		document.cookie = "cookie_info=1";
	});

	//---------------newsfeed--------------
	$("#wrapper").on("click", ".newsfeed_element[data-msg_id]", function(event){

		var this_element = $(event.target).closest(".newsfeed_element");
		var msg_id		 = this_element.attr("data-msg_id");

		if(this_element.hasClass("notification")){
			newsfeed_post_reset( "msg", msg_id, function(){
				this_element.removeClass("notification");

				var counter_element = $("#control_newsfeed_post_counter");

				newsfeed_counter( counter_element, 1 );
				newsfeed_counter( $("#control_open_not"), 1 );

				if(counter_element.hasClass("inactive")){
					$("#control_newsfeed_wrapper").find(".newsfeed_readall").slideUp(500);
				}
			});
		}

		project_msg_init( $("#project_msg"), msg_id, function(){

			$("#pmsg_content_subject").css("width", $("#pmsg_content_text").width()-$("#pmsg_content_timestamp").width()-20 +"px");

			//ready
			project_msg_widget_open();
		});
	});
	$("#newsfeed_post_readall").click(function(){

		var this_element		= $(this);
		var newsfeed_wrapper 	= this_element.closest(".newsfeed_wrapper");

		var type	 	= newsfeed_wrapper.attr("data-newsfeed_type");
		var dest_id 	= newsfeed_wrapper.attr("data-newsfeed_dest");

		newsfeed_post_reset( type, dest_id, function(){

			var notification_elements = newsfeed_wrapper.find(".newsfeed_element.notification");

			var counter_element = $("#control_newsfeed_post_counter");

			newsfeed_counter( counter_element, notification_elements.length );
			newsfeed_counter( $("#control_open_not"), notification_elements.length );

			notification_elements.removeClass("notification");
			this_element.slideUp(500);
		});
	});
	$(".newsfeed_more").click(function(){

		newsfeed_list_load( 0, $(this).closest(".newsfeed_wrapper"), 10, 0, function(){});
	});

	//-------newsfeed_not
	$(".newsfeed_not").each(function(){
		lc_transl($(this), function(){});
	});

	$(".newsfeed_not_read").click(function(event){

		var this_element 	 = $(this);
		var newsfeed_element = this_element.closest(".newsfeed_element");
		var not_id 			 = newsfeed_element.attr("data-not_id");

		newsfeed_not_reset( not_id, function(){} );
	});

	$("#newsfeed_not_readall, #h_dashboard_newsfeed_not_readall").click(function(){

		var this_element		= $(this);
		var newsfeed_wrapper 	= this_element.closest(".newsfeed_not");
		var not_type			= newsfeed_wrapper.attr("data-not_type");

		var notification_elements = newsfeed_wrapper.find(".newsfeed_element");

		if(not_type == "user")
			var counter_element = $("#control_newsfeed_not_counter");
		if(not_type == "kurs")
			var counter_element = $("#h_dashboard_newsfeed_not_counter");

		newsfeed_counter( counter_element, notification_elements.length );
		newsfeed_counter( $("#control_open_not"), notification_elements.length );

		notification_elements.slideUp(500);
		this_element.slideUp(500);

		newsfeed_not_reset(not_type, function(){});
	});

	$(".newsfeed_not .newsfeed_element").on("click", function(event){

		var this_element 	 = $(event.target);

		if(!this_element.closest(".newsfeed_not_read").length){


			this_element		 = this_element.closest(".newsfeed_element");
			var not_id 			 = this_element.attr("data-not_id");
			var not_type 		 = this_element.attr("data-not_type");
			var not_number 		 = this_element.attr("data-not_number");
			var not_msg_id 		 = this_element.attr("data-not_msg_id");

			newsfeed_not_reset( not_id, function(){

				//unset cookies
				document.cookie = "not_type=";
				document.cookie = "not_number=";
				document.cookie = "not_comment=";

				//set cookies
				document.cookie = "not_type="+not_type;
				document.cookie = "not_number="+not_number;

				//reply
				if(not_type == "reply"){
					document.cookie = "not_comment="+not_msg_id;
				}

				//php request for msg_location
				newsfeed_not_location( not_msg_id, function(result){

					this_element.stop().slideUp(500, function(){
						this_element.remove();
					});

					//post
					if(result["type"] == "pmsg"){
						var wrapper = $("#project_msg");
						project_msg_init( wrapper, result["pmsg_id"], function(){
							project_msg_widget_open();

							if(not_type == "reply"){
								var scroll = wrapper.find("*[data-pmsg_type='comment_element'][data-pmsg_id='"+not_msg_id+"']").position().top;
								$("#project_msg_inner").scrollTop( scroll );
							}
						});
					}

					//module
					if(result["type"] == "module"){

						document.cookie = "m_module_open="+result["module_id"];
						kurs_memberarea( result["kurs_id"] );
					}

					//reviews
					if(result["type"] == "review"){
						document.cookie = "not_rev_id="+result["rev_id"];
						document.cookie = "control_open=";
						window.location = "kurs.html?p="+html_decode(result["get_param"]);
					}

					//kurs > new review
					if(result["type"] == "kurs"){
						document.cookie = "control_open=";
						window.location = "kurs.html?p="+html_decode(result["get_param"]);
					}
				});

			});
		}
	});


	//--------------project_msg-------------

	$("#wrapper").on("input", "*[data-pmsg_type='wrapper'] *[data-pmsg_type='input_area']", function(event){

		var this_element	= $(event.target);
		var area_element	= this_element;
		var input_val 		= this_element.val();

		var input_wrapper	= this_element.closest("*[data-pmsg_type='input']");
		var submit_element 	= input_wrapper.find("*[data-pmsg_type='input_submit']");
		var input_icon		= input_wrapper.find("*[data-pmsg_type='user_icon']");

		if(!submit_element.hasClass("active")){

			if(input_val != ""){
				input_wrapper.addClass("edit");
				submit_element.stop().fadeIn(300);
				submit_element.addClass("active");
			}
		}
	});
	$("#wrapper").on("click", "*[data-pmsg_type='input_submit']", function(event){

		var this_element	= $(event.target).closest("*[data-pmsg_type='input_submit']");

		if(!this_element.hasClass("disabled")){

			this_element.addClass("disabled");

			var pmsg_wrapper	= this_element.closest("*[data-pmsg_type='wrapper']");

			var input_wrapper	= this_element.closest("*[data-pmsg_type='input']");
			var pmsg			= input_wrapper.closest("*[data-pmsg_id]");

			var area_element	= input_wrapper.find("*[data-pmsg_type='input_area']");
			var submit_element 	= this_element;

			var content			= area_element.val();

			var dest_type 		= pmsg.attr("data-pmsg_type");
			var dest_id			= pmsg.attr("data-pmsg_id");

			var type, layer;
			if(!pmsg.hasClass("pmsg_comment_element")){
				layer 		= 2;
				type 		= "comment";
			}
			else{
				layer 		= 3;
				type 		= "reply";
			}

			if(content != ""){

				project_msg(type, dest_type, dest_id, layer, "", content, function(){

					submit_element.removeClass("active");
					input_wrapper.stop().slideUp(500, function(){
						project_msg_layer( pmsg_wrapper, layer, dest_id, 1, 1, function(){});
					});
				});
			}
		}
	});
	$("#wrapper").on("click", "*[data-pmsg_type='wrapper'] *[data-pmsg_type='more']", function(event){

		var this_element	= $(event.target);
		var pmsg_wrapper	= this_element.closest("*[data-pmsg_type='wrapper']");

		var dest_element 	= this_element.closest("*[data-pmsg_id]");
		var dest_id 		= dest_element.attr("data-pmsg_id");

		var layer 			= 2;

		if(dest_element.hasClass("pmsg_comment_element"))
			layer = 3;

		project_msg_layer( pmsg_wrapper, layer, dest_id, 15, 0, function(){});
	});

	$("#wrapper").on("click", "*[data-pmsg_type='reply_button']", function(event){

		var this_element	= $(event.target);
		var pmsg_wrapper	= this_element.closest("*[data-pmsg_type='wrapper']");

		var comment_element = this_element.closest("*[data-pmsg_type='comment_element']");
		var pmsg_id 		= comment_element.attr("data-pmsg_id");

		var reply_area 		= comment_element.find("*[data-pmsg_type='reply_area']");

		if(!this_element.hasClass("loaded")){

			this_element.addClass("loaded");
			reply_area.addClass("active");

			project_msg_layer( pmsg_wrapper, 3, pmsg_id, 10, 0, function(){
				reply_area.stop().slideDown(500);
			});
		}
		else{
			if(reply_area.hasClass("active")){
				reply_area.stop().slideUp(500).removeClass("active");
			}
			else{
				reply_area.stop().slideDown(500).addClass("active");
			}
		}
	});

	$("#pmsg_close").click(function(){

		project_msg_widget_close();
	});

	//---------------control-----------------------
    control_init();

	if(get_control == 0){

		if(getCookie("control_open") != ""){
			control_open(1);
		}

		$(window).load(function(){

			if(getCookie("login_reload") == "1")
				login_reload = true;

			$.doTimeout(1000, function(){
				control_open_element();
				if(login_reload == true){
					if(getCookie("register") == "1"){

						user_register_mail(function(){});

						document.cookie = "register=";

						login_reload = false;
					}
					else if(getCookie("welcome_push") != ""){
						//welcome_push
						user_name_receive(lc_user_key, function(name){
							comm_widget_notifications_push( "unigrow", "", "Willkommen zurück "+name[0]+"! ;)", "report" );
						});
						document.cookie = "welcome_push=";
					}
					document.cookie = "login_reload=";
				}
			});
		});
	}
	else{
		if(get_control == "open"){
			control_open(1);
		}
		if(get_control == "close"){
			control_close();
		}
	}

	//registration confirm
	var getParam_rc = getParam( "rc" );
	if(getParam_rc != "" && getParam_rc != null)
		user_register_mail_confirm( getParam_rc );

	if(getCookie("reg_confirm") == "1"){

		//welcome blk_msg
		blk_steps_open($("#welcome"));

		$("#welcome_close").click(function(){
			blk_steps_close($("#welcome"));
			if (getCookie("buy_login_first") != "") {
				control_close();
				var url = "kurs.html?p=" + getCookie("buy_login_first");
				document.cookie = "buy_login_first=";
                document.cookie = "buy_trigger=1";
				window.location = url;
			}
		});

		document.cookie = "reg_confirm=";
	}

	//application_result
	if($("#application_result").length){
		blk_steps_open($("#application_result"));

		$(".application_result_close").click(function(){

			kurs_application_reply_confirm( $("#application_result").attr("data-kurs_id") );

			blk_steps_close($("#application_result"));
		});
	}

	//------nav

	//control_open
	$("#control_open").click(function(){
		control_open();
	});
	//control_close
	$("#control_nav_close").click(function(){
		control_close();
	});

	//marketplace
	$(".control_nav_bar_marketplace").click(function(){
		if(glob_cms_filename == "index.html"){
			control_close();
		}
		else{
			document.cookie = "control_open=";
			window.location = "index.html";
		}
	});

	//kurserstellung
	$(".control_nav_bar_kurserstellung").click(function(){
		if(glob_cms_filename == "bewerbung.html"){
			control_close();
		}
		else{
			document.cookie = "control_open=";
			kurs_application_init(false);
		}
	});
	$("#agb_ersteller_submit").click(function(){
        if($("#agb_widget_checkbox_input").is(":checked")) {
            kurs_application_init(true)
        }
        else{
            ug_alert("KURSERSTELLER AGB", "Du musst den Kursersteller AGB zustimmen um fortzufahren!", "Okay", 0, function(){});
		}
	});

	//logout
	$(".control_nav_bar_logout").click(function(){

		ug_alert( "ABMELDEN", "Möchtest du dich wirklich abmelden?", "Weiter", "Abbrechen", function(result){
			if(result == true)
				logout();
		});
	});

	//------login
	if(login_bool == false){

		if(reg_confirm == false){

			tt_form_submit($("#control_login_form_login"), function(callback){

				if(callback){
					login($("#control_login_form_login_username").val(), $("#control_login_form_login_pw").val());
				}
				else
					ug_alert( "ANMELDUNG FEHLGESCHLAGEN", "Bitte alle benötigten Felder ausfüllen.", "Schließen", 0, function(){});
			});

			//reset password
			$("#control_login_form_login_pw_reset").click(function(){

				var email = $("#control_login_form_login_username").val();

				if(email.length){

					ug_alert( "PASSWORT ZURÜCKSETZEN", "Wir senden an deinen Account <span class='ug_alert_mark'>"+email+"</span> eine E-Mail zum Zurücksetzen deines Passworts.", "E-Mail anfordern", "anderer Account", function(){

						reset_password_mail( email );
					});

				}
				else{
					ug_alert( "E-MAIL EINGEBEN", "Gib zum Zurücksetzen deines Passworts bitte deine E-Mail an. :)", "Schließen", 0, function(){} );
				}
			});

			//register
			$(".control_login_form_register").each(function(){

				//init data_policy form
				rows_width( $(".control_login_form_register_datapolicy_checkbox"), $(".control_login_form_register_datapolicy_text"), $(".control_login_form_register_datapolicy"), true );

				tt_form_submit($(this), function(form){

					if(form){

						if(form.find(".control_login_form_register_datapolicy_checkbox input:checked").length){

							var username 	= form.find(".control_login_form_register_username").val();
							var pw 			= form.find(".control_login_form_register_pw").val();
							var fname 		= form.find(".control_login_form_register_fname").val();
							var lname 		= form.find(".control_login_form_register_lname").val();
							var email 		= form.find(".control_login_form_register_email").val();

							var course_id 	= 0;
							var demo_freecourses = form.closest("#demo_present_member_freecourse.register");
							if(demo_freecourses.length){
								course_id = demo_freecourses.find(".kurs_tile_element_wrapper.register").attr("data-course_id");
							}

							user_create( 	lc_user_key,
											fname,
											lname,
											email,
											pw,
											course_id,
											function(){

								//registrierung erfolgreich
								document.cookie = "register=1";

								login(email, pw);
							});
						}
						else{
							ug_alert( "EINE SACHE NOCH", "Bitte stimme den Datenschutzbestimmungen zu. :)", "Schließen", 0, function(){} );
							form.find(".control_login_form_register_datapolicy").addClass("active");
						}
					}
					else
						ug_alert( "REGISTRIEREN", "Bitte fülle alle benötigten Felder aus. :)", "Schließen", 0, function(){} );
				});
			});
		}
		else{

			$("#control_dashboard_confirm_img_square").click(function(){

				var this_element = $(this);

				if(!this_element.hasClass("sent")){

					if(!this_element.hasClass("blocked")){

						this_element.addClass("blocked");

						user_register_mail(function(){
							this_element.addClass("sent");

							ug_alert( "DU HAST POST!", "Wir haben dir eine Bestätigungsmail gesendet. ;)", "Schließen", 0, function(){});
						});
					}
				}
			});
		}
	}


	if($("#pwr_steps").length){
		reset_password_init( $("#pwr_steps").attr("data-key") );

		$("#pwr_confirm").click(function(){

			var pw1 = $("#pwr_input1").val();
			var pw2 = $("#pwr_input2").val();

			var key = $("#pwr_steps").attr("data-key");

			if(pw1 != ""){

				if(pw1 == pw2){
					reset_password( pw1, key );
				}
				else{
					ug_alert( "UNGLEICHE PASSWÖRTER", "Du hast zwei unterschiedliche Passwörter eingegeben.", "Schließen", 0, function(){} );
				}
			}
		});
	}

	$(".control_login_form_button").click(function(){
		control_login_switch();
	});

	//----demo
	if($("#control").hasClass("demo")){

		if(!$("#control").hasClass("active")){
			control_open(1);
		}

		if(glob_cms_device == "mobile"){
			$(this).removeClass("active");
			demo_mobile_open();
		}
		else{
			demo_open();
		}
	}
	if(glob_cms_device == "mobile"){
		$(".demo_present_content").each(function(){
			$(this).after( $(this).closest(".demo_present_wrapper").find(".demo_present_text") );
		});
	}
	$("#demo_open").click(function(){

		demo_open();
	});
	$("#demo_open_mobile").click(function(){

		demo_mobile_open();
	});

	$(".demo_button:not(#demo_story_button)").click(function(){
		$(this).closest(".demo_pages.active").removeClass("active").addClass("inactive").next(".demo_pages").addClass("active");
	});
	$("#demo_close").click(function(){
		demo_close();
	});


	//demo_nav
	$(".demo_nav_element").click(function(){
		if(!$(this).hasClass("inactive")){
			$(this).addClass("inactive");

			$(".demo_present_element").removeClass("active");

			var present_element;

			if($(this).attr("id") == "demo_nav_member")
				present_element = $("#demo_present_member");
			else
				present_element = $("#demo_present_coach");

			$(".demo_pages.active").removeClass("active").addClass("inactive").next(".demo_pages").addClass("active");

			present_element	.addClass("active")
							.find(".demo_pages").eq(0).addClass("active");

			var active_page = $("demo_pages.active");
			var video = active_page.find(".demo_present_content_video");
			if(video.length == 1){

				new MediaElementPlayer(video.find(".demo_present_content_video_player")[0], {
					pluginPath: glob_cms_home_dir+"temp/mediaelement_master/build/",
					enableKeyboard: false,
					features: []
				});
			}

			on_resize();
		}
	});

	//demo_intro
	$("#demo_story_button").click(function(){
		$("#demo_intro").animate({scrollTop: $("#demo_intro_top").outerHeight(true)-(window.innerHeight*0.1)}, 600);
	});

	//demo_freecourses
	$("#demo_present_member_freecourse").find("a").each(function(){
		$(this).contents().unwrap();
	});
	$("#demo_present_member_freecourse").find(".kurs_tile_element_text_button").text("JETZT BEITRETEN").attr("onclick", "");
	$("#demo_present_member_freecourse").find(".kurs_tile_element_wrapper, .kurs_tile_element_text_button").click(function(event){

		var kurs_element = $(this).closest(".kurs_tile_element_wrapper");
		$("#demo_present_member_freecourse").find(".kurs_tile_element_wrapper").removeClass("register");
		kurs_element.addClass("register");
		$("#demo_present_member_freecourse").stop().fadeOut(500, function(){
			$(this).addClass("register").fadeIn(500);
		});

		$("#demo_close").stop().fadeOut(300);
	});

	$("#demo_present_member_freecourse_courses_register_back").click(function(){

		$("#demo_present_member_freecourse").stop().fadeOut(500, function(){
			$(this).removeClass("register").fadeIn(500);
		});
		$("#demo_close").stop().fadeIn(300);
	});
	$("#demo_present_member_freecourse_courses_register_only").click(function(){
		demo_close();
	});

	//------dashboard

	//logout
	if(!$("#control_dashboard").find(".control_dashboard_rows").length)
		$("#control_dashboard").css("height", window.innerHeight);

	//profile_edit
	//dropzone > pb
	if(login_bool == true && $("#control_dashboard_icon_dropzone").length){
		dropzone_open($("#control_dashboard_icon_dropzone"), $(".control_dropzone_single.clonable"), "pb", 0, function(id, filename){

			user_update( lc_user_key, "icon_type", "img", function(){
				user_update( lc_user_key, "icon", id, function(){

					var img_element = $("#control_dashboard_icon").find("img");
					if(!img_element.length){
						$("#control_dashboard_icon").html("<img src='' alt='Profilbild' />");
						img_element = $("#control_dashboard_icon").find("img");
					}
					img_element.attr("src", glob_cms_home_dir+"temp/media/project/"+filename);
				});
			});
		});
	}
	//descr
	$("#control_dashboard_widget_profile_descr_input").on("input", function(event){

		var submit_element = $("#control_dashboard_widget_profile_descr_submit");

		if($(event.target).val() != "" && !submit_element.hasClass("active")){
			submit_element.stop().slideDown(500).addClass("active");
		}
	});
	$("#control_dashboard_widget_profile_descr_submit").click(function(){

		var input_element = $("#control_dashboard_widget_profile_descr_input");
		var this_element = $(this);

		user_update(lc_user_key, "descr", input_element.val(), function(){
			this_element.stop().slideUp(500);
		});
	});

	//social_network
	$(".control_dashboard_social_net_input").on("input", function(event){

		var submit_element = $(event.target).closest(".control_dashboard_social_net").find(".control_dashboard_social_net_submit");

		if(!submit_element.hasClass("active")){
			submit_element.stop().fadeIn(500).addClass("active");
			$(event.target).addClass("edit");
		}
	});
	$(".control_dashboard_social_net_submit").click(function(){

		var this_element = $(this);
		var input_element = this_element.closest(".control_dashboard_widget_subline").find(".control_dashboard_social_net_input");

		var db_attr = this_element.closest(".control_dashboard_social_net").attr("data-socnet_type")+"_link";

		user_update(lc_user_key, db_attr, input_element.val(), function(){
			this_element.stop().fadeOut(500, function(){
				input_element.removeClass("edit");
			});
		});
	});

	//newsfeed
	if(login_bool == true)
		newsfeed_list_load( "user_dashboard", $("#control_newsfeed_wrapper"), 10, 0, function(){});

	//unigrow post
	if($("#control_dashboard_unigrow_post").length){

		$("#control_dashboard_unigrow_post_title:not(.active)").click(function(){

			$(this).addClass("active");
			$("#control_dashboard_unigrow_post").stop().slideDown(500);
		});

		$(".control_dashboard_unigrow_post_dest_element").click(function(){

			if(!$(this).hasClass("active")){
				$(".control_dashboard_unigrow_post_dest_element").removeClass("active");
				$(this).addClass("active");
			}
		});

		$("#control_dashboard_unigrow_post_subject, #control_dashboard_unigrow_post_content").on("input", function(){

			if(!$("#control_dashboard_unigrow_post_submit").hasClass("active")){
				if(	$("#control_dashboard_unigrow_post_subject").val() != "" &&
					$("#control_dashboard_unigrow_post_content").val() != ""){

					$("#control_dashboard_unigrow_post_submit").addClass("active").slideDown(500);
				}
			}
		});

		$("#control_dashboard_unigrow_post_submit").click(function(){

			var this_element = $(this);

			if(this_element.hasClass("active")){

				var subject = $("#control_dashboard_unigrow_post_subject");
				var content = $("#control_dashboard_unigrow_post_content");

				if(subject.val() != "" && content.val() != ""){

					var type = "unigrow_" + $(".control_dashboard_unigrow_post_dest_element.active").attr("data-unigrow_dest");

					project_msg(type, 0, 0, 1, subject.val(), content.val(), function(){

						this_element.removeClass("active").slideUp(500);
						subject.val("");
						content.val("");
						$("#control_dashboard_unigrow_post").slideUp(500);
						$("#control_dashboard_unigrow_post_title").removeClass("active");

						newsfeed_list_load( 0, $("#control_newsfeed_wrapper"), 1, 1, function(){});
					});
				}
				else{
					ug_alert( "UNIGROW POST", "Bitte alle Felder ausfüllen. :)", "Schließen", 0, function(){} );
				}
			}
		});
	}

	//courses
	$("#control_dashboard_creator_post_title").click(function(){

		var this_element = $(this);

		if(!this_element.hasClass("active")){

			this_element.addClass("active");
			$("#control_dashboard_creator_post").stop().slideDown(500);
		}
	});
	$("#control_dashboard_creator_post_subject, #control_dashboard_creator_post_content").on("input", function(){

		var submit_button = $("#control_dashboard_creator_post_submit");

		if(!submit_button.hasClass("active")){

			if($("#control_dashboard_creator_post_subject").val() != "" && $("#control_dashboard_creator_post_content").val() != "")
				submit_button.addClass("active").stop().slideDown(500);
		}
	});
	$("#control_dashboard_creator_post_submit").click(function(){

		var submit_element = $(this);

		var subject = $("#control_dashboard_creator_post_subject").val();
		var content = $("#control_dashboard_creator_post_content").val();

		if(submit_element.hasClass("active") && subject != "" && content != ""){

			project_msg("post", "creator", "", 1, subject, content, function(){

				submit_element.removeClass("active").stop().hide();
				$("#control_dashboard_creator_post").stop().slideUp(500);
				$("#control_dashboard_creator_post_title").removeClass("active");
				$("#control_dashboard_creator_post_subject").val("");
				$("#control_dashboard_creator_post_content").val("");

				newsfeed_list_load( 0, $("#control_newsfeed_wrapper"), 1, 1, function(){});
			});
		}
		else{
			ug_alert( "POST AN KURSTEILNEHMER", "Bitte gib einen Betreff und eine Nachricht für deinen Post ein. :)", "Schließen", 0, function(){} );
		}
	});

	$("#control").on("mouseenter", ".control_dashboard_course[data-course_id]", function(event){

		var this_element 	= $(event.target).closest(".control_dashboard_course");
		var course_id 		= this_element.attr("data-course_id");

		control_course_mouseenter( course_id );
	});

	$("#control").on("mouseleave", ".control_dashboard_course[data-course_id]", function(event){

		control_course_mouseleave();
	});

	$(".control_dashboard_course.created").click(function(){

		if(!$(this).find(".control_dashboard_course_status_application").length){

			if(glob_cms_device == "desktop")
				kurs_hosting($(this).attr("data-course_id"));
			else{
				if($(this).find(".control_dashboard_course_publish").length){
					ug_alert( "MOBILE VERSION", "Unsere mobile Version unterstützt leider noch kein umfangreiches Kurshosting. Das tut uns leid. :(", "Schließen", 0, function(){} );
				}
				else{
					ug_alert( "MOBILE VERSION", "Unsere mobile Version unterstützt leider noch kein umfangreiches Kurshosting. Weiter zum Mitgliederbereich?", "Ja", "Nein", function(result){
						if(result == true)
							kurs_memberarea($(this).attr("data-course_id"));
					});
				}
			}
		}
		else{
			ug_alert("BEWERBUNG ERHALTEN", "Wir werden Dich so schnell wie möglich informieren. :)", "Schließen", 0, function(){});
		}
	});

	$(".control_dashboard_course:not(.created)").click(function(){
		kurs_memberarea($(this).attr("data-course_id"));
	});



	//---------------comm_widget-----------------

	//open/close
	if(!getCookie("comm_widget_open").length){
		document.cookie = "comm_widget_open=0";
	}
	else{
		if(getCookie("comm_widget_open") == "1")
			comm_widget_show(true);
	}

	$("#comm_widget_open, #comm_widget_close").click(function(){

		if(!$("#comm_widget_push").hasClass("active")){

			if($("#comm_widget").hasClass("active"))
				comm_widget_hide();
			else
				comm_widget_show();
		}
	});

	//push disable/enable
	if(getCookie("comm_widget_push") == "0")
		$("#comm_widget_push_active").css("visibility", "visible");

	$("#comm_widget_push_mute").click(function(){

		comm_widget_push_hide();
		document.cookie = "comm_widget_push=0";
		$("#comm_widget_push_active").css("visibility", "visible");
	});
	$("#comm_widget_push_active").click(function(){
		document.cookie = "comm_widget_push=1";
		$("#comm_widget_push_active").css("visibility", "hidden");
	});

	//push
	$("body").on("click", "#comm_widget_push_inner[data-cw_chatroom]", function(event){

		if(!$(event.target).closest("#comm_widget_push_input").length){

			var this_element = $(event.target).closest("#comm_widget_push_inner");

			comm_widget_show(false, this_element.attr("data-cw_chatroom"));

			this_element.attr("data-cw_chatroom", "");

			$.doTimeout("comm_widget_push_inner");
			comm_widget_push_hide();
		}
	});

	$("#comm_widget_push").hover(function(){

		if($(this).attr("data-cw_chatroom") != ""){
			$.doTimeout("comm_widget_push_inner");
			comm_widget_push_show();
		}

	}, function(){
		if(!$("#comm_widget_push_input").find("textarea:focus").length){
			$.doTimeout("comm_widget_push_inner", 2000, function(){
				comm_widget_push_hide();
			});
		}
	});
	$("#comm_widget_push_input").find("textarea").focusout(function(){
		comm_widget_push_hide();
	});
	$("#comm_widget_push_input").find("form").submit(function(){
		comm_widget_push_msg();
	});
	$("#comm_widget_push_input").find("textarea").keypress(function(event){

		if(event.which == 13)
			comm_widget_push_msg();
	});

	//scrolling
	/* überarbeiten > alternative suchen > probleme touchpad
	$("body").on( 'mousewheel DOMMouseScroll', ".comm_widget_content_elements, .comm_widget_content_chat_history, .comm_widget_chatbox_settings", function (ev) {

		var $this = $(this),
			scrollTop = this.scrollTop,
			scrollHeight = this.scrollHeight,
			height = $this.height(),
			delta = (ev.type == 'DOMMouseScroll' ?
				ev.originalEvent.detail * -40 :
				ev.originalEvent.wheelDelta),
			up = delta > 0;

		var prevent = function() {
			ev.stopPropagation();
			ev.preventDefault();
			ev.returnValue = false;
			return false;
		}

		if (!up && -delta > scrollHeight - height - scrollTop) {
			// Scrolling down, but this will take us past the bottom.
			$this.scrollTop(scrollHeight);
			return prevent();
		} else if (up && delta > scrollTop) {
			// Scrolling up, but this will take us past the top.
			$this.scrollTop(0);
			return prevent();
		}
	});*/

	//nav_elements
	$(".comm_widget_nav_elements:not(.comm_widget_nav_elements_bottom)[data-content]").click(function(){

		$("#comm_widget_content_menu_wrapper").show();
		$("#comm_widget_user_profile").hide();
		$("#comm_widget_content_loading").hide();

		var menu = $(this).attr("data-content");

		if($("#comm_widget_img").css("display") != "none")
			comm_widget_img_close();

		if($("*[data-lc_type='chatbox'][data-lc_chatroom]").length)
			comm_widget_chatbox_close( $("*[data-lc_type='chatbox'][data-lc_chatroom]") );

		comm_widget_menu_open( menu );
	});
	$("#comm_widget_nav_size").click(function(){

		var this_element = $(this);
		var comm_widget = $("#comm_widget");

		if(this_element.hasClass("min")){
			comm_widget.addClass("small");
			this_element.removeClass("min").addClass("max");
			$("#comm_widget_blk").stop().fadeOut(300);
		}
		else{
			$("#comm_widget").removeClass("small");
			this_element.removeClass("max").addClass("min");
			$("#comm_widget_blk").stop().fadeIn(300);
		}
		cw_on_resize();
	});

	//-------cw_img link
	$("body").on("click", "*[data-cw_link='cw_img']", function(event){

		var this_element 	= $(event.target).closest("*[data-cw_link='cw_img']");
		var filename		= this_element.attr("data-cw_filename");

		if(filename != "" && filename != undefined){

			comm_widget_img_open("img", filename);
		}
		else{
			comm_widget_img_open("html", this_element.html());
		}
	});
	$("#comm_widget_img_cancel").click(function(){
		comm_widget_img_close();
	});

	//-------search

	$("#comm_widget_search_form").submit(function(){

		var search_str = $(this).find("input").val();

		if(search_str != ""){

			comm_widget_search_init(search_str);
		}
	});
	$("#comm_widget_search_form").find("input").on("input", function(event){

		if($(event.target).val() == ""){

			//user_search
			$("#comm_widget_content_search").find(".comm_widget_search_recommend, .comm_widget_search_results").hide();
			comm_widget_search_init("");
		}
	});

	$("#wrapper").on("click", ".comm_widget_search_list_element:not(.clonable)", function(event){

		var this_element = $(event.target);

		if(this_element.closest(".comm_widget_search_list_element_buttons_rows").length == 0){

			var this_element = $(event.target).closest("*[data-cw_user_key]");
			var user_key = this_element.attr("data-cw_user_key");

			comm_widget_user_profile_init( user_key );
			$("#comm_widget_search").stop().fadeOut(300);
		}
	});

	//username_click
	$("#wrapper").on("click", "*[data-cw_link='user_profile'][data-cw_user_key], *[data-cw_link='user_profile']>*[data-cw_user_key]", function(event){

		var this_element = $(event.target).closest("*[data-cw_user_key]");
		var user_key = this_element.attr("data-cw_user_key");

		if( $(event.target).closest("*[data-cw_type='user_contact_private'], *[data-cw_type='user_contact_support']").length == 0 ){
			comm_widget_user_profile_init( user_key );
			if(!$("#comm_widget").hasClass("active"))
				comm_widget_show();
		}
	});

	//close
	$("#comm_widget_user_profile_cancel").click(function(){

		$("#comm_widget_user_profile").hide();
		$("#comm_widget_content_menu_wrapper").stop().fadeIn(300);
	});

	//contact
	$("#wrapper").on("click", "*[data-cw_type='user_contact_private'], *[data-cw_type='user_contact_support']", function(event){

		var this_element = $(event.target);

		var user_key = this_element.closest("*[data-cw_user_key]").attr("data-cw_user_key");

		if(user_key != undefined){

			var contact = this_element.closest("*[data-cw_type='user_contact_private'], *[data-cw_type='user_contact_support']").attr("data-cw_type");

			var chatroom_type_search, chatbox_area, chatbox_clonable, chatroom_type_new;

			if(contact == "user_contact_private"){

				comm_widget_menu_open( "nachrichten" );
				$("#comm_widget_content_nachrichten_menu").hide();

				chatroom_type_search = "private";
				chatbox_area = $("#comm_widget_content_nachrichten_chatbox_area");
				chatbox_clonable = $("#comm_widget_chatbox_private_clonable");

				chatroom_type_new = "private";

				var chatbox = $("#comm_widget_content_nachrichten_chatbox");
			}

			if(contact == "user_contact_support"){

				comm_widget_menu_open( "support" );
				$("#comm_widget_content_support_menu").hide();

				chatroom_type_search = "support_kursersteller,support_plattform";
				chatbox_area = $("#comm_widget_content_support_chatbox_area");
				chatbox_clonable = $("#comm_widget_chatbox_private_clonable");

				chatroom_type_new = "support_kursersteller";

				var chatbox = $("#comm_widget_content_support_chatbox");
			}

			lc_chatroom_private_check( user_key, function(lc_private_chatroom_id){

				comm_widget_receive_chatroom_id(chatroom_type_search, 0, 1, 0, 0, 0, lc_private_chatroom_id, function(cw_private_chatroom_id){

					if(cw_private_chatroom_id == "" || lc_private_chatroom_id == 0){

						chatbox.show();

						lc_chatroom_private( user_key, "offline", chatbox_area, chatbox_clonable, 20, false, function(chatroom_id){
							//chatroom_created
							comm_widget_chatroom_create(chatroom_id, "0", chatroom_type_new, "", "", function(){
								//chatroom_erstellt
								comm_widget_chatbox_init( chatroom_id, chatbox, chatbox_area, chatbox_clonable, 50, function(){});
							});
						});
					}
					else{
						comm_widget_chatbox_init( cw_private_chatroom_id[0], chatbox, chatbox_area, chatbox_clonable, 50, function(){});
					}
				});
			});

			if(!$("#comm_widget").hasClass("active")){
				comm_widget_show();
			}

			$("#comm_widget_user_profile").hide();
			$("#comm_widget_content_menu_wrapper").stop().fadeIn(300);
		}
	});
	$("*[data-cw_type='user_block_0'], *[data-cw_type='user_block_1']").click(function(){

		var this_element	= $(this);
		var block_element 	= this_element.closest("*[data-cw_type='user_block']");
		var user_key 		= block_element.attr("data-cw_user_key");

		var profile_element = this_element.closest("#comm_widget_user_profile_head_contact");
		if(profile_element.length)
			profile_element.stop().hide();

		cw_user_block(user_key, function(){

			cw_user_contact_rights_prepare( user_key, 0, function(){
				cw_user_contact_rights_update( user_key, 0, function(){
					profile_element.stop().fadeIn(300);
				});
			});
		});
	});

	//kurs_click
	$("#wrapper").on("click", "*[data-cw_type='user_profile_courses_thumbnail'][data-get_param]", function(event){

		var this_element = $(event.target).closest("*[data-cw_type='user_profile_courses_thumbnail']");
		document.cookie = "control_open=";
		window.location = "kurs.html?p="+this_element.attr("data-get_param");
	});

	//social network click
	$("#wrapper").on("click", ".comm_widget_user_profile_content_element_content_social_network[data-cw_url]", function(event){

		var this_element = $(event.target).closest(".comm_widget_user_profile_content_element_content_social_network[data-cw_url]");

		window.open( this_element.attr("data-cw_url"), "_blank" );
	});


	//-----------------------------------------------------------------------sub_menus
	//join
	$("#comm_widget_content_chatrooms").on("click", "*[data-cw_type='chatroom_list_element'][data-chatroom_id]", function(event){

		var this_element = $(event.target);

		if(!this_element.closest("*[data-cw_type='user_leave_remove']").length){

			var this_element 	= $(event.target).closest("*[data-cw_type='chatroom_list_element'][data-chatroom_id]");
			var chatroom_id		= this_element.attr("data-chatroom_id");

			var task1 = $.Deferred();

			if(this_element.attr("data-user_rights") == "no-member"){
				//join
				lc_chatroom_user_join( chatroom_id, function(){
					task1.resolve();
					this_element.removeAttr("data-user_rights");
				});
			}
			else{
				task1.resolve();
			}


			$.when(task1).done(function(){

				var chatbox_id = this_element.closest(".comm_widget_content_elements").attr("id") +"_chatbox";
				this_element.closest(".comm_widget_content_menu").hide();

				comm_widget_chatbox_init( chatroom_id, $("#"+chatbox_id), $("#"+chatbox_id+"_area"), $("#comm_widget_chatbox_clonable"), 20, function(){});

			}).promise();
		}
	});
	$("#comm_widget_content_nachrichten, #comm_widget_content_support").on("click", "*[data-cw_type='chatroom_list_element'][data-chatroom_id]", function(event){

		var this_element = $(event.target);

		if(!this_element.closest("*[data-cw_type='user_leave_remove']").length){

			var this_element 	= $(event.target).closest("*[data-cw_type='chatroom_list_element'][data-chatroom_id]");
			var chatroom_id		= this_element.attr("data-chatroom_id");

			var chatbox_id = this_element.closest(".comm_widget_content_elements").attr("id") +"_chatbox";
			this_element.closest(".comm_widget_content_menu").hide();

			var chatbox_clonable;

			if(this_element.closest("#comm_widget_content_support_plattform").length == 0)
				chatbox_clonable = $("#comm_widget_chatbox_private_clonable");
			else
				chatbox_clonable = $("#comm_widget_chatbox_support_clonable");

			comm_widget_chatbox_init( chatroom_id, $("#"+chatbox_id), $("#"+chatbox_id+"_area"), chatbox_clonable, 20, function(){
				if(chatbox_id == "comm_widget_content_support_chatbox")
					$("#comm_widget_content_support_chatbox").find("*[data-lc_report='create']").hide();
			});
		}
	});

	//-------------------------------------chatbox buttons > click events
	//chatbox notifications button
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='notifications']", function(event){

		var this_element 	= $(event.target).closest("*[data-cw_type='notifications']");
		var chatbox			= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id		= chatbox.attr("data-lc_chatroom");

		var current_val		= this_element.attr("data-cw_not");

		if(current_val == "0")
			lc_user_set_notifications( chatroom_id, 1, function(){
				chatbox.find("*[data-cw_type='notifications']").hide();
				chatbox.find("*[data-cw_type='notifications'][data-cw_not='1']").show();
			});
		else
			lc_user_set_notifications( chatroom_id, 0, function(){
				chatbox.find("*[data-cw_type='notifications']").hide();
				chatbox.find("*[data-cw_type='notifications'][data-cw_not='0']").show();
			});
	});

	//chatbox info button
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-lc_type='chatroom_title'].info_open, *[data-cw_type='support_user_name']", function(event){

		var chatbox = $(event.target).closest("*[data-lc_type='chatbox']");

		var info = chatbox.find("*[data-lc_type='info']");
		if(info.length){

			if(info.hasClass("active") == false)
				comm_widget_chatbox_info_open();
		}
	});

	//---------------------------aktionen
	//---------general
	$("#wrapper").on("click", ".comm_widget_chatbox_user_info_action_button_cancel", function(event){

		comm_widget_chatbox_info_action_close();
	});
	//---------chatroom actions
	$("#wrapper").on("click", ".comm_widget_chatbox_user_info_action_button_text", function(event){

		var this_element = $(event.target);
		var content_element = this_element.closest(".comm_widget_chatbox_user_info_action").find(".comm_widget_chatbox_user_info_action_content");

		comm_widget_chatbox_info_action_close();

		if(!content_element.hasClass("active")){

			var action_button = $(".comm_widget_chatbox_user_info_action_button");
			action_button.addClass("active");

			action_button.find("p").hide();
			action_button.find(".comm_widget_chatbox_user_info_action_button_cancel").show();

			content_element.stop().slideDown(500).addClass("active");
		}
	});
	$("#wrapper").on("click", ".comm_widget_chatbox_user_info_action_content p", function(event){

		comm_widget_chatbox_info_action_close();
	});

	//chatroom_confirm_dialog
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='confirm_button']", function(event){

		var this_element = $(event.target);

		this_element.closest("*[data-cw_type='confirm']").removeClass("active").stop().fadeOut(300);
		comm_widget_chatbox_info_action_close();
	});


	//chatbox chatroom_edit
	//chatroom_settings
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='chatroom_settings']", function(event){

		var this_element 	= $(event.target).closest("*[data-cw_type='chatroom_settings']");
		var chatbox			= this_element.closest("*[data-lc_type='chatbox']");
		var settings		= chatbox.find(".comm_widget_chatbox_settings");

		if(!settings.hasClass("active")){
			settings.css("visibility", "hidden").stop().show().addClass("active");
			cw_on_resize();
			settings.hide().css("visibility", "visible").fadeIn(300);

			var action = $(".comm_widget_chatbox_user_info_action");
			action.hide();

			var info_user_wrapper = chatbox.find("*[data-lc_type='info_user_wrapper']");
			info_user_wrapper.hide();

			var root_settings = $("*[data-cw_type='settings_mod']");
			if(!rights_check(lc_user_key, "root") && !rights_check(lc_user_key, "lc_mod"))
				root_settings.hide();
			else
				root_settings.show();

			dropzone_open(chatbox.find(".comm_widget_chatbox_settings_element_content_dropzone_wrapper"), $(".cw_dropzone_single.clonable"), "cw_icon", 0, function(id, filename){

				var chatroom_id = chatbox.attr("data-lc_chatroom");

				comm_widget_chatroom_update( chatroom_id, "icon", id, function(){
					comm_widget_chatroom_update( chatroom_id, "icon_type", "img", function(){

						settings.find("*[data-cw_type='settings_mod_icon']").val(id);
						settings.find("*[data-cw_type='settings_mod_icon_type']").val("img");

						var chatroom_icons = chatbox.find("*[data-lc_transl='chatroom_icon']");
						chatroom_icons.stop().hide().fadeIn(300);
						chatroom_icons.html(chatroom_id);

						cw_chatroom_icon[chatroom_id] = 0;

						chatroom_icons.each(function(){
							lc_translate_user_data("chatroom_icon", $(this), function(){});
						});
					});
				});
			});
		}
	});
	$("body").on("change", "*[data-lc_type='chatbox'][data-lc_chatroom] .comm_widget_chatbox_settings input[type='text']", function(event){

		var this_element 	= $(event.target);
		var chatroom_id 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]").attr("data-lc_chatroom");
		var val				= this_element.val();


		if(this_element.attr("data-cw_type") == "settings_mod_icon"){

			comm_widget_chatroom_update( chatroom_id, "icon", val, function(){
				//hier weitermachen > lc_transl
			});
		}
		if(this_element.attr("data-cw_type") == "settings_mod_icon_type"){

			comm_widget_chatroom_update( chatroom_id, "icon_type", val, function(){
				//hier weitermachen > lc_transl
			});
		}
		if(this_element.attr("data-cw_type") == "settings_title_input"){

			lc_chatroom_update( chatroom_id, "title", val, function(){
				this_element.closest("*[data-lc_type='chatbox']").find("*[data-lc_type='chatroom_title']").text(val);
			});
		}
	});
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='settings_user_join'] *[data-cw_val]:not(.active)", function(event){

		var this_element 	= $(event.target).closest("*[data-cw_val]");
		var chatbox			= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id		= chatbox.attr("data-lc_chatroom");
		var val				= this_element.attr("data-cw_val");

		lc_chatroom_update( chatroom_id, "user_join", val, function(){

			chatbox.find("*[data-cw_type='settings_user_join'] *[data-cw_val]").removeClass("active");
			this_element.addClass("active");
		});
	});
	$("body").on("change", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='settings_category'] select[name='category']", function(event){

		var this_element 	= $(event.target);
		var chatbox			= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id		= chatbox.attr("data-lc_chatroom");
		var val				= this_element.find("option:selected").val();

		comm_widget_chatroom_update( chatroom_id, "category_id", val, function(){

			//category changed
		});
	});

	//add_user / invite_user
	//init
	$("#wrapper").on("click", ".comm_widget_chatbox[data-lc_chatroom] *[data-cw_type='add_user'], .comm_widget_chatbox[data-lc_chatroom] *[data-cw_type='invite_user']", function(event){

		var this_element 		= $(event.target);
		var chatbox 			= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var add_user_element 	= chatbox.find(".comm_widget_chatbox_add_user");

		if(!add_user_element.hasClass("active")){

			var cw_type			= this_element.attr("data-cw_type");
			var chatroom_id 	= chatbox.attr("data-lc_chatroom");

			var action = $(".comm_widget_chatbox_user_info_action");
			action.hide();

			var info_user_wrapper = chatbox.find("*[data-lc_type='info_user_wrapper']");
			info_user_wrapper.hide();

			$(".comm_widget_chatbox_add_user_results").hide();

			lc_user_recommend( 10, function(callback){

				var user_recommend_keys = [];
				var user_recommend_counter = 0;

				for(var x=0; x<callback.length; x++){

					if(chatbox.find("*[data-lc_type='info_user'][data-lc_user_key='"+callback[x]+"']").length == 0){
						user_recommend_keys[user_recommend_counter] == callback[x];
						user_recommend_counter++;
						if(user_recommend_counter == 3)
							break;
					}
				}

				var user_element = chatbox.find(".comm_widget_chatbox_add_user_vorschlag_element");
				var user_element_wrapper = chatbox.find(".comm_widget_chatbox_add_user_vorschlag_element_wrapper");

				var task1 = $.Deferred();

				if(user_recommend_keys.length){

					comm_widget_add_user_list("refresh", user_element, user_element_wrapper, user_recommend_keys, function(){
						chatbox.find(".comm_widget_chatbox_add_user_vorschlag").show();
						task1.resolve();
					});
				}
				else{
					chatbox.find(".comm_widget_chatbox_add_user_vorschlag").hide();
					task1.resolve();
				}

				$.when(task1).done(function(){

					add_user_element.css("visibility", "hidden").stop().show().addClass("active");
					cw_on_resize();
					add_user_element.hide().css("visibility", "visible").fadeIn(300);
					$(".comm_widget_chatbox_add_user_search_input").val("");
				}).promise();
			});

			//add/invite show elements
			add_user_element.find("*[data-cw_show]").hide();

			add_user_element.attr("data-cw_add", cw_type);

			if(cw_type == "add_user")
				add_user_element.find("*[data-cw_show='add']").show();
			if(cw_type == "invite_user")
				add_user_element.find("*[data-cw_show='invite']").show();

			//ausgewählt reset
			$(".comm_widget_chatbox_add_user_list").hide();

			var user_checked = chatbox.find(".comm_widget_chatbox_add_user_list_element");
			user_checked.removeAttr("data-user_key");
			var clone_cache = user_checked.clone();
			user_checked.remove();
			clone_cache.appendTo(chatbox.find(".comm_widget_chatbox_add_user_list_element_wrapper"));
		}
	});
	//input
	$("#wrapper").on("input", ".comm_widget_chatbox_add_user_search_input", function(event){

		var this_element 	= $(event.target);
		var val				= this_element.val();

		$(".comm_widget_chatbox_add_user_results_element").hide();

		if($(".comm_widget_chatbox_add_user_vorschlag_element[data-user_key]").length){
			if(val == ""){
				$(".comm_widget_chatbox_add_user_vorschlag").stop().fadeIn(300);
			}
			else{
				$(".comm_widget_chatbox_add_user_vorschlag").fadeOut(300);
			}
		}
	});

	//add_user add element
	$("#wrapper").on("click", ".comm_widget_chatbox_add_user_vorschlag_element[data-user_key], .comm_widget_chatbox_add_user_results_element[data-user_key]", function(event){

		var this_element = $(event.target).closest(".comm_widget_chatbox_add_user_vorschlag_element[data-user_key], .comm_widget_chatbox_add_user_results_element[data-user_key]");

		if(this_element.closest("*[data-cw_link='user_profile']").length == 0){

			if((!this_element.hasClass("member") && !this_element.hasClass("invited") && !this_element.hasClass("blocked")) || (this_element.hasClass("invited") && this_element.closest(".comm_widget_chatbox_add_user").attr("data-cw_add") == "add_user")){

				var user_key = [];
				user_key[0] = this_element.attr("data-user_key");
				var chatbox = this_element.closest("*[data-lc_type='chatbox']");

				var user_element = chatbox.find(".comm_widget_chatbox_add_user_list_element");
				var user_element_wrapper = chatbox.find(".comm_widget_chatbox_add_user_list_element_wrapper");

				if(chatbox.find(".comm_widget_chatbox_add_user_list_element[data-user_key='"+user_key[0]+"']").length == 0)
					comm_widget_add_user_list("add", user_element, user_element_wrapper, user_key, function(){});

				if($(".comm_widget_chatbox_add_user_list").css("display") == "none")
					$(".comm_widget_chatbox_add_user_list").fadeIn(300);
			}
			else{
				var member = this_element.find("*[data-cw_type='member'], *[data-cw_type='invited'], *[data-cw_type='blocked_0'], *[data-cw_type='blocked_1']");

				$.doTimeout("add_user_member");

				member.addClass("active");
				$.doTimeout("add_user_member", 500, function(){
					member.removeClass("active");
				});
			}
		}
	});
	//add_user remove element
	$("#wrapper").on("click", ".comm_widget_chatbox_add_user_list_element[data-user_key] *[data-cw_type='user_add_remove']", function(event){

		var this_element = $(event.target).closest(".comm_widget_chatbox_add_user_list_element");

		if(this_element.closest(".comm_widget_chatbox_add_user_list_element_wrapper").find(".comm_widget_chatbox_add_user_list_element").length == 1){

			this_element.closest(".comm_widget_chatbox_add_user_list").slideUp(300, function(){
				this_element.hide().removeAttr("data-user_key");
			});
		}
		else
			this_element.remove();
	});
	//add_user search
	$("#wrapper").on("click", ".comm_widget_chatbox[data-lc_chatroom] .comm_widget_chatbox_add_user_search_submit", function(event){

		var this_element = $(event.target);
		var chatbox = this_element.closest(".comm_widget_chatbox");

		comm_widget_add_user_search( chatbox );
	});
	$("#wrapper").on("keypress", ".comm_widget_chatbox[data-lc_chatroom] .comm_widget_chatbox_add_user_search_input", function(event){

		var this_element = $(event.target);
		var chatbox = this_element.closest(".comm_widget_chatbox");

		if(event.which == 13)
			comm_widget_add_user_search( chatbox );
	});

	//add_user submit
	$("#wrapper").on("click", ".comm_widget_chatbox[data-lc_chatroom] .comm_widget_chatbox_add_user_list_submit", function(event){

		var this_element 	= $(event.target);

		var user_selected 	= this_element.closest(".comm_widget_chatbox_add_user").find(".comm_widget_chatbox_add_user_list_element[data-user_key]");
		var chatbox 		= this_element.closest("*[data-lc_type='chatbox']");
		var chatroom_id 	= chatbox.attr("data-lc_chatroom");

		var add_type		= chatbox.find(".comm_widget_chatbox_add_user").attr("data-cw_add");

		for(var x=0; x<user_selected.length; x++){

			if(add_type == "add_user")
				lc_chatroom_add_user( chatroom_id, user_selected.eq(x).attr("data-user_key"), "offline", function(){} );
			if(add_type == "invite_user")
				lc_chatroom_invite_user( chatroom_id, user_selected.eq(x).attr("data-user_key"), "offline" );
		}

		this_element.closest(".comm_widget_chatbox_add_user").fadeOut(300);
		comm_widget_chatbox_info_action_close();
	});


	//chatroom_status
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='open'], *[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='close']", function(event){

		var this_element 	= $(event.target);
		var chatroom_id 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]").attr("data-lc_chatroom");
		var status 			= this_element.attr("data-cw_type");

		chatroom_edit_confirm_open(status, chatroom_id, 0, function(){
			lc_chatroom_update( chatroom_id, "status", status, function(){});
			$("*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='open'], *[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='close']").show();
			this_element.hide();
		});
	});

	//chatroom_clear (verlauf löschen)
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='clear']", function(event){

		var this_element 	= $(event.target);
		var chatbox		 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var chatroom_id 	= chatbox.attr("data-lc_chatroom");

		chatroom_edit_confirm_open("clear", chatroom_id, 0, function(){
			lc_chatroom_clear( chatroom_id, function(){
				comm_widget_chatbox_info_close();
			});
		});
	});

	//chatroom_leave
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='leave']", function(event){

		var this_element 	= $(event.target);
		var info_element	= this_element.closest("*[data-lc_type='info']");
		var chatroom_id 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]").attr("data-lc_chatroom");
		var status 			= this_element.attr("data-cw_type");

		chatroom_edit_confirm_open(status, chatroom_id, 0, function(){
			lc_chatroom_user_leave( chatroom_id, function(){

				if(info_element.length){
					comm_widget_chatbox_info_close();
				}
			});
		});
	});
	//chatroom_leave_remove
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='leave_remove']", function(event){

		var this_element 	= $(event.target);
		var info_element	= this_element.closest("*[data-lc_type='info']");
		var chatroom_id 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]").attr("data-lc_chatroom");
		var status 			= this_element.attr("data-cw_type");

		chatroom_edit_confirm_open(status, chatroom_id, 0, function(){
			lc_chatroom_user_leave_remove( chatroom_id, function(){

				if(info_element.length){
					comm_widget_chatbox_info_close();
				}
			});
		});
	});

	//chatroom_remove
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='remove']", function(event){

		var this_element 	= $(event.target);
		var chatroom_id 	= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]").attr("data-lc_chatroom");
		var status 			= this_element.attr("data-cw_type");

		chatroom_edit_confirm_open(status, chatroom_id, 0, function(){
			lc_chatroom_remove( chatroom_id );
		});
	});

	//-------user interactions

	//user_click
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-lc_type='info_user']:not(*[data-cw_link='user_profile'])", function(event){

		var this_element 	= $(event.target).closest("*[data-lc_type='info_user']");
		var user_key		= this_element.attr("data-lc_user_key");

		var	chatbox			= this_element.closest("*[data-lc_type='chatbox'][data-lc_chatroom]");
		var user_action		= chatbox.find(".comm_widget_chatbox_user_info_action_user");

		if(!this_element.hasClass("active")){

			user_action.find("*[data-cw_link='user_profile']").attr("data-cw_user_key", user_key);
			user_action.find("*[data-lc_transl='user_name']").text(user_key);

			user_action.find("*[data-cw_type='remove_user']").show();

			var user_rights 		= chatbox.find("*[data-lc_type='info_user'][data-lc_user_key='"+lc_user_key+"']").attr("data-lc_user_rights");
			var user_rights_action	= this_element.attr("data-lc_user_rights");

			if(	user_key != lc_user_key &&
				((rights_check(lc_user_key, "root") || rights_check(lc_user_key, "lc_mod") ||
				(user_rights == "admin" && user_rights_action != "admin" &&
				!rights_check(user_key, "root") && !rights_check(user_key, "lc_mod"))) ||
				chatbox.hasClass("comm_widget_chatbox_support_plattform") && rights_check(lc_user_key, "supporter")) ){

					user_action.find("*[data-cw_type='remove_user']").attr("data-cw_user_key", user_key).show();
			}
			else
				user_action.find("*[data-cw_type='remove_user']").hide();

			user_action.find("*[data-cw_type='add_admin'], *[data-cw_type='remove_admin']").hide();

			if(	user_key != lc_user_key &&
				(rights_check(lc_user_key, "root") || rights_check(lc_user_key, "lc_mod") ||
				(user_rights == "admin" && user_rights_action != "admin" &&
				!rights_check(user_key, "root") && !rights_check(user_key, "lc_mod"))) ){

					if(user_rights_action != "invited"){

						if(user_rights_action != "admin")
							user_action.find("*[data-cw_type='add_admin']").attr("data-cw_user_key", user_key).show();
						else
							user_action.find("*[data-cw_type='remove_admin']").attr("data-cw_user_key", user_key).show();
					}
			}

			lc_retransl( user_action, function(){

				if(!chatbox.find("*[data-lc_type='info_user'].active").length){

					comm_widget_chatbox_info_action_close();
					user_action.slideDown(500);
				}
				else{
					user_action.hide();
					user_action.fadeIn(500);
				}

				$("*[data-lc_type='info_user']").removeClass("active");
				this_element.addClass("active");
				user_action.addClass("active");

				var action_button = $(".comm_widget_chatbox_user_info_action_button");
				action_button.addClass("active");

				action_button.find("p").hide();
				$(".comm_widget_chatbox_user_info_action_button_cancel").show();
			});
		}
		else{

			this_element.removeClass("active");
			user_action.slideUp(500).removeClass("active");

			var action_button = $(".comm_widget_chatbox_user_info_action_button");
			action_button.removeClass("active");

			action_button.find("p").hide();
			$(".comm_widget_chatbox_user_info_action_button_text").show();
		}
	});


	//add_admin
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='add_admin'][data-cw_user_key]", function(event){

		var this_element = $(event.target).closest("*[data-cw_type='add_admin']");

		var chatroom_id = this_element.closest("*[data-lc_type='chatbox']").attr("data-lc_chatroom");
		var user_key = this_element.attr("data-cw_user_key");

		chatroom_edit_confirm_open("add_admin", chatroom_id, user_key, function(){
			lc_chatroom_add_admin(chatroom_id, user_key, function(){});
		});
	});
	//remove_admin
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='remove_admin'][data-cw_user_key]", function(event){

		var this_element = $(event.target).closest("*[data-cw_type='remove_admin']");

		var chatroom_id = this_element.closest("*[data-lc_type='chatbox']").attr("data-lc_chatroom");
		var user_key = this_element.attr("data-cw_user_key");

		chatroom_edit_confirm_open("remove_admin", chatroom_id, user_key, function(){
			lc_chatroom_remove_admin(chatroom_id, user_key, function(){});
		});
	});


	//remove_user
	$("body").on("click", "*[data-lc_type='chatbox'][data-lc_chatroom] *[data-cw_type='remove_user']", function(event){

		var this_element = $(event.target).closest("*[data-cw_type='remove_user']");

		var chatroom_id = this_element.closest("*[data-lc_type='chatbox']").attr("data-lc_chatroom");
		var user_key = this_element.attr("data-cw_user_key");

		chatroom_edit_confirm_open("user_remove", chatroom_id, user_key, function(){
			lc_chatroom_remove_user(chatroom_id, user_key);
			$("*[data-lc_type='chatbox'][data-lc_chatroom='"+chatroom_id+"']").find("*[data-cw_type='info_user'][data-lc_user_key='"+user_key+"']").remove();
		});
	});



	//chatrooms
	//user_leave_remove
	$("#wrapper").on("click", "*[data-cw_type='chatroom_list_element'] *[data-cw_type='user_leave_remove']", function(event){

		var this_element = $(event.target);
		var list_element = this_element.closest("*[data-cw_type='chatroom_list_element'][data-chatroom_id]");
		var chatroom_id = list_element.attr("data-chatroom_id");

		lc_chatroom_user_leave_remove( chatroom_id, function(){});
	});

	//eigene gruppen > chatroom_create
	$("#comm_widget_content_chatrooms_eigene_gruppen_add i").click(function(){

		comm_widget_create_chatroom_open();
	});
	$("#comm_widget_create_chatroom_user_join").find("*[data-cw_val]").click(function(){

		var this_element = $(this);

		if(!this_element.hasClass("active")){

			$("#comm_widget_create_chatroom_user_join").find("*[data-cw_val]").removeClass("active");
			this_element.addClass("active");
		}
	});
	$("#comm_widget_create_chatroom_submit").click(function(){

		var chatroom_create = $(this).closest("#comm_widget_create_chatroom");

		var title 		= chatroom_create.find("#comm_widget_create_chatroom_title").val();

		var user_join 	= chatroom_create.find("#comm_widget_create_chatroom_user_join *[data-cw_val].active").attr("data-cw_val");
		var category_id = chatroom_create.find("#comm_widget_create_chatroom_category").val();

		var icon 		= chatroom_create.find("#comm_widget_create_chatroom_icon").val();
		var icon_type 	= chatroom_create.find("#comm_widget_create_chatroom_icon_type").val();

		var creator = "user_create";
		var admin_create = $("#comm_widget_create_chatroom_admin_create:checked");
		if(admin_create.length)
			creator = "admin_create";

		if(title != ""){

			lc_chatroom_create( title, 50, "offline", user_join, "0", function(chatroom_id){

				if(chatroom_id != ""){

					comm_widget_chatroom_create( 	chatroom_id,
													category_id,
													creator,
													icon,
													icon_type,

													function(){

						comm_widget_create_chatroom_close();
						$("#comm_widget_content_chatrooms_menu").stop().hide();
						comm_widget_chatbox_init( chatroom_id, $("#comm_widget_content_chatrooms_chatbox"), $("#comm_widget_content_chatrooms_chatbox_area"), $("#comm_widget_chatbox_clonable"), 20, function(){});
					})
				}
			});
		}
		else
			ug_alert( "NEUER KURSCHATROOM", "Bitte gib einen Titel an.", "Schließen", 0, function(){} );
	});
	$("#comm_widget_create_chatroom_cancel").click(function(){

		comm_widget_create_chatroom_close();
	});

	//gruppe beitreten > search
	$("#comm_widget_content_chatrooms_gruppe_beitreten_search form").submit(function(event){

		event.preventDefault();

		var input_element = $(this).find("input");
		var search_str = input_element.val();

		comm_widget_chatrooms_gruppe_beitreten_search( input_element, search_str );

	});
	$("#comm_widget_content_chatrooms_gruppe_beitreten_search form input").on("input", function(){

		if($(this).val() == ""){
			$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content").hide();
			$("#comm_widget_content_chatrooms_gruppe_beitreten_popular").stop().fadeIn(300);
		}
	});
	$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content_cancel").click(function(){

		$("#comm_widget_content_chatrooms_gruppe_beitreten_search form input").val("");

		$("#comm_widget_content_chatrooms_gruppe_beitreten_search_content").hide();
		$("#comm_widget_content_chatrooms_gruppe_beitreten_popular").stop().fadeIn(300);
	});

	//nachrichten
	//user_search
	$("#comm_widget_content_nachrichten_privat_search form").submit(function(event){
		event.preventDefault();
	});
	$("#comm_widget_content_nachrichten_privat_search input").on("input", function(){

		var list_element = $("#comm_widget_content_nachrichten_privat_list").find("*[data-cw_type='chatroom_list_element']");
		var search_str = $(this).val().toLowerCase();;

		if(search_str != ""){

			$("#comm_widget_content_nachrichten_privat").find(".comm_widget_content_widget_empty").hide();

			var hidden = 0;

			for(var x=0; x<list_element.length; x++){

				if(list_element.eq(x).find("*[data-cw_type='title']").text().toLowerCase().startsWith( search_str ) ){
					list_element.eq(x).show();
					$("#comm_widget_content_nachrichten_privat_search_no_result").hide();
				}
				else{
					list_element.eq(x).hide();
					hidden++;
				}
			}

			if(hidden == list_element.length){
				$("#comm_widget_content_nachrichten_privat_search_no_result").show();
			}
		}
		else{
			if(list_element.length == 0)
				$("#comm_widget_content_nachrichten_privat").find(".comm_widget_content_widget_empty").show();

			$("#comm_widget_content_nachrichten_privat_search_no_result").hide();
			list_element.show();
		}
	});


	//support
	$("#comm_widget_content_support_plattform_content").find(".comm_widget_chatroom_list_element").click(function(){

		if($(this).attr("data-chatroom_id") == undefined){

			comm_widget_support_plattform_chatbox_init();
		}
	});
	$("body").on("keypress", "#comm_widget_content_support_chatbox *[data-lc_type='form_input']", function(event){

		if(event.which == 13){
			comm_widget_support_plattform_submit( $(event.target) );
		}
	});
	$("body").on("submit", "#comm_widget_content_support_chatbox *[data-lc_type='form']", function(event){

		comm_widget_support_plattform_submit( $(event.target).find("*[data-lc_type='form_input']") );
	});

	$("#wrapper").on("click", ".comm_widget_content_chatbox_cancel", function(event){

		var this_element = $(event.target).closest(".comm_widget_content_chatbox_cancel");
		var chatbox = $(event.target).closest("*[data-lc_type='chatbox']");

		if(chatbox.find(".comm_widget_chatroom_edit_element.active").length)
			comm_widget_chatbox_info_action_close();

		else if(chatbox.find("*[data-lc_type='info']:visible").length){
			comm_widget_chatbox_info_close();
			chatbox.find(".comm_widget_content_chatbox_cancel.no_close").removeClass("active");
		}

		else if(!this_element.hasClass("no_close"))
			comm_widget_chatbox_close( $(event.target).closest("*[data-lc_type='chatbox']") );
		else
			comm_widget_hide();
	});
});
