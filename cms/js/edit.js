// global var

var media_dropzone = "";
var cms_menu_posx;
var cms_menu_posy;

var cms_data_save = true;

var cms_onpage_changes = "";


//basic functions extra file: 'basic.js'

// cms_box
function cms_box_open( selector ){
		
	$("body, html").css("overflow", "hidden");
	selector.wrap("<div class='cms_box_wrapper cms_element'></div>");
	
	$(".cms_box_wrapper").scroll(function(){
		if($("#cms_goto_top").hasClass("active")){
			if($(".cms_box_wrapper").scrollTop() > 0){
				if($("#cms_goto_top").css("display") == "none")
					$("#cms_goto_top").stop().fadeIn(300);
			}
			else{
				if($("#cms_goto_top").css("display") != "none")
					$("#cms_goto_top").stop().fadeOut(300);
			}
		}
	});
	
	if(selector.attr("id") == "cms_inhalte_bearbeiten")
		$("#cms_ib_widget").stop().fadeOut(500);
		
	
	$("#cms_black").stop().fadeIn(500, function(){ 
		selector.stop().fadeIn(300, function(){
			
			if(selector.find("#cms_ib_editor_img").attr("display") != "none"){
				
				var cms_img = $("#cms_ib_editor_img_vorschau").find("#cms_ib_editor_img_vorschau_img");
			
			}
			
		}); 
	});
	$("#cms_goto_top").addClass("active");
	
}
function cms_box_close( selector ){
	
	if(cms_data_save == false)
		if(confirm("Änderungen verwerfen?"))
			cms_data_save = true;
	
	if(cms_data_save == true){
		
		cms_media_close();
		
		if(selector == "all"){
			//media
			cms_box_close( $("#cms_mediathek") );
			$("#cms_menu_mediathek").removeClass("active");
			
			//sv
			cms_box_close( $("#cms_seitenverwaltung") );
			$("#cms_menu_seitenverwaltung").removeClass("active");
			
			//IB
			cms_box_close( $("#cms_inhalte_bearbeiten") );
			
			//settings
			cms_box_close( $("#cms_settings") );
			$("#cms_menu_settings").removeClass("active");
		}
		else{
			selector.fadeOut(300);
			$("#cms_goto_top").removeClass("active").fadeOut(300);
			$("#cms_black").fadeOut(300, function(){
				$(".cms_box_wrapper").find(".cms_box").unwrap();
				$("body, html").css("overflow", "auto");
			});
			
			if(selector.attr("id") == "cms_inhalte_bearbeiten"){
				$("#cms_ib_widget").stop().fadeIn(500);
			}
		}
	}
	
}


function cms_thumbnail_create(upload){
	
	$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
		task : "media_thumbnail_create"
	})
	.done(function( data ) {
		
		if(data != "")
			alert(data);
		
		if(upload == 1)
			cms_mediathek_load_content();
	});
}
// cms_menu
function cms_menu_relative(){
	
	if( parseInt($("#cms_menu").css("top"))+100 > window.innerHeight ){
		$("#cms_menu").css("top", ( window.innerHeight-$("#cms_menu").width() ) + "px");
	}
	if( parseInt($("#cms_menu").css("left"))+100 > window.innerWidth ){
		$("#cms_menu").css("left", ( window.innerWidth-$("#cms_menu").width() ) + "px");
	}
	if( parseInt($("#cms_menu").css("top")) < 0 ){
		$("#cms_menu").css("top", "0px");
	}
	if( parseInt($("#cms_menu").css("left")) < 0 ){
		$("#cms_menu").css("left", "0px");
	}
}
function cms_load_menu(abstand){
	
	cms_menu_posx = getCookie("cms_menu_posx");
	cms_menu_posy = getCookie("cms_menu_posy");
	
	if(cms_menu_posx != ""){
		$("#cms_menu").css("top", cms_menu_posy).css("left", cms_menu_posx);
	}
	else{
		cms_menu_posx = $("#cms_menu").css("left");
		cms_menu_posy = $("#cms_menu").css("top");
	}
	
	
	var menu_main_height = $("#cms_menu_main").height();
	var main_elements_innerheight = $(".cms_menu_main_elements").innerHeight();
	var main_elements_outerheight = $(".cms_menu_main_elements").outerHeight();
	var main_elements_border = (main_elements_outerheight-main_elements_innerheight)/2;
	
	var main_elements_top = $(".cms_menu_main_elements_top");
	var count_top = main_elements_top.length;
	
	var for_count = 1;
	
	for(var x=(count_top-1); x>=0; x--){
		main_elements_top.eq(x).css("top", -for_count*(abstand+main_elements_outerheight) +"px");
		main_elements_top.eq(x).next(".cms_menu_main_elements_title").css("top", -(for_count*(abstand+main_elements_outerheight))+main_elements_border +"px");
		
		for_count++;
	}
	
	var main_elements_bottom = $(".cms_menu_main_elements_bottom");
	var count_bottom = main_elements_bottom.length;
	
	for(var x=0; x<count_bottom; x++){
		main_elements_bottom.eq(x).css("top", (x+1)*abstand+x*main_elements_outerheight+menu_main_height +"px");
		main_elements_bottom.eq(x).next(".cms_menu_main_elements_title").css("top", (x+1)*abstand+x*main_elements_outerheight+menu_main_height+main_elements_border +"px");
	}
	
	
	$("#cms_menu").draggable({
		scroll: false,
		start: function(event, ui) {
			$(this).find("#cms_menu_main_img").addClass('noclick');
		},
		handle: '#cms_menu_main_img',
		stop: function(){
			cms_menu_relative();
			cms_menu_posx = $("#cms_menu").css("left");
			cms_menu_posy = $("#cms_menu").css("top");
		}
	});
	
	var cms_status = getCookie("cms_menu_status");
	
	if(cms_status == ""){
		document.cookie = "cms_menu_status=open";
		$(".cms_menu_main_elements").fadeIn(1000);
	}
	else{
		if(cms_status == "open")
			$(".cms_menu_main_elements").show();
		if(cms_status == "close"){
			$(".cms_menu_main_elements").hide();
			$("#cms_menu").css({"top": (window.innerHeight-$("#cms_menu").width()) +"px", 
								"left": "0px"});
			$("#cms_menu").draggable("disable");
		}
	}
	
	//devices
	$("#cms_menu_device i").hide();
	$("#cms_menu_device").next(".cms_menu_main_elements_title").find("span").hide();
	
	if(glob_cms_device == "desktop"){
		$("#cms_menu_device i.fa-mobile").show();
		$("#cms_menu_device").next(".cms_menu_main_elements_title").find("span[data-info='mobile']").show();
	}
	else{
		$("#cms_menu_device i.fa-desktop").show();
		$("#cms_menu_device").next(".cms_menu_main_elements_title").find("span[data-info='desktop']").show();
	}
}

// cms_img_preview
function cms_img_preview_relative(){
	
	var cms_img_preview = $("#cms_img_preview");
	var cms_media_img_vorschau_container = $("#cms_img_preview_container");
	
	cms_media_img_vorschau_container.find("#cms_img_preview_img").css("width", "100%").css("height", "auto");
	
	var cms_img_vorschau_img_height = cms_media_img_vorschau_container.find("#cms_img_preview_img").height();
	var cms_img_vorschau_height		= cms_media_img_vorschau_container.height();
	
	if(cms_img_vorschau_img_height > cms_img_vorschau_height){
		cms_media_img_vorschau_container.find("#cms_img_preview_img").css("height", "100%").css("width", "auto");

		cms_media_img_vorschau_container.find("i").css("right", (cms_media_img_vorschau_container.width() - cms_media_img_vorschau_container.find("#cms_img_preview_img").width())/2 +"px")
	}
	else{
		cms_media_img_vorschau_container.find("i").css("right", "0px");
	}
	
	//vertical align
	var cms_margin_top = ( cms_img_vorschau_height-cms_img_preview.find("#cms_img_preview_img").innerHeight() ) /2;
	cms_img_preview.find("img").css("margin-top", cms_margin_top + "px");
	cms_media_img_vorschau_container.find("i").css("top", cms_margin_top + "px");
}
function cms_img_preview( img_src , img_alt ){
	
	var cms_img_preview_html = "";
	
	cms_img_preview_html = cms_img_preview_html + "<div id='cms_img_preview'>";
	cms_img_preview_html = cms_img_preview_html + 	"<div id='cms_img_preview_container'>";
	cms_img_preview_html = cms_img_preview_html + 		"<img id='cms_img_preview_loading' src='"+ glob_cms_home_dir +"cms/img/ajax-loader.gif' alt='Lädt'/>";
	cms_img_preview_html = cms_img_preview_html + 		"<img id='cms_img_preview_img' src='"+ img_src +"' alt='"+ img_alt +"' />";
	cms_img_preview_html = cms_img_preview_html + 		"<i class='fa fa-times' aria-hidden='true' onclick='cms_img_preview_close()'></i>";
	cms_img_preview_html = cms_img_preview_html + 	"</div>";
	cms_img_preview_html = cms_img_preview_html + "</div>";
	
	$("body").append(cms_img_preview_html);
	
	var cms_img_preview = $("#cms_img_preview");
	
	cms_img_preview.fadeIn(500);
	
	cms_img_preview.find("img").css("visibility", "hidden");
	cms_img_preview.find("#cms_img_preview_loading").css("visibility", "visible");
	
	//Bild laden
	$("#cms_img_preview").find("#cms_img_preview_img").load(function(){
		cms_img_preview.find("img").css("visibility", "hidden");
		cms_img_preview.find("#cms_img_preview_img").css("visibility", "visible");
		cms_img_preview_relative();
	});
}
function cms_img_preview_close(){
	$("#cms_img_preview").fadeOut(300, function(){
		$("#cms_img_preview").remove();
	});
}

