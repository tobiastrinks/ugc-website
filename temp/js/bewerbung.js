//----glob_var
//vimeo_upload
var h_lib_vimeo_files = [];
var kurs_id;

var module_descr_cache = "";

//------------general

function ke_on_resize(){
	
	$("#ke_1_descr_input").css("height", $("#ke_1_thumbnail").height()-$("#ke_1_title_input").outerHeight(true) +"px");
}

function ke_page_open( new_page, fast ){
	
	if(!new_page.hasClass("active") && new_page.length){
		
		$(".ke_page").removeClass("active").css("overflow-y","hidden");
		
		var new_index 	= new_page.index();
		var pages		= $(".ke_page");
		var diff;
		var left;
		
		for(var x=0; x<pages.length; x++){
			
			diff = (x+1)-new_index;
			left = 100*diff +"%";
			
			if(fast == 1){
				pages.eq(x).stop().css("left", left).css("overflow-y","auto");
			}
			else{
				pages.eq(x).stop().animate({"left": left}, 2000, function(){
					$(this).css("overflow-y","auto");
				});
			}
		}
		new_page.addClass("active");
		$(".ke_nav_element").removeClass("active");
		$(".ke_nav_element[data-pageid='"+new_page.attr("id")+"']").addClass("active");
	}
}


function kurs_application_receive(kurs_id, callback){
	//kurs erstellen
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 			: "kurs_application_receive",
		kurs_id			: kurs_id
	})
	.done(function( data ){
		if(data != "")
			callback($.parseJSON(data));
		else
			callback("");
	});
}
function kurs_application_init(kurs_id){
	
	kurs_application_receive(kurs_id, function(result){
		
		//ke_1
		$("*[data-ke_type='name']").val( result["name"] );
		$("*[data-ke_type='descr']").val( result["descr"] );
		
		if(result["thumbnail"] != undefined)
			$("*[data-ke_type='thumbnail']").html("<img src='"+glob_cms_home_dir+"temp/media/project/kurse_thumb/"+result["thumbnail"]+"' alt='Kursthumbnail' />");
	
		$("*[data-ke_type='cat']").find("*[data-ke_cat]").removeClass("active");
		$("*[data-ke_type='cat']").find("*[data-ke_cat='"+ result["category_id"] +"']").addClass("active");
		
		//ke_2
		if(result["price_model"] == "fix"){
			$("#ke_2_fix_onetime_input").val(result["price_1"]);
			
			if(result["price_2"] != 0)
				$("#ke_2_fix_rate1_input").val(result["price_2"]);
			
			if(result["price_duration"] != 0)
				$("#ke_2_fix_rate2_input").val(result["price_duration"]);
		}
		if(result["price_model"] == "abo"){
			$("#ke_2_abo_input").val(result["price_1"]);
		}
		
		var flip_element = $(".ke_2_rows[data-ke_price_model='"+result["price_model"]+"']");
		if(flip_element.length)
			ke_2_flip(flip_element);
		ke_2_check();
		
		//ke_3
		$("#ke_3_content").attr("data-module_id", result["module_id"]);
		
		if(result["module_title"] != ""){
			$("#ke_3_title_input").val(result["module_title"]);
		}
		
		if(result["video_name"] != undefined){
			$("#ke_3_dropzone").addClass("done");
			$("#ke_3_dropzone_done").attr("data-ke_video_id", result["video_id"]).find(".ke_3_dropzone_upload_filename").text(result["video_name"]);
		}
		
		for(var x=1; x<=3; x++){
			if(result[ "question_"+x ] != 0)
				$(".ke_3_questions_element_textarea[data-ke_question='"+x+"']").val( result[ "question_"+x ] );
		}
		
		$("#ke_3_descr_input").trumbowyg({
			lang	: "de",
			btns: [['formatting'], ['bold', 'italic'], ['link'], 'btnGrp-lists', ['removeformat']]
			
		}).on("tbwinit", function(){
			
			var this_trumb = $(this);
			
			this_trumb.trumbowyg("html", result["module_descr"]);
			module_descr_cache = result["module_descr"];
			
			setInterval(function(){
				
				var new_descr = this_trumb.trumbowyg("html");
				
				if(new_descr != module_descr_cache){
					
					kurs_content_update("module", $("#ke_3_content").attr("data-module_id"), "descr", new_descr, function(){});
					module_descr_cache = new_descr;
				}
			}, 2000);
			
		});
	});
}
function kurs_application_update(kurs_id, attr, val, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_application_update",
		kurs_id : kurs_id,
		attr 	: attr,
		val	 	: val
	})
	.done(function( data ){
		
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}
function kurs_application_submit(kurs_id, callback){
	
	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 			: "kurs_application_submit",
		kurs_id			: kurs_id
	})
	.done(function( data ){
		
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else
			callback(1);
	});
}

