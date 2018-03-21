var hosting_nav_height;
var hosting_id;

var h_lib_dropzone;

var h_lib_vimeo_files = [];
var h_lib_video_thumb_dropzone;

function hosting_nav_pos(){
	
	if(!$("#hosting_nav").hasClass("fixed")){
		if(hosting_nav_height+30 < window.innerHeight-$("#content_inner").offset().top)
			$("#hosting_nav").addClass("fixed");
	}
	else{
		if(hosting_nav_height+30 > window.innerHeight-$("#content_inner").offset().top)
			$("#hosting_nav").removeClass("fixed");
	}
}

function hosting_video_resize(){
	//16:9 video size
	$("#hosting_content_edit_video").css("height", $("#hosting_content_edit_video").width()*(0.5625) +"px");
	$("#h_lib_body_preview_img_video").css("height", $("#h_lib_body_preview_img_video").width()*(0.5625) +"px");
}

//-----kurs_operations

function kurs_publish_check(){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_publish_check"
	})
	.done(function( data ) {
		if(data != ""){
			
			var result = $.parseJSON(data);
			
			var task = [];
			
			task[0] = $("#h_publish_tasks_informations");
			task[1] = $("#h_publish_tasks_inhalte");
			task[2] = $("#h_publish_tasks_seiten");
			
			var all_done = true;
			
			for(var x=0; x<3; x++){
				
				if(result[x] == true)
					task[x].addClass("done");
				else{
					task[x].removeClass("done");
					all_done = false;
				}
			}
			
			if(all_done == true){
				$("#h_publish_submit").addClass("done");
			}
		}
	});
}

//---------------------------general------------------------------
function h_lib_pricing_revenue(){

	$("*[data-pricing_input]").each(function(){
		var this_element = $(this);
		var rev_elem = $("*[data-pricing_rev='"+this_element.attr("data-pricing_input")+"']");

		if(rev_elem.length){
            var val = this_element.val().replace(",",".");
            if(val != "") {
                val = parseFloat(val) * 0.7;
                val = Math.floor(val * 100) / 100;
                val = val.toString().replace(".", ",");
                rev_elem.val(val);
            }
            else{
                rev_elem.val("");
			}
		}
	});
}

//---------------------------library------------------------------

//---operations
function h_lib_rename(id, new_name, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_lib_rename",
		id			: id,
		name		: new_name
	})
	.done(function( data ){
		
		if(data == "invalid_name"){
			ug_alert( "UNGÜLTIGER DATEINAME", "Dateiname wird bereits verwendet.", "Schließen", 0, function(){} );
		}
		else
			callback(1);
	});
}
function h_lib_remove(id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_lib_remove",
		id			: id
	})
	.done(function( data ){
		
		if(data == ""){
			callback(true);
		}
		else{
			callback(data);
		}
	});
}
function h_lib_video_thumb(video_id, thumb_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_lib_video_thumb",
		video_id	: video_id,
		thumb_id	: thumb_id
	})
	.done(function( data ){
		if(data == ""){
			callback(1);
		}
		else{
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		}
	});
}

//---preview
function h_lib_preview_open(id, callback){
	
	var preview_element = $("#h_lib_body_preview");
	
	if(!preview_element.hasClass("active")){
		
		preview_element.addClass("active").attr("data-lib_id", id);
		
		$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
			task 		: "kurs_lib_preview_receive",
			id			: id
		})
		.done(function( data ) {
			if(data != ""){
				var result = $.parseJSON(data);
				
				preview_element.css("visibility", "hidden").show();
				
				//-----init
				$("#h_lib_body_preview_img_video").hide();
				
				//img/icon
				$("#h_lib_body_preview_img").find("i, img").hide();
				if(result["type"] == "img"){
					$("#h_lib_body_preview_img_img").attr("src", "");
					$("#h_lib_body_preview_img_img").show().attr("src", glob_cms_home_dir+"temp/media/project/"+result["filename"]);
				}
				else if(result["type"] == "video"){
					
					var vimeo_wrapper = $("#h_lib_body_preview_img_video");
					vimeo_wrapper.show();
					
					if(result["duration"] != 0){
						vimeo_player(vimeo_wrapper, result["vimeo_id"], result["thumbnail"], function(){});
						$("#h_lib_body_preview_img_video_encoding").hide();
					}
					else{
						$("#h_lib_body_preview_img_video_encoding").show();
					}
				}
				else if(result["type"] == "pdf"){
					$("#h_lib_body_preview_img_pdf").show();
				}
				else if(result["type"] == "doc"){
					$("#h_lib_body_preview_img_doc").show();
				}
				
				//name
				$("#h_lib_body_preview_name").removeClass("edit");
				$("#h_lib_body_preview_name_input_area").val( html_decode( result["name"] ) );
				
				var filename_ext;
				if(result["type"] == "video")
					filename_ext = result["filetype"];
				else
					filename_ext = result["filename"].split('.').pop();
				
				$("#h_lib_body_preview_name_input_type").text("."+filename_ext);
				
				
				//info
				$("#h_lib_body_preview_info_size_val").attr("data-lc_transl", "filesize").text(result["size"]);
				$("#h_lib_body_preview_info_timestamp_val").attr("data-lc_transl", "timestamp").text(result["timestamp"]);
				
				if(result["type"] == "img"){
					$("#h_lib_body_preview_info_res").show();
					$("#h_lib_body_preview_info_res_val").text(result["res"] +" px");
				}
				else
					$("#h_lib_body_preview_info_res").hide();
				
				if(result["type"] == "video"){
					$("#h_lib_body_preview_info_duration").show();
					
					var duration = parseInt(result["duration"]);
					if(duration != 0){
						
						var duration_output = "";
						
						if(duration > 3600){
							// > 1h
							var hours = Math.floor(duration/3600);
							var minutes = Math.floor(duration/60)-hours*60;
							if(minutes.toString().length == 1)
								minutes = "0"+minutes;
							duration_output = hours+":"+minutes+" h";
						}
						else if(duration > 60){
							// < 60min
							var minutes = Math.floor(duration/60);
							var seconds = duration-minutes*60;
							if(seconds.toString().length == 1)
								seconds = "0"+seconds;
							duration_output = minutes+":"+seconds+" min";
						}
						else{
							// < 60s
							duration_output = duration+" sec";
						}
					
						$("#h_lib_body_preview_info_duration_val").text(duration_output);
					}
					else{
						$("#h_lib_body_preview_info_duration").hide();
					}
				}
				else
					$("#h_lib_body_preview_info_duration").hide();
				
				
				//download
				if(result["type"] != "video"){
					var download_url = glob_cms_home_dir+"temp/media/project/"+result["filename"];
					$("#h_lib_body_preview_button_download").parent("a").attr({"download":result["name"]+"."+result["filename"].split('.').pop(), "href":download_url});
				}
				else{
					$("#h_lib_body_preview_button_download").hide();
				}
				//------ready
				lc_retransl( $("#h_lib_body_preview"), function(){
					
					preview_element.stop().css("visibility","visible").hide().fadeIn(300);
					
					$("#h_lib_nav_upload, #h_lib_nav_video, #h_lib_nav_img").hide();
					$("#h_lib_nav_cancel").show();
					
					hosting_video_resize();
					
					callback(1);
				});
			}
		});
	}
}
function h_lib_preview_close(callback){
	
	$("#h_lib_body_preview").stop().fadeOut(300, function(){
		$(this).css("visibility", "hidden").show();
		callback(1);
	}).removeClass("active");
	
	$("#h_lib_nav_upload, #h_lib_nav_video, #h_lib_nav_img").show();
	$("#h_lib_nav_cancel").hide();
}

//---upload
function h_lib_upload_open(callback){
	
	$("#h_lib_body_upload").stop().fadeIn(300, function(){
		
		var nav_upload_start = $("#h_lib_nav_upload_action");
		if(nav_upload_start.hasClass("active"))
			nav_upload_start.stop().fadeIn(300);
		
		callback(1);
	}).addClass("active");
	
	$("#h_lib_nav_video, #h_lib_nav_img").stop().fadeOut(300);
	$("#h_lib_body").addClass("inactive");
	
	$("#h_lib_nav_upload").hide();
	$("#h_lib_nav_cancel").show();
}
function h_lib_upload_close(callback){
	
	$("#h_lib_body_upload").stop().fadeOut(300, function(){
		callback(1);
	}).removeClass("active");
	
	$("#h_lib_nav_video, #h_lib_nav_img").stop().fadeIn(300);
	$("#h_lib_nav_upload_action").stop().hide();
	$("#h_lib_body").removeClass("inactive");
	
	$("#h_lib_nav_upload").show();
	$("#h_lib_nav_cancel").hide();
}
function h_lib_upload_vimeo(){
	
	var vimeo_upload = false;
	var first_queue = -1;
	
	for(var x=0; x<h_lib_vimeo_files.length; x++){
		
		if(h_lib_vimeo_files[x].vimeo != undefined && h_lib_vimeo_files[x].vimeo == "active")
			vimeo_upload = true;
		
		if(first_queue == -1 && h_lib_vimeo_files[x].vimeo == "queue")
			first_queue = x;
	}
	
	if(vimeo_upload == false && first_queue != -1){
		
		var upload_file = h_lib_vimeo_files[ first_queue ];
		
		upload_file.vimeo 	= "active";
        upload_file.kurs_id = hosting_id;

		var file_html = upload_file.preview_element;
		
		var uploader = new VimeoUpload({
			file: upload_file,
			
			onProgress: function(data) {
				var progress = data.loaded/data.total*100;
				var progress_element = file_html.find(".dz-upload");
				progress_element.attr("data-dz-uploadprogress", progress).css("width", progress+"%");
			},
			
			onComplete: function(data) {
				file_html.slideUp(500, function(){
					file_html.remove();
					if($("#h_lib_body_upload_dropzone_content").find(".h_lib_dropzone_element").length == 0){
						h_lib_dropzone_reset();
					}
				});
				upload_file.vimeo = "done";
				
				var result = $.parseJSON(data);
				
				h_lib_list_add({
					lib_id 		: result["lib_id"],
					lib_type 	: "video",
					h_name 		: result["h_name"],
					size 		: result["size"],
					timestamp 	: result["timestamp"]
				});
			
				//next upload
				h_lib_upload_vimeo();
			}
		});
		uploader.upload();
	}
}