//cms_media
function cms_mediathek_load_content(){
	
	$("#cms_media_kachelansicht .cms_thumbnail_box_img_pdf").attr("src", glob_cms_home_dir+"cms/img/media_thumb_pdf.png")
	$("#cms_media_kachelansicht .cms_thumbnail_box_img_doc").attr("src", glob_cms_home_dir+"cms/img/media_thumb_doc.png")
	$("#cms_media_detailansicht_vorschau_loading").attr("src", glob_cms_home_dir+"cms/img/ajax-loader.gif")
	
	
	var cms_media_table;
	
	$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
		task : "media_receive"
	})
	.done(function( data ) {
		
		var result = $.parseJSON( data );
		
		//Kachelansicht
		
		var draggable = 0;
		//if elements were draggable
		if($("#cms_media_kachelansicht").find(".cms_thumbnail_box").eq(0).data('ui-draggable'))
			draggable = 1;
		
		$("#cms_media_kachelansicht").find(".cms_thumbnail_box:not(.clonable)").addClass("inactive");
		var cms_clonable = $("#cms_media_kachelansicht").find(".cms_thumbnail_box.clonable").hide();
		
		for(var x=0; x<result.length; x++){
			
			cms_media_sort[x] = result[x]["ID"];
			
			var new_element;
			var element_exists = $(".cms_thumbnail_box[data-cms_id='"+result[x]["ID"]+"']");
			
			if(element_exists.length){
				element_exists.removeClass("inactive");
			}
			else{
				new_element = cms_clonable.clone().appendTo("#cms_media_kachelansicht").addClass("new_element");
			
				new_element.find(".cms_thumbnail_box_img").hide();
				
				new_element.attr("data-cms_id", result[x]["ID"]).find("*[data-cms_id='']").each(function(){
					$(this).attr("data-cms_id", result[x]["ID"]);
				});
				
				if(result[x]["type"] == "img")
					new_element.find(".cms_thumbnail_box_img_img").show().attr({"src": glob_cms_home_dir+'temp/media/thumbnail/'+ result[x]["src"] + '?timestamp='+$.now() , "alt": result[x]["alt"]});
				if(result[x]["type"] == "pdf")
					new_element.find(".cms_thumbnail_box_img_pdf").show();
				if(result[x]["type"] == "doc")
					new_element.find(".cms_thumbnail_box_img_doc").show();
				
				
				new_element.find(".cms_thumbnail_box_edit_media_upload_date span").text(result[x]["upload_date"]);
				new_element.find(".cms_thumbnail_box_edit_download").attr({"download":result[x]["src"], "href":glob_cms_home_dir+'temp/media/'+ result[x]["src"]});
				
				new_element.find(".cms_media_check").attr({"name":"cms_media_check"+result[x]["ID"], id:"cms_media_check"+result[x]["ID"], });
				new_element.find(".cms_media_check").next("label").attr("for","cms_media_check"+result[x]["ID"]);
				
				new_element.find(".cms_thumbnail_title").attr({"title":result[x]["src"], "data-cms_alt":result[x]["alt"], "data-cms_upload_date":result[x]["upload_date"], "data-cms_type":result[x]["type"]}).text(result[x]["src"]);
				
				new_element.removeClass("new_element").removeClass("clonable").show();
			}
		}
		$("#cms_media_kachelansicht").find(".cms_thumbnail_box:not(.clonable).inactive").remove();
		
		
		$("#cms_media_kachelansicht").append('<div class="clear"></div>');
		
		
		//Detailansicht
		
		$("#cms_media_detailansicht table").find("tr:not(.clonable, #cms_media_detailansicht_table_headtr)").remove();
		var cms_clonable = $("#cms_media_detailansicht_table").find(".cms_media_detailansicht_table_files.clonable").hide();
		
		for(var x=0; x<result.length; x++){
			
			var new_element = cms_clonable.clone().appendTo("#cms_media_detailansicht_table table").addClass("new_element");
			
			new_element.find(".cms_media_detailansicht_table_files_icon").hide();
			
			if(result[x]["type"] == "img")
				new_element.find(".cms_media_detailansicht_table_files_icon_img").show().attr({"src": glob_cms_home_dir+'temp/media/thumbnail/'+ result[x]["src"] + '?timestamp='+$.now() , "alt": result[x]["alt"]});
			if(result[x]["type"] == "pdf")
				new_element.find(".cms_media_detailansicht_table_files_icon_pdf").show();
			if(result[x]["type"] == "doc")
				new_element.find(".cms_media_detailansicht_table_files_icon_doc").show();
			
			new_element.attr("data-cms_id", result[x]["ID"]).find("*[data-cms_id='']").each(function(){
				$(this).attr("data-cms_id", result[x]["ID"]);
			});
			
			new_element.find(".cms_media_detail_fileinfo").attr({"data-cms_alt":result[x]["alt"], "data-cms_type":result[x]["type"], "data-cms_upload_date":result[x]["upload_date"], "data-cms_filename":result[x]["src"]}).text(result[x]["src"]);
			
			new_element.find(".cms_media_detailansicht_table_files_upload_date").text(result[x]["upload_date"]);
			
			new_element.find(".cms_media_check_td").attr("name", "cms_media_check"+ result[x]["ID"]);
			
			new_element.removeClass("new_element").removeClass("clonable").show();
		}
		
		cms_media_detailansicht_vorschau( $(".cms_media_detailansicht_table_files:visible").eq(0) );
	
		
		if(draggable == 1)
			cms_ib_media_draggable();
		
		//Dropzone load
			if(media_dropzone == ""){
				
				media_dropzone = new Dropzone("#cms_media_upload_dropzone", {
					url: glob_cms_home_dir+'cms/php_request/upload.php',
					autoProcessQueue:false,
					dictDefaultMessage: "Ziehe Dateien zum Upload hierher",
					maxFilesize: 4,
					
					init: function() {
						var submitButton = document.querySelector("#cms_media_upload_dropzone_start")
							myDropzone = this; // closure

						submitButton.addEventListener("click", function() {
							myDropzone.processQueue();
							myDropzone.options.autoProcessQueue = true;
						});
						
						this.on("addedfile", function(origFile) {
							
							$(".cms_media_upload_buttons").css("visibility", "visible");
						});
						
						this.on("complete", function (file) {
							if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
								media_dropzone.options.autoProcessQueue = false;
							}
							cms_thumbnail_create(1);
						});
						
					}
				});
			}
			
		/*ansicht*/
		if(getCookie("cms_media_ansicht") == "detail")
			cms_media_ansicht(getCookie("cms_media_ansicht"));
		
		/*sort*/
		if(getCookie("cms_media_sort"))
			cms_media_sort(getCookie("cms_media_sort"));
		else
			cms_media_sort( "latest" );
		
		/*type*/
		if(getCookie("cms_media_type"))
			cms_media_type(getCookie("cms_media_type"));
		else
			cms_media_type("all");
	});
	
}
function cms_media_close(){
	media_dropzone = "";
	$(".cms_media_widget").remove();
	$("#cms_menu_mediathek").removeClass("active");
}

function cms_media_detailansicht_vorschau( tr_parent ){
	
	if(tr_parent.length == 0){
		
		$("#cms_media_detailansicht_vorschau").css("visibility","hidden");
	}
	else{
		
		$("#cms_media_detailansicht_vorschau").css("visibility","visible");
		
		$(".cms_media_detailansicht_table_files").removeClass("cms_media_detail_active");
		tr_parent.addClass("cms_media_detail_active");
		
		var cms_media_detail_fileinfo = tr_parent.find(".cms_media_detail_fileinfo");
		
		var cms_type = cms_media_detail_fileinfo.attr("data-cms_type");
		var cms_id	= cms_media_detail_fileinfo.attr("data-cms_id");
		var cms_filename = cms_media_detail_fileinfo.text();
		
		$("#cms_media_detailansicht_rename_input_alt").prop('readonly', false);
		
		if(cms_type == "img"){
			var cms_src = glob_cms_home_dir+"temp/media/thumbnail/" + cms_filename;
			var cms_alt = cms_media_detail_fileinfo.attr("data-cms_alt");
		}
		if(cms_type == "pdf"){
			var cms_src = glob_cms_home_dir+"cms/img/media_thumb_pdf.png";
			var cms_alt = "PDF-Datei";
			$("#cms_media_detailansicht_rename_input_alt").prop('readonly', true);
		}
		if(cms_type == "doc"){
			var cms_src = glob_cms_home_dir+"cms/img/media_thumb_doc.png";
			var cms_alt = "Dokument";
			$("#cms_media_detailansicht_rename_input_alt").prop('readonly', true);
		}
		
		$("#cms_media_detailansicht_vorschau_img").hide();
		$("#cms_media_detailansicht_vorschau_loading").show();
		
		$("#cms_media_detailansicht_vorschau_img").attr("src", cms_src).attr("alt", cms_alt).attr( "data-cms_id",cms_id ).load(function(){
			$("#cms_media_detailansicht_vorschau_img").show();
			$("#cms_media_detailansicht_vorschau_loading").hide();
		});
		
		$(".cms_media_detailansicht_table_files").css("background-color", "transparent");
		tr_parent.css("background-color", "background-color: rgba(0,0,0,0.1)");
		
		coverimg( $("#cms_media_detailansicht_vorschau_container") );
		
		
		$("#cms_media_detailansicht_rename_input_filename").val( delete_filetype( cms_filename ) );
		$("#cms_media_detailansicht_rename_input_alt").val( cms_alt );
		
		
		$("#cms_media_detailansicht_nav i").show();
		
		if(cms_type == "pdf" || cms_type == "doc"){
			$("#cms_media_detailansicht_nav_view").hide();
		}
		
		
		//img_preview
			if(cms_type == "img")
				cms_src = glob_cms_home_dir+"temp/media/" + cms_filename;
			$("#cms_media_detailansicht_nav_view").attr("onclick", "cms_img_preview('"+ cms_src + "', '"+ cms_alt + "')");
		
		//Download
			$("#cms_media_detailansicht_nav_download").parent("a").attr("download", cms_filename).attr("href", glob_cms_home_dir+"temp/media/"+cms_filename);
	}
}

function cms_media_rename( cms_id , cms_newname , cms_newalt ){

	var cms_type = get_filetype(cms_newname);
	
	$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
		task : "media_rename",
		cms_id : cms_id,
		cms_newname : cms_newname,
		cms_newalt : cms_newalt,
		cms_type : cms_type
	})
	.done(function( data ){
		
		//Informationen aktualisieren
		if(data == ""){
			
			//kachelansicht
				$("#cms_media_kachelansicht").find(".cms_thumbnail_title[data-cms_id='"+ cms_id +"']").text(cms_newname);
				$("#cms_media_kachelansicht").find(".cms_thumbnail_title[data-cms_id='"+ cms_id +"']").attr("title", cms_newname);
				$("#cms_media_kachelansicht").find(".cms_thumbnail_title[data-cms_id='"+ cms_id +"']").attr("data-cms_alt", cms_newalt);
				$(".cms_thumbnail_box_edit").find("a[data-cms_id='"+ cms_id +"']").attr("download", cms_newname).attr("href", glob_cms_home_dir+"temp/media/"+cms_newname);
				
			//detail
				var cms_media_detail_fileinfo = $(".cms_media_detail_fileinfo[data-cms_id='"+ cms_id +"']");
				cms_media_detail_fileinfo.text( cms_newname );
				cms_media_detail_fileinfo.attr("data-cms_filename", cms_newname);
				cms_media_detail_fileinfo.attr("data-cms_alt", cms_newalt);
				//Refresh preview img and buttons
				cms_media_detailansicht_vorschau( cms_media_detail_fileinfo.parent("tr") );
			
			cms_ib_rename_media( cms_id );
		}
		else
			alert(data);
	});
}
function cms_media_rename_hide(){
	
	$("#cms_media_kachelansicht .cms_thumbnail_box_rename").hide(300);
	$("#cms_media_kachelansicht .cms_thumbnail_box_rename_buttons").hide();
	$("#cms_media_kachelansicht .cms_thumbnail_title").show(300);
	$("#cms_media_kachelansicht .cms_thumbnail_box_edit").css("visibility", "visible");
}
function cms_media_ansicht( ansicht ){
	/*cookie*/
	document.cookie = "cms_media_ansicht="+ansicht;
	
	if(ansicht == "kachel")
		var cms_ansicht_button = $("#cms_media_nav_aktion_open_ansicht_kacheln");
	if(ansicht == "detail")
		var cms_ansicht_button = $("#cms_media_nav_aktion_open_ansicht_details");
	
	if(cms_ansicht_button.attr("class") != "cms_media_nav_aktion_open_ansicht_button"){
		cms_ansicht_button = cms_ansicht_button.closest(".cms_media_nav_aktion_open_ansicht_button");
	}
	
	//auswahl
	var cms_media_checked = cms_media_auswahl();
	$(".cms_media_check").prop( "checked", false );
	$(".cms_media_check_td input").prop( "checked", false );
	
	for(var x=0; x<cms_media_checked.length; x++){
		$(".cms_media_check[data-cms_id='"+cms_media_checked[x]+"']").prop("checked", true);
		$(".cms_media_check_td input[data-cms_id='"+cms_media_checked[x]+"']").prop("checked", true);
	}
		
	
	$("#cms_media_nav_aktion_open_ansicht").find("i").css("visibility", "hidden");
	
	if(cms_ansicht_button.attr("id") == "cms_media_nav_aktion_open_ansicht_kacheln"){
		$("#cms_media_detailansicht").hide();
		$("#cms_media_kachelansicht").fadeIn(500);
		$("#cms_media_nav_aktion_open_ansicht_kacheln i").css("visibility", "visible");
	}
	
	if(cms_ansicht_button.attr("id") == "cms_media_nav_aktion_open_ansicht_details"){
		$("#cms_media_kachelansicht").hide();
		$("#cms_media_detailansicht").fadeIn(500, function(){ 
			//Vorschau laden
				cms_media_detailansicht_vorschau( $(".cms_media_detailansicht_table_files:visible").eq(0) ); 
				$("#cms_media_detailansicht_vorschau").show();
		});
		$("#cms_media_nav_aktion_open_ansicht_details i").css("visibility", "visible");
	}
}
function cms_media_sort( sort_type ){
	
	if($("#cms_media_kachelansicht").find(".cms_thumbnail_box:not(.clonable)").length > 1){
		
		/*cookie*/
		document.cookie = "cms_media_sort="+sort_type;
		
		if(sort_type == "filename"){
			$(".cms_media_nav_aktion_open_sort_button i").css("visibility", "hidden");
			$("#cms_media_nav_aktion_open_sort_filename i").css("visibility", "visible");
		}
		if(sort_type == "latest"){
			$(".cms_media_nav_aktion_open_sort_button i").css("visibility", "hidden");
			$("#cms_media_nav_aktion_open_sort_latest i").css("visibility", "visible");	
		}
		
		var draggable = false;
		
		if($("#cms_media_kachelansicht").find(".cms_thumbnail_box").eq(0).data('ui-draggable'))
			draggable = true;
		
		var cms_string = Array( $(".cms_media_detail_fileinfo").length );
		
		for(var x=0; x>=0; x++){
			
			if( $(".cms_media_detail_fileinfo").eq(x).length > 0 ){
				
				if(sort_type == "filename")
					cms_string[x] = $(".cms_media_detail_fileinfo").eq(x).attr("data-cms_filename");
				
				if(sort_type == "latest")
					cms_string[x] = $(".cms_media_detail_fileinfo").eq(x).attr("data-cms_upload_date");
			}
			else
				x=-2;
		}
		
		var cms_string_sorted = cms_string.sort();
		cms_string_sorted = unique(cms_string_sorted);
		
		if(sort_type == "latest")
			cms_string_sorted = cms_string_sorted.reverse();
		
		var cms_current_element;
		var cms_prev_element;
		var cms_html_cache;
		
		var cms_element_counter_detail=0;
		var cms_element_counter_kachel=0;
		
		for(var x=0; x<cms_string_sorted.length; x++){
			
			//detail
			if(sort_type == "filename")
				cms_current_element = $(".cms_media_detail_fileinfo[data-cms_filename='"+ cms_string_sorted[x] +"']").closest("tr");
			if(sort_type == "latest")
				cms_current_element = $(".cms_media_detail_fileinfo[data-cms_upload_date='"+ cms_string_sorted[x] +"']").closest("tr");
			
			for(var y=0; y<cms_current_element.length; y++){
				
				cms_html_cache 	= cms_current_element.eq(y).wrap('<p/>').parent().html();
				cms_current_element.eq(y).unwrap();
				
				if(cms_element_counter_detail>0)
					cms_prev_element = $("#cms_media_detailansicht .cms_media_detailansicht_table_files").eq(cms_element_counter_detail-1);
				else
					cms_prev_element = $("#cms_media_detailansicht_table_headtr");
				
				
				cms_current_element.eq(y).remove();
				$( cms_html_cache ).insertAfter( cms_prev_element );
				
				
				
				cms_element_counter_detail++;
			}
			
			//kachel
			if(sort_type == "filename")
				cms_current_element = $(".cms_thumbnail_title[title='"+ cms_string_sorted[x] +"']").closest(".cms_thumbnail_box");
			if(sort_type == "latest")
				cms_current_element = $(".cms_thumbnail_title[data-cms_upload_date='"+ cms_string_sorted[x] +"']").closest(".cms_thumbnail_box");
			
			for(var y=0; y<cms_current_element.length; y++){
				
				cms_html_cache 	= cms_current_element.eq(y).wrap('<p/>').parent().html();
				cms_current_element.eq(y).unwrap();
				
				cms_current_element.eq(y).remove();
				
				if(cms_element_counter_kachel==0){
					$( cms_html_cache ).insertBefore( $("#cms_media_kachelansicht .cms_thumbnail_box").eq(0) );
				}
				else{
					cms_prev_element = $("#cms_media_kachelansicht .cms_thumbnail_box").eq(cms_element_counter_kachel-1);
					$( cms_html_cache ).insertAfter( cms_prev_element );
				}
				
				cms_element_counter_kachel++;
			}
			
			
			
		}
		
		if(draggable == true){
			cms_ib_media_draggable();
		}
	}
}
function cms_media_type(type){
	
	/*cookie*/
	document.cookie = "cms_media_type="+type;
	
	if(type == "all"){
		$(".cms_media_nav_aktion_open_filetype_button i").css("visibility", "hidden");
		$("#cms_media_nav_aktion_open_filetype_all i").css("visibility", "visible");
		
		$("#cms_media_kachelansicht .cms_thumbnail_box:not(.clonable)").show();
		$("#cms_media_detailansicht .cms_media_detailansicht_table_files:not(.clonable)").show();
	}
	if(type == "img"){
		$(".cms_media_nav_aktion_open_filetype_button i").css("visibility", "hidden");
		$("#cms_media_nav_aktion_open_filetype_img i").css("visibility", "visible");
		
		$("#cms_media_kachelansicht .cms_thumbnail_box").hide();
		$("#cms_media_detailansicht .cms_media_detailansicht_table_files").hide();
		
		$("#cms_media_kachelansicht .cms_thumbnail_title[data-cms_type='img']").closest(".cms_thumbnail_box").show();
		$("#cms_media_detailansicht .cms_media_detail_fileinfo[data-cms_type='img']").closest(".cms_media_detailansicht_table_files").show();
	}
	if(type == "doc"){
		$(".cms_media_nav_aktion_open_filetype_button i").css("visibility", "hidden");
		$("#cms_media_nav_aktion_open_filetype_doc i").css("visibility", "visible");
		
		$("#cms_media_kachelansicht .cms_thumbnail_box").hide();
		$("#cms_media_detailansicht .cms_media_detailansicht_table_files").hide();
		
		$("#cms_media_kachelansicht .cms_thumbnail_title[data-cms_type='pdf']").closest(".cms_thumbnail_box").show();
		$("#cms_media_kachelansicht .cms_thumbnail_title[data-cms_type='doc']").closest(".cms_thumbnail_box").show();
		$("#cms_media_detailansicht .cms_media_detail_fileinfo[data-cms_type='pdf']").closest(".cms_media_detailansicht_table_files").show();
		$("#cms_media_detailansicht .cms_media_detail_fileinfo[data-cms_type='doc']").closest(".cms_media_detailansicht_table_files").show();
	}
	
	cms_media_detailansicht_vorschau( $(".cms_media_detailansicht_table_files:visible").eq(0) );
}