function ke_2_flip(element){
	
	$(".ke_2_flip.selected").removeClass("selected").toggleClass("flipped").closest(".ke_2_rows");
	element.find(".ke_2_rows_inner_1").closest(".ke_2_flip").toggleClass("flipped").addClass("selected");
}
function ke_2_check(){
	
	$(".ke_2_rows").removeClass("active");
	
	var selected 		= $(".ke_2_flip.selected");
	var selected_id 	= selected.closest(".ke_2_rows").attr("id");
	
	var result = 0;
	
	if(selected_id == "ke_2_free"){
		result = 1;
	}
	else if(selected_id == "ke_2_fix"){
		if($("#ke_2_fix_onetime_input").val() > 0 && 
			( ($("#ke_2_fix_rate1_input").val() == "" && $("#ke_2_fix_rate2_input").val() == "") || 
			($("#ke_2_fix_rate1_input").val() > 0 && $("#ke_2_fix_rate2_input").val() > 0) )){
				result = 1;
			}
	}
	else if(selected_id == "ke_2_abo"){
		if($("#ke_2_abo_input").val() > 0)
			result = 1;
	}
	
	if(result == 0)
		return false;
	else{
		selected.closest(".ke_2_rows").addClass("active");
		return true;
	}
}
function ke_2_price_update(){
	
	var price_1, price_2, price_duration;
	var price_model = $(".ke_2_rows.active").attr("data-ke_price_model");
	
	kurs_update(kurs_id, "price_model", price_model, function(){});
	
	if(price_model == "free"){
		price_1 = 0;
		price_2 = 0;
		price_duration = 0;
	}
	if(price_model == "fix"){
		price_1 = $("#ke_2_fix_onetime_input").val();
		
		price_2 = $("#ke_2_fix_rate1_input").val();
		if(price_2 == "")
			price_2 = 0;
		
		price_duration = $("#ke_2_fix_rate2_input").val();
		if(price_duration == "")
			price_duration = 0;
	}
	if(price_model == "abo"){
		price_1 = $("#ke_2_abo_input").val();
		price_2 = 0;
		price_duration = 0;
	}
	
	kurs_update(kurs_id, "price_1", price_1, function(){});
	kurs_update(kurs_id, "price_2", price_2, function(){});
	kurs_update(kurs_id, "price_duration", price_duration, function(){});
}