function h_lib_list_init(){

	$.post(glob_cms_home_dir+"temp/php_request/kurse.php", {
		task: "kurs_lib_receive"
	}).done(function(data){
		if(data != ""){

			var result = $.parseJSON(data);
			for(var x=0; x<result.length; x++)
				h_lib_list_add(result[x]);
		}
		else{
			// show empty library msg
			$("#h_lib_body_list_details_empty").addClass("active");
		}
	});
}
function h_lib_list_add( result ){
	
	var detail_list = $("#h_lib_body_list_details");

	var empty_elem = $("#h_lib_body_list_details_empty");
	if(empty_elem.hasClass("active"))
        empty_elem.removeClass("active");

	$(".h_lib_details_element.clonable").clone().addClass("new_element").prependTo(detail_list);
	var new_element = detail_list.find(".h_lib_details_element.new_element");
    new_element.removeClass("clonable");
	
	new_element.attr("data-lib_id", result["lib_id"]).attr("data-lib_type", result["lib_type"]).attr("data-filename", result["filename"]).attr("data-lib_filename", result["h_name"]);
	
	//icon
	var icon_row = new_element.find(".h_lib_details_element_icon");
    icon_row.find("img, i").removeClass("active");
	
	if(result["lib_type"] == "img"){
		icon_row.find(".h_lib_details_element_icon_img").addClass("active").attr("src", glob_cms_home_dir+"temp/media/project/kurse_small/"+result["img_src"]);
	}
	else if(result["lib_type"] == "video"){
		icon_row.find(".h_lib_details_element_icon_video").addClass("active");
	}
	else if(result["lib_type"] == "pdf"){
		icon_row.find(".h_lib_details_element_icon_pdf").addClass("active");
	}
	else if(result["lib_type"] == "doc"){
		icon_row.find(".h_lib_details_element_icon_doc").addClass("active");
	}
	
	//name
	new_element.find(".h_lib_details_element_name").find(".h_lib_details_element_val").html(result["h_name"]);
	
	//size
	new_element.find(".h_lib_details_element_size").find(".h_lib_details_element_val").text(result["size"]);
	
	//timestamp
	new_element.find(".h_lib_details_element_timestamp").find(".h_lib_details_element_val").text(result["timestamp"]);
	
	lc_retransl(new_element, function(){
		new_element.removeClass("clone");
		
		if($("#h_lib_body_list_details_empty.active").length){
			$("#h_lib_nav_search_area").val("");
			$("#h_lib_nav_video, #h_lib_nav_img").addClass("active");
		}
		
		new_element.removeClass("new_element");
		
		if( $("#h_lib_nav_search_area").val() == "" ){
			
			if(	(result["lib_type"] == "video" && $("#h_lib_nav_video").hasClass("active")) ||
				(result["lib_type"] != "video" && $("#h_lib_nav_img").hasClass("active")) ){
					new_element.stop().slideDown(300, function(){
						$(this).css("display","");
					});
			}
			else{
				new_element.addClass("type_hide");
			}
		}
		else{
			new_element.addClass("search_hide");
		}
		
		if($(".h_lib_details_element.ui-draggable").length){
			kurs_pages_draggable();
			kurs_content_video_draggable();
		}
	});
}

function h_lib_dropzone_reset(){
	$("#h_lib_body_upload_dropzone_msg").fadeIn(300).removeClass("drag");
	
	if($("#h_lib_nav_upload_action").hasClass("active"))
		$("#h_lib_nav_upload_action").fadeOut(300).removeClass("active");
}


//--------------------------content-------------------------------
function kurs_content_receive( callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_content_receive"
	})
	.done(function( data ){
		if(data != "")
			callback($.parseJSON(data));
		else
			callback("");
	});
}
function kurs_content_pos_update(){
	
	var pos_lesson = [];
	var pos_module = [];
	var x=0;
	
	$(".h_content_lesson_element:not(.clonable)").each(function(){
		
		pos_lesson[x] = $(this).attr("data-c_id");
		pos_module[x] = [];
		var y=0;
		
		$(this).find(".h_content_module_element:not(.clonable)").each(function(){
			pos_module[x][y] = $(this).attr("data-c_id");
			y++;
		});
		
		x++;
	});
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_content_pos_update",
		pos_lesson	: pos_lesson,
		pos_module	: pos_module
	})
	.done(function(data){
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}
function kurs_content_visibility(type, id, visibility){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_content_visibility",
		type	: type,
		id		: id,
		visibility	: visibility
	})
	.done(function( data ) {
		if(data != ""){
			
			if(data == "lesson_error"){
				ug_alert( "LEKTION VERÖFFENTLICHEN", "Veröffentliche zuerst ein Modul dieser Lektion.", "Schließen", 0, function(){} );
			}
			if(data == "module_error"){
				ug_alert( "MODUL VERÖFFENTLICHEN", "Das Modul ist nicht vollständig.", "Schließen", 0, function(){} );
			}
		}
		else{
			if(type == "module"){
				if($("#hosting_content_edit_module[data-module_id='"+id+"']").length){
					
					if(visibility == 1)
						$("#hosting_content_edit_settings_visibility").addClass("active");
					else
						$("#hosting_content_edit_settings_visibility").removeClass("active");
				}
				var nav_element = $(".h_content_module_element[data-c_id='"+id+"']").find(".h_content_module_element_icons_visibility");
				
				if(visibility == 0)
					nav_element.addClass("active");
				else
					nav_element.removeClass("active");
			}
			if(type == "lesson"){
				if($("#hosting_content_edit_lesson[data-c_id='"+id+"']").length){
					
					if(visibility == 1)
						$("#hosting_content_edit_lesson_settings_visibility").addClass("active");
					else
						$("#hosting_content_edit_lesson_settings_visibility").removeClass("active");
				}
				var nav_element = $(".h_content_lesson_element[data-c_id='"+id+"']").find(".h_content_lesson_element_icons_visibility");
				
				if(visibility == 0)
					nav_element.addClass("active");
				else
					nav_element.removeClass("active");
			}
		}
	});
}

//------lessons/modules
function kurs_content_element_submit( input_wrapper ){
	
	var input_val		= input_wrapper.find(".h_content_lesson_input_area").val();
	var submit_button	= input_wrapper.find(".h_content_element_submit");
	
	if(input_val != ""){
	
		if(!input_wrapper.closest(".h_content_lesson_element_module").length){
			
			//new lesson
			kurs_content_lesson_create(input_val, function(id){
				
				input_wrapper.find(".h_content_lesson_input_area").val("");
				
				submit_button.stop().fadeOut(300, function(){
					input_wrapper.removeClass("edit");
				}).removeClass("active");
				
				kurs_content_lesson_add(id, input_val, 0);
			});
		}
		else{
			
			//new module
			var lesson_id = input_wrapper.closest(".h_content_lesson_element").attr("data-c_id");
			
			kurs_content_module_create(lesson_id, input_val, function(id){
				
				input_wrapper.find(".h_content_lesson_input_area").val("");
				
				submit_button.stop().fadeOut(300, function(){
					input_wrapper.removeClass("edit");
				}).removeClass("active");
				
				kurs_content_module_add(lesson_id, id, input_val, 0, 0);
				
				kurs_module_open(id, function(){});
			});
		}
	}
	else
		ug_alert( "ELEMENT ERSTELLEN", "Bitte Titel eingeben.", "Schließen", 0, function(){} );
}

//------lessons
function kurs_content_lesson_create(title, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_content_lesson_create",
		title		: title
	})
	.done(function( id ) {
		if(id != "")
			callback(id);
	});
}
function kurs_content_lesson_add(id, title, visibility){
	
	//add new lesson
	var lesson_list 	= $("#h_content_lesson_list");
	var lesson_clonable	= $(".h_content_lesson_element.clonable");
	
	lesson_clonable.clone().addClass("empty").appendTo(lesson_list);
	
	var new_element = lesson_list.find(".empty");
	
	new_element.attr("data-c_id", id);
	new_element.find(".h_content_lesson_element_title").html(title);
	
	//visibility
	if(visibility == 0)
		new_element.find(".h_content_lesson_element_icons_visibility").addClass("active");
	else
		new_element.find(".h_content_lesson_element_icons_visibility").removeClass("active");
	
	new_element.removeClass("clonable").removeClass("empty");
}
function kurs_content_lesson_edit(id){
	
	var lesson_element = $("#hosting_content_edit_lesson");
	
	if(!lesson_element.attr("data-c_id") != id || !lesson_element.hasClass("active")){
	
		var nav_element = $(".h_content_lesson_element[data-c_id='"+id+"']");
		
		$(".h_content_module_element_title").removeClass("selected");
		$(".h_content_lesson_element_title").removeClass("selected");
		nav_element.find(".h_content_lesson_element_title").addClass("selected");
		
		//title
		var title = nav_element.find(".h_content_lesson_element_title").text();
		$("#hosting_content_edit_lesson_settings_title").removeClass("active");
		$("#hosting_content_edit_lesson_settings_title_input_area").val( $('<div/>').html(title).text() );
		
		//visibility
		var visibility_button = $("#hosting_content_edit_lesson_settings_visibility");
		
		visibility_button.removeClass("active");
		if(!nav_element.find(".h_content_lesson_element_icons_visibility").hasClass("active")){
			visibility_button.addClass("active");
		}
		
		if(!$("#hosting_content_edit:visible").length){
			$("#hosting_content_edit").show();
			$("#hosting_content_media").show();
		}
		
		$("#hosting_content_edit_module").hide();
		lesson_element.stop().fadeIn(300).addClass("active").attr("data-c_id", id);
	}
}
function kurs_content_lesson_remove(lesson_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_content_lesson_remove",
		id		: lesson_id
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}

//-----modules
function kurs_content_module_create(lesson_id, title, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_content_module_create",
		lesson_id	: lesson_id,
		title		: title
	})
	.done(function( id ) {
		if(id != "")
			callback(id);
	});
}
function kurs_content_module_add(lesson_id, id, title, visibility, preview){
	
	//add new lesson
	var lesson_element  = $(".h_content_lesson_element[data-c_id='"+lesson_id+"']");
	var module_list 	= lesson_element.find(".h_content_lesson_element_module_list");
	var module_clonable	= lesson_element.find(".h_content_module_element.clonable");
	
	module_clonable.clone().addClass("empty").appendTo(module_list);
	
	var new_element = module_list.find(".empty");
	
	new_element.attr("data-c_id", id);
	new_element.find(".h_content_module_element_title").html(title);
	
	//icons
	new_element.find(".h_content_module_element_icons").find("i").removeClass("active");
	
	if(visibility == 0)
		new_element.find(".h_content_module_element_icons_visibility").addClass("active");
	if(preview == 1)
		new_element.find(".h_content_module_element_icons_preview").addClass("active");
	
	new_element.removeClass("clonable").removeClass("empty");
}