function cms_media_auswahl(){
	
	//get ID's
	
	var cms_auswahl_id = [];
	
	if( $("#cms_media_kachelansicht").css("display") != "none" )
		var cms_media_check_checked = $(".cms_media_check:checked");
	else
		var cms_media_check_checked = $(".cms_media_check_td input:checked");
		
		
	for(var x=0; x<cms_media_check_checked.length; x++)
		cms_auswahl_id[x] = cms_media_check_checked.eq(x).attr("data-cms_id");
	
	
	return(cms_auswahl_id);
}

function cms_media_delete( cms_auswahl_id ){
	
	if(cms_auswahl_id.length == 0)
		alert("Nichts ausgewählt.");
	
	if(cms_auswahl_id.length>0 && confirm(cms_auswahl_id.length +" Elemente unwiderruflich löschen?")){
		
		var cms_auswahl_string = "";
		
		for(var x=0; x<cms_auswahl_id.length; x++)
			cms_auswahl_string = cms_auswahl_string + cms_auswahl_id[x] + ",";
		
		$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
			task 	: "media_delete",
			auswahl : cms_auswahl_string
		})
		.done(function( data ) {
			
			if(data == "true"){
				for(var x=0; x<cms_auswahl_id.length; x++){
					
					$(".cms_thumbnail_box[data-cms_id='"+ cms_auswahl_id[x] +"']").remove();
					$(".cms_media_detailansicht_table_files[data-cms_id='"+ cms_auswahl_id[x] +"']").remove();
				
					if($("#cms_ib_editor_img").css("display") != "none"){
						$("#cms_ib_editor_img_vorschau").find("img[data-cms_id='"+cms_auswahl_id[x]+"']").attr({"src": "", "alt": "", "data-cms_id": ""});
						$("#cms_ib_editor_img_vorschau_noimg").show();
					}
					if($("#cms_ib_editor_img_dia_thumbnail").css("display") != "none"){
						$("#cms_ib_editor_img_dia_thumbnail").find(".cms_thumbnail_box[data-cms_imgdia_id='"+cms_auswahl_id[x]+"']").remove();
					}
				}
			}
			else{
				alert("Löschen fehlgeschlagen. Bitte wenden Sie sich an den Administrator.");
				alert(data);
			}
		});
		
	}
}
function cms_media_download( cms_auswahl_id ){
	
	if(cms_auswahl_id.length == 0){
		alert("Nichts ausgewählt.");
	}
	else{
		var cms_auswahl_string = "";
		
		for(var x=0; x<cms_auswahl_id.length; x++)
			cms_auswahl_string = cms_auswahl_string + cms_auswahl_id[x] + ",";
		
		$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
			task 		: "media_zip_download",
			auswahl 	: cms_auswahl_string,
			zip_name	: "tt_cms_download.zip"
		})
		.done(function( data ) {
			window.location.href = data;
		});
	}
}