$(document).ready(function(){
	
	kurs_id = $("#content").attr("data-kurs_id");
	
	kurs_application_init(kurs_id);
	
	ke_on_resize();
	
	$(window).on("resize", function(){
		ke_on_resize();
	});
	
	ke_page_open( $("#ke_1"), 1 );
	
	/*nav*/
	$("#ke_nav").on("click", ".ke_nav_element", function(event){
		
		var this_element = $(event.target).closest(".ke_nav_element");
		
		if(!this_element.hasClass("active")){
			
			ke_page_open( $("#"+this_element.attr("data-pageid")) );
		}
	});
	
	$(".ke_continue").click(function(){
		ke_page_open( $(".ke_page.active").next(".ke_page") );
	});
	
	/*ke_1*/
	dropzone_open( $("#ke_1_thumbnail_dropzone"), $(".ke_dropzone_single.clonable"), "kurs_file,thumbnail", 0, function(id, filename){
		
		$("#ke_1_thumbnail_img").html("<img src='"+glob_cms_home_dir+"temp/media/project/kurse_thumb/"+filename+"' alt='Kursthumbnail' />");
		$("#ke_1_thumbnail").attr("data-ke_id", id);
	
		kurs_update(kurs_id, "thumbnail", id, function(){});
	});
	
	$("*[data-ke_type='name'], *[data-ke_type='descr']").change(function(){
		
		kurs_update(kurs_id, $(this).attr("data-ke_type"), $(this).val(), function(){});
	});
	
	$(".ke_1_cat_element").click(function(){
		
		var this_element = $(this);
		
		if(!this_element.hasClass("active")){
			
			var cat_id = this_element.attr("data-ke_cat");
			
			$(".ke_1_cat_element").removeClass("active");
			this_element.addClass("active");
			
			$(".ke_1_cat_descr").removeClass("active");
			$(".ke_1_cat_descr[data-ke_cat='"+cat_id+"']").addClass("active");
			
			kurs_update(kurs_id, "category_id", cat_id, function(){});
		}
	});
	
	/*ke_2*/
	$(".ke_2_rows_inner_1").click(function(){
		
		ke_2_flip($(this).closest(".ke_2_rows"));
		
		if(ke_2_check() == true){
			ke_2_price_update();
		}
	});
	
	$("#ke_2_fix input, #ke_2_abo input").on("input", function(event){
		ke_2_check();
	});
	$("#ke_2_fix input, #ke_2_abo input").on("change", function(event){
		if(ke_2_check() == true){
			ke_2_price_update();
		}
	});
	
	/*ke_3*/
	$("#ke_3_title_input").change(function(){
		
		kurs_content_update("module", $("#ke_3_content").attr("data-module_id"), "title", $(this).val(), function(){});
	});
	
	var bewerbung_vimeo_upload = 0;
	
	var bewerbung_dropzone = new Dropzone("#ke_3_dropzone_inner", {
		url: "#",
		autoProcessQueue: true,
		previewTemplate: $("#ke_3_dropzone_prev_temp").html(),
		maxFiles: 1,
		autoProcessQueue: false,
		dictInvalidFileType: "error_filetype",
		acceptedFiles: "video/*",
		
		init: function(){
			
			this.on("addedfile", function (file, response) {
				
				var this_dropzone = this;
				var dropzone_element = $("#ke_3_dropzone");
				
				if(dropzone_element.hasClass("done")){
					
					dropzone_element.removeClass("done").addClass("upload");
					
					ug_alert( "BEWERBUNGSVIDEO ÜBERSCHREIBEN?", "Mit dem Upload eines weiteren Videos, wird das alte Video überschrieben.", "Weiter", "Abbrechen", function(result){
						
						if(result){
							this_dropzone.processFile(file);
						}
						else{
							dropzone_element.addClass("done").removeClass("upload");
						}
					});
				}
				else{
					this_dropzone.processFile(file);
				}
			});
			
			this.on("sending", function(dropzone_file, xhr, formData){
				
				$("#ke_3_dropzone").addClass("upload").removeClass("done");
				
				var filename = dropzone_file.name;
				
				h_lib_vimeo_files[0] = dropzone_file;
				h_lib_vimeo_files[0]["vimeo"] = "active";
				
				$("#ke_3_dropzone_upload").html("");
				
				var file_html = $(dropzone_file.previewElement);
				file_html.clone().appendTo($("#ke_3_dropzone_upload"));
				
				if(bewerbung_vimeo_upload != 0)
					bewerbung_vimeo_upload.xhr.abort();
				
				bewerbung_vimeo_upload = dropzone_file;
				
				this.removeFile(dropzone_file);
				
				var uploader = new VimeoUpload({
					file: bewerbung_vimeo_upload,
					
					onProgress: function(data) {
						var progress = data.loaded/data.total*100;
						$("#ke_3_dropzone_upload").find(".ke_3_dropzone_upload_progress").attr("data-dz-uploadprogress", progress).css("width", progress+"%");
						$("#ke_3_dropzone_upload").find(".ke_3_dropzone_upload_progress_val").text(Math.round(progress));
					},
					
					onComplete: function(data) {
						
						var result = $.parseJSON(data);
						
						var dropzone_done = $("#ke_3_dropzone_done");
						var old_video_id = dropzone_done.attr("data-ke_video_id");
						
						kurs_content_update("module", $("#ke_3_content").attr("data-module_id"), "video_id", result["lib_id"], function(){
						
							if(old_video_id != undefined && old_video_id != ""){
								
								$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
									task 		: "kurs_lib_remove",
									id			: old_video_id
								});
							}
							
							$("#ke_3_dropzone").removeClass("upload").addClass("done");
							dropzone_done.attr("data-ke_video_id", result["lib_id"]).find(".ke_3_dropzone_upload_filename").text(result["h_name"]);
						});
						
					}
				});
				uploader.upload();
			});
			
			this.on("error", function(file, error){
				if(error == "error_filetype"){
					ug_alert( "DATEITYP NICHT UNTERSTÜTZT", "Es werden ausschließlich Videodateien unterstützt!", "Schließen", 0, function(){} );
					this.removeFile(file);
				}
			});
		}
	});
	
	
	/*questions*/
	$(".ke_3_questions_element_textarea").change(function(){
		
		var val = $(this).val();
		var attr = "question_"+$(this).attr("data-ke_question");
		
		kurs_application_update(kurs_id, attr, val, function(){});
	});
	
	/*submit*/
	$("#ke_submit").click(function(event){
		
		if(!$("#ke_3_dropzone").hasClass("upload")){
		
			var question_steps = $("#ke_submit_steps");
			
			blk_steps_open(question_steps);
			
			$(".blk_steps_content_page_button").click(function(){
				blk_steps_next(question_steps, function(){});
			});
			
			$("#application_submit").click(function(){
				if(!$(this).hasClass("inactive")) {
					$(this).addClass("inactive");
                    kurs_application_submit(kurs_id, function () {
                        ug_alert("BEWERBUNG GESENDET!", "Danke Dir! Wir werden Dir schnellstmöglich antworten. :)", "Zur Startseite", 0, function () {
                            document.cookie = "control_open=1";
                            window.location = "index.html";
                        });
                    });
                }
			});
		}
		else{
			ug_alert( "AKTIVER UPLOAD", "Bitte warte bis dein Modulvideo vollständig hochgeladen wurde.", "Schließen", 0, function(){} );
		}
	});
});