function kurs_module_open(module_id, callback){
	
	var hosting_edit_inner = $("#hosting_content_edit_module");
	
	if(hosting_edit_inner.attr("data-module_id") != module_id || $("#hosting_content_edit_lesson:visible").length){
		
		$(".h_content_lesson_element_title").removeClass("selected");
		$(".h_content_module_element_title").removeClass("selected");
		$(".h_content_module_element[data-c_id='"+module_id+"']").find(".h_content_module_element_title").addClass("selected");
		
		hosting_edit_inner.css("visibility", "hidden");
		$("#hosting_content_edit_lesson").hide();
		
		$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
			task 		: "kurs_content_detail_receive",
			type		: "module",
			id			: module_id
		})
		.done(function(data){
			if(data != ""){
				
				var result = $.parseJSON(data);
				
				//title
				$("#hosting_content_edit_title_input_area").val( $('<div/>').html(result["title"]).text() );
				
				//video
				if(result["vimeo_id"] != null){
					$("#hosting_content_edit_video_drop").removeClass("empty").hide();
					
					var video_wrapper = $("#hosting_content_edit_video_content");
					
					video_wrapper.show().attr("data-lib_id", result["video_id"]);
					vimeo_player( video_wrapper, result["vimeo_id"], result["video_thumbnail"], function(){});
					video_wrapper.css("height", "");
					
					$("#hosting_content_edit_video_remove").show();
				}
				else{
					$("#hosting_content_edit_video_drop").addClass("empty").show();
					$("#hosting_content_edit_video_content").hide();
					
					$("#hosting_content_edit_video_remove").hide();
				}
				
				//descr
				if(result["descr"] != null)
					$("#hosting_content_edit_descr_area").trumbowyg("html", result["descr"]);
				else
					$("#hosting_content_edit_descr_area").trumbowyg('empty');
				
				hosting_edit_inner	.css("visibility", "visible").stop().hide().fadeIn(500, function(){
					
					$("#hosting_content_edit_video").css("height", $("#hosting_content_edit_video").width()*(0.5625) +"px");
					
				}).attr("data-module_id", module_id);
				
				//visibility
				if(result["visibility"] == "1")
					$("#hosting_content_edit_settings_visibility").addClass("active");
				else
					$("#hosting_content_edit_settings_visibility").removeClass("active");
				
				//preview
				if(result["preview"] == "1")
					$("#hosting_content_edit_settings_preview").addClass("active");
				else
					$("#hosting_content_edit_settings_preview").removeClass("active");
				
				if(!$("#hosting_content_edit:visible").length){
					$("#hosting_content_edit").show();
					$("#hosting_content_media").show();
				}
				
				document.cookie = "h_c_module_open="+module_id;
			}
		});
	}
}
//settings
function kurs_content_module_preview(module_id, val, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_content_module_preview",
		id		: module_id,
		val		: val
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}
function kurs_content_module_remove(module_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_content_module_remove",
		id		: module_id
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}
function kurs_content_module_video_update(module_id, video_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_content_module_video_update",
		module_id	: module_id,
		video_id	: video_id
	})
	.done(function( data ) {
		if(data != ""){
			var result = $.parseJSON(data);
			
			if(result["vimeo_id"] != 0){
				
				if(result["duration"] != 0)
					callback(result["vimeo_id"], result["thumbnail"]);
				else
					ug_alert( "ENCODING LÄUFT", "Das Video wird derzeit encodiert. Versuche es in ein paar Minuten nochmal.", "Schließen", 0, function(){} );
			}
			else{
				callback(0);
			}
		}
	});
}

//video draggable
function kurs_content_video_draggable(){
	
	$(".h_lib_details_element[data-lib_type='video'], #h_lib_body_preview_img_video").draggable({
		helper: "clone",
		containment: "#wrapper",
		connectWith: "#hosting_content_edit_video_drop",
		start: 	function(e, ui){
			ui.helper.addClass("drag");
			var drop_elem = $("#hosting_content_edit_video_drop");
			if(!drop_elem.hasClass("empty"))
				drop_elem.stop().fadeIn(500);
			
			var thumb_dropzone = ui.helper.find("#h_lib_body_preview_img_video_content_dropzone");
			if(thumb_dropzone.length)
				thumb_dropzone.hide();
		},
		stop:	function(e, ui){
			ui.helper.removeClass("drag");
			var drop_elem = $("#hosting_content_edit_video_drop");
			if(!drop_elem.hasClass("empty"))
				drop_elem.stop().fadeOut(500);
		}
	});
	
	$("#hosting_content_edit_video_drop").droppable({
		accept: ".h_lib_details_element[data-lib_type='video'], #h_lib_body_preview_img_video",
		hoverClass: "hover",
		tolerance: "pointer",
		drop: function( event, ui ) {
			
			var element 	= ui.helper;
			
			var video_id;
			var module_id 	= $("#hosting_content_edit_module").attr("data-module_id");
			
			if(element.hasClass("h_lib_details_element")){
				video_id 	= element.attr("data-lib_id");
			}
			else{
				video_id	= $("#h_lib_body_preview").attr("data-lib_id");
			}
			
			kurs_content_module_video_update(module_id, video_id, function(vimeo_id, thumb){
				
				vimeo_player( $("#hosting_content_edit_video_content"), vimeo_id, thumb, function(){} );
				
				$("#hosting_content_edit_video_content").show().attr("data-lib_id", video_id);
				
				$("#hosting_content_edit_video_remove").stop().slideDown(500);
				
				var drop_elem = $("#hosting_content_edit_video_drop");
				drop_elem.stop().fadeOut(500, function(){
					$(this).removeClass("empty");
				});
			});
		}
	});
	
}
//files draggable
function kurs_content_files_draggable(){

    $(".h_lib_details_element[data-lib_type='img'], .h_lib_details_element[data-lib_type='pdf']").draggable({
        helper: "clone",
        containment: "#wrapper",
        connectWith: "#hosting_content_edit_descr",
        start: 	function(e, ui){
            ui.helper.addClass("drag");
        },
        stop:	function(e, ui){
            ui.helper.removeClass("drag");
        }
    });

    $("#hosting_content_edit_descr").droppable({
        accept: ".h_lib_details_element[data-lib_type='img'], .h_lib_details_element[data-lib_type='pdf']",
        hoverClass: "hover",
        tolerance: "pointer",
        drop: function( event, ui ) {
            var element 	= ui.helper;
            var descr_area	= $("#hosting_content_edit_descr_area");
            var old_html	= descr_area.trumbowyg("html");

            var new_element;
            var new_element_filename = element.attr("data-filename");
			var new_element_src = "/temp/media/project/"+new_element_filename;
			var new_element_alias = element.attr("data-lib_filename");

            if(element.attr("data-lib_type") == "img")
            	new_element = '<img src="'+new_element_src+'" alt="'+new_element_alias+'" />';
            else if(element.attr("data-lib_type") == "pdf")
                new_element = '<a href="'+new_element_src+'" target="_blank">'+new_element_alias+'</a>';

			descr_area.trumbowyg("html", old_html+new_element);
            $(".trumbowyg-editor").scrollTop( 999999 );
			
			var submit_button = $("#hosting_content_edit_descr_submit");
				
			if(!submit_button.hasClass("active")){
				submit_button.stop().slideDown(500).addClass("active");
			}
        }
    });
}

//--------------------------pages---------------------------//
function kurs_pages_update( page_type, pos, type, content, callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_pages_update",
		page_type 	: page_type,
		pos			: pos,
		type		: type,
		content		: content
	})
	.done(function( data ) {
		if(data != "")
			callback($.parseJSON(data));
	});
}
function kurs_pages_draggable(){
	
	$(".h_lib_details_element[data-lib_type='img']").draggable({
		helper: "clone",
		containment: "#wrapper",
		connectWith: ".h_pages_edit_element[data-pcms_type='img']:not(.clonable)",
		start: 	function(e, ui){
			ui.helper.addClass("drag");
			$(".h_pages_edit_element[data-pcms_type='"+ ui.helper.attr("data-lib_type") +"']:not(.clonable)").addClass("dragging");
		},
		stop:	function(e, ui){
			ui.helper.removeClass("drag");
			$(".h_pages_edit_element[data-pcms_type='"+ ui.helper.attr("data-lib_type") +"']:not(.clonable)").removeClass("dragging");
		}
	});
	$(".h_pages_edit_element[data-pcms_type='img']:not(.clonable)").droppable({
		accept: ".h_lib_details_element[data-lib_type='img']",
		hoverClass: "over",
		tolerance: "pointer",
		drop: function( event, ui ) {
			
			var element 		= ui.helper;
			var insert_element 	= $(this).closest("*[data-pcms_pos]");
			
			var page_type		= insert_element.closest(".h_pages_edit").attr("data-page_type");
			
			var pcms_pos 		= insert_element.attr("data-pcms_pos");
			var pcms_type 		= insert_element.attr("data-pcms_type");
			
			kurs_pages_update( page_type, pcms_pos, pcms_type, element.attr("data-lib_id"), function(result){
				
				var update_element = $("*[data-pcms_pos='"+pcms_pos+"'][data-pcms_type='"+pcms_type+"']");
				
				update_element.each(function(){
					
					var this_element = $(this);
					
					this_element.find("img").attr("src", glob_cms_home_dir+"temp/media/project/"+result["filename"]);
					this_element.find(".product_img_placeholder").remove();
					
					if(this_element.attr("data-cms_img_align") == "cover_center"){
						coverimg(this_element);
					}
				});
				
				kurs_publish_check();
			});
		}
	});
}
function h_pages_text_editor_close(editor){
	
	var temp_wrapper = editor.closest(".h_pages_edit_temp_inner");
	
	temp_wrapper.css("overflow-y", "auto");
	temp_wrapper.find(".h_pages_text_editor").stop().fadeOut(500).removeClass("active");
}