// --  Inhalte bearbeiten  -- //
function cms_ib_widget_scrolling(){
	
	if($("#cms_ib_widget_content").height() < $(".cms_ib_widget_cat.active").height()){
		
		if($(".cms_ib_widget_cat.active").offset().top < $("#cms_ib_widget_content").offset().top){
			if($("#cms_ib_widget_pageup").hasClass("active") == false)
				$("#cms_ib_widget_pageup").hide().css("visibility", "visible").stop().fadeIn(300).addClass("active");
		}
		else
			$("#cms_ib_widget_pageup").css("visibility", "hidden").removeClass("active");
		
		if($("#cms_ib_widget_content").offset().top+$("#cms_ib_widget_content").height() < $(".cms_ib_widget_cat.active").offset().top+$(".cms_ib_widget_cat.active").height()){
			if($("#cms_ib_widget_pagedown").hasClass("active") == false)
				$("#cms_ib_widget_pagedown").hide().css("visibility", "visible").stop().fadeIn(300).addClass("active");
		}
		else
			$("#cms_ib_widget_pagedown").css("visibility", "hidden").removeClass("active");
		
	}
	else{
		$("#cms_ib_widget_pageup").css("visibility", "hidden").removeClass("active");
		$("#cms_ib_widget_pagedown").css("visibility", "hidden").removeClass("active");
	}
	
}
function cms_ib_widget_relative(){
	
	$("#cms_ib_widget_content").css("height", $("#cms_ib_widget").height()-$("#cms_ib_widget_head").height()-70-(2*$(".cms_ib_widget_pagescroll").height())+"px");
	
	cms_ib_widget_scrolling();

	if($("#cms_ib_widget").hasClass("active"))
		$("#cms_ib_widget").css("right","0px");
	
	else
		$("#cms_ib_widget").css("right","-"+$("#cms_ib_widget").width()+"px");
}
function cms_ib_widget_exists(){
	
	//check if ib_widget element exists in wrapper
	var ib_widget_element = $("#cms_ib_widget").find(".cms_ib_widget_container[data-cmstype][data-cmspos]");
	
	for(var x=0; x<ib_widget_element.length; x++){
		
		if($("#wrapper").find("*[data-cmspos='"+ib_widget_element.eq(x).attr("data-cmspos")+"']").length == 0)
			ib_widget_element.eq(x).remove();
	}
	
}
function cms_ib_widget_order(){
	
	if($("#cms_ib_widget_wrapper_clone").length){
	
		var wrapper = $("*[data-cmstype='wrapper']");
		var elements = $("#cms_ib_widget_text .cms_ib_widget_container");
		
		var ib_widget_wrapper = $("#cms_ib_widget_wrapper_clone").html();
		
		for(var x=0; x<wrapper.length; x++){
			
			for(var y=0; y<3; y++){
				
				if(y==0){
					//text
					var content_elements = wrapper.eq(x).find("*[data-cmstype='text_long'], *[data-cmstype='text_short']");
					var ib_widget_cat = $("#cms_ib_widget_text");
					var data_cmstype = "text";
				}
				if(y==1){
					var content_elements = wrapper.eq(x).find("*[data-cmstype='img']");
					var ib_widget_cat = $("#cms_ib_widget_img");
					var data_cmstype = "img";
				}
				if(y==2){
					var content_elements = wrapper.eq(x).find("*[data-cmstype='img_dia']");
					var ib_widget_cat = $("#cms_ib_widget_img_dia");
					var data_cmstype = "img_dia";
					
				}
				
				if(content_elements.length){
					ib_widget_cat.append(ib_widget_wrapper);
					
					var new_wrapper = ib_widget_cat.find(".cms_ib_widget_wrapper:not(.active)");
					
					new_wrapper.find(".cms_ib_widget_wrapper_title").text(wrapper.eq(x).attr("data-cmscat"));
					for(var z=0; z<content_elements.length; z++){
						ib_widget_cat.find(".cms_ib_widget_container[data-cmstype='"+data_cmstype+"'][data-cmspos='"+ content_elements.eq(z).attr("data-cmspos") +"']")
						.appendTo( new_wrapper.find(".cms_ib_widget_wrapper_content") );
					}
					new_wrapper.addClass("active");
				}
			}
		}
		
		$("#cms_ib_widget_wrapper_clone").remove();
		
		$(".cms_ib_widget_wrapper").each(function(){
			
			var cookie_name = "cms_ib_widget_wrapper_"+$(this).find(".cms_ib_widget_wrapper_title").text();
			var cookie_content = getCookie( cookie_name );
			
			if(cookie_content){
				if(cookie_content == "1"){
					$(this).find(".cms_ib_widget_wrapper_content").show().addClass("active");
				}
			}
			else{
				$(this).find(".cms_ib_widget_wrapper_content").hide().removeClass("active");
				document.cookie = cookie_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
			}
		});
		
		$(".cms_ib_widget_wrapper").on("click", ".cms_ib_widget_wrapper_title", function(){
		
			var content_element = $(this).closest(".cms_ib_widget_wrapper").find(".cms_ib_widget_wrapper_content");
			
			var cookie_name = "cms_ib_widget_wrapper_"+content_element.closest(".cms_ib_widget_wrapper").find(".cms_ib_widget_wrapper_title").text();
			
			if(content_element.hasClass("active")){
				content_element.stop().slideUp(300).removeClass("active");
				document.cookie = cookie_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
			}
			else{
				content_element.stop().slideDown(300).addClass("active");
				document.cookie =cookie_name+"=1";
			}
		});	
	}
}
function cms_ib_widget_empty_elements($element){
	
	var type = $element.attr("data-cmstype");
	var pos = $element.attr("data-cmspos");
	var global = $element.attr("data-cmsglobal");
	var cat;
	
	if(type == "text_long" || type == "text_short")
		cat = $("#cms_ib_widget_text");
	
	if(type == "img")
		cat = $("#cms_ib_widget_img");
	
	if(type == "img_dia")
		cat = $("#cms_ib_widget_img_dia");
	
	var new_element = 	cat.find(".cms_ib_widget_container_clone").clone().removeClass("cms_ib_widget_container_clone").attr("data-cmspos", pos).attr("data-cmsglobal", global);
	new_element.find(".cms_ib_widget_container_empty_input").html($element.html());
	
	cat.prepend( new_element );
}
function cms_ib_open(){
	
	document.cookie = "ib=true";
	
	//cmsglobal
	$(".cms_ib_widget_container[data-cmsglobal='']").each(function(){
		
		var cmspos = $(this).attr("data-cmspos");
		var cmsglobal;
		
		if(cmspos != ""){
			cmsglobal = $("#wrapper").find("*[data-cmspos='"+cmspos+"']").attr("data-cmsglobal");
			$(this).attr("data-cmsglobal", cmsglobal);
		}
	});
	
	$("*[data-cmstype='text_long'], *[data-cmstype='text_short']").attr("data-cmsedit", "active");
	$("*[data-cmstype='img']").attr("data-cmsedit", "active");
	$("*[data-cmstype='img_dia']").attr("data-cmsedit", "active");
	
	$("*[data-cmstype='text_long'][data-cmsedit='active'], *[data-cmstype='text_short'][data-cmsedit='active'], .cms_ib_widget_container[data-cmstype='text']").hover(function(){
		$("*[data-cmspos='"+$(this).attr("data-cmspos")+"']:not(.cms_ib_widget_container)").addClass("cmshover");
	}, function(){
		$("*[data-cmspos='"+$(this).attr("data-cmspos")+"']:not(.cms_ib_widget_container)").removeClass("cmshover");
	});
	$("*[data-cmstype='img'], *[data-cmstype='img_dia'], .cms_ib_widget_container[data-cmstype='img']").hover(function(){
		$("*[data-cmspos='"+$(this).attr("data-cmspos")+"']:not(.cms_ib_widget_container)").append("<div class='cms_ib_img_hover'></div>");
		$(".cms_ib_img_hover").css("z-index", $(this).find("img").css("z-index") + 1);
		
	}, function(){
		$("*[data-cmspos='"+$(this).attr("data-cmspos")+"']:not(.cms_ib_widget_container)").find(".cms_ib_img_hover").remove();
	});
	
	$("#cms_menu_inhalte_bearbeiten").addClass("active");
	
	cms_ib_widget_exists();
	
	cms_ib_widget_order();
	
	$("#cms_ib_widget").stop().animate({"right":"0px"}, 600, function(){
		$("#cms_ib_widget_visibility").find("p").hide();
		$("#cms_ib_widget_visibility").find("#cms_ib_widget_visibility_close").stop().fadeIn(500);
		
		$(".cms_ib_widget_head_menu").removeClass("active");
		$(".cms_ib_widget_cat").hide();
		$(".cms_ib_widget_head_menu[data-type='cms_ib_widget_text']").addClass("active");
		$("#cms_ib_widget_text").stop().fadeIn(300, function(){
			$(".cms_ib_widget_pagescroll").css("opacity", "1");
			cms_ib_widget_scrolling();
		});
		
	}).addClass("active");
	
	var cms_ib_widget_exist = false;
	
	
	//content_clone
	$("*[data-cmstype='add_clone']").show();
	
	$("*[data-cmstype='clone_element']").append( $(".cms_clone_element_nav").clone() ); $("*[data-cmstype='clone_element']").find(".cms_clone_element_nav").addClass("active");
	$("*[data-cmstype='clone_element'][data-cms_clonevisibility='0']").find(".cms_clone_element_nav_visibility").addClass("fa-eye-slash");
	$("*[data-cmstype='clone_element'][data-cms_clonevisibility='1']").find(".cms_clone_element_nav_visibility").addClass("fa-eye");
	
	$("*[data-cms_clonesortable='true']").each(function(){
		
		if($(this).attr("data-cms_clonesortabletype") == "drag"){
			
			$(this).find(".cms_clone_element_nav_sortable_buttons").hide();
			
			$(this).css("height", $(this).height()+"px");
			
			$(this).sortable({
				items: '> div',
				sort: sort_jQueryBug8342Fix,
				handle: '.cms_clone_element_nav_move',
				connectWith: "*[data-cms_clonesortable='true']",
				update: function(e, ui){
					cms_data_save = false;
					
					if($("#cms_save_onpage_changes").hasClass("active") == false)
						$("#cms_save_onpage_changes").stop().fadeIn(300).addClass("active");
					
					var cms_new_onpage_change = "cms_clone_class:"+ui.item.closest("*[data-cmstype='clone_element']").attr("data-cms_cloneclass")+";";
					
					if(cms_onpage_changes.indexOf(cms_new_onpage_change) < 0)
						cms_onpage_changes = cms_onpage_changes + cms_new_onpage_change;
				}
			});
		}
		else{
			$(this).find(".cms_clone_element_nav_move").hide();
			
			$(this).find(".cms_clone_element_nav_sortable_buttons").click(function(){
				
				var this_clone = $(this).closest("*[data-cmstype='clone_element']");
				var all_clones = $(this).closest("*[data-cms_clonesortable='true']").find("*[data-cmstype='clone_element']");
				
				if($(this).hasClass("fa-angle-right")){
					if(this_clone.next().length && this_clone.next().attr("data-cmstype") != "add_clone")
						this_clone.next().after( this_clone );
				}
				else{
					if(this_clone.prev().length && this_clone.prev().attr("data-cmstype") != "add_clone")
						this_clone.prev().before( this_clone );
				}
			});
		}
	});
}
function cms_ib_close(){
	
	document.cookie = "ib=false";
	
	$("*[data-cmstype='text_long'], *[data-cmstype='text_short']").attr("data-cmsedit", "passive");
	$("*[data-cmstype='img']").attr("data-cmsedit", "passive");
	$("*[data-cmstype='img_dia']").attr("data-cmsedit", "passive");
	
	$("*[data-cmstype='img'], *[data-cmstype='img_dia']").unbind('mouseenter mouseleave');
	
	$("#cms_menu_inhalte_bearbeiten").removeClass("active");
	
	$("#cms_ib_widget_visibility").find("p").stop().fadeOut(500);
	$("#cms_ib_widget").stop().animate({"right":"-"+$("#cms_ib_widget").width()+"px"}, 600).removeClass("active");

	//content_clone
	$("*[data-cmstype='add_clone']").hide();
	$(".cms_clone_element_nav.active").remove();
	
	$("*[data-cms_clonesortable='true']").each(function(){
		
		if($(this).attr("data-cms_clonesortabletype") == "drag"){
			
			$(this).sortable("destroy");
		}
	});
}


function cms_ib_addimg( cms_filename , cms_alt , cms_id ){
	
	var img = $("#cms_ib_editor_img_vorschau_img");
	var img_load = $("#cms_ib_editor_img_vorschau_load");
	
	img.hide();
	img_load.show();
	
	img.one("load", function() {
		
		img.show();
		img_load.hide();
		img.attr("alt", cms_alt).attr("data-cms_id", cms_id).css("visibility", "hidden");
		
	}).attr("src", glob_cms_home_dir+"temp/media/"+cms_filename+"?timestamp"+$.now());
	
	img.load(function(){
		img.css("visibility", "visible");
		$("#cms_ib_editor_img_vorschau_noimg").hide();
	});
	
	cms_data_save = false;
}
function cms_ib_dia_addimg( cms_filename , cms_alt , cms_id ){
	
	var load_thumbnail = "";
	
		load_thumbnail = load_thumbnail	+ "<div class='cms_thumbnail_box' data-cms_imgdia_id='"+ cms_id +"'>";
						
		load_thumbnail = load_thumbnail + 	"<div class='cms_thumbnail_box_img_container'>";
		load_thumbnail = load_thumbnail + 		"<img src='"+glob_cms_home_dir+"temp/media/thumbnail/"+ cms_filename +"' alt='"+ cms_alt +"' />";
		
		load_thumbnail = load_thumbnail +		"<div class='cms_thumbnail_box_edit'>";
		
		load_thumbnail = load_thumbnail	+ 			"<i class='fa fa-trash' aria-hidden='true' title='aus Diashow entfernen'></i>";
		load_thumbnail = load_thumbnail	+ 			"<i class='fa fa-arrows' aria-hidden='true' title='Verschieben'></i>";
		load_thumbnail = load_thumbnail	+ 			"<br /><i class='fa fa-eye' aria-hidden='true' title='Vergrößern'></i>";
		
		load_thumbnail = load_thumbnail +		"</div>";
		
		load_thumbnail = load_thumbnail +	"</div>";
		load_thumbnail = load_thumbnail +	"<p class='cms_thumbnail_title'>"+ cms_filename +"</p>";
		
		load_thumbnail = load_thumbnail	+ "</div>"
	
	
	$("#cms_ib_editor_img_dia_thumbnail .clear").before(load_thumbnail);
	
	cms_data_save = false;
}

function cms_ib_media_get_link(){
	
	var cms_thumbnail_box = $(".cms_ib_editor").find(".cms_media_widget").find(".cms_thumbnail_box");
	var cms_detailansicht_table_files = $(".cms_ib_editor").find(".cms_media_widget").find(".cms_media_detailansicht_table_files");
	
	cms_thumbnail_box.find(".cms_thumbnail_box_edit>*").hide();
	cms_thumbnail_box.find(".cms_thumbnail_box_edit_media_upload_date").show();
	cms_thumbnail_box.find(".cms_thumbnail_title").on("click", function(){
		return false;
	});
	$("#cms_media_detailansicht_rename").hide();
	
	cms_thumbnail_box.on("click", function(){
		
		$("#cms_ib_editor_get_link .cms_box_content_box_headline").text( glob_cms_home_dir+"temp/media/"+$(this).find(".cms_thumbnail_title").attr("title") );
		if($("#cms_ib_editor_get_link").css("display") == "none")
			$("#cms_ib_editor_get_link").fadeIn(300);
	});
	cms_detailansicht_table_files.on("click", function(){
		alert( glob_cms_home_dir+"temp/media/"+$(this).find(".cms_media_detail_fileinfo").attr("data-cms_filename") );
		$("#cms_ib_editor_get_link .cms_box_content_box_headline").text( glob_cms_home_dir+"temp/media/"+$(this).find(".cms_media_detail_fileinfo").attr("data-cms_filename") );
		if($("#cms_ib_editor_get_link").css("display") == "none")
			$("#cms_ib_editor_get_link").fadeIn(300);
	});
}

function cms_ib_media_draggable(){
	
	$(".cms_ib_editor").find(".cms_media_widget").find(".cms_thumbnail_box, .cms_media_detailansicht_table_files").draggable({
		helper: "clone",
		start: function(){
			$("#cms_ib_editor_img_dia_thumbnail").css({"background-color" : "#e6ebff" , "border" : "4px dotted #487cff"});
			$("#cms_ib_editor_img_vorschau").css({"border" : "4px dotted #487cff"});
		},
		stop: function( event, ui ){
			
			$("#cms_ib_editor_img_dia_thumbnail").css({"background-color" : "transparent" , "border" : "none"});
			$("#cms_ib_editor_img_vorschau").css({"border" : "none"});
			
			var cms_ib;
			
			if($("#cms_ib_editor_img").css("display") != "none")
				cms_ib			= $("#cms_ib_editor_img_vorschau");
			if($("#cms_ib_editor_img_dia").css("display") != "none")
				cms_ib			= $("#cms_ib_editor_img_dia_thumbnail");
				
			var cms_ib_top		= cms_ib.offset().top;
			var cms_ib_left		= cms_ib.offset().left;
			var cms_ib_right	= cms_ib.offset().left+cms_ib.width();
			var cms_ib_bottom	= cms_ib.offset().top+cms_ib.height();
			
			var element_top		= ui.offset.top+($(this).height()*0.5);
			var element_left	= ui.offset.left+($(this).width()*0.5);
			
			
			if(	element_top > cms_ib_top && element_top < cms_ib_bottom
			&&	element_left > cms_ib_left && element_left < cms_ib_right){
				
				var cms_filename;
				var cms_alt;
				var cms_id;
				var cms_type;
				
				//kachel
				if($(this).hasClass("cms_thumbnail_box")){
					cms_filename = $(this).find(".cms_thumbnail_title").attr("title");
					cms_alt = $(this).find(".cms_thumbnail_title").attr("data-cms_alt");
					cms_id = $(this).find(".cms_thumbnail_title").attr("data-cms_id");
					cms_type = $(this).find(".cms_thumbnail_title").attr("data-cms_type");
				}
				//details
				if($(this).hasClass("cms_media_detailansicht_table_files")){
					cms_filename = $(this).find(".cms_media_detail_fileinfo").attr("data-cms_filename");
					cms_alt = $(this).find(".cms_media_detail_fileinfo").attr("data-cms_alt");
					cms_id = $(this).find(".cms_media_detail_fileinfo").attr("data-cms_id");
					cms_type = $(this).find(".cms_media_detail_fileinfo").attr("data-cms_type");
				}
				
				if(cms_type != "img"){
					alert("Es können nur Bilder hinzugefügt werden.")
				}
				else{
					if($("#cms_ib_editor_img").css("display") != "none")
						cms_ib_addimg(cms_filename , cms_alt , cms_id);
					if($("#cms_ib_editor_img_dia").css("display") != "none")
						cms_ib_dia_addimg(cms_filename , cms_alt , cms_id);
					
				}
				
			}
		}
	});
}

