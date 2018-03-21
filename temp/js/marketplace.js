function mp_search( search_val ){

	search_val = search_val.replace(/-/g, " ").replace(/ /g, "-");
	window.location = "search.html?s="+search_val;
}

function mp_kurs_join(kurs_id){

	$.post( glob_cms_home_dir+"temp/php_request/kurse.php", {
		task 	: "kurs_join",
		kurs_id : kurs_id
	})
	.done(function( data ) {
		if(data != "")
			ug_alert( "Error", data, "Schließen", 0, function(){} );
		else{
			document.cookie = "buy_done=1";
			reload();
		}
	});
}

//elopage
function elopage_get_payment_link( callback ){
	
	$.post( glob_cms_home_dir+"temp/php_request/elopage.php", {
		task 	: "get_payment_link"
	})
	.done(function( payment_link ) {
		callback( payment_link );
	});
}

$(document).ready(function(){
	
	//--------------search
	
	if($("#marketplace_search").length){
		
		$("#marketplace_search").hover(function(){
			$(this).addClass("hover");
		}, function(){
			$(this).removeClass("hover");
		});
		$("#marketplace_search_input_area").focusin(function(){
			$("#marketplace_search").addClass("focus");
		});
		$("#marketplace_search_input_area").focusout(function(){
			$("#marketplace_search").removeClass("focus");
		});
		
		$(window).on("scroll", function(){
			$("#marketplace_search").removeClass("hover");
		});
	}
	
	$("#marketplace_header_search_input").on("input", function(event){
		
		var this_element  = $(event.target);
		var input_wrapper = $("#marketplace_header_search_input_wrapper");
		
		if(!input_wrapper.hasClass("active") && this_element.val() != ""){
			input_wrapper.addClass("active");
		}
	});
	$("#marketplace_search_button").click(function(){
		var search_val = $("#marketplace_search_input_area").val();
		if(search_val != ""){
			mp_search( search_val );
		}
	});
	$("#marketplace_search_input_area").keypress(function(event){
		var search_val = $("#marketplace_search_input_area").val();
		if(event.which == 13 && search_val != ""){
			mp_search( search_val );
		}
	});
	
	//search marketplace_header
	$("#marketplace_header_search_input_wrapper").find("form").submit(function(){
		
		var search_val = $("#marketplace_header_search_input").val();
		if(search_val != ""){
			mp_search( search_val );
		}
	});
	
	
	/*spotlight*/
	$("#marketplace_spotlight_content").find(".kurs_list_element_wrapper_ul").lightSlider({
		item: 1,
		//loop: true,
		loop: false,
		//auto: true,
		auto: false,
        slideMargin: 100,
		enableTouch: true,
		pause: 6000,
        pauseOnHover: true,
		onBeforeSlide: function(el){
			el.find("*[data-cms_img_align='cover_center']").each(function(){
				coverimg($(this));
			});
		}
    });
	
	
	/*buy_done*/
	if(getCookie("buy_done") == "1"){
		document.cookie = "buy_done=";
		control_open($("#"+getCookie("control_element")), 1);
	}
});