//-----------------------------------------MARKETING------------------------------------//
function h_marketing_keywords_init( parent ){
	
	var keywords 	= parent.attr("data-keywords");
	var input		= parent.find(".h_marketing_keywords_input");
	
	if(keywords != undefined && keywords != ""){
		
		keywords = keywords.split(",");
		
		var clonable 	= parent.find(".h_marketing_keywords_element.clonable");
		var list 		= parent.find(".h_marketing_keywords_content_list");
		
		for(var x=0; x<keywords.length; x++){
			
			clonable.clone().addClass("empty").removeClass("clonable").appendTo(list);
			var new_element = list.find(".h_marketing_keywords_element.empty");
			
			new_element.find(".h_marketing_keywords_element_text").text(keywords[x]).attr("title", keywords[x]);
			new_element.removeClass("empty");
		}
	}
	
	if(keywords == undefined || keywords == "" || keywords.length < 5){
		input.addClass("active")
	}
}
function h_marketing_keywords_add( parent ){
	
	var input_element 	= parent.find(".h_marketing_keywords_input_area input");
	var keyword 		= input_element.val();
	
	if(keyword != ""){
		
		var space_pos = keyword.indexOf(" ");
		
		if(space_pos != -1)
			keyword = keyword.slice(0,space_pos);
		
		input_element.val("");
		
		$(".h_marketing_keywords_content").each(function(){
			
			var list 		= $(this).find(".h_marketing_keywords_content_list");
			var clonable 	= $(this).find(".h_marketing_keywords_element.clonable");
			
			clonable.clone().removeClass("clonable").addClass("empty").appendTo(list);
			var new_element = list.find(".h_marketing_keywords_element.empty");
			
			new_element.find(".h_marketing_keywords_element_text").text(keyword).attr("title", keyword);
			new_element.removeClass("empty");
		});
		
		if($(".h_marketing_keywords_content_list").eq(0).find(".h_marketing_keywords_element").length == 5){
			$(".h_marketing_keywords_input").removeClass("active");
		}
		
		h_marketing_keywords_update();
	}
}
function h_marketing_keywords_remove( keyword ){
	
	$(".h_marketing_keywords_content").each(function(){
		
		var list 		= $(this).find(".h_marketing_keywords_content_list");
		list.find(".h_marketing_keywords_element_text[title='"+keyword+"']").closest(".h_marketing_keywords_element").fadeOut(300, function(){
			$(this).remove();
			h_marketing_keywords_update();
		});
	});
	
	$(".h_marketing_keywords_input").addClass("active");
	
}
function h_marketing_keywords_update(){
	
	var list 			= $("*[data-keywords]").eq(0).find(".h_marketing_keywords_content_list");
	var list_elements 	= list.find(".h_marketing_keywords_element");
	
	var keyword_str 	= "";
	
	list_elements.each(function(){
		keyword_str = keyword_str+ $(this).find(".h_marketing_keywords_element_text").text() + ",";
	});
	
	keyword_str = keyword_str.slice(0,-1);
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 		: "kurs_keywords_update",
		keywords	: keyword_str
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
	});
}