function cms_ib_rename_media( change_id ){
	if($("#cms_inhalte_bearbeiten").css("display") != "none"){
		
		var new_name = $("#cms_media_kachelansicht").find(".cms_thumbnail_title[data-cms_id='"+ change_id +"']").text();
		$("#cms_ib_editor_img_dia_thumbnail").find(".cms_thumbnail_box[data-cms_imgdia_id='"+ change_id +"']").find(".cms_thumbnail_title").text(new_name);
	}
}

//SEITENVERWALTUNG
function cms_sv_load_info( cms_id ){
	
	if( cms_id == -1 ){
		for(var x=0; x<$(".cms_sv_pageinfo_input").length; x++){
			
			if($(".cms_sv_pageinfo_input").eq(x).val() == "index")
				$(".cms_sv_pageinfo_input").eq(x).prop('readonly', false);
			
			$(".cms_sv_pageinfo_input").eq(x).val("");
		}
		
		$(".cms_sv_pages").find("li").removeClass("selected");
		$("#cms_sv_pageinfo_remove_page").hide();
	}
	else{
		$(".cms_sv_new_page_root").removeClass("active");
		$(".cms_sv_pages").find("li").removeClass("selected");
		$(".cms_sv_pages").find("li[data-cms_sv_id='"+cms_id+"']").addClass("selected");
		$("#cms_sv_pageinfo_remove_page").show();
		
		$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
			task 	: "sv_load_info",
			id 		: cms_id
		})
		.done(function( data ) {
			
			data = html_decode( data ).split(";");
			
			for(var x=0; x<data.length; x++){
				
				if($(".cms_sv_pageinfo_input").eq(x).attr("name") == "cms_sv_dateiname"){
					data[x] = delete_filetype( data[x] );

					if(data[x] == "index")
						$(".cms_sv_pageinfo_input").eq(x).prop('readonly', true);
					else
						$(".cms_sv_pageinfo_input").eq(x).prop('readonly', false);
				}
				$(".cms_sv_pageinfo_input").eq(x).val( data[x] );
			}
		});
	}
}
function cms_sv_change_device( new_device ){
	
	var this_span = $("#cms_sv_device_select span[data-cms_sv_device='"+new_device+"']");
	
	$(".cms_sv_pages").hide();
	$(".cms_sv_pages[data-cms_sv_device='"+ this_span.attr("data-cms_sv_device") +"']").fadeIn(300, function(){
		var cms_id = $(".cms_sv_pages").find("li:visible").eq(0).attr("data-cms_sv_id");
		cms_sv_load_info( cms_id );
	});
	$("#cms_sv_device_select span").removeClass("active");
	this_span.addClass("active");
}
function cms_sv_sortable(){
	
	$(".cms_sv_pages_flexible ul").sortable({ 
		items: '> li:not(.cms_sv_new_page)',
		cancel: '.cms_sv_new_page',
		start: function(e, ui) {
			ui.item.find(".cms_sv_li_pagename").addClass('noclick');
			$(this).attr('data-previndex', ui.item.index());
		},
		update: function(e, ui) {
			var newIndex = ui.item.index();
			var oldIndex = $(this).attr('data-previndex');
			$(this).removeAttr('data-previndex');
			
			var cms_id = ui.item.attr("data-cms_sv_id");
			var old_pos= parseInt(oldIndex)+1;
			var new_pos= parseInt(newIndex)+1;
			
			$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
				task 	: "sv_reihenfolge",
				id 		: cms_id,
				oldpos 	: old_pos,
				newpos 	: new_pos
			})
			.done(function( data ) {
				if(data != "")
					alert(data);
			});
		}
	});
}


$(document).ready(function(){

	//start functions
	cms_thumbnail_create(0);
   
   //relative
	$(window).on("resize", function(){
		
		if($("#cms_img_preview").length != 0)
			cms_img_preview_relative();
		
		cms_menu_relative();
		
		if($("#cms_ib_widget:visible").length)
			cms_ib_widget_relative();
	});
	$("#cms_ib_widget_content").on("scroll", function(){
		cms_ib_widget_scrolling();
	});
   
   
	$("#cms_goto_top").click(function(){
		$(".cms_box_wrapper").animate({scrollTop:0}, '500');
	});
	
	$(window).load(function(){
		//load menu
		cms_load_menu(10);
	});
	
	$("#cms_menu_main_img").click(function(){
		
		if ($(this).hasClass('noclick')) {
			$(this).removeClass('noclick');
		}
		else{
			
			var cms_menu_main_elements = $(".cms_menu_main_elements");
			
			var delay_time = 0;
			
			if(cms_menu_main_elements.css("display") == "none"){
			
				for(var x=0; x<cms_menu_main_elements.length; x++){
					
					cms_menu_main_elements.eq(x).delay(delay_time).fadeIn(300);
					delay_time = delay_time+100;
				}
				
				if(cms_menu_posx != ""){
					$("#cms_menu").css("top", cms_menu_posy).css("left", cms_menu_posx);
				}
				cms_menu_relative();
				$("#cms_menu").draggable("enable");
				
				document.cookie = "cms_menu_status=open";
			}
			else{
				
				for(var x=cms_menu_main_elements.length -1; x>=0; x--){
					
					cms_menu_main_elements.eq(x).delay(delay_time).fadeOut(300);
					delay_time = delay_time+100;
				}
				$("#cms_menu").css({"top": (window.innerHeight-$("#cms_menu").width()) +"px", 
									"left": "0px"});
				
				$("#cms_menu").draggable("disable");
				
				document.cookie = "cms_menu_status=close";
			}
		}
	});
	$(".cms_menu_main_elements").hover(function(){
		$(this).next(".cms_menu_main_elements_title").stop().fadeIn(300);
	},function(){
		$(this).next(".cms_menu_main_elements_title").stop().fadeOut(300);
	});	
	
	
	
	//Thumbnail
	$("body").on({
		mouseenter: function () {
			$(this).find(".cms_thumbnail_box_edit").stop().fadeIn(200);
		},
		mouseleave: function () {
			$(this).find(".cms_thumbnail_box_edit").stop().fadeOut(200);
		}
	}, '.cms_thumbnail_box');
	
	
	// Inhalte bearbeiten
	if(getCookie("ib").length){
		if(getCookie("ib") == "true")
			cms_ib_open();
		
		if(getCookie("ib") == "false")
			cms_ib_close();
	}
	if($("#cms_ib_widget:visible").length)
			cms_ib_widget_relative();
		
	$("#cms_menu_inhalte_bearbeiten").click(function(){
		
		if(getCookie("ib").length == 0){
			//set cookie
			document.cookie = "ib=true";
			cms_ib_open();
		}
		else{
			if(getCookie("ib") == "true"){
				cms_ib_close();
			}
			else{
				document.cookie = "ib=true";
				cms_ib_open();
			}	
		}
	});
	
	//cms_ib_widget
	$(".cms_ib_widget_head_menu").click(function(){
		$(".cms_ib_widget_head_menu").removeClass("active");
		$(this).addClass("active");
		$(".cms_ib_widget_cat").hide().removeClass("active");
		$("#"+$(this).attr("data-type")).stop().fadeIn(300).addClass("active");
	});
	$("#cms_ib_widget_visibility p").click(function(){
		if($(this).attr("id") == "cms_ib_widget_visibility_close"){
			$("#cms_ib_widget_visibility").find("p").stop().fadeOut(500);
			$("#cms_ib_widget").stop().animate({"right":"-"+$("#cms_ib_widget").width()+"px"}, 600, function(){
				$("#cms_ib_widget_visibility").find("#cms_ib_widget_visibility_open").stop().fadeIn(500);
			}).removeClass("active");
		}
		else{
			$("#cms_ib_widget_visibility").find("p").stop().fadeOut(500);
			$("#cms_ib_widget").stop().animate({"right":"0px"}, 600, function(){
				$("#cms_ib_widget_visibility").find("#cms_ib_widget_visibility_close").stop().fadeIn(500);
			}).addClass("active");
		}
	});
	$("#cms_ib_widget_pageup").click(function(){
		$("#cms_ib_widget_content").stop().animate({scrollTop:$("#cms_ib_widget_content").scrollTop()-200+"px"}, 500);
	});
	$("#cms_ib_widget_pagedown").click(function(){
		$("#cms_ib_widget_content").stop().animate({scrollTop:$("#cms_ib_widget_content").scrollTop()+200+"px"}, 500);
	});
		
	
	$("#cms_inhalte_bearbeiten").find(".cms_box_close").click(function(){
	
		if($("#cms_ib_editor_text_long").css("display") != "none")
			window.location = glob_cms_filename;
		
		cms_box_close( $("#cms_inhalte_bearbeiten") );
	});
	
	$("*[data-cmstype='text_short'], .cms_ib_widget_container[data-cmstype='text']").click(function(){
		
		if(getCookie("ib") == "true"){
			
			var this_element = $(this);
			
			var cmspos 	= $(this).attr("data-cmspos");
			var cmstype	= $("*[data-cmstype='text_short'][data-cmspos='"+cmspos+"']").attr("data-cmstype");
			
			var content_global = 0;
			if(this_element.attr("data-cmsglobal") == "1")
				content_global = 1;
			
			if(cmstype == "text_short"){
				
				if($(this).hasClass("cms_ib_widget_container"))
					var cmscontent = $(this).find(".cms_ib_widget_container_full_content").text();
				else
					var cmscontent = $(this).text();
				
				var page	= $("body").attr("id");
					page	= page.replace("page", "");
				
				$("#cms_ib_editor_text_short_submit").unbind();
				
				$("#cms_ib_editor_text_short_submit").bind("click", function(){
					
					var cms_input = $("#cms_ib_short_textarea").val();
					
					
					$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
						task 	: "ib_text_change",
						cmspos 	: cmspos,
						cmstype : cmstype,
						page 	: page,
						cms_input : cms_input,
						content_global : content_global
					})
					.done(function( data ) {
						if(data != "")
							alert(data);
						else{
							cms_data_save = true;
							reload();
						}
					});
				});
				
				$("#cms_ib_short_textarea").val( cmscontent );
				
				//Load Editor
				$(".cms_ib_editor").css("display", "none");
				cms_box_open( $("#cms_inhalte_bearbeiten") );
				
				$("#cms_ib_editor_text_short").show();
				
				return false;
			}
		}
	});
	$("#cms_ib_short_textarea").on("input", function(){
		if(cms_data_save == true)
			cms_data_save = false;
	});
	
	$("*[data-cmstype='text_long'], .cms_ib_widget_container[data-cmstype='text']").click(function(){
		
		if(getCookie("ib") == "true"){
			
			var this_element = $(this);
			
			//set var
			var cmspos 	= $(this).attr("data-cmspos");
			var cmstype	= $("*[data-cmstype='text_long'][data-cmspos='"+cmspos+"']").attr("data-cmstype");
			
			var content_global = 0;
			if(this_element.attr("data-cmsglobal") == "1")
				content_global = 1;
			
			if(cmstype == "text_long"){
			
				if($(this).hasClass("cms_ib_widget_container"))
					var cmscontent = $(this).find(".cms_ib_widget_container_full_content").html();
				else
					var cmscontent = $(this).html();
				
				
				var page	= $("body").attr("id");
					page	= page.replace("page", "");
				
				//ÜBERARBEITEN
				tinymce.remove('mceRemoveControl', true, '#cms_ib_long_textarea');
				$("#cms_ib_editor_text_long_form").find(".mce-tinymce").remove();
				$("#cms_ib_long_textarea").show();
				
				$("#cms_ib_long_textarea").val(cmscontent);
		
				tinymce.init({
					selector: '#cms_ib_long_textarea',
					height: 500,
					theme: 'modern',
					plugins: [
						'advlist autolink lists link image charmap print preview hr anchor pagebreak',
						'searchreplace wordcount visualblocks visualchars code fullscreen',
						'insertdatetime media nonbreaking save table contextmenu directionality',
						'emoticons template paste textcolor colorpicker textpattern imagetools'
					],
					toolbar1: 'insertfile undo redo | styleselect | bold italic | fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
					toolbar2: 'print preview media | forecolor backcolor',
					image_advtab: true,
					font_formats: 'helvetica,sans-serif',
					fontsize_formats: '14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 44px 48px 52px 56px 60px 70px 80px 90px 100px 110px 120px 140px 160px 180px 200px 250px 300px 350px 400px 500px',
					content_css: [
						glob_cms_home_dir+'temp/style/tinymce.css'
					],
					setup: function(ed) {
						ed.on('change', function(ed) {
							if(cms_data_save == true)
								cms_data_save = false;
						});
					}
				});
				
				$("#cms_ib_editor_text_long_submit").unbind();
				
				$("#cms_ib_editor_text_long_submit").bind("click", function(){
					
					var cms_input = tinyMCE.activeEditor.getContent();
					
					$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
						task 	: "ib_text_change",
						cmspos 	: cmspos,
						cmstype : cmstype,
						page 	: page,
						cms_input : cms_input,
						content_global : content_global
					})
					.done(function( data ) {
						if(data != "")
							alert(data);
						else{
							cms_data_save = true;
							reload();
						}
					});
				});
				
				
				//Load Editor
				$(".cms_ib_editor").css("display", "none");
				cms_box_open( $("#cms_inhalte_bearbeiten") );
				
				$("#cms_ib_editor_text_long").show();
				
				return false;
			}
		}
	});
	
	$("*[data-cmstype='img']").click(function(){


		if(getCookie("ib") == "true"){
			
			var this_element = $(this);
			
			var cmspos 	= $(this).attr("data-cmspos");
			var page	= $("body").attr("id").replace("page", "");
			
			var content_global = 0;
			if(this_element.attr("data-cmsglobal") == "1")
				content_global = 1;
			
			$("#cms_ib_editor_img_vorschau").attr("data-cmspos", cmspos);
			
			var img = $("#cms_ib_editor_img_vorschau").find("#cms_ib_editor_img_vorschau_img");
			$("#cms_ib_editor_img_vorschau_load").show();
			img.hide();
			
			//load img
			$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
				task 	: "ib_img_receive",
				cmspos 	: cmspos,
				page 	: page
			})
			.done(function( data ) {
				if(data != ""){
					var img_info = $.parseJSON(data);
					
					img.attr("src", glob_cms_home_dir+"temp/media/"+img_info["src"]);
					img.attr("alt", img_info["alt"]);
					
					$("#cms_ib_editor_img_vorschau_load").hide();
					img.show();

					$("#cms_ib_editor_img_vorschau_noimg").hide();
				}
				else{
					$("#cms_ib_editor_img_vorschau_load").hide();
					$("#cms_ib_editor_img_vorschau_noimg").show();
				}
			});
				
			//Load Editor
			
			$(".cms_ib_editor").css("display", "none");
			$("#cms_ib_editor_img").show();
			cms_box_open( $("#cms_inhalte_bearbeiten") );
			
			$(".cms_ib_editor_img_add_text2").hide();
			$(".cms_ib_editor_img_add_text1").fadeIn(300);
			
			
			//submit
			$("#cms_ib_editor_img_submit").unbind();
			
			$("#cms_ib_editor_img_submit").bind("click", function(){
		
				cms_data_save = true;
				
				if($("#cms_ib_editor_img_vorschau_img").css("display") != "none"){
					
					var cmspos 	= $("#cms_ib_editor_img_vorschau").attr("data-cmspos");
					var cmsid	= $("#cms_ib_editor_img_vorschau_img").attr("data-cms_id");
					var page	= $("body").attr("id").replace("page", "");
					
					
					$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
						task 	: "ib_img_change",
						cmspos 	: cmspos,
						page 	: page,
						id 		: cmsid,
						content_global : content_global
					})
					.done(function( data ) {
						if(data != "")
							alert(data);
						else{
							cms_data_save = true;
							reload();
						}
					});
				}	
				else
					cms_box_close("all");
			});
			
			return false;
		}
	});
	
	
	$("*[data-cmstype='img_dia']").click(function(){

		if(getCookie("ib") == "true"){
			
			var this_element = $(this);
			
			var cmspos 	= $(this).attr("data-cmspos");
			var page	= $("body").attr("id");
				page	= page.replace("page", "");
				
			$("#cms_ib_editor_img_dia_thumbnail").attr("data-cmspos", cmspos);
			
			var content_global = 0;
			if(this_element.attr("data-cmsglobal") == "1")
				content_global = 1;
				
			var load_thumbnail = "";
			var thumbnail_margin;
			var thumbnail_margin_timer = 0;
			
			for(var x=1; x>0; x++){
				
				var cms_imgdia_next  	= $("span[data-img-pos_name='"+ cmspos +"'][data-img-position='"+ x +"']");
				var cmsid				= cms_imgdia_next.attr("data-img-ID");
				
				if( cms_imgdia_next.length > 0 ){
					
						load_thumbnail = load_thumbnail	+ "<div class='cms_thumbnail_box' data-cms_imgdia_id='"+ cmsid +"'>";
						
						load_thumbnail = load_thumbnail + 	"<div class='cms_thumbnail_box_img_container'>";
						load_thumbnail = load_thumbnail + 		"<img data-ori_src='"+glob_cms_home_dir+"temp/media/"+ cms_imgdia_next.attr("data-img-img_file") +"' src='"+glob_cms_home_dir+"temp/media/thumbnail/"+ cms_imgdia_next.attr("data-img-img_file") +"' alt='"+ cms_imgdia_next.attr("data-img-alt") +"' />";
						
						load_thumbnail = load_thumbnail +		"<div class='cms_thumbnail_box_edit'>";
						
						load_thumbnail = load_thumbnail	+ 			"<i class='fa fa-trash' aria-hidden='true' title='aus Diashow entfernen'></i>";
						load_thumbnail = load_thumbnail	+ 			"<i class='fa fa-arrows' aria-hidden='true' title='Verschieben'></i>";
						load_thumbnail = load_thumbnail	+ 			"<br /><i class='fa fa-eye' aria-hidden='true' title='Vergrößern'></i>";
						
						load_thumbnail = load_thumbnail +		"</div>";
						
						load_thumbnail = load_thumbnail +	"</div>";
						load_thumbnail = load_thumbnail +	"<p class='cms_thumbnail_title'>"+ cms_imgdia_next.attr("data-img-img_file") +"</p>";
						
						load_thumbnail = load_thumbnail	+ "</div>";
						
				}
				else{
					x=-2;
				}
			}
			$("#cms_ib_editor_img_dia_thumbnail").html( load_thumbnail+"<div class='clear'></div>" );
			
			
			//Load Editor
			
			$(".cms_ib_editor").css("display", "none");
			$("#cms_ib_editor_img_dia").show();
			cms_box_open( $("#cms_inhalte_bearbeiten") );
			
			$("#cms_ib_editor_img_dia_thumbnail").sortable({
				handle: '.fa-arrows',
				cursor: 'move',
				stop: function(){
					$(".cms_thumbnail_box_edit").stop().fadeOut(500);
				},
				update: function(){
					cms_data_save = false;
				},
				sort: sort_jQueryBug8342Fix
			});
			
			$(".cms_ib_editor_img_add_text2").hide();
			$(".cms_ib_editor_img_add_text1").fadeIn(300);
			
			
			//submit
			//Slideshow aktualisieren -> Url generieren für PHP
			$("#cms_ib_editor_img_dia_submit").unbind();
			
			$("#cms_ib_editor_img_dia_submit").bind("click", function(){
				
				cms_data_save = true;
				
				var cmspos = $("#cms_ib_editor_img_dia_thumbnail").attr("data-cmspos");
				
				var cmsid = "";
				
				for(var x=0; x>=0; x++){
					
					var cms_thumb = $("#cms_ib_editor_img_dia_thumbnail").find(".cms_thumbnail_box").eq(x);
					
					if(cms_thumb.attr("data-cms_imgdia_id") != undefined){
						
						cmsid += cms_thumb.attr("data-cms_imgdia_id") +",";
					}
					else{
						x=-2;
					}
				}
				
				//delete last ','
				cmsid = cmsid.slice(0, -1);
				
				var page = $("body").attr("id").replace("page", "");
				
				$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
					task 	: "ib_img_dia_change",
					cmspos 	: cmspos,
					page 	: page,
					cmsid	: cmsid,
					content_global : content_global
				})
				.done(function( data ) {
					if(data != "")
						alert(data);
					else{
						cms_data_save = true;
						reload();
					}
				});
			});
			
			return false;
		}
	});
	$(".cms_ib_editor_img_add").click(function(){
		var cms_this = $(this);
		var cms_dia = $(this).closest(".cms_ib_editor").find(".cms_media_widget");
		
		if(cms_dia.css("display") == "none" || cms_dia.length == 0){
			
			if(cms_dia.length == 0){
				
				var response;
				$.ajax({ type: "GET",   
					 url: glob_cms_home_dir+"cms/mediathek.html",   
					 async: false,
					 success : function(text)
					{
						response= text;
					}
				});
				$(this).closest(".cms_ib_editor").append(response);
				cms_mediathek_load_content();
				cms_dia = $(this).closest(".cms_ib_editor").find(".cms_media_widget");
			}
			cms_dia.hide().fadeIn(300, function(){
				
				if(cms_this.closest(".cms_ib_editor").attr("id") != "cms_ib_editor_text_long")
					cms_ib_media_draggable();
				else
					cms_ib_media_get_link();
			});
			
			$(".cms_ib_editor_img_add_text1").hide();
			$(".cms_ib_editor_img_add_text2").fadeIn(300);
		}
		else{
			cms_dia.fadeOut(500);
			$(".cms_ib_editor_img_add_text2").hide();
			$(".cms_ib_editor_img_add_text1").fadeIn(300);
		}
		
	});
	
	$("#cms_ib_editor_img_dia_thumbnail").on("click", ".fa-trash", function(){
		
		var cms_trash_element 	= $(this).closest(".cms_thumbnail_box");
		cms_trash_element.hide(500, function(){ cms_trash_element.remove(); });
		
	});
	$("#cms_ib_editor_img_dia_thumbnail").on("click", ".fa-eye", function(){
		
		var cms_img_src = $(this).closest(".cms_thumbnail_box_img_container").find("img").attr("data-ori_src");
		var cms_img_alt = $(this).closest(".cms_thumbnail_box_img_container").find("img").attr("alt");
		
		cms_img_preview( cms_img_src , cms_img_alt );
	});
	
	
	
	//content_clone
	$(".cms_clone_element_nav_visibility").click(function(){
		
		var this_element = $(this);
		var new_visibility = 0;
		
		if($(this).hasClass("fa-eye-slash"))
			new_visibility = 1;
		
		$.post( glob_cms_home_dir+"cms/php_request/content_clone.php", {
			task : "visibility",
			visibility : new_visibility,
			clone_id : this_element.closest("*[data-cmstype='clone_element']").attr("data-cms_cloneid")
		})
		.done(function( data ) {
			if(data != "")
				alert(data);
			
			if(new_visibility == 0)
				this_element.removeClass("fa-eye").addClass("fa-eye-slash");
			else
				this_element.removeClass("fa-eye-slash").addClass("fa-eye");
		});
	});
	$(".cms_clone_element_nav_remove").click(function(){
		
		var wrap_element = $(this).closest("*[data-cms_clonesortable='true']");
		wrap_element.css("height", "auto");
		
		cms_data_save = false;
			
		if($("#cms_save_onpage_changes").hasClass("active") == false)
			$("#cms_save_onpage_changes").stop().fadeIn(300).addClass("active");
		
		var cms_new_onpage_change = "cms_clone_class:"+$(this).closest("*[data-cmstype='clone_element']").attr("data-cms_cloneclass")+";";
		
		if(cms_onpage_changes.indexOf(cms_new_onpage_change) < 0)
			cms_onpage_changes = cms_onpage_changes + cms_new_onpage_change;
		
		$(this).closest("*[data-cmstype='clone_element']").fadeOut(400, function(){
			$(this).remove();
			wrap_element.css("height", wrap_element.height()+"px");
		});
	});
	
	$("*[data-cmstype='add_clone']").click(function(){
		
		var cms_clone_class = $(this).attr("data-cms_cloneclass");
		
		$.post( glob_cms_home_dir+"cms/php_request/content_clone.php", {
			task : "add_element",
			clone_class : cms_clone_class
		})
		.done(function( data ) {
			if(data != "")
				alert(data);
			
			window.location = glob_cms_filename;
		});
	});
	//onpage_change
	$("#cms_save_onpage_changes_submit").click(function(){
		
		var cms_task = cms_onpage_changes.slice(0, -1).split(";");
		var cms_val = "";
		
		for(var x=0; x<cms_task.length; x++){
			
			cms_val = cms_task[x].split(":");
			
			if(cms_val[0] == "cms_clone_class"){
				
				var cms_id_string = "";
				
				for(var y=0; y<$("*[data-cms_cloneclass='"+cms_val[1]+"'][data-cmstype='clone_element']").length; y++){
					cms_id_string = cms_id_string + $("*[data-cms_cloneclass='"+cms_val[1]+"'][data-cmstype='clone_element']").eq(y).attr("data-cms_cloneid")+";";
				}
				cms_id_string = cms_id_string.slice(0, -1);
				
				$.post( glob_cms_home_dir+"cms/php_request/content_clone.php", {
					task : "refresh_class",
					clone_class : cms_val[1],
					clone_id : cms_id_string
				})
				.done(function( data ) {
					if(data != "")
						alert(data);
					
					cms_data_save = true;
					
					window.location = glob_cms_filename;
				});
			}
		}
		
	});
	$("#cms_save_onpage_changes_reset").click(function(){
		cms_data_save = true;
		window.location = glob_cms_filename;
	});
	
	// Mediathek
	$("#cms_menu_mediathek").click(function(){
		
		if($("#cms_menu_mediathek").hasClass("active")){
			
			//close mediathek
			cms_box_close( "all" );
			
		}
		else{
			cms_box_close( "all" );
			
			$("#cms_menu_mediathek").addClass("active");
			
			if($("#cms_mediathek").length == 0)
				$("body").append("<div class='cms_box cms_element' id='cms_mediathek'></div>");
			
			var response;
			$.ajax({ type: "GET",   
				 url: glob_cms_home_dir+"cms/mediathek.html",   
				 async: false,
				 success : function(text)
				{
					response= text;
				}
			});
			response = '<div class="cms_box_close"><i class="fa fa-times-circle" aria-hidden="true"></i></div>'+response;
			$("#cms_mediathek").html(response);
			
			
			//Load Mediathek
			cms_box_open( $("#cms_mediathek") );
			cms_mediathek_load_content();
			
		}
	});
	$("body").on("click", "#cms_mediathek .cms_box_close", function(event){
		
		//close mediathek
		cms_box_close( "all" );
	});
	
	//menu
	$("body").on({
		mouseenter: function () {
			$("#cms_media_nav_aktion_open").stop().fadeIn(300);
		},
		mouseleave: function () {
			$("#cms_media_nav_aktion_open").stop().fadeOut(300);
		}
	}, "#cms_media_nav_aktion");
	
	
	//Kachelansicht
	$("body").on("click", "#cms_media_kachelansicht .fa-eye", function(event){
		
		var cms_fileinfo = $(event.target).closest(".cms_thumbnail_box").find(".cms_thumbnail_title");
		
		var cms_src = glob_cms_home_dir+"temp/media/" + cms_fileinfo.attr("title");
		var cms_alt = cms_fileinfo.attr("data-cms_alt");
		
		cms_img_preview(cms_src , cms_alt);
	});
	$("body").on("click", "#cms_media_kachelansicht .cms_thumbnail_title", function(event){
		
		var cms_kachelansicht = $("#cms_media_kachelansicht");
		
		//close old edit
		cms_media_rename_hide();
		
		//show editor
		$(event.target).closest(".cms_thumbnail_box").find(".cms_thumbnail_box_rename").fadeIn(300);
		$(event.target).closest(".cms_thumbnail_box").find(".cms_thumbnail_box_rename_buttons").fadeIn(300);
		$(event.target).hide();
		
		$(event.target).closest(".cms_thumbnail_box").find(".cms_thumbnail_box_edit").css("visibility", "hidden");
		
		//load input
		var cms_filename = delete_filetype( $(event.target).text() );
		var cms_alt = $(event.target).attr("data-cms_alt");
		var cms_type = $(event.target).attr("data-cms_type");
		
		cms_kachelansicht.find(".cms_media_kachel_rename_input_alt").prop('readonly', false);
		
		if(cms_type == "pdf"){
			cms_alt = "PDF-Datei";
			cms_kachelansicht.find(".cms_media_kachel_rename_input_alt").prop('readonly', true);
		}
		if(cms_type == "doc"){
			cms_alt = "Dokument";
			cms_kachelansicht.find(".cms_media_kachel_rename_input_alt").prop('readonly', true);
		}
		
		cms_kachelansicht.find(".cms_media_kachel_rename_input_filename").val(cms_filename);
		cms_kachelansicht.find(".cms_media_kachel_rename_input_alt").val(cms_alt);
		
	});
	$("body").on("click", "#cms_media_kachelansicht .cms_thumbnail_box_rename_submit", function(event){
		
		var cms_active_file = $(event.target).closest(".cms_thumbnail_box").find(".cms_thumbnail_title");
		
		var cms_id		= cms_active_file.attr("data-cms_id");
		
		var cms_oldname = cms_active_file.text();
		var cms_newname = $(event.target).closest(".cms_thumbnail_box").find(".cms_media_kachel_rename_input_filename").val();
		var cms_oldalt 	= cms_active_file.attr("data-cms_alt");
		var cms_newalt 	= $(event.target).closest(".cms_thumbnail_box").find(".cms_media_kachel_rename_input_alt").val();
		
		
		var cms_return = filename_control( cms_newname );
		
		if(cms_return != true)
			alert("Leerzeichen und sonstige Sonderzeichen sind im Dateinamen nicht möglich.");
		
		else{
			cms_newname = cms_newname + get_filetype( cms_oldname );
			if(cms_newname != cms_oldname || cms_newalt != cms_oldalt)
				cms_media_rename( cms_id , cms_newname , cms_newalt );
			
			cms_media_rename_hide();
		}
		
		
	});
	$("body").on("click", "#cms_media_kachelansicht .cms_thumbnail_box_rename_cancel", function(event){
		
		cms_media_rename_hide();
	});
	
	//Detailansicht
	$("body").on("click", ".cms_media_detailansicht_table_files", function(event){
		
		if($(event.target).attr("type") != "checkbox")
			cms_media_detailansicht_vorschau( $(event.target).closest(".cms_media_detailansicht_table_files") );
	});
	
	$("body").on("click", "#cms_media_detailansicht_rename_buttons_submit", function(event){
		
		var cms_active_file = $(".cms_media_detail_active");
		
		var cms_id		= cms_active_file.find(".cms_media_detail_fileinfo").attr("data-cms_id");
		
		var cms_oldname = cms_active_file.find(".cms_media_detail_fileinfo").text();
		var cms_newname = $("#cms_media_detailansicht_rename_input_filename").val();
		
		var cms_oldalt = cms_active_file.find(".cms_media_detail_fileinfo").attr("data-cms_alt");
		var cms_newalt = $("#cms_media_detailansicht_rename_input_alt").val();
		
		
		var cms_return = filename_control( cms_newname );
		
		if(cms_return != true)
			alert("Leerzeichen und sonstige Sonderzeichen sind im Dateinamen nicht möglich.");
		
		else{
			cms_newname = cms_newname + get_filetype( cms_oldname );
			if(cms_newname != cms_oldname || cms_oldalt != cms_newalt)
				cms_media_rename( cms_id , cms_newname , cms_newalt );
		}
		
		
	});
	$("body").on("click", "#cms_media_detailansicht_rename_buttons_cancel", function(event){
		
		var cms_active_file = $(".cms_media_detail_active");
		var cms_oldname 	= cms_active_file.find(".cms_media_detail_fileinfo").text();
		var cms_oldalt 		= cms_active_file.find(".cms_media_detail_fileinfo").attr("data-cms_alt");
		
		$("#cms_media_detailansicht_rename_input_filename").val(delete_filetype( cms_oldname ));
		$("#cms_media_detailansicht_rename_input_alt").val( cms_oldalt );
	});
	
	//menu interactions
	
	// - auswahl loeschen
	$("body").on("click", "#cms_media_nav_aktion_open_auswahl_loeschen", function(){
		
		cms_media_delete( cms_media_auswahl() );
	});
	$("body").on("click", "#cms_media_nav_aktion_open_auswahl_herunterladen", function(){
		
		cms_media_download( cms_media_auswahl() );
	});
	$("body").on("click", "#cms_media_nav_aktion_open_auswahl_aufheben", function(){
		
		$(".cms_media_check").prop( "checked", false );
		$(".cms_media_check_td input").prop( "checked", false );
	});
	// - ansicht
	$("body").on("click", ".cms_media_nav_aktion_open_ansicht_button", function(event){
		
		if($(event.target).attr("id") == "cms_media_nav_aktion_open_ansicht_kacheln")
			cms_media_ansicht( "kachel" );
		if($(event.target).attr("id") == "cms_media_nav_aktion_open_ansicht_details")
			cms_media_ansicht( "detail" );
	
	});
	// - sort
	$("body").on("click", "#cms_media_nav_aktion_open_sort_filename", function(){
		
		cms_media_sort( "filename" );
	});
	$("body").on("click", "#cms_media_nav_aktion_open_sort_latest", function(){
		
		cms_media_sort( "latest" );
	});
	// - filetype
	$("body").on("click", "#cms_media_nav_aktion_open_filetype_all", function(){
		cms_media_type("all")
	});
	$("body").on("click", "#cms_media_nav_aktion_open_filetype_img", function(){
		cms_media_type("img");
	});
	$("body").on("click", "#cms_media_nav_aktion_open_filetype_doc", function(){
		cms_media_type("doc");
	});
	
	
	// Upload
	$("body").on("click", "#cms_media_nav_upload", function(){
		
		if( $("#cms_media_explorer").css("display") != "none" ){
			//nav
			$(".cms_media_nav_elements").hide();
			$(".cms_media_nav_upload_active").show();
			
			$("#cms_media_explorer").hide();
			$("#cms_media_upload").slideDown(300);
			$("#cms_media_nav_upload").css("font-weight", "bold");
		}
	});
	$("body").on("click", "#cms_media_nav_upload_back", function(){
		
		//nav
			$(".cms_media_nav_elements").show();
			$(".cms_media_nav_upload_active").hide();
			$("#cms_media_nav_upload").show();
		
		$("#cms_media_upload").slideUp(300, function(){
			
			$("#cms_media_explorer").fadeIn(300);
		});
		$("#cms_media_nav_upload").css("font-weight", "normal");
	});
	$("body").on("click", "#cms_media_upload_dropzone_cancel", function(e){
		e.preventDefault();
		media_dropzone.options.autoProcessQueue = false;
		media_dropzone.removeAllFiles(true); 
		$(".cms_media_upload_buttons").css("visibility", "hidden");
	});
	
	
	
	// Search
	$("body").on("input", "#cms_media_search", function(){ 
		
		var cms_search_string = $("#cms_media_search").val();
		
		//kacheln
		$("#cms_media_kachelansicht").find(".cms_thumbnail_box").hide();
		
		var cms_filename_element = $("#cms_media_kachelansicht").find(".cms_thumbnail_box").find(".cms_thumbnail_title");
		
		var cms_search_counter=0;
		var cms_markup;
		
		for(var x=0; x<cms_filename_element.length; x++){
			
			var cms_current_string = cms_filename_element.eq(x).text();
			
			//unmarkup text
			cms_markup = cms_filename_element.eq(x).html();
			cms_markup = cms_markup.replace('<span class="cms_media_search">' , "");
			cms_markup = cms_markup.replace('</span>' , "");
			cms_filename_element.eq(x).html( cms_markup );
			
			if (cms_current_string.toLowerCase().indexOf( cms_search_string ) >= 0){
				cms_filename_element.eq(x).closest(".cms_thumbnail_box").show();
				
				//markup text
				cms_markup = cms_filename_element.eq(x).html();
				cms_markup = cms_markup.replace(cms_search_string , "<span class='cms_media_search'>"+cms_search_string+"</span>");
				cms_filename_element.eq(x).html( cms_markup );
				
				cms_search_counter++;
			}
		}
		
		//details
		$(".cms_media_detailansicht_table_files").hide();
		
		var cms_filename_element = $(".cms_media_detail_fileinfo");
		
		var cms_markup;
		
		for(var x=0; x<cms_filename_element.length; x++){
			
			var cms_current_string = cms_filename_element.eq(x).text();
			
			//unmarkup text
			cms_markup = cms_filename_element.eq(x).html();
			cms_markup = cms_markup.replace('<span class="cms_media_search">' , "");
			cms_markup = cms_markup.replace('</span>' , "");
			cms_filename_element.eq(x).html( cms_markup );
			
			if (cms_current_string.toLowerCase().indexOf( cms_search_string ) >= 0){
				cms_filename_element.eq(x).closest(".cms_media_detailansicht_table_files").show();
				
				//markup text
				cms_markup = cms_filename_element.eq(x).html();;
				cms_markup = cms_markup.replace(cms_search_string , "<span class='cms_media_search'>"+cms_search_string+"</span>");
				cms_filename_element.eq(x).html( cms_markup );
				
			}
		}
		
		if($(".cms_media_detail_active").css("display") == "none"){
			
			var cms_new_vorschau = $(".cms_media_detailansicht_table_files:visible").eq(0);
			
			if(cms_new_vorschau.length > 0){
				cms_media_detailansicht_vorschau( cms_new_vorschau );
				$("#cms_media_detailansicht_vorschau").show(300);
			}
			else
				$("#cms_media_detailansicht_vorschau").hide(300);
		}
		else{
			$("#cms_media_detailansicht_vorschau").show(300);
			cms_media_detailansicht_vorschau( $(".cms_media_detail_active") );
		}
		
		
		if(cms_search_counter == 0){
			$("#cms_media_detailansicht").css("visibility", "hidden");
			$("#cms_media_kachelansicht").css("visibility", "hidden");
			$("#cms_search_no_result").show();
		}
		else{
			$("#cms_media_detailansicht").css("visibility", "visible");
			$("#cms_media_kachelansicht").css("visibility", "visible");
			$("#cms_search_no_result").hide();
			cms_media_detailansicht_vorschau( $(".cms_media_detail_active") );
		}
		
	});
	
	// Seiten verwalten
	$("#cms_menu_seitenverwaltung").click(function(){
		
		if($("#cms_menu_seitenverwaltung").hasClass("active")){
			
			window.location = glob_cms_filename;
		}
		else{
			cms_box_close( "all" );
			cms_box_open($("#cms_seitenverwaltung"));
			$("#cms_menu_seitenverwaltung").addClass("active");
			
			var cms_id = $(".cms_sv_pages_flexible").find("li").eq(0).attr("data-cms_sv_id");
			cms_sv_load_info( cms_id );
			
			cms_sv_change_device( glob_cms_device );
			
			cms_sv_sortable();
		}
	});
	$("#cms_seitenverwaltung .cms_box_close i").click(function(){
		window.location = glob_cms_filename;
	});
	
	$("#cms_sv_device_select span").click(function(){
		
		if($(this).hasClass("active") == false){
			cms_sv_change_device($(this).attr("data-cms_sv_device"));
		}
	});
	
	$(".cms_sv_pages").on("click", ".cms_sv_childpage", function(){
		
		var this_element = $(this).closest("li");
		var cms_id = this_element.attr("data-cms_sv_id");
		
		if(this_element.hasClass("closed")){
			this_element.children("ul").stop().slideDown(500);
			this_element.removeClass("closed");
			$(this).removeClass("fa-chevron-down").addClass("fa-chevron-up");
		}
		else{
			this_element.find("ul").stop().slideUp(500);
			this_element.addClass("closed");
			this_element.find("li").addClass("closed");
			$(this).removeClass("fa-chevron-up").addClass("fa-chevron-down");
		}
	});
	$(".cms_sv_pages").on("click", ".cms_sv_li_pagename", function(){
		
		if ($(this).hasClass('noclick')) {
			$(this).removeClass('noclick');
		}
		else{
			var cms_id = $(this).closest("li").attr("data-cms_sv_id");
			cms_sv_load_info( cms_id );
		}
	});
	$(".cms_sv_pages").on("click", ".cms_sv_visibility", function(){
		
		var cms_id = $(this).closest("li").attr("data-cms_sv_id");
		var this_element = $(this);
		
		$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
			task 			: "sv_change_visibility",
			visibility_id 	: cms_id
		})
		.done(function( data ) {
			
			if(data != "")
				alert(data);
			else{
				if(this_element.hasClass("fa-eye")){
					this_element.removeClass("fa-eye");
					this_element.addClass("fa-eye-slash");
				}
				else{
					this_element.removeClass("fa-eye-slash");
					this_element.addClass("fa-eye");
				}
			}
		});		
	});
	$(".cms_sv_pages").on("click", ".cms_sv_new_page", function(){
		
		var cms_new_child_parent		= $(this).parent("ul").closest("li").attr("data-cms_sv_id");
		var cms_new_child_ebene			= $(this).parent("ul").attr("data-cms_sv_ebene");
		cms_new_child_ebene = parseInt(cms_new_child_ebene);
		var cms_new_child_device		= $(this).closest(".cms_sv_pages").attr("data-cms_sv_device");
		
		var cms_new_child_nc			= $(this).closest(".cms_sv_parent_top").attr("data-cms_sv_nc");
		var cms_new_child_nc = parseInt(cms_new_child_nc);
		var cms_new_child_nc_output		= "";
		var cms_new_child_nc_button		= "";
		
		if(cms_new_child_nc+1 <= cms_new_child_ebene)
			cms_new_child_nc_output		= " disabled";
		else
			cms_new_child_nc_button = '<ul id="cms_sv_pages_ebene'+(cms_new_child_ebene+1)+'" data-cms_sv_ebene="'+(cms_new_child_ebene+1)+'"><li class="cms_sv_new_page"><div><i class="fa fa-plus" aria-hidden="true"></i></div></li></ul>';
	
		var this_element = $(this);
		
		$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
			task 				: "sv_new_child",
			new_child_parent	: cms_new_child_parent,
			new_child_ebene 	: cms_new_child_ebene,
			new_child_device 	: cms_new_child_device
		})
		.done(function( data ) {
			
			var new_element = "";
			var cms_nc_id = data;
			
			new_element=new_element+'<li data-cms_sv_id="'+cms_nc_id+'" class="closed"><div class="cms_sv_li_pagename cms_sv_li_cols">Neue Seite</div>';
			new_element=new_element+	'<div class="cms_sv_li_icons cms_sv_li_cols">';
			new_element=new_element+		'<i class="fa fa-eye-slash cms_sv_visibility" aria-hidden="true"></i>';
			new_element=new_element+		'<i class="fa fa-chevron-down cms_sv_childpage'+cms_new_child_nc_output+'" aria-hidden="true"></i>';
			new_element=new_element+	'</div><div class="clear"></div>'+cms_new_child_nc_button+'</li>';
			
			this_element.before(new_element);
			this_element.prev("li").hide().slideDown(500);
			cms_sv_sortable();
		});
	
	});
	
	$("#cms_sv_pageinfo_submit").click(function(){
		
		
		var cms_submit = true;
		
		//check filename
		if( filename_control( $("#cms_sv_dateiname").val() ) != true ){
			cms_submit = false;
			alert("Der Dateiname ist ungültig.");
		}
		
		
		if(cms_submit == true){
			
			$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
				task			: "sv_seitendaten",
				name 			: $("#cms_sv_seitenname").val(),
				title 			: $("#cms_sv_seitentitel").val(),
				filename 		: $("#cms_sv_dateiname").val(),
				
				meta_keywords 	: $("#cms_sv_seokeywords").val(),
				meta_descr 		: $("#cms_sv_seodescription").val(),
				
				pos				: $("#cms_sv_position").val(),
				ebene 			: $("#cms_sv_ebene").val(),
				id 				: $("#cms_sv_id").val(),
				parent_page 	: $("#cms_sv_elternseite").val(),
				new_child 		: $("#cms_sv_unterseite").val(),
				temp 			: $("#cms_sv_temp").val(),
				device 			: $("#cms_sv_device").val()
			})
			.done(function( data ) {
				
				if($(".cms_sv_pages").find("li.selected .cms_sv_li_pagename").text() != $("#cms_sv_seitenname").val())
					$(".cms_sv_pages").find("li.selected .cms_sv_li_pagename").text($("#cms_sv_seitenname").val());
				
				if(data == "")
					alert("Erfolgreich übernommen");
				else
					alert(data);
				
				if($("#cms_sv_id").val() != "")
					cms_sv_load_info( $(".cms_sv_pages").find("li.selected").attr("data-cms_sv_id") );
				else{
					alert("Seite wird neu geladen.");
					window.location = glob_cms_home_dir;
				}
			});
		}
		
	});
	$("#cms_sv_pageinfo_reset").click(function(){
		cms_sv_load_info( $(".cms_sv_pages").find("li.selected").attr("data-cms_sv_id") );
	});
	
	
	$("#cms_sv_pageinfo_remove_page").click(function(){
		
		var cms_id = $(".cms_sv_pages").find("li.selected").attr("data-cms_sv_id");
		
		if($("#cms_sv_dateiname").val() == "index"){
			alert("Die index.html (Startseite) kann nicht gelöscht werden.");
		}
		else{
			if( confirm("Möchten Sie diese Seite und all Ihre Unterseiten wirklich löschen?")){
				
				$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
					task 	: "sv_remove",
					id 		: cms_id
				})
				.done(function( data ) {
					if(data != "")
						alert(data);
					else{
						$(".cms_sv_pages").find("li.selected").slideUp(500, function(){ 
							$(".cms_sv_pages").find("li.selected").remove(); 
							cms_sv_load_info( $(".cms_sv_pages_flexible").find("li").eq(0).attr("data-cms_sv_id") );
						});
					}
				});
			}
		}
	});
	
	//new_page_root
	$(".cms_sv_new_page_root").click(function(){
		$(".cms_sv_new_page_root").addClass("active");
		cms_sv_load_info(-1);
	});
	
	//copy desktop to mobile
	$("#cms_sv_copy_desktop").click(function(){
		
		if(confirm("Desktop Seitenstruktur wirklich übernehmen?")){
			
			$.post( glob_cms_home_dir+"cms/php_request/edit.php", {
				task 	: "sv_copy_desktop"
			})
			.done(function( data ) {
				if(data != "")
					alert(data);
				else{
					window.location = glob_cms_filename;
				}
			});
		}
	});
	
	//device change
	$("#cms_menu_device").click(function(){
		if($(this).find("i:visible").hasClass("fa-desktop"))
			window.location = glob_cms_home_dir+glob_cms_desktop_dir.substring(1)+"index.html";
		else
			window.location = glob_cms_home_dir+glob_cms_mobile_dir.substring(1)+"index.html";
	});
	
	
	//settings
	/*$("#cms_menu_settings").click(function(){
		
		if($("#cms_menu_settings").hasClass("active")){
			
			window.location = glob_cms_filename;
		}
		else{
			cms_box_close( "all" );
			cms_box_open($("#cms_settings"));
			$("#cms_menu_settings").addClass("active");
		
			cms_set_open( $("#cms_settings_menu>ul>li").eq(0).find("li").eq(0).attr("data-cms_settings") );
		}
		
	});
	$("#cms_settings .cms_box_close i").click(function(){
		window.location = glob_cms_filename;
	});
	
	$("#cms_settings_menu li p").click(function(){
		
		if($(this).parent("li").hasClass("active") == false && $(this).attr("data-info") != "no_select"){
		
			$("#cms_settings_change_buttons").hide(400);
			
			var cms_set_cat = $(this).parent("li").attr("data-cms_settings");
			
			if(cms_set_cat != undefined){
				cms_set_open(cms_set_cat);
			}
		}
	});
	
	$("#cms_settings_content").find("input, textarea").on("input", function(){
		if($("#cms_settings_change_buttons").css("display") == "none")
			$("#cms_settings_change_buttons").show(400);
	});
	
	$("#cms_settings_change_buttons_submit").click(function(){
		
		var cat = $("#cms_settings_menu li.active").attr("data-cms_settings");
		
		if(cat.indexOf("content_clone") !== -1){
			
			if(cat == "content_clone"){
				//new clone_class
				$.post( glob_cms_home_dir+"cms/php_request/content_clone.php", {
					task : "new_class",
					clone_class : $("#cms_settings_content_input_new_clone_class").val()
				})
				.done(function( data ) {
					if(data != "")
						alert(data);
					
					$("#cms_settings_change_buttons").hide(400);
				});
			}
			else{
				
			}
		}
		else{
			if(cms_set_check( cat )){
				
				cms_set_change( cat );
			}
		}
	});
	$("#cms_settings_change_buttons_reset").click(function(){
		var cat = $("#cms_settings_menu li.active").attr("data-cms_settings");
		cms_set_open(cat);
		$("#cms_settings_change_buttons").hide(400);
	});*/
	
	//logout
	$("#cms_menu_logout").click(function(){
		
		if(confirm("Wirklich abmelden?")){
		
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					
					window.location = "index.html";
				}
			};
			xmlhttp.open("GET", glob_cms_home_dir+"cms/php_request/logout.php", true);
			xmlhttp.send();	
		}
	});
	
	$( window ).unload(function() {
			
		
		
		document.cookie = "cms_menu_posx="+cms_menu_posx;
		document.cookie = "cms_menu_posy="+cms_menu_posy;
	});

});
window.onbeforeunload = function(e) {
	
	if(cms_data_save == false){
		var dialogText = "Seite verlassen?";
		e.returnValue = dialogText;
		return dialogText;
	}
};