$(document).ready(function(){
	
	//--------------------------------------general----------------------------------------//
	hosting_id = $("#content_inner").attr("data-hosting_id");
	
	hosting_nav_height = $("#hosting_nav").height();
	hosting_nav_pos();
	
	$("#content").on("scroll", function(){
		hosting_nav_pos();
	});
	$(window).on("resize", function(){
		hosting_nav_pos();
	});
	
	/*nav*/	
	$(".hosting_nav_element").hover(function(){
		$(this).find(".hosting_nav_text").stop().fadeIn(300);
	},function(){
		$(this).find(".hosting_nav_text").stop().fadeOut(300);
	});
	
	$(".hosting_nav_element").click(function(){
		reload( "pg="+$(this).attr("data-page") );
	});
	
	//---header_buttons
	if($("#h_header_buttons").length){
		
		$("#h_header_memberarea").click(function(){
			kurs_memberarea(hosting_id);
		});
	}
	
	//-----------------------------------------publish------------------------------------------
	if($("#h_publish").length){
		
		kurs_publish_check();

		$("#h_publish_submit").click(function(){
				
			if($("#h_publish_submit:not(.done)").length)
				comm_widget_show(0, "help");
			else{
				if($("#control_dashboard_icon").find("img").length)
					blk_steps_open( $("#h_publish_action_wrapper") );
				else{
					ug_alert( "PROFIL VERVOLLSTÄNDIGEN", "Du benötigst ein Profilbild um deinen Kurs zu veröffentlichen. <br /><br />So schaffst du mehr Vertrauen bei deinen potentiellen Kunden. :)", "Schließen", 0, function(){} );
					control_open( $("#control_dashboard") );
				}
			}
		});
		$("#h_publish_action_close").click(function(){
			
			if($("#h_publish_action_page1").hasClass("active")){
				blk_steps_close( $("#h_publish_action_wrapper") );
			}
			else{
				window.location = "hosting.html?pg=dashboard";
			}
		});
		
		
		$(".h_publish_action_page_button").click(function(){

			var publish = false;
			if($("#h_publish_action_page1").hasClass("active"))
				publish = true;

			var next_page = blk_steps_next($("#h_publish_action_wrapper"), function () {

				if (publish) {
					//VERÖFFENTLICHEN
					$.post(glob_cms_home_dir + "temp/php_request/kurse.php", {
						task: "kurs_publish"
					})
						.done(function (data) {
							if (data != "")
								ug_alert("Error", data, "Schließen", 0, function () {
								});
							else {
								//chatroom erstellen
								kurs_receive(hosting_id, function (result) {

									result = result[hosting_id];

									lc_chatroom_create(result["name"], 0, "offline", "invite", "0", function (chatroom_id) {

										if (chatroom_id != "") {

											comm_widget_chatroom_create(chatroom_id,
												result["category_id"],
												"kurs",
												result["thumbnail_id"],
												"img",

												function () {

													next_page.addClass("active");

													//cw_animation
													comm_widget_show(1, chatroom_id);

													blk_steps_cw_animation($("#h_publish_action_page2"));
												});
										}
									});
								});
							}
						});
				}
				if (next_page.attr("id") == "h_publish_action_page3") {

					blk_steps_cw_animation_close();
				}
			});

			if (next_page.attr("id") == "h_publish_action_page3") {
				comm_widget_hide();
				$("#comm_widget_open").stop().fadeOut(500);
			}
		});
	}

	//-----------------------------------------global functions---------------------------------

    //pricing
    $("#h_pricing_select").change(function(){

        $(".h_pricing_element").stop().hide().removeClass("active");

        var price_model = $(this).find("option:selected").val();
        var new_element = $(".h_pricing_element[data-h_pricing='"+ price_model +"']");

        new_element.stop().fadeIn(300).addClass("active");
        if(price_model == "free" && !new_element.find(".h_pricing_element_submit").hasClass("active")){
            new_element.find(".h_pricing_element_submit").addClass("active").stop().slideDown(500);
        }
    });
    h_lib_pricing_revenue();
	$("*[data-pricing_input]").on("input", function(event){
		h_lib_pricing_revenue();
	});
    $("#h_pricing_fix_all_input, #h_pricing_fix_rate_input, #h_pricing_fix_rate_duration_input, #h_pricing_abo_input").on("input", function(){

        var active_element 	= $(".h_pricing_element.active");
        var active_val	 	= active_element.attr("data-h_pricing");

        var submit_element 	= active_element.find(".h_pricing_element_submit");

        if(active_val == "fix"){

            if(!submit_element.hasClass("active")){

                var fix_all_input			= $("#h_pricing_fix_all_input").val();
                var fix_rate_input			= $("#h_pricing_fix_rate_input").val();
                var fix_rate_duration_input	= $("#h_pricing_fix_rate_duration_input").val();

                if(fix_all_input != "" && ((fix_rate_input == "" && fix_rate_duration_input == "") || (fix_rate_input != "" && fix_rate_duration_input != ""))){

                    submit_element.addClass("active").stop().slideDown(500);
                }
            }
        }
        if(active_val == "abo"){

            if(!submit_element.hasClass("active")){

                var abo_input	= $("#h_pricing_abo_input").val();

                if(abo_input != ""){

                    submit_element.addClass("active").stop().slideDown(500);
                }
            }
        }
    });
    $(".h_pricing_element").on("click", ".h_pricing_element_submit.active", function(event){

        var submit_button 	= $(event.target).closest(".h_pricing_element_submit");

        var active_element 	= $(".h_pricing_element.active");
        var active_val	 	= active_element.attr("data-h_pricing");

        if(active_val == "free"){

            kurs_update(hosting_id, "price_model", "free", function(){
                submit_button.removeClass("active").stop().slideUp(300);
            });
        }
        if(active_val == "fix"){

            var fix_all_input			= $("#h_pricing_fix_all_input").val();
            var fix_rate_input			= $("#h_pricing_fix_rate_input").val();
            var fix_rate_duration_input	= $("#h_pricing_fix_rate_duration_input").val();

            if(fix_all_input != ""){

                if((fix_rate_input == "" && fix_rate_duration_input == "") || (fix_rate_input != "" && fix_rate_duration_input != "")){

                    var task1 = $.Deferred();
                    var task2 = $.Deferred();
                    var task3 = $.Deferred();
                    var task4 = $.Deferred();

                    kurs_update(hosting_id, "price_model", "fix", function(){
                        task1.resolve();
                    });
                    kurs_update(hosting_id, "price_1", parseInt(fix_all_input), function(){
                        task2.resolve();
                    });
                    kurs_update(hosting_id, "price_2", parseInt(fix_rate_input), function(){
                        task3.resolve();
                    });
                    kurs_update(hosting_id, "price_duration", parseInt(fix_rate_duration_input), function(){
                        task4.resolve();
                    });

                    $.when(task1, task2, task3, task4).done(function(){
                        submit_button.removeClass("active").stop().slideUp(300);
                    }).promise();
                }
                else{
                    ug_alert( "UNVOLLSTÄNDIG", "Bitte Ratenzahlung ausfüllen oder freilassen.", "Schließen", 0, function(){} );
                }
            }
            else{
                ug_alert( "UNVOLLSTÄNDIG", "Bitte Fixpreis angeben.", "Schließen", 0, function(){} );
            }
        }
        if(active_val == "abo"){

            var abo_input = $("#h_pricing_abo_input").val();

            if(abo_input != ""){

                var task1 = $.Deferred();
                var task2 = $.Deferred();

                kurs_update(hosting_id, "price_model", "abo", function(){
                    task1.resolve();
                });
                kurs_update(hosting_id, "price_1", parseInt(abo_input), function(){
                    task2.resolve();
                });

                $.when(task1, task2).done(function(){
                    submit_button.removeClass("active").stop().slideUp(300);
                }).promise();
            }
            else{
                ug_alert( "UNVOLLSTÄNDIG", "Bitte monatlichen Betrag angeben.", "Schließen", 0, function(){} );
            }
        }
    });

	
	//-----------------------------------------library------------------------------------------
	
	if($("#h_lib").length){

		//init
        h_lib_list_init();

		//------------------general
		$("#h_lib_nav_cancel").click(function(){
			
			if($("#h_lib_body_upload").hasClass("active")){
				h_lib_upload_close(function(){});
			}
			if($("#h_lib_body_preview").hasClass("active")){
				
				var video_thumb = $("#h_lib_body_preview_img_video_content_dropzone.active");
				
				if(	!video_thumb.length || h_lib_video_thumb_dropzone.files.length == 0){
					h_lib_preview_close(function(){});
					video_thumb.removeClass("active");
				}
				else{
					ug_alert( "UPLOAD ABBRECHEN", "Der Upload des Videothumbnails wird abgebrochen! Fortfahren?", "Ja", "Abbrechen", function(result){
						if(result == true){
							h_lib_preview_close(function(){});
							video_thumb.removeClass("active");
							video_thumb.find(".dz-progress, *[data-project_type='dropzone_thumb_blk']").stop().fadeOut(300, function(){
								h_lib_video_thumb_dropzone.removeAllFiles();
							});
						}
					});
				}
			}
		});
		
		//------------------------list
		$("#h_lib_body_list").find(".h_lib_details_element_timestamp").each(function(){
			$(this).find(".h_lib_details_element_val").attr("data-lc_transl", "timestamp");
		});
		$("#h_lib_body_list").find(".h_lib_details_element_size").each(function(){
			$(this).find(".h_lib_details_element_val").attr("data-lc_transl", "filesize");
		});
		lc_transl($("#h_lib_body_list"), function(){});
		
		//------------------------filter
		$("#h_lib_nav_video, #h_lib_nav_img").click(function(){
			
			var elements = $(".h_lib_details_element[data-lib_type='video']:not(.search_hide)");
			
			if($(this)[0] == $("#h_lib_nav_img")[0]){
				elements = $(".h_lib_details_element:not(*[data-lib_type='video']):not(.search_hide)");
			}
			
			if($(this).hasClass("active")){
				$(this).removeClass("active");
				elements.addClass("type_hide");
			}
			else{
				$(this).addClass("active");
				elements.removeClass("type_hide");
			}
			
			if(!$("#h_lib_body_list_details_empty.active").length){
				if(!$(".h_lib_details_element:visible").length){
					$("#h_lib_body_list_details_no_results").addClass("active");
				}
				else{
					$("#h_lib_body_list_details_no_results").removeClass("active");
				}
			}
		});
		
		//---------------------------search
		$("#h_lib_nav_search_area").val("");
		$("#h_lib_nav_search_area").on("input", function(event){
			
			var input_val 		= $(event.target).val();
			var file_elements 	= $("#h_lib_body_list_details").find(".h_lib_details_element");
			
			//reset
			file_elements.removeClass("search_hide");
			file_elements.find(".h_lib_search_marker").each(function(){
				var element_val = $(this).closest(".h_lib_details_element_val");
				element_val.html(element_val.text());
			});
			
			if(input_val != ""){
			
				file_elements.each(function(){
					
					var this_element 	= $(this);
					var filename 		= this_element.find(".h_lib_details_element_name").find(".h_lib_details_element_val").text();
					
					var element_val = this_element.find(".h_lib_details_element_name").find(".h_lib_details_element_val");
					
					var search_index = filename.toLowerCase().indexOf( input_val.toLowerCase() );
					var filename_length = filename.length;
					
					if(search_index >= 0){
						this_element.removeClass("search_hide");
						var new_html = filename.substr(0, search_index) + "<span class='h_lib_search_marker'>"+ filename.substr(search_index, input_val.length) +"</span>" + filename.substr(search_index+input_val.length);
						element_val.html( new_html );
					}
					else{
						this_element.addClass("search_hide");
						element_val.html(element_val.text());
					}
				});
				
				if(!$("#h_lib_body_list_details_empty.active").length){
					if(!$("#h_lib_body_list_details").find(".h_lib_details_element:visible").length){
						$("#h_lib_body_list_details_no_results").addClass("active");
					}
					else{
						$("#h_lib_body_list_details_no_results").removeClass("active");
					}
				}
			}
		});
		
		$("#h_lib_body_list_details_no_results_reset").click(function(){
			$("#h_lib_body_list_details_no_results").removeClass("active");
			$("#h_lib_nav_search_area").val("");
			$("#h_lib_nav_video, #h_lib_nav_img").addClass("active");
			$(".h_lib_details_element").removeClass("search_hide").removeClass("type_hide");
		});
		
		//------------------------preview
		$("#h_lib_body_list").on("click", ".h_lib_details_element", function(event){
			
			var this_element = $(event.target).closest(".h_lib_details_element");
			
			h_lib_preview_open(this_element.attr("data-lib_id"), function(){
				
				//------------------------video_thumb dropzone
				var dropzone_area = $("#h_lib_body_preview_img_video_content_dropzone");
				if($("#h_lib_body_preview_img_video_content:visible").length && dropzone_area.html() == ""){
					dropzone_open( dropzone_area, $(".h_lib_video_thumb_dropzone.clonable"), "kurs_file,video_thumb", [450,250], function(id, filename){
						
						dropzone_area.removeClass("active");
						
						var data_lib_id = $("#h_lib_body_preview").attr("data-lib_id");
						
						h_lib_video_thumb(data_lib_id, id, function(){
							
							var url = glob_cms_home_dir+"temp/media/project/video_thumb/"+glob_cms_device+"/"+filename;
						
							var player = vimeo_players[$("#h_lib_body_preview_img_video").attr("data-vimeo_id")];
							player.pause();
							player.setPoster(url);
							$("#h_lib_body_preview_img_video").find(".mejs__layers, .mejs__iframe-overlay").removeClass("inactive");
							
							//module_video
							var module_player = vimeo_players[$("#hosting_content_edit_video_content").attr("data-vimeo_id")];
							
							if(module_player != undefined && $("#hosting_content_edit_video_content").attr("data-lib_id") == data_lib_id){
								module_player.pause();
								module_player.setPoster(url);
								$("#hosting_content_edit_video_content").find(".mejs__layers, .mejs__iframe-overlay").removeClass("inactive");
							}
						});
					});
					h_lib_video_thumb_dropzone = dropzone_array[dropzone_area.find("*[data-project_type='dropzone_content']").attr("id")];
					
					h_lib_video_thumb_dropzone.on("addedfile", function(){
						dropzone_area.addClass("fastslide").addClass("active");
					});
					h_lib_video_thumb_dropzone.on("thumbnail", function(){
						dropzone_area.removeClass("fastslide");
					});
				}
			});
			
		});
		$("#h_lib_body_preview_name_input_area").on("input", function(){
			
			var this_element = $("#h_lib_body_preview_name_input_area");
			
			if(this_element.val() != "" && !$("#h_lib_body_preview_name").hasClass("edit")){
				$("#h_lib_body_preview_name").addClass("edit");
			}
		});
		$("#h_lib_body_preview_name_submit").click(function(event){
			
			var this_element = $(event.target);
			
			var input_area 	= $("#h_lib_body_preview_name_input_area");
			var input_val 	= input_area.val();
			
			if(input_val != ""){
				var preview 		= this_element.closest("#h_lib_body_preview");
				var preview_id 		= preview.attr("data-lib_id");
				
				var list_element 	= $(".h_lib_details_element[data-lib_id='"+preview_id+"']");
				
				h_lib_rename( preview_id, input_val, function(){
					$("#h_lib_body_preview_name").removeClass("edit");
					
					var filename = input_val+$("#h_lib_body_preview_name_input_type").text();
					list_element.find(".h_lib_details_element_name").find(".h_lib_details_element_val").text(filename).attr("title", filename);
				});
			}
			else{
				ug_alert( "UMBENENNEN", "Bitte gib einen Dateinamen ein.", "Schließen", 0, function(){} );
			}
		});
		$("#h_lib_body_preview_button_remove").click(function(){
			
			var media_id = $(this).closest("#h_lib_body_preview").attr("data-lib_id");
			
			ug_alert( "DATEI LÖSCHEN", "Datei wirklich löschen?", "Ja", "Abbrechen", function(result){
				
				if(result == true){
				
					h_lib_remove( media_id, function(result){
						
						if(result === true){
							h_lib_preview_close(function(){
								var details_element = $("#h_lib_body_list").find(".h_lib_details_element[data-lib_id='"+media_id+"']");
								details_element.stop().slideUp(300, function(){
									details_element.remove();

									if(!$(".h_lib_details_element:not(.clonable)").length){
                                        $("#h_lib_body_list_details_empty").addClass("active");
									}
								});
							});
						}
						else{
							if(result == "thumbnail")
								ug_alert( "LÖSCHEN NICHT MÖGLICH", "Diese Datei wird als Thumbnail verwendet.", "Schließen", 0, function(){} );
							
							if(result == "temp_product")
								ug_alert( "LÖSCHEN NICHT MÖGLICH", "Diese Datei wird derzeit auf der Produktseite verwendet.", "Schließen", 0, function(){} );
							if(result == "temp_sell")
								ug_alert( "LÖSCHEN NICHT MÖGLICH", "Diese Datei wird derzeit auf dem Bestellformular verwendet.", "Schließen", 0, function(){} );
							if(result == "temp_ty")
								ug_alert( "LÖSCHEN NICHT MÖGLICH", "Diese Datei wird derzeit auf der Dankeseite verwendet.", "Schließen", 0, function(){} );
							
							if(result.startsWith("module_")){
								ug_alert( "LÖSCHEN NICHT MÖGLICH", "Dieses Video wird bereits im Modul '"+ html_decode(result.replace("module_","")) +"' verwendet.", "Schließen", 0, function(){} );
							}
						}
					});
				}
			});
		});
		
		
		//------------------------upload
		$("#h_lib_body_list_details_empty_upload").click(function(){
			h_lib_upload_open(function(){});
		});
		
		var showDrag = false;
		var timeout = -1;

		$("html").bind("dragenter", function () {
			showDrag = true;
			
			var preview = $("#h_lib_body_preview.active");
			var video_thumb = $("#h_lib_body_preview_img_video_content_dropzone:visible");
			
			if(preview.length && video_thumb.length){
				video_thumb.addClass("active");
			}
			if(!video_thumb.hasClass("active")){
				
				var upload_element = $("#h_lib_body_upload");
				if(!upload_element.hasClass("active")){
				
					var task1 = $.Deferred();
					
					if($("#h_lib_body_preview").hasClass("active")){
						h_lib_preview_close(function(){
							task1.resolve();
						});
					}
					else{
						task1.resolve();
					}
					
					$.when(task1).done(function(){
						
						upload_element.addClass("active").find("#h_lib_body_upload_dropzone_msg").addClass("drag");
						h_lib_upload_open(function(){});
						
					}).promise();
				}
			}
		});
		$("html").bind("dragover", function(){
			showDrag = true;
		});
		$("html").bind("dragleave", function (e) {
			
			if(	$(e.target).closest("#wrapper").length == 0 ){
				showDrag = false; 
				clearTimeout( timeout );
				timeout = setTimeout( function(){
					if( !showDrag ){ 
						if($("#h_lib_body_upload_dropzone_content").html() == ""){	
							var upload_element = $("#h_lib_body_upload");
							if(upload_element.hasClass("active")){
								
								h_lib_upload_close(function(){
									upload_element.find("#h_lib_body_upload_dropzone_msg").removeClass("drag");
								});
							}
						}
						$("#h_lib_body_preview_img_video_content_dropzone").removeClass("active");
					}
				}, 200 );
			}
		});
		$("#h_lib_nav_upload").click(function(){
			
			if(!$(this).hasClass("active")){
				h_lib_upload_open(function(){});
			}
			else{
				h_lib_upload_close(function(){});
			}
		});
		
		//init dropzone
		var h_lib_dropzone_area = $("#h_lib_body_upload_dropzone");
	
		h_lib_dropzone = new Dropzone("#h_lib_body_upload_dropzone_content", {
			
			url: glob_cms_home_dir+"temp/php_request/upload.php",
			autoProcessQueue: true,
			dictDefaultMessage: "",
			dictInvalidFileType: "error_filetype",
			thumbnailWidth: 100,
			thumbnailHeight: 100,
			thumbnailMethod: "crop",
			previewTemplate: $("#h_lib_dropzone_element").html(),
			maxFilesize: 5000,
			
			acceptedFiles: "image/*,video/*,application/pdf,mp4",
			
			init: function(){
				
				this.on("addedfile", function (file, response) {
					
					var this_element = $(file.previewElement);
					
					if(!file.type.startsWith("video/") && file.size > 20000000){ //20MB
						ug_alert( "UPLOAD NICHT MÖGLICH", "Die maximale Dateigröße für Bilder und Dokumente beträgt 20MB", "Schließen", 0, function(){} );
						
						this_element.remove();
						this.removeFile(file);
						if($("#h_lib_body_upload_dropzone_content").find(".h_lib_dropzone_element").length == 0){
							h_lib_dropzone_reset();
						}
					}
					
					//general
					$("#h_lib_body_upload_dropzone_msg").hide();
					
					if(!$("#h_lib_nav_upload_action").hasClass("active"))
						$("#h_lib_nav_upload_action").fadeIn(300).addClass("active");
					
					//filename
					this_element.find(".h_lib_dropzone_element_filename").attr("title", file.name);
					
					//icon
					if(!file.type.startsWith("image/")){
						
						this_element.find(".h_lib_dropzone_element_img").find("img").hide();
						
						if(file.type == "application/pdf"){
							this_element.find(".h_lib_dropzone_element_img_pdf").show();
						}
						else if(file.type.startsWith("video/")){
							this_element.find(".h_lib_dropzone_element_img_video").show();
						}
					}

					//vimeo upload
                    if(file.type.startsWith("video/")) {
                        var this_dropzone = this;
                        var file_html = $(file.previewElement);
                        file_html.clone().insertAfter(file_html).addClass("vimeo_upload new");

                        this_dropzone.removeFile(file);

                        file_html = $("#h_lib_body_upload_dropzone_content").find(".vimeo_upload.new");
                        file_html.removeClass("new");

                        var new_element = h_lib_vimeo_files.length;

                        h_lib_vimeo_files[new_element] = file;
                        h_lib_vimeo_files[new_element].preview_element = file_html;
                        h_lib_vimeo_files[new_element].vimeo = "queue";

                        h_lib_upload_vimeo();
                    }
				});
				this.on("sending", function(dropzone_file, xhr, formData){

					if(!dropzone_file.type.startsWith("video/")){
						formData.append("type", "kurs_file");
					}
				});
				this.on("success", function (file, response) {

					var this_dropzone = this;
					$(file.previewElement).slideUp(300, function(){
						this_dropzone.removeFile(file);
						
						if($("#h_lib_body_upload_dropzone_content").find(".h_lib_dropzone_element").length == 0){
							h_lib_dropzone_reset();
						}
					});
					
					//add to list
					var result = $.parseJSON(response);
					
					h_lib_list_add({
						lib_id 		: result["lib_id"],
						lib_type 	: result["lib_type"],
						img_src		: result["src"],
						h_name 		: result["h_name"],
						size 		: result["size"],
						timestamp 	: result["timestamp"]
					});
				});
				this.on("error", function (file, error) {
					
					var remove = false;
					
					if(error == "error_filetype"){
						ug_alert( "UPLOAD NICHT MÖGLICH", "Dateityp '."+file.name.split('.').pop()+"' wird nicht unterstützt.", "Schließen", 0, function(){} );
						remove = true;
					}
					else if(error != "Upload canceled.")
						ug_alert( "UPLOAD FEHLGESCHLAGEN", error, "Schließen", 0, function(){} );
					
					if(remove == true){
					
						var this_dropzone = this;
						$(file.previewElement).slideUp(300, function(){
							this_dropzone.removeFile(file);
							
							if($("#h_lib_body_upload_dropzone_content").find(".h_lib_dropzone_element").length == 0){
								$("#h_lib_body_upload_dropzone_msg").fadeIn(300).removeClass("drag");
								
								if($("#h_lib_nav_upload_action").hasClass("active"))
									$("#h_lib_nav_upload_action").fadeOut(300).removeClass("active");
							}
						});
					}
				});
			}
		});
		$("#h_lib_body_upload_dropzone_content").on("click", ".h_lib_dropzone_element_img_remove", function(event){
			
			var this_element = $(event.target);
			
			this_element.closest(".h_lib_dropzone_element").stop().fadeOut(300, function(){
				
				//standard files
				var dropzone_files = h_lib_dropzone.files;
				for(var x=0; x<dropzone_files.length; x++){
					
					if($(dropzone_files[x].previewTemplate)[0] == $(this)[0]){
						h_lib_dropzone.removeFile(dropzone_files[x]);
					}
				}
				
				//vimeo
				for(var x=0; x<h_lib_vimeo_files.length; x++){
					
					if(h_lib_vimeo_files[x].preview_element[0] == $(this)[0]){
						h_lib_vimeo_files[x].xhr.abort();
						h_lib_vimeo_files[x].vimeo = "canceled";
					}
				}
				
				$(this).remove();
				
				if($("#h_lib_body_upload_dropzone_content").find(".h_lib_dropzone_element").length == 0){
					h_lib_dropzone_reset();
				}
			});
		});
		$("#h_lib_nav_upload_action").click(function(){
			
			var this_element = $(this);
			
			//CANCEL UPLOAD
			
			if(this_element.hasClass("active")){	
				//standard files
				h_lib_dropzone.removeAllFiles(true);
				
				//vimeo cancel
				for(var x=0; x<h_lib_vimeo_files.length; x++){
					
					if(h_lib_vimeo_files[x].preview_element.length){
						h_lib_vimeo_files[x].preview_element.fadeOut(300, function(){
							$(this).remove();
						});
					}
					
					if(h_lib_vimeo_files[x].vimeo != "canceled"){
						if(h_lib_vimeo_files[x].vimeo == "active")
							h_lib_vimeo_files[x].xhr.abort();
						h_lib_vimeo_files[x].vimeo = "canceled";
					}
				}
				
				h_lib_dropzone_reset();
			}
		});
		
		
	}
	
	
	
	//-----------------------------------------------dashboard------------------------------------------------
	
	if($(".hosting_nav_element.active[data-page='dashboard']").length){
		
		//thumbnail
		if($("#h_dashboard_info_thumbnail_dropzone").length){
			dropzone_open( $("#h_dashboard_info_thumbnail_dropzone"), $(".h_dashboard_dropzone_single.clonable"), "kurs_file,thumbnail", 0, function(id, filename){
				
				$("#h_dashboard_info_thumbnail_img").html("<img src='"+glob_cms_home_dir+"temp/media/project/kurse_thumb/"+filename+"' alt='Kursthumbnail' />");
				$("#h_dashboard_info_thumbnail").attr("data-ke_id", id);
				
				var check_publish = $("#h_dashboard_thumbnail").find(".check_publish");
				if(!check_publish.hasClass("active"))
					check_publish.addClass("active");
				
				//update
				kurs_update(hosting_id, "thumbnail", id, function(){ 
					kurs_publish_check(); 
				});
			});
		}
		
		//informations
		$("#h_dashboard_info_text_name_input, #h_dashboard_info_text_descr_input").on("input", function(){
			
			var submit_button = $("#h_dashboard_info_text_submit");
			
			if(!submit_button.hasClass("active")){
				
				if($("#h_dashboard_info_text_name_input").val() != ""){
					submit_button.addClass("active");
					submit_button.stop().slideDown(500);
				}
			}
		});
		$("#h_dashboard_info_text").on("click", "#h_dashboard_info_text_submit", function(event){
			
			var this_element = $(event.target).closest("#h_dashboard_info_text_submit");
			
			if(this_element.hasClass("active")){
				
				this_element.removeClass("active");
				
				var name	= $("#h_dashboard_info_text_name_input");
				var descr	= $("#h_dashboard_info_text_descr_input");
				
				if(name.val() != ""){
					
					if(descr.val() == "" && $("#h_publish_tasks_informations").hasClass("done")){
						
						$("#h_publish_tasks_informations, #h_publish_submit").removeClass("done");
						var check_publish = $("#h_dashboard_info").find(".check_publish");
						if(check_publish.hasClass("active"))
							check_publish.removeClass("active");
					}
					if(name.val() != "" && descr.val() != "" && $(".h_dashboard_info_cat_element.selected").length){
						var check_publish = $("#h_dashboard_info").find(".check_publish");
						if(!check_publish.hasClass("active"))
							check_publish.addClass("active");
					}
					
					var task1 = $.Deferred();
					var task2 = $.Deferred();
					
					kurs_update(hosting_id, "name", name.val(), function(){
						task1.resolve();
						
						if($("#hosting_content").attr("data-kurs_status") == "online"){
							comm_widget_receive_chatroom_id( "kurs", 0, 0, 0, 0, hosting_id, 0, function(chatroom_id){
								lc_chatroom_update( chatroom_id[0], "title", name.val(), function(){});
							});							
						}
					});
					kurs_update(hosting_id, "descr", descr.val(), function(){
						task2.resolve();
					});
					
					$.when(task1, task2).done(function(){
						kurs_publish_check();
						this_element.stop().slideUp(300);
					}).promise();
					
				}
				else{
					ug_alert( "NICHT MÖGLICH", "Dein Kurs muss einen Namen besitzen.", "Schließen", 0, function(){} );
				}
			}
		});
		$(".h_dashboard_info_cat_element").click(function(){
			
			var this_element = $(this);
			
			if(!this_element.hasClass("selected")){
				
				$(".h_dashboard_info_cat_element").removeClass("selected");
				
				kurs_update(hosting_id, "category_id", this_element.attr("data-h_cat"), function(){
					
					this_element.addClass("selected");
				});
			}
		});
		
		if($("#hosting_content").attr("data-kurs_status") == "online"){
			
			/*newsfeed_post*/			
			newsfeed_list_load( "kurs_dashboard", $("#h_dashboard_newsfeed_post_list_inner"), 10, 0, function(){});
			
			$("#h_dashboard_newsfeed_post_subject, #h_dashboard_newsfeed_post_content").on("input", function(){
				
				if(!$("#h_dashboard_newsfeed_post_submit").hasClass("active")){
					if($("#h_dashboard_newsfeed_post_subject").val() != "" && $("#h_dashboard_newsfeed_post_content").val() != ""){
						$("#h_dashboard_newsfeed_post_submit").stop().slideDown(500).addClass("active");
					}
				}
			});
			$("#h_dashboard_newsfeed_post_submit").click(function(){
				
				if($("#h_dashboard_newsfeed_post_subject").val() != "" && $("#h_dashboard_newsfeed_post_content").val() != ""){
					project_msg("post", "kurs", hosting_id, 1, $("#h_dashboard_newsfeed_post_subject").val(), $("#h_dashboard_newsfeed_post_content").val(), function(){
						newsfeed_list_load( "kurs_dashboard", $("#h_dashboard_newsfeed_post_list_inner"), 1, 1, function(){});
						
						$("#h_dashboard_newsfeed_post_subject").val("");
						$("#h_dashboard_newsfeed_post_content").val("");
						$("#h_dashboard_newsfeed_post_submit").stop().slideUp(500).removeClass("active");
					});
				}
				else
					ug_alert( "DU HAST ETWAS VERGESSEN", "Gib einen Betreff und eine Nachricht ein, um den Post zu senden.", "Schließen", 0, function(){} );
			});
		}
	}
	
	
	/*--------------------content------------------------*/
	
	if($(".hosting_nav_element.active[data-page='content']").length){
		
		$("#hosting_content_edit").hide();
		$("#hosting_content_media").hide();
		
		kurs_content_receive(function(result){
			
			for(var x=0; x<result.length; x++){
				
				//lessons
				kurs_content_lesson_add(result[x]["id"], result[x]["title"], result[x]["visibility"]);
				
				if(result[x]["module"] != undefined && result[x]["module"].length){
					
					for(var y=0; y<result[x]["module"].length; y++){
						
						kurs_content_module_add(result[x]["module"][y]["lesson_id"], result[x]["module"][y]["id"], result[x]["module"][y]["title"], result[x]["module"][y]["visibility"], result[x]["module"][y]["preview"]);
					}
				}
				
				if(getCookie("h_c_lesson_"+result[x]["id"]) == "1"){
					
					var lesson_element = $(".h_content_lesson_element[data-c_id='"+result[x]["id"]+"']");
					
					lesson_element.addClass("active").find(".h_content_lesson_element_module").stop().show();
				}
			}
			
			if($(".h_content_lesson_element.active").length){
				$("#hosting_content_edit").show();
				$("#hosting_content_media").show();
			}
		
			
			$("#h_content_lesson_list").sortable({
				items: '> .h_content_lesson_element',
				axis: 'y',
				sort: sort_jQueryBug8342Fix,
				start: function(e, ui){
					ui.item.addClass("drag");
				},
				stop: function(e, ui){
					ui.item.removeClass("drag");
				},
				update: function(e, ui){
					kurs_content_pos_update();
				}
			});
			
			$(".h_content_lesson_element_module_list").each(function(){
				
				$(this).sortable({
					items: '> .h_content_module_element',
					axis: 'y',
					connectWith: ".h_content_lesson_element_module_list",
					sort: sort_jQueryBug8342Fix,
					start: function(e, ui){
						ui.item.addClass("drag");
					},
					stop: function(e, ui){
						ui.item.removeClass("drag");
					},
					update: function(e, ui){
						kurs_content_pos_update();
					}
				});
			});
		
			$("#hosting_content").on("click", ".h_content_lesson_element_title", function(event){
				
				var lesson_element = $(event.target).closest(".h_content_lesson_element");
				
				if(!lesson_element.hasClass("active")){
					lesson_element.addClass("active");
					lesson_element.find(".h_content_lesson_element_module").stop().slideDown(500);
					
					document.cookie = "h_c_lesson_"+lesson_element.attr("data-c_id")+"=1";
				}
				else{
					lesson_element.removeClass("active");
					lesson_element.find(".h_content_lesson_element_module").stop().slideUp(500);
					
					document.cookie = "h_c_lesson_"+lesson_element.attr("data-c_id")+"=";
				}
			});
			
			$("#hosting_content").on("click", ".h_content_lesson_element_icon.edit", function(event){
				
				var this_element = $(event.target);
				var lesson_id = this_element.closest(".h_content_lesson_element").attr("data-c_id");
				
				kurs_content_lesson_edit(lesson_id);
			});
			
			$("#hosting_content").on("input", ".h_content_lesson_input_area", function(event){
				
				this_element = $(event.target);
				
				var input_wrapper 	= this_element.closest(".h_content_lesson_input");
				var submit_button	= input_wrapper.next(".h_content_element_submit");
				
				if(!submit_button.hasClass("active")){
				
					submit_button.addClass("active");
					
					input_wrapper.addClass("edit");
					submit_button.stop().fadeIn(300);
				}
			});
			$("#hosting_content").on("keypress", ".h_content_lesson_input_area", function(event){
				
				if(event.which == 13){
					
					var this_element = $(event.target);
					if(this_element.val() != ""){
						
						var input_wrapper = this_element.closest(".h_content_lesson_input");
						
						kurs_content_element_submit( input_wrapper );
					}
				}
			});
			$("#hosting_content").on("click", ".h_content_element_submit", function(event){
				
				var this_element 	= $(event.target).closest(".h_content_element_submit");
				var input_wrapper 	= this_element.prev(".h_content_lesson_input");
				
				kurs_content_element_submit( input_wrapper );
			});
			//publish_nav
			$("#hosting_content_lessons").on("click", ".h_content_lesson_element_icons_visibility.active", function(event){
				kurs_content_visibility("lesson", $(event.target).closest(".h_content_lesson_element").attr("data-c_id"), 1);
			});
			$("#hosting_content_lessons").on("click", ".h_content_module_element_icons_visibility.active", function(event){
				kurs_content_visibility("module", $(event.target).closest(".h_content_module_element").attr("data-c_id"), 1);
			});

			//--------files_draggable
            kurs_content_files_draggable();
			
			//--------video_draggable
			kurs_content_video_draggable();
			
			$("#hosting_content_edit_video_remove").click(function(){
				
				var drop_elem = $("#hosting_content_edit_video_drop");
				
				if(!drop_elem.hasClass("empty")){
					$("#hosting_content_edit_video_content").stop().hide();
					drop_elem.addClass("empty").stop().fadeIn(500);
					$(this).stop().slideUp(500);
					
					var module_id = $("#hosting_content_edit_module").attr("data-module_id");
					
					kurs_content_module_video_update(module_id, 0, function(){});
				}
			});
			
			$("#hosting_content_edit_descr_area").trumbowyg({
				lang	: "de",
				btns: [['formatting'], ['bold', 'italic'], ['link'], 'btnGrp-lists', ['removeformat']]
				
			}).on("tbwinit", function(){
				
				$("#hosting_content").on("click", ".h_content_module_element_title", function(event){
					
					var this_element = $(event.target).closest(".h_content_module_element_title");
					
					kurs_module_open( this_element.closest(".h_content_module_element").attr("data-c_id"), function(){} );
				});
				
				if(getCookie("h_c_module_open")){
					kurs_module_open( getCookie("h_c_module_open"), function(){} );
				}
				
			}).on("tbwchange", function(){
				
				var submit_button = $("#hosting_content_edit_descr_submit");
				
				if(!submit_button.hasClass("active")){
					submit_button.stop().slideDown(500).addClass("active");
				}
			});
			
			
			
			//------------edit
			
			//-------module
			//video
			$(window).on("resize", function(){
				
				hosting_video_resize();
			});
			
			
			//title
			$("#hosting_content_edit_title_input_area").on("input", function(event){
				
				var this_element 	= $(event.target);
				var submit_element 	= $("#hosting_content_edit_title_submit");
				var input_wrapper	= $("#hosting_content_edit_title");
				
				if(this_element.val() != "" && !input_wrapper.hasClass("edit")){
					
					input_wrapper.addClass("edit");
				}
			});
			$("#hosting_content_edit_title_submit").click(function(){
				
				var id 				= $("#hosting_content_edit_module").attr("data-module_id");
				
				var input_wrapper	= $("#hosting_content_edit_title");
				var input_element 	= $("#hosting_content_edit_title_input_area");
				var input_val	 	= input_element.val();
				
				var nav_title		= $(".h_content_module_element_title.selected");
				
				if(input_wrapper.hasClass("edit") && input_val != ""){
					
					kurs_content_update("module", id, "title", input_val, function(){
						input_wrapper.removeClass("edit");
						nav_title.text(input_val);
					});
				}
				else
					ug_alert( "DU HAST ETWAS VERGESSEN", "Dein Modul braucht einen Titel.", "Schließen", 0, function(){} );
			});
			
			
			//descr
			$("#hosting_content_edit_descr_submit").click(function(){
				
				var this_element = $(this);
				var id = $("#hosting_content_edit_module").attr("data-module_id");
				
				if(this_element.hasClass("active")){
					
					kurs_content_update("module", id, "descr", $("#hosting_content_edit_descr_area").trumbowyg("html"), function(){
						this_element.stop().slideUp(500).removeClass("active");
						kurs_publish_check();
					});
				}
			});
			
			//settings
			
			//visibility
			$("#hosting_content_edit_settings_visibility").click(function(){
				
				var this_element 	= $(this);
				var val 			= 0;
				var id 				= $("#hosting_content_edit_module").attr("data-module_id");
				
				if(!this_element.hasClass("active")){
					val = 1;
				}
				
				kurs_content_visibility("module", id, val);
			});
			
			//preview
			$("#hosting_content_edit_settings_preview").click(function(){
				
				var this_element = $(this);
				var id = $("#hosting_content_edit_module").attr("data-module_id");
				
				var val = 0;
				
				if(!this_element.hasClass("active"))
					val = 1;
				
				kurs_content_module_preview(id, val, function(){
					
					var nav_element = $(".h_content_module_element[data-c_id='"+id+"']").find(".h_content_module_element_icons_preview");
					
					if(this_element.hasClass("active")){
						this_element.removeClass("active");
						nav_element.removeClass("active");
					}
					else{
						this_element.addClass("active");
						nav_element.addClass("active");
					}
				});
			});
			
			//delete
			$("#hosting_content_edit_settings_remove").click(function(){
				
				ug_alert( "MODUL LÖSCHEN", "Möchtest du dieses Modul wirklich löschen?", "Ja", "Abbrechen", function(result){
				
					if(result == true){
				
						var inner 	= $("#hosting_content_edit_module");
						var id 		= inner.attr("data-module_id");
						
						kurs_content_module_remove(id, function(){
							
							$(".h_content_module_element[data-c_id='"+id+"']").remove();
							inner.stop().fadeOut(300, function(){
								inner.css("visibility", "hidden").show();
							});
						});
					}
				});
			});
			
			//-----lesson
			$("#hosting_content_edit_lesson_settings_title_input_area").on("input", function(){
				
				var lesson_title = $("#hosting_content_edit_lesson_settings_title");
				
				if(!lesson_title.hasClass("active")){
					lesson_title.addClass("active");
				}
			});
			$("#hosting_content_edit_lesson_settings_title_submit").click(function(){
				
				var input_element 	= $("#hosting_content_edit_lesson_settings_title_input_area");
				var input_val		= input_element.val();
				
				var id				= $("#hosting_content_edit_lesson").attr("data-c_id");
				
				if(input_val != ""){
					
					kurs_content_update("lesson", id, "title", input_val, function(){
						$("#hosting_content_edit_lesson_settings_title").removeClass("active");
						
						var title_element = $(".h_content_lesson_element[data-c_id='"+id+"']").find(".h_content_lesson_element_title");
						title_element.html(input_val);
					});
				}
			});
			
			$("#hosting_content_edit_lesson_settings_visibility").click(function(){
				
				var this_element = $(this);
				
				var id = $("#hosting_content_edit_lesson").attr("data-c_id");
				
				var visibility = 0;
				if(!this_element.hasClass("active"))
					visibility = 1;
				
				kurs_content_visibility("lesson", id, visibility);
			});
			
			$("#hosting_content_edit_lesson_settings_remove").click(function(){
				
				var id = $("#hosting_content_edit_lesson").attr("data-c_id");
				
				ug_alert( "LEKTION LÖSCHEN", "Diese Lektion mit allen Modulen entgültig löschen?", "Ja", "Abbrechen", function(result){
				
					if(result == true){
					
						kurs_content_lesson_remove(id, function(){
							
							var edit_element = $("#hosting_content_edit_lesson[data-c_id='"+id+"']:visible");
							
							$(".h_content_lesson_element[data-c_id='"+id+"']").remove();
							edit_element.fadeOut(300).removeClass("active");
						});
					}
				});
			});
		});
	}
	
	
	//-----------------------------------pages--------------------------------------
	
	if($(".hosting_nav_element.active[data-page='pages']").length){
		
		//init check_publish
		$(".check_publish").each(function(){
			
			var page_edit_element = $(".h_pages_edit[data-page_type='"+$(this).closest(".h_pages_overview_element").attr("data-page_type")+"']");
			
			if(page_edit_element.length && page_edit_element.find(".product_text_placeholder.required, .product_img_placeholder.required").length){
				$(this).removeClass("active");
			}
			else{
				$(this).addClass("active");
			}
		});
		
		//init price_button
		var product_price = $("#hosting_content").attr("data-kurs_price");
		
		$("*[data-product_type='member']").hide();
		if(product_price == 0)
			$("*[data-product_type='buy']").hide();
		else
			$("*[data-product_type='free']").hide();
		
		$(".h_pages_overview_content").click(function(){
			
			var page_element = $("#h_pages_"+$(this).closest(".h_pages_overview_element").attr("data-page_type"));
			
			if(page_element.length){
				
				$("#h_pages_overview").hide();
				page_element.stop().fadeIn(500);
			}
			
			$(".h_pages_edit_temp_inner").find("*[data-cms_img_align='cover_center']").each(function(){
				coverimg($(this));
			});
			temp_on_resize();
		});
		
		$(".h_pages_edit_temp_bar_back").click(function(){
			
			$(".h_pages_edit").hide();
			$("#h_pages_overview").stop().fadeIn(500);
			
			$(".h_pages_overview_content").find("*[data-cms_img_align='cover_center']").each(function(){
				coverimg($(this));
			});
			temp_on_resize();
		});
		
		/*init page-edit*/
		
		$(".h_pages_edit_temp_inner").find("*[data-pcms_type='img']:not(.h_pages_edit_element), *[data-pcms_type='video']:not(.h_pages_edit_element)").each(function(){
			
			var this_element 	= $(this);
			var pcms_type		= this_element.attr("data-pcms_type");
			
			$(".h_pages_edit_element[data-pcms_type='"+pcms_type+"'].clonable").clone().appendTo( this_element );
			this_element.find(".h_pages_edit_element").removeClass("clonable");
		});
		
		
		/*img, video_edit*/
		kurs_pages_draggable();
		
		/*text_edit*/
		$(".h_pages_text_editor").clone().removeClass("clonable").appendTo(".h_pages_edit_temp_inner");
		
		$(".h_pages_text_editor:not(.clonable)").each(function(){
			
			var this_element 	= $(this);
			var textarea 		= this_element.find(".h_pages_text_editor_area");
			var submit_button	= this_element.find(".h_pages_text_editor_submit");
			
			textarea.trumbowyg({
				lang	: "de",
				btns: [['formatting'], ['bold', 'italic'], ['link'], 'btnGrp-lists', 'btnGrp-justify', ['removeformat']/*, 'foreColor'*/]				
			}).on("tbwchange", function(){
				
				if(!submit_button.hasClass("active")){
					submit_button.stop().slideDown(500).addClass("active");
				}
			});
		});
		
		$(".h_pages_edit_temp_inner *[data-pcms_type='text']:not(.h_pages_edit_element)").click(function(){
			
			var this_element = $(this);
			
			var temp_wrapper = this_element.closest(".h_pages_edit_temp_inner");
			var text_editor	 = temp_wrapper.find(".h_pages_text_editor");
			
			temp_wrapper.css("overflow-y", "hidden");
			text_editor.stop().fadeIn(500).addClass("active").css("top", temp_wrapper.scrollTop() +"px");
			
			text_editor.attr({"data-pos": this_element.attr("data-pcms_pos")});
			
			var textarea = temp_wrapper.find(".h_pages_text_editor_area");
			
			var text_html = this_element.html();
			if(this_element.find(".product_text_placeholder").length)
				text_html = "";
			
			textarea.trumbowyg("html", text_html);
		});
		$(".h_pages_text_editor_cancel").click(function(){
			
			var this_element = $(this);
			h_pages_text_editor_close( this_element.closest(".h_pages_text_editor") );
		});
		
		$(".h_pages_text_editor_submit").click(function(){
			
			var this_element = $(this);
			
			var text_editor	 = this_element.closest(".h_pages_text_editor");
			var page_wrapper = this_element.closest(".h_pages_edit");
			var page_type 	 = page_wrapper.attr("data-page_type");
			
			var content		 = text_editor.find(".h_pages_text_editor_area").trumbowyg("html");
			
			if(content != ""){
				
				var position	 = text_editor.attr("data-pos");
				
				if(this_element.hasClass("active")){
					
					kurs_pages_update( page_type, position, "text", content, function(){
						
						$("*[data-pcms_type='text'][data-pcms_pos='"+position+"']").html(content);
						
						this_element.removeClass("active").stop().slideUp(300);
						h_pages_text_editor_close( this_element.closest(".h_pages_text_editor") );
						
						kurs_publish_check();
					});
				}
			}
			else{
				ug_alert( "UNVOLLSTÄNDIG", "Du musst etwas eingeben. :)", "Schließen", 0, function(){} );
			}
		});
	}
	
	/*----------------------MARKETING----------------------*/
	
	//keywords
	if($("#hosting_marketing").length || $("#h_publish").length){
		
		if($("#h_marketing_keywords").length){
			h_marketing_keywords_init( $("#h_marketing_keywords") );
		}
		if($("#h_publish_keywords").length){
			h_marketing_keywords_init( $("#h_publish_keywords") );
		}
		
		$("#content").on("input", ".h_marketing_keywords_input_area input", function(event){
			
			var this_element 	= $(event.target);
			var input			= this_element.closest(".h_marketing_keywords_input");
			var parent			= this_element.closest("*[data-keywords]");
			
			if(!input.hasClass("input"))
				input.addClass("input");
			
			var input_element = input.find("input");
			var input_val = this_element.val();
			
			if(input_val.slice(-1) == "," || input_val.slice(-1) == " "){
				
				input_element.val( input_val.slice(0,-1) );
				h_marketing_keywords_add( parent );
			}
			
		});
		$("#content").on("submit", ".h_marketing_keywords_input form", function(event){
			
			var this_element 	= $(event.target);
			var parent			= this_element.closest("*[data-keywords]");
			
			h_marketing_keywords_add( parent );
		});
		$("#content").on("click", ".h_marketing_keywords_element_remove", function(event){
			
			var element = $(event.target).closest(".h_marketing_keywords_element");
			
			h_marketing_keywords_remove( element.find(".h_marketing_keywords_element_text").attr("title") );
		});
		
	}
	if($("#hosting_marketing").length){
		
		
	}
});